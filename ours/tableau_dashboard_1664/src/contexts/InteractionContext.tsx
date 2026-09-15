/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { HighlightState, FilterState } from '../types/interactions';

interface InteractionContextType {
  highlights: Map<string, HighlightState>;
  filters: Map<string, FilterState>;
  setHighlight: (sheet: string, field: string, values: Set<string | number>) => void;
  setFilter: (sheet: string, field: string, values: Set<string | number>) => void;
  clearHighlight: (sheet?: string) => void;
  clearFilter: (sheet?: string) => void;
  isHighlighted: (sheet: string, value: string | number) => boolean;
  isFiltered: (value: string | number) => boolean;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [highlights, setHighlights] = useState<Map<string, HighlightState>>(new Map());
  const [filters, setFilters] = useState<Map<string, FilterState>>(new Map());

  const setHighlight = useCallback((sheet: string, field: string, values: Set<string | number>) => {
    setHighlights((prev) => {
      const newMap = new Map(prev);
      newMap.set(sheet, {
        enabled: true,
        sourceSheet: sheet,
        field,
        values,
      });
      return newMap;
    });
  }, []);

  const setFilter = useCallback((sheet: string, field: string, values: Set<string | number>) => {
    setFilters((prev) => {
      const newMap = new Map(prev);
      newMap.set(sheet, {
        enabled: true,
        sourceSheet: sheet,
        field,
        values,
      });
      return newMap;
    });
  }, []);

  const clearHighlight = useCallback((sheet?: string) => {
    setHighlights((prev) => {
      if (sheet) {
        const newMap = new Map(prev);
        newMap.delete(sheet);
        return newMap;
      }
      return new Map();
    });
  }, []);

  const clearFilter = useCallback((sheet?: string) => {
    setFilters((prev) => {
      if (sheet) {
        const newMap = new Map(prev);
        newMap.delete(sheet);
        return newMap;
      }
      return new Map();
    });
  }, []);

  const isHighlighted = useCallback((sheet: string, value: string | number): boolean => {
    const highlight = highlights.get(sheet);
    if (!highlight || !highlight.enabled || highlight.values.size === 0) {
      return true;
    }
    return highlight.values.has(value);
  }, [highlights]);

  const isFiltered = useCallback((value: string | number): boolean => {
    if (filters.size === 0) return true;

    for (const filter of filters.values()) {
      if (filter.enabled && filter.values.size > 0) {
        return filter.values.has(value);
      }
    }
    return true;
  }, [filters]);

  return (
    <InteractionContext.Provider
      value={{
        highlights,
        filters,
        setHighlight,
        setFilter,
        clearHighlight,
        clearFilter,
        isHighlighted,
        isFiltered,
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteractions() {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteractions must be used within an InteractionProvider');
  }
  return context;
}
