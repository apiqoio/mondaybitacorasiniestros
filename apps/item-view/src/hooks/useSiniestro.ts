import { useCallback, useState } from 'react';
import { consultarSiniestro, escribirCampos } from '../services/siniestro.service';
import { loadMapping } from '../services/storage.service';
import type { SiniestroApiResponse } from '@shared/types';

export type SiniestroStatus = 'idle' | 'loading' | 'success' | 'error';

export function useSiniestro() {
  const [status, setStatus] = useState<SiniestroStatus>('idle');
  const [data, setData] = useState<SiniestroApiResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const consultar = useCallback(
    async (boardId: string, itemId: string, numeroSiniestro: string) => {
      setStatus('loading');
      setMessage(null);
      setData(null);

      try {
        // 1. Traer datos de la API
        const apiData = await consultarSiniestro(numeroSiniestro);
        setData(apiData);

        // 2. Leer mapeo guardado
        const config = await loadMapping();
        const mappings = config?.mappings ?? [];

        if (mappings.length < 2) {
          setMessage('Se requieren al menos 2 campos mapeados para poblar el tablero.');
          setStatus('error');
          return;
        }

        // 3. Escribir campos en Monday
        const { ok, errores } = await escribirCampos(boardId, itemId, apiData, mappings);

        if (errores > 0 && ok === 0) {
          setMessage('No se pudo actualizar ningún campo. Revisa la configuración.');
          setStatus('error');
        } else if (errores > 0) {
          setMessage(`Se actualizaron ${ok} campo(s). ${errores} campo(s) fallaron.`);
          setStatus('success');
        } else {
          setMessage(`Se actualizaron ${ok} campo(s) correctamente.`);
          setStatus('success');
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setMessage(error.message ?? 'Error al consultar el siniestro');
        setStatus('error');
      }
    },
    [],
  );

  return { status, data, message, consultar };
}
