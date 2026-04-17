import React, { useEffect, useState } from 'react';
import { Loader } from '@vibe/core';
import { useMondayContext, monday } from './hooks/useMondayContext';
import { SiniestroTab } from './components/SiniestroTab';

const SINIESTRO_COLUMN_ID = 'siniestro__1';

export default function App() {
  const { context, ready } = useMondayContext();
  const [numeroSiniestro, setNumeroSiniestro] = useState<string | null>(null);

  useEffect(() => {
    if (!context?.boardId || !context?.itemId) return;

    const query = `
      query {
        items(ids: [${context.itemId}]) {
          column_values(ids: ["${SINIESTRO_COLUMN_ID}"]) {
            text
          }
        }
      }
    `;

    monday.api(query).then((res: { data?: { items?: Array<{ column_values?: Array<{ text: string }> }> } }) => {
      const text = res.data?.items?.[0]?.column_values?.[0]?.text ?? null;
      setNumeroSiniestro(text && text !== '' ? text : null);
    });
  }, [context?.boardId, context?.itemId]);

  if (!ready) {
    return (
      <div className="spinner-center" style={{ height: '100vh' }}>
        <Loader size="medium" />
      </div>
    );
  }

  if (!context) {
    return (
      <div className="spinner-center" style={{ height: '100vh', flexDirection: 'column', gap: 12 }}>
        <div className="alert-box alert-box-error">
          <span>✕</span>
          <div>No se pudo conectar con Monday.com. Recarga la página o verifica que la app esté instalada correctamente.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="app-header-icon">BS</div>
        <div>
          <div className="app-header-title">Bitácora Siniestros</div>
          <div className="app-header-subtitle">Consulta y mapeo de datos de siniestros</div>
        </div>
      </div>

      <SiniestroTab context={context} numeroSiniestro={numeroSiniestro} />
    </div>
  );
}
