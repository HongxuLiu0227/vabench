import { useState, useEffect, useCallback } from 'react';
import type { StockPriceRecord, MonthlyAverage, MaxPriceInfo, DateRange } from '../types/stockData';
import {
  loadStockData,
  calculateMonthlyAverages,
  calculateMaxPrice,
} from '../services/stockDataService';

export function useStockData() {
  const [data, setData] = useState<StockPriceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const stockData = await loadStockData();
        setData(stockData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error loading stock data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getMonthlyAverages = useCallback((filter?: DateRange): MonthlyAverage[] => {
    if (data.length === 0) return [];
    return calculateMonthlyAverages(data, filter);
  }, [data]);

  const getMaxOpen = useCallback((filter?: DateRange): MaxPriceInfo | null => {
    if (data.length === 0) return null;
    return calculateMaxPrice(data, 'open', filter);
  }, [data]);

  const getMaxClose = useCallback((filter?: DateRange): MaxPriceInfo | null => {
    if (data.length === 0) return null;
    return calculateMaxPrice(data, 'close', filter);
  }, [data]);

  return {
    data,
    loading,
    error,
    getMonthlyAverages,
    getMaxOpen,
    getMaxClose,
  };
}
