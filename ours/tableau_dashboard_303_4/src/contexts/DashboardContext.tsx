import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DashboardFilters, HighlightState } from '../types/data';

interface DashboardContextType {
  filters: DashboardFilters;
  highlight: HighlightState;
  setFilter: (field: keyof DashboardFilters, values: string[]) => void;
  clearAllFilters: () => void;
  setHighlight: (field: string | null, value: string | null, sourceWorksheet: string | null) => void;
  clearHighlight: () => void;
  isFiltered: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const initialFilters: DashboardFilters = {
  selectedLightConditions: [],
  selectedSpeedLimits: [],
  selectedWeatherConditions: [],
  selectedRoadSurfaceConditions: [],
  selectedAccidentSeverities: [],
  selectedDayOfWeek: []
};

const initialHighlight: HighlightState = {
  field: null,
  value: null,
  sourceWorksheet: null
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [highlight, setHighlightState] = useState<HighlightState>(initialHighlight);

  const setFilter = useCallback((field: keyof DashboardFilters, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [field]: values
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const setHighlight = useCallback((field: string | null, value: string | null, sourceWorksheet: string | null) => {
    setHighlightState({ field, value, sourceWorksheet });

    // Auto-clear highlight after 2 seconds (Tableau behavior)
    if (field !== null && value !== null) {
      setTimeout(() => {
        setHighlightState(initialHighlight);
      }, 2000);
    }
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightState(initialHighlight);
  }, []);

  const isFiltered = Object.values(filters).some(arr => arr.length > 0);

  const value = {
    filters,
    highlight,
    setFilter,
    clearAllFilters,
    setHighlight,
    clearHighlight,
    isFiltered
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
