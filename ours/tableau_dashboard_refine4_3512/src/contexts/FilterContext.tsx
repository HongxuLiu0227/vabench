import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { FilterState } from '../types/data';

interface FilterContextType {
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
  clearFilter: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filter, setFilterState] = useState<FilterState>({
    year: null,
    breachType: null,
  });

  const setFilter = (newFilter: FilterState) => {
    setFilterState(newFilter);
  };

  const clearFilter = () => {
    setFilterState({
      year: null,
      breachType: null,
    });
  };

  return (
    <FilterContext.Provider value={{ filter, setFilter, clearFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
