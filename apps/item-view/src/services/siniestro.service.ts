import mondaySdk from 'monday-sdk-js';
import type { SiniestroApiResponse, MappingEntry } from '@shared/types';

const monday = mondaySdk();

/**
 * Consulta la API externa de siniestros vía el backend proxy.
 * Usa el sessionToken de Monday para autenticar el request.
 */
export async function consultarSiniestro(
  numeroSiniestro: string,
): Promise<SiniestroApiResponse> {
  const { data: token } = await monday.get('sessionToken');

  const res = await fetch(`/api/siniestros/${encodeURIComponent(numeroSiniestro)}`, {
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
    case 'date':
      return JSON.stringify({ date: value }); // Asume 'YYYY-MM-DD'
    case 'numbers':
      return JSON.stringify(String(Number(value)));
    case 'status':
      return JSON.stringify({ label: value });
    case 'text':
    default:
      return JSON.stringify(value);
  }
}

/**
 * Escribe los valores mapeados en las columnas del ítem usando la API de Monday.
 * Escribe campo por campo para continuar aunque uno falle.
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
    const rawValue = apiData[mapping.apiField as keyof SiniestroApiResponse];
    if (rawValue === undefined || rawValue === null || rawValue === '') continue;

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
