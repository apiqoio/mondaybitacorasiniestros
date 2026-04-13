import React from 'react';
import { Button, Loader } from '@vibe/core';
import { MappingRow } from './MappingRow';
import { useMapping, MIN_MAPPINGS } from '../hooks/useMapping';
import type { BoardColumn } from '../hooks/useMondayContext';
import type { MappingEntry } from '@shared/types';

interface Props {
  columns: BoardColumn[];
}

export function ConfigTab({ columns }: Props) {
  const { mappings, loading, saving, saveError, saveSuccess, isValid, addRow, updateRow, removeRow, persist } =
    useMapping(columns);

  const usedApiFields = mappings.map((m) => m.apiField).filter(Boolean);
  const usedColumnIds = mappings.map((m) => m.columnId).filter(Boolean);
  const validCount = mappings.filter((m) => m.apiField && m.columnId).length;

  if (loading) {
    return (
      <div className="spinner-center">
        <Loader size="medium" />
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">Configuración de Mapeo</h2>
      <p className="section-subtitle">
        Asocia cada campo de la API con una columna del tablero. Se requieren al menos{' '}
        {MIN_MAPPINGS} mapeos.
      </p>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span className={`badge ${validCount >= MIN_MAPPINGS ? 'badge-success' : 'badge-warning'}`}>
          {validCount} mapeo{validCount !== 1 ? 's' : ''} configurado{validCount !== 1 ? 's' : ''}
        </span>
        {validCount < MIN_MAPPINGS && (
          <span style={{ fontSize: 12, color: 'var(--monday-text-secondary)' }}>
            — faltan {MIN_MAPPINGS - validCount} para habilitar
          </span>
        )}
      </div>

      {/* Column headers */}
      {mappings.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 40px',
            gap: 8,
            paddingBottom: 4,
            borderBottom: '2px solid var(--monday-primary, #0073ea)',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--monday-text-secondary, #676879)' }}>
            Campo de la API
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--monday-text-secondary, #676879)' }}>
            Columna del Tablero
          </span>
          <span />
        </div>
      )}

      {/* Mapping rows */}
      {mappings.map((row, i) => (
        <MappingRow
          key={i}
          row={row}
          index={i}
          columns={columns}
          usedApiFields={usedApiFields}
          usedColumnIds={usedColumnIds}
          onChange={(idx, patch, cols) => updateRow(idx, patch as Partial<MappingEntry>, cols)}
          onRemove={removeRow}
        />
      ))}

      {mappings.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin mapeos configurados</div>
            <div style={{ fontSize: 13 }}>
              Agrega al menos {MIN_MAPPINGS} mapeos para habilitar la consulta.
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="actions-bar">
        <button type="button" className="btn-secondary" onClick={addRow}>
          + Agregar campo
        </button>

        <Button
          disabled={!isValid || saving}
          loading={saving}
          onClick={persist}
          size="small"
        >
          Guardar configuración
        </Button>
      </div>

      {saveError && (
        <div className="alert-box alert-box-error" style={{ marginTop: 8 }}>
          <span>✕</span>
          <div>{saveError}</div>
        </div>
      )}

      {saveSuccess && (
        <div className="alert-box alert-box-success" style={{ marginTop: 8 }}>
          <span>✓</span>
          <div>Configuración guardada correctamente</div>
        </div>
      )}
    </div>
  );
}
