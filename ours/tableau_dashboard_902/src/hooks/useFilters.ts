import { useContext } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import type { FilterContextType } from '../contexts/FilterContext';

export function useFilters(): FilterContextType {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
