/**
 * Hook to use dashboard context
 */
import { useContext } from 'react';
import { DashboardContext, type DashboardContextType } from './DashboardContext';

export function useDashboardContext(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardProvider');
  }
  return context;
}
