/**
 * Dashboard filter and interaction context
 * Implements Filter 3 action: selecting a day filters the hour chart
 */
import { createContext } from 'react';
import type { FilterState } from '../types';

export interface DashboardContextType {
  filterState: FilterState;
  setDayFilter: (day: number | null) => void;
  toggleDayFilter: (day: number) => void;
  clearFilters: () => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);
