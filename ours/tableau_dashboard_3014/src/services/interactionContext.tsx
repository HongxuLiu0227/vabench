import { useState, useCallback, type ReactNode } from 'react';
import type { SelectionState, FilterState } from '../types';
import { InteractionContext } from '../contexts/InteractionContext';

export interface InteractionContextType {
  selections: Map<string, SelectionState>;
  filterState: FilterState | null;
  setSelection: (worksheet: string, items: string[]) => void;
  clearSelection: (worksheet?: string) => void;
  getSelection: (worksheet: string) => string[];
  setFilter: (enabled: boolean, sourceWorksheet: string, filters: Record<string, string | number | boolean>) => void;
  clearFilter: () => void;
}

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<Map<string, SelectionState>>(new Map());
  const [filterState, setFilterState] = useState<FilterState | null>(null);

  const setSelection = useCallback((worksheet: string, items: string[]) => {
    setSelections(prev => {
      const newMap = new Map(prev);
      if (items.length === 0) {
        newMap.delete(worksheet);
      } else {
        newMap.set(worksheet, {
          worksheet,
          selectedItems: items,
          timestamp: Date.now(),
        });
      }
      return newMap;
    });
  }, []);

  const clearSelection = useCallback((worksheet?: string) => {
    setSelections(prev => {
      if (worksheet) {
        const newMap = new Map(prev);
        newMap.delete(worksheet);
        return newMap;
      }
      return new Map();
    });
  }, []);

  const getSelection = useCallback((worksheet: string): string[] => {
    return selections.get(worksheet)?.selectedItems || [];
  }, [selections]);

  const setFilter = useCallback((enabled: boolean, sourceWorksheet: string, filters: Record<string, string | number | boolean>) => {
    if (enabled) {
      setFilterState({
        enabled: true,
        sourceWorksheet,
        filters,
      });
    } else {
      setFilterState(null);
    }
  }, []);

  const clearFilter = useCallback(() => {
    setFilterState(null);
  }, []);

  return (
    <InteractionContext.Provider
      value={{
        selections,
        filterState,
        setSelection,
        clearSelection,
        getSelection,
        setFilter,
        clearFilter,
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

