import { useState, useEffect } from 'react';
import type { TweetData } from '../types';
import { loadTweetData } from '../services/dataLoader';

export function useTweetData() {
  const [data, setData] = useState<TweetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const tweetData = await loadTweetData();
        setData(tweetData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading tweet data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
