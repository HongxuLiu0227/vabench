import { useState, useEffect } from 'react';
import { loadDashboardData } from '../services/dataService';
import type {
  YearlySalesData,
  CustomerOverviewData,
  ScatterplotData,
  BarChartData,
} from '../types/dashboard';

interface DashboardData {
  yearlySales: YearlySalesData[];
  customerOverview: CustomerOverviewData[];
  scatterplot: ScatterplotData[];
  barChart: BarChartData[];
}

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
}

export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await loadDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
