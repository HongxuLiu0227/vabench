/**
 * Dashboard Provider component
 */
import { useState, useCallback } from 'react';
import { DashboardContext } from './DashboardContext';

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [filterState, setFilterState] = useState<{ selectedDay: number | null }>({ selectedDay: null });

  const setDayFilter = useCallback((day: number | null) => {
    setFilterState({ selectedDay: day });
  }, []);

  const toggleDayFilter = useCallback((day: number) => {
    setFilterState(prev => ({
      selectedDay: prev.selectedDay === day ? null : day
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState({ selectedDay: null });
  }, []);

  return (
    <DashboardContext.Provider
      value={{ filterState, setDayFilter, toggleDayFilter, clearFilters }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

