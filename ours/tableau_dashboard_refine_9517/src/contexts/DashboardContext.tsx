import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FilterState, SelectionState } from '../types';

interface DashboardContextType {
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  clearFilters: () => void;
  selection: SelectionState | null;
  setSelection: (selection: SelectionState | null) => void;
  clearSelection: () => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [selection, setSelectionState] = useState<SelectionState | null>(null);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      return updated;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const setSelection = useCallback((newSelection: SelectionState | null) => {
    setSelectionState(newSelection);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(null);
  }, []);

  const value = {
    filters,
    updateFilters,
    clearFilters,
    selection,
    setSelection,
    clearSelection,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

