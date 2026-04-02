import React, { useEffect, useState } from 'react';
import { Button, Loader, Text, AttentionBox } from '@vibe/core';
import { useSiniestro } from '../hooks/useSiniestro';
import { loadMapping } from '../services/storage.service';
import { MIN_MAPPINGS } from '../hooks/useMapping';
import type { MondayContextData } from '../hooks/useMondayContext';

interface Props {
  context: MondayContextData;
  numeroSiniestro: string | null;
}

export function SiniestroTab({ context, numeroSiniestro }: Props) {
  const { status, data, message, consultar } = useSiniestro();
  const [hasMapping, setHasMapping] = useState<boolean | null>(null);

  // Verificar si hay suficientes mapeos configurados
  useEffect(() => {
    loadMapping().then((config) => {
      const count = config?.mappings?.filter((m) => m.apiField && m.columnId).length ?? 0;
      setHasMapping(count >= MIN_MAPPINGS);
    });
  }, []);

  if (hasMapping === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
        <Loader size="small" />
      </div>
    );
  }

  const canConsult = hasMapping && !!numeroSiniestro;

  return (
    <div style={{ padding: '16px' }}>
      {/* Número de siniestro */}
      <div style={{ marginBottom: '16px' }}>
        <Text weight="bold">Número de Siniestro</Text>
        <Text style={{ fontSize: '24px', margin: '4px 0' }}>
          {numeroSiniestro ?? <span style={{ color: 'var(--secondary-text-color)' }}>—</span>}
        </Text>
      </div>

      {/* Aviso si no hay configuración */}
      {!hasMapping && (
        <div style={{ marginBottom: '16px' }}>
          <AttentionBox
            title="Sin configuración"
            text="No hay mapeo de campos configurado. Un administrador debe configurarlo en la pestaña Configuración."
            type="warning"
          />
        </div>
      )}

      {/* Aviso si no hay número de siniestro */}
      {hasMapping && !numeroSiniestro && (
        <div style={{ marginBottom: '16px' }}>
          <AttentionBox
            title="Sin número de siniestro"
            text="Este elemento no tiene número de siniestro asignado en la columna SINIESTRO."
            type="warning"
          />
        </div>
      )}

      {/* Botón principal */}
      <Button
        disabled={!canConsult || status === 'loading'}
        loading={status === 'loading'}
        onClick={() =>
          consultar(context.boardId, context.itemId, numeroSiniestro!)
        }
        size="medium"
      >
        Consultar y Poblar Datos
      </Button>

      {/* Resultado */}
      {status === 'success' && message && (
        <div style={{ marginTop: '16px' }}>
          <AttentionBox
            title="Completado"
            text={message}
            type="positive"
          />
        </div>
      )}

      {status === 'error' && message && (
        <div style={{ marginTop: '16px' }}>
          <AttentionBox
            title="Error"
            text={message}
            type="negative"
          />
        </div>
      )}

      {/* Vista previa de datos obtenidos */}
      {data && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'var(--primary-background-hover-color)',
            borderRadius: '8px',
          }}
        >
          <Text weight="bold" style={{ marginBottom: '8px' }}>
            Datos recibidos de la API
          </Text>
          {Object.entries(data)
            .filter(([, v]) => v !== '' && v !== null)
            .map(([key, value]) => (
              <div
                key={key}
                style={{ display: 'flex', gap: '8px', padding: '2px 0' }}
              >
                <Text
                  type="text2"
                  color="secondary"
                  style={{ minWidth: '180px' }}
                >
                  {key}
                </Text>
                <Text type="text2">{String(value)}</Text>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
