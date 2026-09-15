import { useState, useEffect } from 'react';
import type { TransformedDiabetesRecord } from '../types';
import { loadDiabetesData } from '../services/dataService';

export const useData = () => {
  const [data, setData] = useState<TransformedDiabetesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loadedData = await loadDiabetesData();
        setData(loadedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
};
