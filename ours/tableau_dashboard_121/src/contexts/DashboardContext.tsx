import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { FilterState } from '../types';

interface DashboardContextType {
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
  clearFilter: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filter, setFilterState] = useState<FilterState>({
    category: null,
    subCategory: null
  });

  const setFilter = (newFilter: FilterState) => {
    setFilterState(newFilter);
  };

  const clearFilter = () => {
    setFilterState({
      category: null,
      subCategory: null
    });
  };

  return (
    <DashboardContext.Provider value={{ filter, setFilter, clearFilter }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Suppress react-refresh warning for context providers
export default undefined;
