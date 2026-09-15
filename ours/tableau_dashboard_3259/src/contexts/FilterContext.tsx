import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FilterState } from '../types';

interface FilterContextType {
  filters: FilterState;
  setUserFilter: (user: string | null) => void;
  setPostFilter: (post: string | null) => void;
  setDateFilter: (date: Date | null) => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    selectedUser: null,
    selectedPost: null,
    selectedDate: null,
  });

  const setUserFilter = useCallback((user: string | null) => {
    setFilters((prev) => ({ ...prev, selectedUser: user }));
  }, []);

  const setPostFilter = useCallback((post: string | null) => {
    setFilters((prev) => ({ ...prev, selectedPost: post }));
  }, []);

  const setDateFilter = useCallback((date: Date | null) => {
    setFilters((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      selectedUser: null,
      selectedPost: null,
      selectedDate: null,
    });
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setUserFilter,
        setPostFilter,
        setDateFilter,
        clearAllFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
