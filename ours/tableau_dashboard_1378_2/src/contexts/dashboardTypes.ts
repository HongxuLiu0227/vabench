import type { ProviderData } from '../types/data';

export interface DashboardState {
  data: ProviderData[];
  selectedStates: Set<string>;
  selectedProvider: ProviderData | null;
  setSelectedStates: (states: Set<string>) => void;
  setSelectedProvider: (provider: ProviderData | null) => void;
}
