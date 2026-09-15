/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import type { HighlightContextType } from '../types';

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const useHighlight = (): HighlightContextType => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};

interface HighlightProviderProps {
  children: React.ReactNode;
}

export const HighlightProvider = ({ children }: HighlightProviderProps) => {
  const [highlightedStartStation, setHighlightedStartStation] = useState<string | null>(null);
  const [highlightedEndStation, setHighlightedEndStation] = useState<string | null>(null);
  const [highlightedYear, setHighlightedYear] = useState<string | null>(null);

  const setHighlight = useCallback((type: 'start' | 'end' | 'year', value: string | null) => {
    switch (type) {
      case 'start':
        setHighlightedStartStation(value);
        break;
      case 'end':
        setHighlightedEndStation(value);
        break;
      case 'year':
        setHighlightedYear(value);
        break;
    }
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightedStartStation(null);
    setHighlightedEndStation(null);
    setHighlightedYear(null);
  }, []);

  const value: HighlightContextType = {
    highlightedStartStation,
    highlightedEndStation,
    highlightedYear,
    setHighlight,
    clearHighlight
  };

  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
};
