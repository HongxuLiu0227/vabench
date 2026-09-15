import { useState, useEffect } from 'react';
import type { DataRow, ProductAggregation, YearSalesAggregation, RegionAggregation } from '../types/data';
import { fetchCSVData, aggregateByProduct, aggregateByYear, aggregateByRegion } from '../services/dataService';

interface DataState {
  rawData: DataRow[];
  productData: ProductAggregation[];
  yearData: YearSalesAggregation[];
  regionData: RegionAggregation[];
  loading: boolean;
  error: string | null;
}

export function useData(): DataState {
  const [state, setState] = useState<DataState>({
    rawData: [],
    productData: [],
    yearData: [],
    regionData: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const rawData = await fetchCSVData();
        const productData = aggregateByProduct(rawData);
        const yearData = aggregateByYear(rawData);
        const regionData = aggregateByRegion(rawData);

        setState({
          rawData,
          productData,
          yearData,
          regionData,
          loading: false,
          error: null,
        });
      } catch (err) {
        setState({
          rawData: [],
          productData: [],
          yearData: [],
          regionData: [],
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    loadData();
  }, []);

  return state;
}
