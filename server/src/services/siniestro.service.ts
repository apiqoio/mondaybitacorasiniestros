import { SiniestroApiResponse } from '../../../shared/types';
import { logger } from '../utils/logger';

const BASE_URL = process.env.SINIESTROS_API_BASE_URL!;
const API_TOKEN = process.env.SINIESTROS_API_TOKEN!;

/**
 * Consulta la API externa de siniestros por número.
 * Reemplazar la URL y headers según la API real.
 */
export async function fetchSiniestro(
  numeroSiniestro: string,
): Promise<SiniestroApiResponse> {
  const url = `${BASE_URL}/siniestros/${encodeURIComponent(numeroSiniestro)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status === 404) {
    throw Object.assign(new Error('Siniestro no encontrado'), { status: 404 });
  }

  if (!res.ok) {
    logger.warn({ status: res.status, url }, 'Error al consultar API de siniestros');
    throw Object.assign(
      new Error(`Error en la API externa: ${res.status}`),
      { status: 502 },
    );
  }

  const data = await res.json() as SiniestroApiResponse;
  return data;
}
