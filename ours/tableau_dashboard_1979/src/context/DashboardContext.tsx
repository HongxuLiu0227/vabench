/**
 * Dashboard context for managing global state and selections
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TourismData, LocationGroup, IndicatorType } from '../types/data';

interface SelectionState {
  selectedLocationGroups: LocationGroup[];
  selectedIndicators: IndicatorType[];
  hoveredLocationGroup: LocationGroup | null;
  hoveredIndicator: IndicatorType | null;
}

interface DashboardContextType {
  data: TourismData[];
  setData: (data: TourismData[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selections: SelectionState;
  setSelectedLocationGroups: (groups: LocationGroup[]) => void;
  setSelectedIndicators: (indicators: IndicatorType[]) => void;
  setHoveredLocationGroup: (group: LocationGroup | null) => void;
  setHoveredIndicator: (indicator: IndicatorType | null) => void;
  clearSelections: () => void;
  clearHovers: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DEFAULT_SELECTIONS: SelectionState = {
  selectedLocationGroups: ['Alberta', 'British Columbia', 'Ontario', 'Quebec'],
  selectedIndicators: ['Total demand', 'Domestic demand', 'International demand (exports)', 'Interprovincial demand (exports)'],
  hoveredLocationGroup: null,
  hoveredIndicator: null
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TourismData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selections, setSelections] = useState<SelectionState>(DEFAULT_SELECTIONS);

  const setSelectedLocationGroups = useCallback((groups: LocationGroup[]) => {
    setSelections(prev => ({ ...prev, selectedLocationGroups: groups }));
  }, []);

  const setSelectedIndicators = useCallback((indicators: IndicatorType[]) => {
    setSelections(prev => ({ ...prev, selectedIndicators: indicators }));
  }, []);

  const setHoveredLocationGroup = useCallback((group: LocationGroup | null) => {
    setSelections(prev => ({ ...prev, hoveredLocationGroup: group }));
  }, []);

  const setHoveredIndicator = useCallback((indicator: IndicatorType | null) => {
    setSelections(prev => ({ ...prev, hoveredIndicator: indicator }));
  }, []);

  const clearSelections = useCallback(() => {
    setSelections(DEFAULT_SELECTIONS);
  }, []);

  const clearHovers = useCallback(() => {
    setSelections(prev => ({
      ...prev,
      hoveredLocationGroup: null,
      hoveredIndicator: null
    }));
  }, []);

  const value: DashboardContextType = {
    data,
    setData,
    isLoading,
    setIsLoading,
    selections,
    setSelectedLocationGroups,
    setSelectedIndicators,
    setHoveredLocationGroup,
    setHoveredIndicator,
    clearSelections,
    clearHovers
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
