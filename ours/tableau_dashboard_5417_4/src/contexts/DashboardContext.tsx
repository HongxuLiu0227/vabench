/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SelectionState, HighlightState } from '../types/data';

interface DashboardContextType {
  // Current selection state
  selection: SelectionState;
  setSelection: (selection: SelectionState) => void;
  clearSelection: () => void;

  // Highlight states per worksheet
  highlights: Map<string, HighlightState>;
  setHighlight: (worksheet: string, state: HighlightState) => void;
  clearHighlights: () => void;

  // Auto-clear flag (from Tableau actions)
  autoClear: boolean;
  setAutoClear: (value: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<SelectionState>({ clear: true });
  const [highlights, setHighlights] = useState<Map<string, HighlightState>>(new Map());
  const [autoClear, setAutoClear] = useState(true);

  const setSelection = useCallback((newSelection: SelectionState) => {
    setSelectionState(newSelection);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState({ clear: true });
    setHighlights(new Map());
  }, []);

  const setHighlight = useCallback((worksheet: string, state: HighlightState) => {
    setHighlights((prev) => {
      const next = new Map(prev);
      next.set(worksheet, state);
      return next;
    });
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlights(new Map());
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        selection,
        setSelection,
        clearSelection,
        highlights,
        setHighlight,
        clearHighlights,
        autoClear,
        setAutoClear,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
