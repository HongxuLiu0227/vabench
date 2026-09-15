import { createContext } from 'react';
import type { DashboardState } from './dashboardTypes';

export const DashboardContext = createContext<DashboardState | undefined>(undefined);
