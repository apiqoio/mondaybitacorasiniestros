import React, { useEffect, useState } from 'react';
import { Button, Loader, TextField } from '@vibe/core';
import { useSiniestro } from '../hooks/useSiniestro';
import { loadMapping } from '../services/storage.service';
import { MIN_MAPPINGS } from '../hooks/useMapping';
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

  // Count non-empty fields per group
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
  const { status, data, message, consultar } = useSiniestro();
  const [hasMapping, setHasMapping] = useState<boolean | null>(null);

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

  useEffect(() => {
    loadMapping().then((config) => {
      const count = config?.mappings?.filter((m) => m.apiField && m.columnId).length ?? 0;
      setHasMapping(count >= MIN_MAPPINGS);
    });
  }, []);

  if (hasMapping === null) {
    return (
      <div className="spinner-center">
        <Loader size="small" />
      </div>
    );
  }

  const isFormValid = (() => {
    if (mode === 'poliza') return !!(oficina.trim() && ramo.trim() && poliza.trim());
    if (mode === 'siniestro') return !!numSiniestro.trim();
    if (mode === 'filenet') return !!numFilenet.trim();
    return false;
  })();

  const canConsult = hasMapping && isFormValid;

  const handleConsultar = () => {
    if (!canConsult) return;

    let params: SearchParams;
    if (mode === 'poliza') {
      params = { mode: 'poliza', oficina: oficina.trim(), ramo: ramo.trim(), poliza: poliza.trim() };
    } else if (mode === 'siniestro') {
      params = { mode: 'siniestro', numeroSiniestro: numSiniestro.trim() };
    } else {
      params = { mode: 'filenet', filenet: numFilenet.trim() };
    }

    consultar(context.boardId, context.itemId, params);
  };

  return (
    <div className="section">
      {/* Warning if no mapping */}
      {!hasMapping && (
        <div className="alert-box alert-box-warning" style={{ marginBottom: 16 }}>
          <span>⚠️</span>
          <div>
            <strong>Sin configuración</strong>
            <div style={{ marginTop: 2 }}>
              No hay mapeo de campos configurado. Un administrador debe configurarlo en la pestaña Configuración.
            </div>
          </div>
        </div>
      )}

      {/* Search card */}
      <div className="card">
        <div className="card-header">
          <span style={{ fontWeight: 600, fontSize: 14 }}>Buscar Siniestro</span>
          {status === 'loading' && <Loader size={20} />}
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
                disabled={!canConsult || status === 'loading'}
                loading={status === 'loading'}
                onClick={handleConsultar}
                size="small"
              >
                Consultar y Poblar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {status === 'success' && message && (
        <div className="alert-box alert-box-success" style={{ marginTop: 16 }}>
          <span>✓</span>
          <div>{message}</div>
        </div>
      )}

      {status === 'error' && message && (
        <div className="alert-box alert-box-error" style={{ marginTop: 16 }}>
          <span>✕</span>
          <div>{message}</div>
        </div>
      )}

      {/* Data preview */}
      {data && <DataPreview data={data} />}
    </div>
  );
}
