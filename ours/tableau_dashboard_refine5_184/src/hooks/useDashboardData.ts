import { useState, useEffect } from 'react';
import { loadDashboardData } from '../services/dataService';
import type {
  ParsedOrderRow,
  ProductAggregation,
  CategoryAggregation,
  RegionAggregation,
} from '../types/data';

export interface DashboardData {
  rawData: ParsedOrderRow[];
  productData: ProductAggregation[];
  categoryData: CategoryAggregation[];
  regionData: RegionAggregation[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadDashboardData()
      .then((loadedData) => {
        setData(loadedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
