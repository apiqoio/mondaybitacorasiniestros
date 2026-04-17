import { useCallback, useState } from 'react';
import { consultarSiniestro, escribirCampos } from '../services/siniestro.service';
import { ACTIVE_MAPPINGS } from '../defaultMapping';
import type { SiniestroApiResponse, SearchParams } from '@shared/types';

export type FetchStatus = 'idle' | 'loading' | 'loaded' | 'error';
export type WriteStatus = 'idle' | 'writing' | 'success' | 'error';

export function useSiniestro() {
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [writeStatus, setWriteStatus] = useState<WriteStatus>('idle');
  const [data, setData] = useState<SiniestroApiResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [writeMessage, setWriteMessage] = useState<string | null>(null);
  const [writeDetalles, setWriteDetalles] = useState<string[]>([]);

  const consultar = useCallback(
    async (params: SearchParams) => {
      setFetchStatus('loading');
      setMessage(null);
      setData(null);
      setWriteStatus('idle');
      setWriteMessage(null);
      setWriteDetalles([]);

      try {
        const apiData = await consultarSiniestro(params);
        setData(apiData);
        setFetchStatus('loaded');
      } catch (err: unknown) {
        const error = err as { message?: string };
        setMessage(error.message ?? 'Error al consultar el siniestro');
        setFetchStatus('error');
      }
    },
    [],
  );

  const poblar = useCallback(
    async (boardId: string, itemId: string) => {
      if (!data) return;

      setWriteStatus('writing');
      setWriteMessage(null);
      setWriteDetalles([]);

      try {
        const { ok, errores, detalles } = await escribirCampos(boardId, itemId, data, ACTIVE_MAPPINGS);
        setWriteDetalles(detalles);

        if (errores > 0 && ok === 0) {
          setWriteMessage('No se pudo actualizar ningún campo.');
          setWriteStatus('error');
        } else if (errores > 0) {
          setWriteMessage(`Se actualizaron ${ok} campo(s). ${errores} campo(s) fallaron.`);
          setWriteStatus('success');
        } else {
          setWriteMessage(`Se actualizaron ${ok} campo(s) correctamente.`);
          setWriteStatus('success');
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setWriteMessage(error.message ?? 'Error al actualizar campos');
        setWriteStatus('error');
      }
    },
    [data],
  );

  return {
    fetchStatus,
    writeStatus,
    data,
    message,
    writeMessage,
    writeDetalles,
    mappings: ACTIVE_MAPPINGS,
    consultar,
    poblar,
  };
}
