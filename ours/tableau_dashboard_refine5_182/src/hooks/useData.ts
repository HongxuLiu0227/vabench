import { useState, useEffect } from 'react';
import { fetchSuperstoreData } from '../services/dataService';
import type { SuperstoreData } from '../services/types';

export function useData() {
  const [data, setData] = useState<SuperstoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchSuperstoreData();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
