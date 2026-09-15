import { createContext, useContext, useState, type ReactNode } from 'react';
import type { HighlightState } from '../types';

interface DashboardContextType {
  highlightState: HighlightState;
  setHighlight: (dimension: string | null, value: string | null) => void;
  clearHighlight: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [highlightState, setHighlightState] = useState<HighlightState>({
    dimension: null,
    value: null,
  });

  const setHighlight = (dimension: string | null, value: string | null) => {
    setHighlightState({ dimension, value });
  };

  const clearHighlight = () => {
    setHighlightState({ dimension: null, value: null });
  };

  return (
    <DashboardContext.Provider value={{ highlightState, setHighlight, clearHighlight }}>
      {children}
    </DashboardContext.Provider>
  );
};
