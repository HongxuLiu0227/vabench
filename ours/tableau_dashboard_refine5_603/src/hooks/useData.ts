import { useState, useEffect } from 'react';
import type {
  ProcessedOrder,
  SalesByYear,
  SalesByMonth,
  RegionalMetrics,
  ScatterDataPoint,
} from '../types';
import {
  loadData,
  aggregateSalesByYear,
  aggregateSalesByMonth,
  aggregateRegionalMetrics,
  aggregateScatterData,
} from '../services/dataService';

export interface DashboardData {
  raw: ProcessedOrder[];
  salesByYear: SalesByYear[];
  salesByMonth: SalesByMonth[];
  regionalMetrics: RegionalMetrics[];
  scatterData: ScatterDataPoint[];
  loading: boolean;
  error: string | null;
}

export function useData(): DashboardData {
  const [data, setData] = useState<ProcessedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const rawData = await loadData();
        setData(rawData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const salesByYear = aggregateSalesByYear(data);
  const salesByMonth = aggregateSalesByMonth(data);
  const regionalMetrics = aggregateRegionalMetrics(data);
  const scatterData = aggregateScatterData(data);

  return {
    raw: data,
    salesByYear,
    salesByMonth,
    regionalMetrics,
    scatterData,
    loading,
    error,
  };
}
