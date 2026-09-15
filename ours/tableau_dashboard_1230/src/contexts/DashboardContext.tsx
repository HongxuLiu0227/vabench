import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { BaseballPlayer, PlayerDataPoint, FilterState, SelectionState } from '../types';
import { loadBaseballData, processPlayerData, getUniqueHandedness, filterByHandedness } from '../services/dataService';

interface DashboardContextType {
  // Raw and processed data
  rawData: BaseballPlayer[];
  processedData: PlayerDataPoint[];
  filteredData: PlayerDataPoint[];

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Filter state
  availableHandedness: string[];
  filterState: FilterState;
  setFilterState: (filters: FilterState) => void;

  // Selection state for highlights
  selectionState: SelectionState;
  setSelectionState: (selection: SelectionState) => void;
  clearSelection: () => void;

  // Actions
  selectByName: (names: string[], sourceWorksheet?: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [rawData, setRawData] = useState<BaseballPlayer[]>([]);
  const [processedData, setProcessedData] = useState<PlayerDataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<PlayerDataPoint[]>([]);
  const [availableHandedness, setAvailableHandedness] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterState, setFilterState] = useState<FilterState>({
    handedness: []
  });

  const [selectionState, setSelectionState] = useState<SelectionState>({
    names: [],
    sourceWorksheet: undefined
  });

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await loadBaseballData();
        setRawData(data);

        const processed = processPlayerData(data);
        setProcessedData(processed);

        const handednessValues = getUniqueHandedness(data);
        setAvailableHandedness(handednessValues);

        // Initialize filter to all values
        setFilterState({ handedness: handednessValues });

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Update filtered data when filters or processed data changes
  useEffect(() => {
    if (processedData.length === 0) {
      setFilteredData([]);
      return;
    }

    const filtered = filterByHandedness(processedData, filterState.handedness);
    setFilteredData(filtered);
  }, [processedData, filterState]);

  // Selection actions
  const selectByName = (names: string[], sourceWorksheet?: string) => {
    setSelectionState({
      names,
      sourceWorksheet
    });
  };

  const clearSelection = () => {
    setSelectionState({
      names: [],
      sourceWorksheet: undefined
    });
  };

  const value: DashboardContextType = {
    rawData,
    processedData,
    filteredData,
    isLoading,
    error,
    availableHandedness,
    filterState,
    setFilterState,
    selectionState,
    setSelectionState,
    clearSelection,
    selectByName
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components */
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
