import { useState, useEffect } from 'react';
import {
  loadCsvData,
  aggregateSalesBySubCategory,
  aggregateSalesByYear,
  aggregateSalesByMonth,
  calculateProfitRatio,
  getTopProducts,
} from '../services/dataService';
import type {
  ParsedOrder,
  SalesBySubCategory,
  SalesByYear,
  SalesByMonth,
} from '../types';

interface UseSuperstoreDataResult {
  data: ParsedOrder[] | null;
  salesBySubCategory: SalesBySubCategory[];
  salesByYear: SalesByYear[];
  salesByMonth: SalesByMonth[];
  profitRatio: number;
  topProducts: Array<{ productName: string; sales: number }>;
  loading: boolean;
  error: string | null;
}

export function useSuperstoreData(): UseSuperstoreDataResult {
  const [data, setData] = useState<ParsedOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        console.log('[Data Loading] Starting CSV data load...');
        const orders = await loadCsvData();

        console.log(`[Data Loading] Successfully loaded ${orders.length} rows`);

        // Validate data quality
        const rowsWithSales = orders.filter(d => d.sales > 0).length;
        const rowsWithValidDates = orders.filter(d => !isNaN(d.orderDate.getTime())).length;

        console.log(`[Data Loading] Data quality check:`);
        console.log(`  - Rows with non-zero sales: ${rowsWithSales}/${orders.length} (${((rowsWithSales / orders.length) * 100).toFixed(1)}%)`);
        console.log(`  - Rows with valid dates: ${rowsWithValidDates}/${orders.length} (${((rowsWithValidDates / orders.length) * 100).toFixed(1)}%)`);

        // Warn about potential issues
        if (rowsWithSales === 0) {
          console.error('[Data Loading] WARNING: All sales values are zero! Charts will be empty.');
        }
        if (rowsWithValidDates === 0) {
          console.error('[Data Loading] WARNING: All dates are invalid! Time-based charts will fail.');
        }

        setData(orders);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        console.error('[Data Loading] Error loading data:', err);
        console.error('[Data Loading] Error details:', errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Derive aggregated data from raw data
  const salesBySubCategory = data ? aggregateSalesBySubCategory(data) : [];
  const salesByYear = data ? aggregateSalesByYear(data) : [];
  const salesByMonth = data ? aggregateSalesByMonth(data) : [];
  const profitRatio = data ? calculateProfitRatio(data) : 0;
  const topProducts = data ? getTopProducts(data, 10) : [];

  // Log aggregated data for debugging
  if (data && data.length > 0) {
    console.log('[Data Loading] Aggregated data summary:');
    console.log(`  - Sales by sub-category: ${salesBySubCategory.length} categories`);
    console.log(`  - Sales by year: ${salesByYear.length} years`);
    console.log(`  - Sales by month: ${salesByMonth.length} months`);
    console.log(`  - Profit ratio: ${(profitRatio * 100).toFixed(2)}%`);
    console.log(`  - Top products: ${topProducts.length} items`);
  }

  return {
    data,
    salesBySubCategory,
    salesByYear,
    salesByMonth,
    profitRatio,
    topProducts,
    loading,
    error,
  };
}
