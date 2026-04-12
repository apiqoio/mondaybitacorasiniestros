import mondaySdk from 'monday-sdk-js';
import type { SiniestroApiResponse, MappingEntry, SearchParams } from '@shared/types';

const monday = mondaySdk();

/**
 * Consulta la API externa de siniestros vía el backend proxy.
 */
export async function consultarSiniestro(
  params: SearchParams,
): Promise<SiniestroApiResponse> {
  const { data: token } = await monday.get('sessionToken');

  const queryParams = new URLSearchParams();
  if (params.mode === 'poliza') {
    queryParams.set('oficina', params.oficina!);
    queryParams.set('ramo', params.ramo!);
    queryParams.set('poliza', params.poliza!);
  } else if (params.mode === 'siniestro') {
    queryParams.set('numeroSiniestro', params.numeroSiniestro!);
  } else if (params.mode === 'filenet') {
    queryParams.set('filenet', params.filenet!);
  }

  const res = await fetch(`/api/siniestros?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(body.error || `Error ${res.status}`);
  }

  const body = await res.json();
  return body.data as SiniestroApiResponse;
}

/**
 * Formatea el valor del API al formato que espera Monday según el tipo de columna.
 */
function formatColumnValue(value: string, columnType: string): string {
  switch (columnType) {
    case 'date': {
      // Extraer solo YYYY-MM-DD de fechas ISO o datetime strings
      const dateMatch = value.match(/\d{4}-\d{2}-\d{2}/);
      return JSON.stringify({ date: dateMatch ? dateMatch[0] : value });
    }
    case 'numbers':
      return JSON.stringify(String(Number(value) || 0));
    case 'status':
      return JSON.stringify({ label: value });
    case 'text':
    default:
      return JSON.stringify(value);
  }
}

/**
 * Escribe los valores mapeados en las columnas del ítem usando la API de Monday.
 */
export async function escribirCampos(
  boardId: string,
  itemId: string,
  apiData: SiniestroApiResponse,
  mappings: MappingEntry[],
): Promise<{ ok: number; errores: number }> {
  let ok = 0;
  let errores = 0;

  for (const mapping of mappings) {
    const rawValue = apiData[mapping.apiField];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') continue;

    const columnValue = formatColumnValue(String(rawValue), mapping.columnType);

    const mutation = `
      mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: ${itemId},
          column_id: "${mapping.columnId}",
          value: ${columnValue}
        ) { id }
      }
    `;

    try {
      const result = await monday.api(mutation) as any;
      if (result.errors?.length) {
        console.error(`Error en columna ${mapping.columnId}:`, result.errors);
        errores++;
      } else {
        ok++;
      }
    } catch {
      errores++;
    }
  }

  return { ok, errores };
}
