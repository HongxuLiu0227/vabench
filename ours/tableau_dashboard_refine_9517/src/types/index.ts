/**
 * Superstore Orders Data Type
 * Matches the CSV structure from /data/Sample - Superstore_Orders.csv
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
 * Parsed order with dates as Date objects
 */
export interface ParsedOrder extends Omit<SuperstoreOrder, 'Order Date' | 'Ship Date'> {
  'Order Date': Date;
  'Ship Date': Date;
}

/**
 * Aggregated sales by customer
 */
export interface CustomerSales {
  customerName: string;
  sales: number;
  profit: number;
}

/**
 * Aggregated sales by city
 */
export interface CitySales {
  city: string;
  state: string;
  sales: number;
}

/**
 * Aggregated sales by sub-category
 */
export interface SubCategorySales {
  subCategory: string;
  category: string;
  sales: number;
}

/**
 * Customer profit data for scatter plot
 */
export interface CustomerProfitData {
  customerName: string;
  sales: number;
  profit: number;
  quantity: number;
}

/**
 * Map data point
 */
export interface MapDataPoint {
  city: string;
  state: string;
  sales: number;
  latitude: number;
  longitude: number;
}

/**
 * Filter state for dashboard interactions
 */
export interface FilterState {
  category?: string;
  subCategory?: string;
  cityName?: string;
  state?: string;
  customerName?: string;
  productName?: string;
  region?: string;
}

/**
 * Selection state for highlight interactions
 */
export interface SelectionState {
  field: string;
  value: string | string[];
}

/**
 * Dashboard action types
 */
export interface DashboardAction {
  name: string;
  kind: 'filter_action';
  sourceWorksheet: string;
  target: string;
  autoClear: boolean;
}
