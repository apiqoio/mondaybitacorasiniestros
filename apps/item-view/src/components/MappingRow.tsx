import React from 'react';
import { Dropdown } from '@vibe/core';
import { API_FIELDS } from '@shared/types';
import type { MappingEntry } from '@shared/types';
import type { BoardColumn } from '../hooks/useMondayContext';

interface Props {
  row: MappingEntry;
  index: number;
  columns: BoardColumn[];
  usedApiFields: string[];
  usedColumnIds: string[];
  onChange: (index: number, patch: Partial<MappingEntry>, columns: BoardColumn[]) => void;
  onRemove: (index: number) => void;
}

export function MappingRow({
  row,
  index,
  columns,
  usedApiFields,
  usedColumnIds,
  onChange,
  onRemove,
}: Props) {
  const apiOptions = API_FIELDS.map((f) => ({
    value: f.key,
    label: `${f.label} (${f.group})`,
    disabled: f.key !== row.apiField && usedApiFields.includes(f.key),
  }));

  const columnOptions = columns.map((c) => ({
    value: c.id,
    label: `${c.title} (${c.type})`,
    disabled: c.id !== row.columnId && usedColumnIds.includes(c.id),
  }));

  const selectedApi = apiOptions.find((o) => o.value === row.apiField) ?? undefined;
  const selectedCol = columnOptions.find((o) => o.value === row.columnId) ?? undefined;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 40px',
        gap: 8,
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid var(--monday-border, #d0d4e4)',
      }}
    >
      <Dropdown
        placeholder="Campo de la API..."
        options={apiOptions}
        value={selectedApi}
        onChange={(opt: any) =>
          onChange(index, { apiField: opt?.value ?? '' }, columns)
        }
        size="small"
        searchable
      />
      <Dropdown
        placeholder="Columna del tablero..."
        options={columnOptions}
        value={selectedCol}
        onChange={(opt: any) =>
          onChange(index, { columnId: opt?.value ?? '' }, columns)
        }
        size="small"
        searchable
      />
      <button
        type="button"
        className="btn-icon"
        onClick={() => onRemove(index)}
        title="Eliminar mapeo"
      >
        ✕
      </button>
    </div>
  );
}
