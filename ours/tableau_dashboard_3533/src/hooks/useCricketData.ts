import { useState, useEffect } from 'react';
import type { CricketDataRow } from '../types/cricket';
import { loadCricketData } from '../services/dataService';

export const useCricketData = () => {
  const [data, setData] = useState<CricketDataRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cricketData = await loadCricketData();
        setData(cricketData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error loading data');
        console.error('Error loading cricket data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
