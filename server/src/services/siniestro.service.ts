import { SiniestroApiResponse } from '../../../shared/types';
import { logger } from '../utils/logger';

const BASE_URL = process.env.SINIESTROS_API_BASE_URL!;

interface FetchParams {
  oficina?: string;
  ramo?: string;
  poliza?: string;
  numeroSiniestro?: string;
  filenet?: string;
}

/**
 * Consulta la API externa de siniestros (Make webhook).
 * El webhook recibe los parámetros directamente como query string.
 */
export async function fetchSiniestro(
  params: FetchParams,
): Promise<SiniestroApiResponse> {
  const queryParams = new URLSearchParams();

  if (params.numeroSiniestro) {
    queryParams.set('siniestro', params.numeroSiniestro);
  }
  if (params.oficina) queryParams.set('oficina', params.oficina);
  if (params.ramo) queryParams.set('ramo', params.ramo);
  if (params.poliza) queryParams.set('poliza', params.poliza);
  if (params.filenet) queryParams.set('filenet', params.filenet);

  const url = `${BASE_URL}?${queryParams.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
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
