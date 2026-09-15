import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FilterState } from '../types';

interface DashboardContextType {
  filters: FilterState;
  setStartStation: (station: string | null) => void;
  setEndStation: (station: string | null) => void;
  clearFilters: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export { DashboardContext };

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    startStation: null,
    endStation: null,
  });

  const setStartStation = useCallback((station: string | null) => {
    setFilters(prev => ({ ...prev, startStation: station }));
  }, []);

  const setEndStation = useCallback((station: string | null) => {
    setFilters(prev => ({ ...prev, endStation: station }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ startStation: null, endStation: null });
  }, []);

  return (
    <DashboardContext.Provider value={{ filters, setStartStation, setEndStation, clearFilters }}>
      {children}
    </DashboardContext.Provider>
  );
}
