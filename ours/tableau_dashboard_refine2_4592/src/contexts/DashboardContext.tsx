import { createContext, useContext, useState, type ReactNode } from 'react';
import { DashboardFilterState } from '../types';

interface DashboardContextType {
  filters: DashboardFilterState;
  setSalesRep: (rep: string | null) => void;
  setItem: (item: string | null) => void;
  setDate: (date: string | null) => void;
  clearAllFilters: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<DashboardFilterState>({
    selectedSalesRep: null,
    selectedItem: null,
    selectedDate: null,
  });

  const setSalesRep = (rep: string | null) => {
    setFilters(prev => ({ ...prev, selectedSalesRep: rep }));
  };

  const setItem = (item: string | null) => {
    setFilters(prev => ({ ...prev, selectedItem: item }));
  };

  const setDate = (date: string | null) => {
    setFilters(prev => ({ ...prev, selectedDate: date }));
  };

  const clearAllFilters = () => {
    setFilters({
      selectedSalesRep: null,
      selectedItem: null,
      selectedDate: null,
    });
  };

  return (
    <DashboardContext.Provider
      value={{
        filters,
        setSalesRep,
        setItem,
        setDate,
        clearAllFilters,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardFilters() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardFilters must be used within DashboardProvider');
  }
  return context;
}
