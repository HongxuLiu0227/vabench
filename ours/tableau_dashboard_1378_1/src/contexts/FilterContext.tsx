import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { FilterState } from '../types';

interface FilterContextType extends FilterState {
  setSelectedDiagnosis: (diagnosis: string | null) => void;
  clearFilter: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
}

/**
 * Provider for global filter state management
 * Handles the selected diagnosis filter that affects multiple worksheets
 */
export function FilterProvider({ children }: FilterProviderProps) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);

  const clearFilter = () => {
    setSelectedDiagnosis(null);
  };

  return (
    <FilterContext.Provider
      value={{
        selectedDiagnosis,
        setSelectedDiagnosis,
        clearFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

/**
 * Hook to access the filter context
 * Throws an error if used outside of FilterProvider
 */
/* eslint-disable react-refresh/only-export-components */
export function useFilter(): FilterContextType {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
/* eslint-enable react-refresh/only-export-components */
