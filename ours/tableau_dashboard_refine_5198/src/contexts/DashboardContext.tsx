import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { HighlightState } from '../types';

interface DashboardContextType {
  highlight: HighlightState;
  setHighlight: (highlight: HighlightState) => void;
  clearHighlight: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [highlight, setHighlightState] = useState<HighlightState>({ enabled: false });

  const setHighlight = useCallback((newHighlight: HighlightState) => {
    setHighlightState(newHighlight);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightState({ enabled: false });
  }, []);

  return (
    <DashboardContext.Provider value={{ highlight, setHighlight, clearHighlight }}>
      {children}
    </DashboardContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components */
export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
/* eslint-enable react-refresh/only-export-components */
