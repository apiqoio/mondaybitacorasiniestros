import React from 'react';
import { Button, Loader, Text, AlertBanner, AlertBannerText } from '@vibe/core';
import { Add } from '@vibe/icons';
import { MappingRow } from './MappingRow';
import { useMapping, MIN_MAPPINGS } from '../hooks/useMapping';
import type { BoardColumn } from '../hooks/useMondayContext';
import type { MappingEntry } from '@shared/types';

interface Props {
  columns: BoardColumn[];
}

export function ConfigTab({ columns }: Props) {
  const { mappings, loading, saving, saveError, isValid, addRow, updateRow, removeRow, persist } =
    useMapping(columns);

  const usedApiFields = mappings.map((m) => m.apiField).filter(Boolean);
  const usedColumnIds = mappings.map((m) => m.columnId).filter(Boolean);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
        <Loader size="medium" />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: '700px' }}>
      <Text element="h2" weight="bold">
        Configuración de Mapeo
      </Text>
      <Text
        type="text2"
        color="secondary"
        style={{ marginBottom: '16px', display: 'block' }}
      >
        Asocia cada campo de la API con una columna del tablero. Se requieren al menos{' '}
        {MIN_MAPPINGS} mapeos para habilitar el botón.
      </Text>

      {/* Encabezados */}
      {mappings.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '8px',
            paddingBottom: '4px',
            borderBottom: '2px solid var(--primary-color)',
          }}
        >
          <Text weight="bold">Campo de la API</Text>
          <Text weight="bold">Columna del tablero</Text>
          <span />
        </div>
      )}

      {/* Filas de mapeo */}
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
        <Text
          color="secondary"
          style={{ display: 'block', textAlign: 'center', padding: '24px 0' }}
        >
          Sin mapeos configurados. Agrega al menos {MIN_MAPPINGS}.
        </Text>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
        <Button
          kind="tertiary"
          leftIcon={Add}
          onClick={addRow}
          size="small"
        >
          Agregar campo
        </Button>

        <Button
          disabled={!isValid || saving}
          loading={saving}
          onClick={persist}
          size="small"
        >
          Guardar configuración
        </Button>

        {!isValid && mappings.length > 0 && (
          <Text color="secondary" type="text2">
            Se necesitan al menos {MIN_MAPPINGS} mapeos completos
          </Text>
        )}
      </div>

      {saveError && (
        <div style={{ marginTop: '12px' }}>
          <AlertBanner backgroundColor="negative" isCloseHidden>
            <AlertBannerText text={saveError} />
          </AlertBanner>
        </div>
      )}
    </div>
  );
}
