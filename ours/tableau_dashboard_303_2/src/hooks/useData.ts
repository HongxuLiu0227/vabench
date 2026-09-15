/**
 * Custom hook for loading accident data
 */
import { useState, useEffect } from 'react';
import type { ParsedAccidentRecord } from '../types/data';
import { loadAccidentData } from '../services/dataService';

export function useData() {
  const [data, setData] = useState<ParsedAccidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const accidentData = await loadAccidentData();
        setData(accidentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
