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
 * Formatea el valor del API al formato JSON que espera Monday según el tipo de columna.
 * Retorna un string con JSON válido.
 */
function formatColumnValue(value: string, columnType: string): string {
  switch (columnType) {
    case 'date': {
      const dateMatch = value.match(/\d{4}-\d{2}-\d{2}/);
      return JSON.stringify({ date: dateMatch ? dateMatch[0] : value });
    }
    case 'numbers':
      return JSON.stringify(String(Number(value) || 0));
    case 'status':
      return JSON.stringify({ label: value });
    case 'long_text':
    case 'long-text':
      return JSON.stringify({ text: value });
    case 'text':
    default:
      return JSON.stringify(value);
  }
}

/**
 * Escribe los valores mapeados en las columnas del ítem usando la API de Monday.
 *
 * Monday's change_column_value expects `value` to be a GraphQL String
 * containing valid JSON. We must double-encode: formatColumnValue produces
 * the JSON, then JSON.stringify wraps it as a GraphQL string literal.
 */
export async function escribirCampos(
  boardId: string,
  itemId: string,
  apiData: SiniestroApiResponse,
  mappings: MappingEntry[],
): Promise<{ ok: number; errores: number; detalles: string[] }> {
  let ok = 0;
  let errores = 0;
  const detalles: string[] = [];

  for (const mapping of mappings) {
    const rawValue = apiData[mapping.apiField];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') continue;

    // formatColumnValue returns valid JSON (e.g. '"text"' or '{"date":"2024-01-01"}')
    const jsonValue = formatColumnValue(String(rawValue), mapping.columnType);

    // JSON.stringify wraps the JSON as a properly escaped GraphQL string literal
    const mutation = `
      mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: ${itemId},
          column_id: "${mapping.columnId}",
          value: ${JSON.stringify(jsonValue)}
        ) { id }
      }
    `;

    try {
      const result = await monday.api(mutation) as any;
      if (result.errors?.length) {
        console.error(`Error en columna ${mapping.columnId}:`, result.errors);
        detalles.push(`${mapping.columnTitle}: ${result.errors[0]?.message ?? 'Error'}`);
        errores++;
      } else {
        detalles.push(`${mapping.columnTitle}: ✓`);
        ok++;
      }
    } catch (err: any) {
      detalles.push(`${mapping.columnTitle}: ${err?.message ?? 'Error'}`);
      errores++;
    }
  }

  return { ok, errores, detalles };
}
