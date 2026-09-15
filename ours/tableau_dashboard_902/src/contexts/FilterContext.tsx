import { createContext, useState, type ReactNode } from 'react';
import type { FilterState } from '../types/data';
import { initialFilters } from '../constants/filter';

export interface FilterContextType {
  filters: FilterState;
  setControlFilter: (value: number | null) => void;
  setChannelFilter: (value: string | null) => void;
  setCampaignFilter: (value: string | null) => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const setControlFilter = (value: number | null) => {
    setFilters((prev) => ({ ...prev, control: value }));
  };

  const setChannelFilter = (value: string | null) => {
    setFilters((prev) => ({ ...prev, channel: value }));
  };

  const setCampaignFilter = (value: string | null) => {
    setFilters((prev) => ({ ...prev, campaign: value }));
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setControlFilter,
        setChannelFilter,
        setCampaignFilter,
        clearAllFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export { FilterContext };
