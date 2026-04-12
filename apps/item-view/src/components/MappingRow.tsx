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
  // Group API field options by category
  const apiOptions = API_FIELDS.map((f) => ({
    value: f.key,
    label: `${f.label}`,
    leftAvatar: f.group,
    isDisabled: f.key !== row.apiField && usedApiFields.includes(f.key),
  }));

  const columnOptions = columns.map((c) => ({
    value: c.id,
    label: `${c.title} (${c.type})`,
    isDisabled: c.id !== row.columnId && usedColumnIds.includes(c.id),
  }));

  const selectedApi = apiOptions.find((o) => o.value === row.apiField) ?? undefined;
  const selectedCol = columnOptions.find((o) => o.value === row.columnId) ?? undefined;

  return (
    <tr>
      <td>
        <Dropdown
          placeholder="Seleccionar campo..."
          options={apiOptions}
          value={selectedApi}
          onChange={(opt: any) =>
            onChange(index, { apiField: opt?.value ?? '' }, columns)
          }
          size="small"
          searchable
        />
      </td>
      <td>
        <Dropdown
          placeholder="Seleccionar columna..."
          options={columnOptions}
          value={selectedCol}
          onChange={(opt: any) =>
            onChange(index, { columnId: opt?.value ?? '' }, columns)
          }
          size="small"
          searchable
        />
      </td>
      <td>
        <button
          type="button"
          className="btn-icon"
          onClick={() => onRemove(index)}
          title="Eliminar mapeo"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
