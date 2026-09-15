import { useContext } from 'react';
import { DashboardContext } from '../contexts/dashboardContext';
import type { DashboardState } from '../contexts/dashboardTypes';

export const useDashboard = (): DashboardState => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
