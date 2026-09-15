import type { SalesData } from './dataLoader';

export interface AggregatedValue {
  category: string;
  value: number;
  count?: number;
}

export interface ScatterPoint {
  x: number; // Sales
  y: number; // Profit
  size: number; // Quantity
  productName: string;
  subCategory: string;
  category: string;
}

export interface TimeSeriesPoint {
  year: string;
  value: number;
}

/**
 * Aggregate Sales by Sub-Category
 */
export function aggregateSalesBySubCategory(data: SalesData[]): AggregatedValue[] {
  const map = new Map<string, number>();

  data.forEach(row => {
    const subCategory = row['Sub-Category'];
    const sales = Number(row.Sales) || 0;
    map.set(subCategory, (map.get(subCategory) || 0) + sales);
  });

  const result = Array.from(map.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value); // Sort descending by sales

  console.log(`Aggregated sales by ${result.length} sub-categories`);
  return result;
}

/**
 * Aggregate Sales by Category and Sub-Category (hierarchical)
 */
export function aggregateSalesByCategoryAndSubCategory(data: SalesData[]): Array<{
  category: string;
  subCategory: string;
  value: number;
}> {
  const map = new Map<string, number>();

  data.forEach(row => {
    const category = row.Category;
    const subCategory = row['Sub-Category'];
    const key = `${category}|||${subCategory}`;
    const sales = Number(row.Sales) || 0;
    map.set(key, (map.get(key) || 0) + sales);
  });

  const result = Array.from(map.entries())
    .map(([key, value]) => {
      const [category, subCategory] = key.split('|||');
      return { category, subCategory, value };
    })
    .sort((a, b) => b.value - a.value); // Sort descending by sales

  console.log(`Aggregated sales by ${result.length} category/sub-category combinations`);
  return result;
}

/**
 * Create scatterplot data: Sales vs Profit, sized by Quantity
 */
export function createScatterplotData(data: SalesData[]): ScatterPoint[] {
  const productMap = new Map<string, ScatterPoint>();

  data.forEach(row => {
    const productName = row['Product Name'];
    const sales = Number(row.Sales) || 0;
    const profit = Number(row.Profit) || 0;
    const quantity = Number(row.Quantity) || 0;

    if (!productMap.has(productName)) {
      productMap.set(productName, {
        x: sales,
        y: profit,
        size: quantity,
        productName,
        subCategory: row['Sub-Category'],
        category: row.Category
      });
    } else {
      const existing = productMap.get(productName)!;
      existing.x += sales;
      existing.y += profit;
      existing.size += quantity;
    }
  });

  const result = Array.from(productMap.values());
  console.log(`Created scatterplot data with ${result.length} products`);
  return result;
}

/**
 * Aggregate Sales by Year
 */
export function aggregateSalesByYear(data: SalesData[]): TimeSeriesPoint[] {
  const yearMap = new Map<string, number>();

  data.forEach(row => {
    const orderDateStr = row['Order Date'];

    // Handle multiple date formats
    // Format 1: "2014-10-02 00:00:00"
    // Format 2: ISO string
    let year: string;

    if (orderDateStr.includes('-')) {
      // Parse "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
      const parts = orderDateStr.split(/[-\s:]/);
      year = parts[0];
    } else {
      // Fallback to Date parsing
      const orderDate = new Date(orderDateStr);
      year = orderDate.getFullYear().toString();
    }

    // Validate year is reasonable
    if (year === 'NaN' || year === 'Invalid') {
      console.warn('Invalid date:', orderDateStr);
      return;
    }

    const sales = Number(row.Sales) || 0;
    yearMap.set(year, (yearMap.get(year) || 0) + sales);
  });

  const result = Array.from(yearMap.entries())
    .map(([year, value]) => ({ year, value }))
    .sort((a, b) => a.year.localeCompare(b.year));

  console.log('Aggregated sales by year:', result);
  return result;
}
