import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import type { SalesDataRaw, SalesData, DiscountOverviewData, SalesBySubCategoryData, ScatterplotData } from '../types/data';

const DATA_URL = '/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv';

/**
 * Normalize CSV header by removing BOM, extra quotes, and whitespace
 * This handles quoted/dirty headers like `"Order Date"` or `"Region"` with repeated quotes
 */
function normalizeHeader(header: string): string {
  let normalized = header;

  // Remove BOM (Byte Order Mark) if present
  normalized = normalized.replace(/^\uFEFF/, '');

  // Remove leading/trailing quotes (handle repeated quotes like `""Region""`)
  normalized = normalized.replace(/^"+|"+$/g, '');

  // Trim whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Coerce a value to a number, returning 0 if invalid
 * This prevents silent bad parses that lead to NaN or all-zero charts
 */
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse a date string, returning a valid Date object
 * This prevents Jan 1970 default dates from parsing issues
 */
function toDate(value: string | number | null | undefined): Date {
  if (value === null || value === undefined || value === '') {
    return new Date(); // Return current date as fallback
  }
  const date = new Date(String(value));
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date value: "${value}", using current date`);
    return new Date();
  }
  return date;
}

/**
 * Parse raw CSV data into typed SalesData
 * Includes validation to catch parsing issues early
 */
function parseSalesData(raw: SalesDataRaw[]): SalesData[] {
  return raw.map((row, index) => {
    try {
      return {
        category: String(row['Category'] || '').trim(),
        city: String(row['City'] || '').trim(),
        country: String(row['Country'] || '').trim(),
        customerName: String(row['Customer Name'] || '').trim(),
        manufacturer: String(row['Manufacturer'] || '').trim(),
        orderDate: toDate(row['Order Date']),
        orderId: String(row['Order ID'] || '').trim(),
        postalCode: toNumber(row['Postal Code']),
        productName: String(row['Product Name'] || '').trim(),
        region: String(row['Region'] || '').trim(),
        segment: String(row['Segment'] || '').trim(),
        shipDate: toDate(row['Ship Date']),
        shipMode: String(row['Ship Mode'] || '').trim(),
        state: String(row['State'] || '').trim(),
        subCategory: String(row['Sub-Category'] || '').trim(),
        discount: toNumber(row['Discount']),
        numberOfRecords: toNumber(row['Number of Records']),
        profit: toNumber(row['Profit']),
        profitRatio: toNumber(row['Profit Ratio']),
        quantity: toNumber(row['Quantity']),
        sales: toNumber(row['Sales']),
      };
    } catch (err) {
      console.error(`Error parsing row ${index}:`, err, row);
      // Return a safe default row to prevent crashes
      return {
        category: '',
        city: '',
        country: '',
        customerName: '',
        manufacturer: '',
        orderDate: new Date(),
        orderId: '',
        postalCode: 0,
        productName: '',
        region: '',
        segment: '',
        shipDate: new Date(),
        shipMode: '',
        state: '',
        subCategory: '',
        discount: 0,
        numberOfRecords: 0,
        profit: 0,
        profitRatio: 0,
        quantity: 0,
        sales: 0,
      };
    }
  });
}

/**
 * Aggregate data for Discount Overview by Region
 */
export function aggregateDiscountOverview(data: SalesData[]): DiscountOverviewData[] {
  const regionMap = new Map<string, {
    count: number;
    totalDiscount: number;
    totalProfit: number;
    totalSales: number;
    totalQuantity: number;
  }>();

  data.forEach(row => {
    const existing = regionMap.get(row.region) || {
      count: 0,
      totalDiscount: 0,
      totalProfit: 0,
      totalSales: 0,
      totalQuantity: 0,
    };

    existing.count++;
    existing.totalDiscount += Number(row.discount);
    existing.totalProfit += Number(row.profit);
    existing.totalSales += Number(row.sales);
    existing.totalQuantity += Number(row.quantity);

    regionMap.set(row.region, existing);
  });

  return Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    avgDiscount: stats.totalDiscount / stats.count,
    sumProfit: stats.totalProfit,
    profitRatio: stats.totalSales > 0 ? stats.totalProfit / stats.totalSales : 0,
    sumQuantity: stats.totalQuantity,
    sumSales: stats.totalSales,
  }));
}

/**
 * Aggregate data for Sales by Sub-Category
 */
export function aggregateSalesBySubCategory(data: SalesData[]): SalesBySubCategoryData[] {
  const subCategoryMap = new Map<string, number>();

  data.forEach(row => {
    const existing = subCategoryMap.get(row.subCategory) || 0;
    subCategoryMap.set(row.subCategory, existing + Number(row.sales));
  });

  return Array.from(subCategoryMap.entries())
    .map(([subCategory, sumSales]) => ({ subCategory, sumSales }))
    .sort((a, b) => b.sumSales - a.sumSales); // Sort descending by sales
}

/**
 * Aggregate data for Scatterplot
 */
export function aggregateScatterplot(data: SalesData[]): ScatterplotData[] {
  const productMap = new Map<string, {
    sumSales: number;
    sumProfit: number;
    sumQuantity: number;
  }>();

  data.forEach(row => {
    const existing = productMap.get(row.productName) || {
      sumSales: 0,
      sumProfit: 0,
      sumQuantity: 0,
    };

    existing.sumSales += Number(row.sales);
    existing.sumProfit += Number(row.profit);
    existing.sumQuantity += Number(row.quantity);

    productMap.set(row.productName, existing);
  });

  return Array.from(productMap.entries()).map(([productName, stats]) => ({
    productName,
    ...stats,
  }));
}

/**
 * Hook to load and parse sales data
 * Includes robust CSV parsing with header normalization and error handling
 */
export function useData() {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const csvText = await response.text();

        if (cancelled) return;

        const result = Papa.parse<SalesDataRaw>(csvText, {
          header: true,
          dynamicTyping: false, // We'll handle parsing ourselves
          skipEmptyLines: 'greedy', // More aggressive empty line skipping
          transformHeader: normalizeHeader, // Normalize headers to handle quotes and BOM
        });

        // Log parsing errors but don't fail completely
        if (result.errors.length > 0) {
          console.warn(`CSV parsing had ${result.errors.length} issues:`, result.errors);
        }

        // Validate that we got data
        if (!result.data || result.data.length === 0) {
          throw new Error('CSV parsed but no data rows found');
        }

        // Validate that required fields are present
        const sampleRow = result.data[0];
        const requiredFields = ['Region', 'Sales', 'Profit', 'Discount', 'Sub-Category'];
        const missingFields = requiredFields.filter(
          field => !(field in sampleRow) || sampleRow[field as keyof SalesDataRaw] === undefined
        );

        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          console.error('Available fields:', Object.keys(sampleRow));
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        const parsedData = parseSalesData(result.data);

        // Validate parsed data
        if (parsedData.length === 0) {
          throw new Error('Data parsing produced zero valid rows');
        }

        // Check for common parsing issues
        const firstRow = parsedData[0];
        if (firstRow.sales === 0 && firstRow.profit === 0 && firstRow.discount === 0) {
          console.warn('Warning: First row has all-zero measures - possible parsing issue');
        }

        if (!cancelled) {
          setData(parsedData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error('Data loading error:', errorMsg);
          setError(errorMsg);
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

/**
 * Hook to get aggregated data for all worksheets
 */
export function useWorksheetData() {
  const { data, loading, error } = useData();

  const discountOverview = loading ? [] : aggregateDiscountOverview(data);
  const salesBySubCategory = loading ? [] : aggregateSalesBySubCategory(data);
  const scatterplot = loading ? [] : aggregateScatterplot(data);

  return {
    discountOverview,
    salesBySubCategory,
    scatterplot,
    loading,
    error,
  };
}
