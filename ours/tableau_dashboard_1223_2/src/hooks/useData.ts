import { useState, useEffect } from 'react';
import type { MarketData } from '../services/dataService';
import { loadMarketData } from '../services/dataService';

interface UseDataResult {
  data: MarketData[] | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for loading market penetration data
 */
export function useData(): UseDataResult {
  const [data, setData] = useState<MarketData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result = await loadMarketData();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load data'));
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
