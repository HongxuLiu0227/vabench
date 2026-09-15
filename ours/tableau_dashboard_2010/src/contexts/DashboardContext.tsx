/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Variation } from '../types/data';

interface DashboardContextType {
  selectedVariation: Variation | null;
  setSelectedVariation: (variation: Variation | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);

  return (
    <DashboardContext.Provider value={{ selectedVariation, setSelectedVariation }}>
      {children}
    </DashboardContext.Provider>
  );
}

