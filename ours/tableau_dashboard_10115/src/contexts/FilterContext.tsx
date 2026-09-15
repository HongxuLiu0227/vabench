import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import type { FilterState } from '../types';

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  updateFilter: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const defaultFilters: FilterState = useMemo(() => ({
    selectedYear: null,
    selectedGeneration: null,
    selectedSex: null,
    selectedGDP: null,
    selectedAge: null,
  }), []);

  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, [defaultFilters]);

  const updateFilter = useCallback((key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const contextValue: FilterContextType = useMemo(() => ({
    filters,
    setFilters,
    clearFilters,
    updateFilter,
  }), [filters, setFilters, clearFilters, updateFilter]);

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
