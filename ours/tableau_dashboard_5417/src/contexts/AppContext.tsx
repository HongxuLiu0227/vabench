import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameData, FilterState, SelectionState } from '../types';
import { loadData, applyFilters, getUniqueValues } from '../utils/data';

interface AppContextType {
  allData: GameData[];
  filteredData: GameData[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  selection: SelectionState;
  setSelection: (selection: SelectionState) => void;
  availableValues: ReturnType<typeof getUniqueValues>;
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allData, setAllData] = useState<GameData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    genres: [],
    ratings: [],
    developers: [],
    numberPlayers: [],
  });
  const [selection, setSelection] = useState<SelectionState>({
    type: null,
    values: new Set(),
    autoClear: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  React.useEffect(() => {
    loadData()
      .then(data => {
        setAllData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Apply filters
  const filteredData = React.useMemo(() => {
    return applyFilters(allData, filters);
  }, [allData, filters]);

  // Get available values for filters
  const availableValues = React.useMemo(() => {
    return getUniqueValues(allData);
  }, [allData]);

  const value: AppContextType = {
    allData,
    filteredData,
    filters,
    setFilters,
    selection,
    setSelection,
    availableValues,
    loading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
