/**
 * Dashboard context for managing filter state across all worksheets
 */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ParsedAccidentRecord, WeatherFilter } from '../types/data';
import { filterByWeather } from '../services/dataService';

interface DashboardContextType {
  data: ParsedAccidentRecord[];
  filteredData: ParsedAccidentRecord[];
  weatherFilter: WeatherFilter;
  setWeatherFilter: (weather: WeatherFilter) => void;
  clearFilter: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, data }: { children: ReactNode; data: ParsedAccidentRecord[] }) {
  const [weatherFilter, setWeatherFilter] = useState<WeatherFilter>(null);

  const filteredData = filterByWeather(data, weatherFilter);

  const clearFilter = () => {
    setWeatherFilter(null);
  };

  const value: DashboardContextType = {
    data,
    filteredData,
    weatherFilter,
    setWeatherFilter,
    clearFilter
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components */
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
/* eslint-enable react-refresh/only-export-components */
