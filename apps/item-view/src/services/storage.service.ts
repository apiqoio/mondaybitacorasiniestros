import mondaySdk from 'monday-sdk-js';
import type { MappingConfig } from '@shared/types';

const monday = mondaySdk();
const STORAGE_KEY = 'siniestro_mapping_v1';

/**
 * Lee el mapeo guardado en Monday Secure Storage (nivel de instancia de la app).
 * Retorna null si no hay configuración guardada.
 */
export async function loadMapping(): Promise<MappingConfig | null> {
  const { data } = await monday.storage.instance.getItem(STORAGE_KEY);
  const value = data?.value;
  if (!value) return null;
  try {
    return JSON.parse(value) as MappingConfig;
  } catch {
    return null;
  }
}

/**
 * Guarda el mapeo en Monday Secure Storage.
 */
export async function saveMapping(config: MappingConfig): Promise<void> {
  await monday.storage.instance.setItem(STORAGE_KEY, JSON.stringify(config));
}
