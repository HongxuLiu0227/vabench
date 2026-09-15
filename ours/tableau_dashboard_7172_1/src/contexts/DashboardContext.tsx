/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SelectionState } from '../types';

interface HighlightState {
  sourceWorksheet: string | null;
  targetWorksheets: Set<string>;
  autoClear: boolean;
}

interface DashboardContextType {
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
  clearSelection: () => void;
  highlightedWorksheets: Set<string>;
  setHighlightedWorksheet: (worksheetName: string) => void;
  clearHighlightedWorksheet: (worksheetName: string) => void;
  highlight: HighlightState;
  triggerHighlight: (sourceWorksheet: string, targetWorksheets: string[], autoClear: boolean) => void;
  clearHighlight: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const initialSelection: SelectionState = {
  broker: null,
  hasPriceCut: null,
  boatType: null,
  boatCondition: null,
};

const initialHighlight: HighlightState = {
  sourceWorksheet: null,
  targetWorksheets: new Set<string>(),
  autoClear: true,
};

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [selection, setSelectionState] = useState<SelectionState>(initialSelection);
  const [highlightedWorksheets, setHighlightedWorksheets] = useState<Set<string>>(new Set());
  const [highlight, setHighlight] = useState<HighlightState>(initialHighlight);

  const setSelection = useCallback((updates: Partial<SelectionState>) => {
    setSelectionState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(initialSelection);
    setHighlightedWorksheets(new Set());
    setHighlight(initialHighlight);
  }, []);

  const setHighlightedWorksheet = useCallback((worksheetName: string) => {
    setHighlightedWorksheets((prev) => new Set(prev).add(worksheetName));
  }, []);

  const clearHighlightedWorksheet = useCallback((worksheetName: string) => {
    setHighlightedWorksheets((prev) => {
      const newSet = new Set(prev);
      newSet.delete(worksheetName);
      return newSet;
    });
  }, []);

  const triggerHighlight = useCallback((sourceWorksheet: string, targetWorksheets: string[], autoClear: boolean) => {
    setHighlight({
      sourceWorksheet,
      targetWorksheets: new Set(targetWorksheets),
      autoClear,
    });
    setHighlightedWorksheets(new Set(targetWorksheets));
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlight(initialHighlight);
    setHighlightedWorksheets(new Set());
  }, []);

  const value = {
    selection,
    setSelection,
    clearSelection,
    highlightedWorksheets,
    setHighlightedWorksheet,
    clearHighlightedWorksheet,
    highlight,
    triggerHighlight,
    clearHighlight,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
