import { useState, useEffect, useCallback } from 'react';
import type { CitiBikeRecord, HighlightState } from '../types';
import { fetchCitiBikeData } from '../services/dataService';

export function useData() {
  const [data, setData] = useState<CitiBikeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchCitiBikeData();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
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

export function useHighlight() {
  const [highlightState, setHighlightState] = useState<HighlightState>({});

  const setHighlight = useCallback((stationName: string | null, sourceWorksheet?: string) => {
    setHighlightState({
      stationName,
      sourceWorksheet,
    });
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightState({});
  }, []);

  return { highlightState, setHighlight, clearHighlight };
}
