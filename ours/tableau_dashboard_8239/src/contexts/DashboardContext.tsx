import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DashboardFilters } from '../types';

interface DashboardContextType {
  filters: DashboardFilters;
  setFilter: (key: keyof DashboardFilters, value: any) => void;
  clearFilters: () => void;
  highlightState: {
    category?: string;
    state?: string;
    subCategory?: string;
    year?: number;
    month?: number;
  };
  setHighlight: (field: string, value: any) => void;
  clearHighlight: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const initialFilters: DashboardFilters = {
  year: 'All',
  month: 'All',
  category: [],
  region: [],
  state: [],
  subCategory: [],
};

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [highlightState, setHighlightState] = useState<{
    category?: string;
    state?: string;
    subCategory?: string;
    year?: number;
    month?: number;
  }>({});

  const setFilter = useCallback((key: keyof DashboardFilters, value: any) => {
    setFilters(prev => {
      // Toggle behavior for arrays
      if (Array.isArray(value)) {
        const current = prev[key] as string[] || [];
        // If value is a single item array, toggle it
        if (value.length === 1) {
          const exists = current.includes(value[0]);
          if (exists) {
            // Remove if exists
            const newValue = current.filter(item => item !== value[0]);
            return { ...prev, [key]: newValue.length > 0 ? newValue : undefined };
          } else {
            // Add if doesn't exist
            return { ...prev, [key]: [...current, value[0]] };
          }
        }
        return { ...prev, [key]: value };
      }

      // For single values (year, month), if clicking the same value, clear it
      if (prev[key] === value) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }

      return { ...prev, [key]: value };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const setHighlight = useCallback((field: string, value: any) => {
    setHighlightState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightState({});
  }, []);

  const value = {
    filters,
    setFilter,
    clearFilters,
    highlightState,
    setHighlight,
    clearHighlight,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
