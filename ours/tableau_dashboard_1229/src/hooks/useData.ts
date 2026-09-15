import { useState, useEffect } from 'react';
import type { BaseballPlayer } from '../types/baseball';
import { loadBaseballData } from '../services/dataService';

/**
 * Hook to load and manage baseball data
 */
export function useData() {
  const [data, setData] = useState<BaseballPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const loadedData = await loadBaseballData();
        if (!cancelled) {
          setData(loadedData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load data'));
          console.error('Error loading data:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
