/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FilterState, HighlightState } from '../types/data';

interface FilterContextValue {
  filters: FilterState;
  highlights: HighlightState;
  setFilter: (filter: Partial<FilterState>) => void;
  clearFilters: () => void;
  setHighlight: (highlight: Partial<HighlightState>) => void;
  clearHighlights: () => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

const initialFilters: FilterState = {
  selectedMonth: null,
  selectedUserType: null,
  selectedGender: null,
};

const initialHighlights: HighlightState = {
  measureName: null,
  gender: null,
  userType: null,
  month: null,
};

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [highlights, setHighlights] = useState<HighlightState>(initialHighlights);

  const setFilter = useCallback((filter: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...filter }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const setHighlight = useCallback((highlight: Partial<HighlightState>) => {
    setHighlights(prev => ({ ...prev, ...highlight }));
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlights(initialHighlights);
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        highlights,
        setFilter,
        clearFilters,
        setHighlight,
        clearHighlights,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
