import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { CitiBikeTrip, FilterState, DashboardContextType } from '../types/citibike';
import { loadCitiBikeData } from '../services/dataLoader';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CitiBikeTrip[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    selectedStation: null,
    selectedEndStation: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const trips = await loadCitiBikeData();
        setData(trips);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply start station filter
    if (filterState.selectedStation) {
      filtered = filtered.filter(
        (trip) => trip['start station name'] === filterState.selectedStation
      );
    }

    // Apply end station filter
    if (filterState.selectedEndStation) {
      filtered = filtered.filter(
        (trip) => trip['end station name'] === filterState.selectedEndStation
      );
    }

    return filtered;
  }, [data, filterState]);

  const value: DashboardContextType = {
    data,
    filteredData,
    filterState,
    setFilterState,
    loading,
    error,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
