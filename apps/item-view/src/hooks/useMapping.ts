import { useCallback, useEffect, useState } from 'react';
import { loadMapping, saveMapping } from '../services/storage.service';
import type { MappingEntry, MappingConfig } from '@shared/types';
import type { BoardColumn } from './useMondayContext';

export const MIN_MAPPINGS = 2;

export function useMapping(columns: BoardColumn[]) {
  const [mappings, setMappings] = useState<MappingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Carga inicial desde Monday Storage
  useEffect(() => {
    if (columns.length === 0) return;
    loadMapping()
      .then((config) => {
        if (config?.mappings) setMappings(config.mappings);
      })
      .finally(() => setLoading(false));
  }, [columns.length]);

  const addRow = useCallback(() => {
    setMappings((prev) => [
      ...prev,
      { apiField: '', columnId: '', columnTitle: '', columnType: '' },
    ]);
  }, []);

  const updateRow = useCallback(
    (index: number, patch: Partial<MappingEntry>, allColumns: BoardColumn[]) => {
      setMappings((prev) =>
        prev.map((row, i) => {
          if (i !== index) return row;
          const updated = { ...row, ...patch };
          if (patch.columnId) {
            const col = allColumns.find((c) => c.id === patch.columnId);
            if (col) {
              updated.columnTitle = col.title;
              updated.columnType = col.type;
            }
          }
          return updated;
        }),
      );
      setSaveSuccess(false);
    },
    [],
  );

  const removeRow = useCallback((index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
    setSaveSuccess(false);
  }, []);

  const isValid = mappings.filter((m) => m.apiField && m.columnId).length >= MIN_MAPPINGS;

  const persist = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const validMappings = mappings.filter((m) => m.apiField && m.columnId);
      const config: MappingConfig = { mappings: validMappings };
      await saveMapping(config);
      setSaveSuccess(true);
    } catch {
      setSaveError('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  }, [mappings]);

  return { mappings, loading, saving, saveError, saveSuccess, isValid, addRow, updateRow, removeRow, persist };
}
