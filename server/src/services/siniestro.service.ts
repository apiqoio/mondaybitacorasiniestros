import { SiniestroApiResponse } from '../../../shared/types';
import { logger } from '../utils/logger';

const BASE_URL = process.env.SINIESTROS_API_BASE_URL!;
const API_TOKEN = process.env.SINIESTROS_API_TOKEN!;

interface FetchParams {
  oficina?: string;
  ramo?: string;
  poliza?: string;
  numeroSiniestro?: string;
  filenet?: string;
}

/**
 * Consulta la API externa de siniestros con los parámetros de búsqueda.
 * Envía los parámetros como query string según la opción seleccionada.
 */
export async function fetchSiniestro(
  params: FetchParams,
): Promise<SiniestroApiResponse> {
  const queryParams = new URLSearchParams();
  if (params.oficina) queryParams.set('oficina', params.oficina);
  if (params.ramo) queryParams.set('ramo', params.ramo);
  if (params.poliza) queryParams.set('poliza', params.poliza);
  if (params.numeroSiniestro) queryParams.set('numeroSiniestro', params.numeroSiniestro);
  if (params.filenet) queryParams.set('filenet', params.filenet);

  const url = `${BASE_URL}/siniestros?${queryParams.toString()}`;

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
