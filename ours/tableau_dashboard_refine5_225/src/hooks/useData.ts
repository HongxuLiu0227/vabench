import { useState, useEffect } from 'react';
import type { ParsedSuperstoreRow, SalesByMonth, SalesByYear, SalesBySubCategory, SalesByProduct } from '../types';
import { loadData, aggregateSalesByMonth, aggregateSalesByYear, aggregateSalesBySubCategory, aggregateSalesByProduct } from '../services/dataLoader';

export interface DashboardData {
  rawData: ParsedSuperstoreRow[];
  salesByMonth: SalesByMonth[];
  salesByYear: SalesByYear[];
  salesBySubCategory: SalesBySubCategory[];
  salesByProduct: SalesByProduct[];
}

export function useData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const rawData = await loadData();

        setData({
          rawData,
          salesByMonth: aggregateSalesByMonth(rawData),
          salesByYear: aggregateSalesByYear(rawData),
          salesBySubCategory: aggregateSalesBySubCategory(rawData),
          salesByProduct: aggregateSalesByProduct(rawData)
        });
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
