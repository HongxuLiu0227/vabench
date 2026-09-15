import React, { useState, useEffect, type ReactNode } from 'react';
import type { ProviderData } from '../types/data';
import type { DashboardState } from './dashboardTypes';
import { DashboardContext } from './dashboardContext';
import { loadCsvData, filterSepsisData, validateDataQuality } from '../services/dataLoader';

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [data, setData] = useState<ProviderData[]>([]);
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set(['NJ', 'NY']));
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const rawData = await loadCsvData('/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv');
        const sepsisData = filterSepsisData(rawData);

        // Validate data quality before setting it
        validateDataQuality(sepsisData);

        setData(sepsisData);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSetSelectedStates = (states: Set<string>) => {
    setSelectedStates(states);
    // Auto-clear provider selection when states change (Tableau behavior)
    setSelectedProvider(null);
  };

  const handleSetSelectedProvider = (provider: ProviderData | null) => {
    setSelectedProvider(provider);
  };

  const value: DashboardState = {
    data,
    selectedStates,
    selectedProvider,
    setSelectedStates: handleSetSelectedStates,
    setSelectedProvider: handleSetSelectedProvider,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
