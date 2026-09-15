import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DashboardState {
  // Filter state
  filters: {
    year: string;
    segment: string;
    region: string;
    category: string;
  };
  // Interaction state
  selectedRegion: string | null;
  selectedCustomer: string | null;
  hoveredCustomer: string | null;
}

interface DashboardContextType {
  state: DashboardState;
  setYear: (year: string) => void;
  setSegment: (segment: string) => void;
  setRegion: (region: string) => void;
  setCategory: (category: string) => void;
  setSelectedRegion: (region: string | null) => void;
  setSelectedCustomer: (customer: string | null) => void;
  setHoveredCustomer: (customer: string | null) => void;
  clearAllSelections: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const initialState: DashboardState = {
  filters: {
    year: 'All',
    segment: 'All',
    region: 'All',
    category: 'All',
  },
  selectedRegion: null,
  selectedCustomer: null,
  hoveredCustomer: null,
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(initialState);

  const setYear = (year: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, year },
    }));
  };

  const setSegment = (segment: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, segment },
    }));
  };

  const setRegion = (region: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, region },
    }));
  };

  const setCategory = (category: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, category },
    }));
  };

  const setSelectedRegion = (region: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedRegion: region,
    }));
  };

  const setSelectedCustomer = (customer: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedCustomer: customer,
    }));
  };

  const setHoveredCustomer = (customer: string | null) => {
    setState((prev) => ({
      ...prev,
      hoveredCustomer: customer,
    }));
  };

  const clearAllSelections = () => {
    setState((prev) => ({
      ...prev,
      selectedRegion: null,
      selectedCustomer: null,
      hoveredCustomer: null,
    }));
  };

  return (
    <DashboardContext.Provider
      value={{
        state,
        setYear,
        setSegment,
        setRegion,
        setCategory,
        setSelectedRegion,
        setSelectedCustomer,
        setHoveredCustomer,
        clearAllSelections,
      }}
    >
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
