import React, { useEffect, useState } from 'react';
import { Loader, TabList, Tab, TabPanels, TabPanel, TabsContext } from '@vibe/core';
import { Settings } from '@vibe/icons';
import { useMondayContext, monday } from './hooks/useMondayContext';
import { SiniestroTab } from './components/SiniestroTab';
import { ConfigTab } from './components/ConfigTab';

const SINIESTRO_COLUMN_ID = 'siniestro__1';

export default function App() {
  const { context, columns, ready } = useMondayContext();
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

  if (!ready || !context) {
    return (
      <div className="spinner-center" style={{ height: '100vh' }}>
        <Loader size="medium" />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="app-header">
        <div className="app-header-icon">BS</div>
        <div>
          <div className="app-header-title">Bitácora Siniestros</div>
          <div className="app-header-subtitle">Consulta y mapeo de datos de siniestros</div>
        </div>
      </div>

      {/* Content — Config tab only for admins */}
      {context.isAdmin ? (
        <TabsContext>
          <TabList className="monday-tabs">
            <Tab>Siniestro</Tab>
            <Tab icon={Settings}>Configuración</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SiniestroTab context={context} numeroSiniestro={numeroSiniestro} />
            </TabPanel>
            <TabPanel>
              <ConfigTab columns={columns} />
            </TabPanel>
          </TabPanels>
        </TabsContext>
      ) : (
        <SiniestroTab context={context} numeroSiniestro={numeroSiniestro} />
      )}
    </div>
  );
}
