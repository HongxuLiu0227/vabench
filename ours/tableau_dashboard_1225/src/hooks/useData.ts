import { useState, useEffect } from 'react';
import { loadCsvData } from '../services/dataLoader';
import type { ParsedSalesData } from '../types/data';

export function useData() {
  const [data, setData] = useState<ParsedSalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const loadedData = await loadCsvData();
        setData(loadedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
