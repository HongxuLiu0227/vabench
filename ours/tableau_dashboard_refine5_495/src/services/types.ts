/**
 * Type definitions for Superstore Orders dataset
 */

export interface SuperstoreOrder {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country': string;
  'City': string;
  'State': string;
  'Postal Code': number;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
}

/**
 * Aggregated data for scatterplot (by Product Name)
 */
export interface ScatterplotDataPoint {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

/**
 * Aggregated data for horizontal bar charts
 */
export interface BarChartDataPoint {
  category: string;
  subCategory?: string;
  sales: number;
}

/**
 * KPI metrics
 */
export interface KPIMetrics {
  totalSales: number;
  totalProfit: number;
  profitRatio: number;
}
