/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FilterState, HighlightState } from '../types';

interface DashboardContextType {
  filters: Map<string, FilterState>;
  highlights: Map<string, HighlightState>;
  setFilter: (filter: FilterState) => void;
  clearFilter: (worksheetName: string) => void;
  clearAllFilters: () => void;
  setHighlight: (highlight: HighlightState) => void;
  clearHighlight: (worksheetName: string) => void;
  clearAllHighlights: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Map<string, FilterState>>(new Map());
  const [highlights, setHighlights] = useState<Map<string, HighlightState>>(new Map());

  const setFilter = useCallback((filter: FilterState) => {
    setFilters((prev) => {
      const newFilters = new Map(prev);
      newFilters.set(filter.worksheetName, filter);
      return newFilters;
    });
  }, []);

  const clearFilter = useCallback((worksheetName: string) => {
    setFilters((prev) => {
      const newFilters = new Map(prev);
      newFilters.delete(worksheetName);
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(new Map());
  }, []);

  const setHighlight = useCallback((highlight: HighlightState) => {
    setHighlights((prev) => {
      const newHighlights = new Map(prev);
      newHighlights.set(highlight.worksheetName, highlight);
      return newHighlights;
    });
  }, []);

  const clearHighlight = useCallback((worksheetName: string) => {
    setHighlights((prev) => {
      const newHighlights = new Map(prev);
      newHighlights.delete(worksheetName);
      return newHighlights;
    });
  }, []);

  const clearAllHighlights = useCallback(() => {
    setHighlights(new Map());
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        filters,
        highlights,
        setFilter,
        clearFilter,
        clearAllFilters,
        setHighlight,
        clearHighlight,
        clearAllHighlights,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};
