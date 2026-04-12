import React, { useEffect, useState } from 'react';
import { Button, Loader, TextField } from '@vibe/core';
import { useSiniestro } from '../hooks/useSiniestro';
import { API_FIELD_GROUPS } from '@shared/types';
import type { MondayContextData } from '../hooks/useMondayContext';
import type { SearchMode, SearchParams, SiniestroApiResponse } from '@shared/types';

interface Props {
  context: MondayContextData;
  numeroSiniestro: string | null;
}

const MODES: { value: SearchMode; label: string; icon: string }[] = [
  { value: 'siniestro', label: 'Siniestro', icon: '🔍' },
  { value: 'poliza', label: 'Póliza', icon: '📋' },
  { value: 'filenet', label: 'FileNet', icon: '📁' },
];

function DataPreview({ data }: { data: SiniestroApiResponse }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (group: string) =>
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));

  const groupsWithData = API_FIELD_GROUPS.map((g) => {
    const fieldsWithValue = g.fields.filter((f) => {
      const val = data[f.key];
      return val !== undefined && val !== null && String(val).trim() !== '' && String(val).trim() !== ' ';
    });
    return { ...g, fieldsWithValue };
  }).filter((g) => g.fieldsWithValue.length > 0);

  return (
    <div className="data-preview">
      {/* Summary stats */}
      <div className="stat-row">
        {data.Siniestro && (
          <div className="stat-card">
            <div className="stat-value">{data.Siniestro}</div>
            <div className="stat-label">Siniestro</div>
          </div>
        )}
        {data.poliza && (
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: 14 }}>{data.poliza}</div>
            <div className="stat-label">Póliza</div>
          </div>
        )}
        {data.Estado_Poliza && (
          <div className="stat-card">
            <div>
              <span
                className={`badge ${
                  String(data.Estado_Poliza).toLowerCase().includes('vigencia')
                    ? 'badge-success'
                    : 'badge-warning'
                }`}
              >
                {data.Estado_Poliza}
              </span>
            </div>
            <div className="stat-label" style={{ marginTop: 4 }}>Estado</div>
          </div>
        )}
      </div>

      {groupsWithData.map((g) => (
        <div className="data-group" key={g.group}>
          <div className="data-group-header" onClick={() => toggle(g.group)}>
            <span>
              {g.group}{' '}
              <span style={{ fontWeight: 400, fontSize: 11 }}>
                ({g.fieldsWithValue.length})
              </span>
            </span>
            <span className={`data-group-chevron ${collapsed[g.group] ? 'collapsed' : ''}`}>
              ▼
            </span>
          </div>
          {!collapsed[g.group] && (
            <div className="data-group-body">
              {g.fieldsWithValue.map((f) => (
                <div className="data-row" key={f.key}>
                  <span className="data-label">{f.label}</span>
                  <span className="data-value">{String(data[f.key])}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SiniestroTab({ context, numeroSiniestro }: Props) {
  const {
    fetchStatus,
    writeStatus,
    data,
    message,
    writeMessage,
    writeDetalles,
    mappings,
    consultar,
    poblar,
  } = useSiniestro();

  const [mode, setMode] = useState<SearchMode>('siniestro');
  const [oficina, setOficina] = useState('');
  const [ramo, setRamo] = useState('');
  const [poliza, setPoliza] = useState('');
  const [numSiniestro, setNumSiniestro] = useState('');
  const [numFilenet, setNumFilenet] = useState('');

  useEffect(() => {
    if (numeroSiniestro) {
      setNumSiniestro(numeroSiniestro);
      setMode('siniestro');
    }
  }, [numeroSiniestro]);

  const isFormValid = (() => {
    if (mode === 'poliza') return !!(oficina.trim() && ramo.trim() && poliza.trim());
    if (mode === 'siniestro') return !!numSiniestro.trim();
    if (mode === 'filenet') return !!numFilenet.trim();
    return false;
  })();

  const handleConsultar = () => {
    if (!isFormValid) return;

    let params: SearchParams;
    if (mode === 'poliza') {
      params = { mode: 'poliza', oficina: oficina.trim(), ramo: ramo.trim(), poliza: poliza.trim() };
    } else if (mode === 'siniestro') {
      params = { mode: 'siniestro', numeroSiniestro: numSiniestro.trim() };
    } else {
      params = { mode: 'filenet', filenet: numFilenet.trim() };
    }

    consultar(params);
  };

  const handlePoblar = () => {
    poblar(context.boardId, context.itemId);
  };

  const hasMappings = mappings.length >= 2;

  return (
    <div className="section">
      {/* Search card */}
      <div className="card">
        <div className="card-header">
          <span style={{ fontWeight: 600, fontSize: 14 }}>Buscar Siniestro</span>
          {fetchStatus === 'loading' && <Loader size={20} />}
        </div>
        <div className="card-body">
          {/* Mode selector */}
          <div className="search-mode-group">
            {MODES.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                className={`search-mode-btn ${mode === value ? 'active' : ''}`}
                onClick={() => setMode(value)}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Search fields */}
          <div className="search-form">
            {mode === 'poliza' && (
              <div className="search-row">
                <TextField
                  title="Oficina"
                  placeholder="Ej. 4"
                  value={oficina}
                  onChange={(val: string) => setOficina(val)}
                  size="small"
                />
                <TextField
                  title="Ramo"
                  placeholder="Ej. 211"
                  value={ramo}
                  onChange={(val: string) => setRamo(val)}
                  size="small"
                />
                <TextField
                  title="Póliza"
                  placeholder="Ej. 116406"
                  value={poliza}
                  onChange={(val: string) => setPoliza(val)}
                  size="small"
                />
              </div>
            )}

            {mode === 'siniestro' && (
              <TextField
                title="Número de Siniestro"
                placeholder="Ej. 507"
                value={numSiniestro}
                onChange={(val: string) => setNumSiniestro(val)}
                size="small"
              />
            )}

            {mode === 'filenet' && (
              <TextField
                title="Número de FileNet"
                placeholder="Ej. 3657807"
                value={numFilenet}
                onChange={(val: string) => setNumFilenet(val)}
                size="small"
              />
            )}

            <div>
              <Button
                disabled={!isFormValid || fetchStatus === 'loading'}
                loading={fetchStatus === 'loading'}
                onClick={handleConsultar}
                size="small"
              >
                Consultar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fetch error */}
      {fetchStatus === 'error' && message && (
        <div className="alert-box alert-box-error" style={{ marginTop: 16 }}>
          <span>✕</span>
          <div>{message}</div>
        </div>
      )}

      {/* Data preview + Populate button */}
      {data && fetchStatus === 'loaded' && (
        <>
          <DataPreview data={data} />

          {/* Populate action */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Actualizar Tablero</span>
              {hasMappings && (
                <span className="badge badge-info">
                  {mappings.length} campo{mappings.length !== 1 ? 's' : ''} mapeado{mappings.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="card-body">
              {!hasMappings ? (
                <div className="alert-box alert-box-warning">
                  <span>⚠️</span>
                  <div>
                    No hay mapeo de campos configurado. Un administrador debe configurarlo en la pestaña <strong>Configuración</strong>.
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--monday-text-secondary)' }}>
                    Revisa la información arriba. Al confirmar, se actualizarán los campos mapeados en el tablero.
                  </p>
                  <Button
                    disabled={writeStatus === 'writing'}
                    loading={writeStatus === 'writing'}
                    onClick={handlePoblar}
                    size="small"
                    color="positive"
                  >
                    Confirmar y Actualizar Campos
                  </Button>
                </>
              )}

              {/* Write results */}
              {writeStatus === 'success' && writeMessage && (
                <div className="alert-box alert-box-success" style={{ marginTop: 12 }}>
                  <span>✓</span>
                  <div>
                    <strong>{writeMessage}</strong>
                    {writeDetalles.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 12 }}>
                        {writeDetalles.map((d, i) => (
                          <div key={i}>{d}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {writeStatus === 'error' && writeMessage && (
                <div className="alert-box alert-box-error" style={{ marginTop: 12 }}>
                  <span>✕</span>
                  <div>
                    <strong>{writeMessage}</strong>
                    {writeDetalles.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 12 }}>
                        {writeDetalles.map((d, i) => (
                          <div key={i}>{d}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
