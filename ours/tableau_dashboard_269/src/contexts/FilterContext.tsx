import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DashboardFilters, SelectionState } from '../types';
import { initialFilters, initialSelection } from '../types';

interface FilterContextType {
  filters: DashboardFilters;
  selection: SelectionState;
  setFilter: (field: keyof DashboardFilters, value: string | number | null) => void;
  setSelection: (field: keyof SelectionState, value: string | null) => void;
  clearFilter: (field: keyof DashboardFilters) => void;
  clearSelection: (field: keyof SelectionState) => void;
  clearAllFilters: () => void;
  clearAllSelections: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [selection, setSelectionState] = useState<SelectionState>(initialSelection);

  const setFilter = useCallback((field: keyof DashboardFilters, value: string | number | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const setSelection = useCallback((field: keyof SelectionState, value: string | null) => {
    setSelectionState(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearFilter = useCallback((field: keyof DashboardFilters) => {
    setFilters(prev => ({ ...prev, [field]: null }));
  }, []);

  const clearSelection = useCallback((field: keyof SelectionState) => {
    setSelectionState(prev => ({ ...prev, [field]: null }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const clearAllSelections = useCallback(() => {
    setSelectionState(initialSelection);
  }, []);

  return (
    <FilterContext.Provider value={{
      filters,
      selection,
      setFilter,
      setSelection,
      clearFilter,
      clearSelection,
      clearAllFilters,
      clearAllSelections,
    }}>
      {children}
    </FilterContext.Provider>
  );
};
