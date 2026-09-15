/**
 * Raw CSV data row structure from Superstore Orders dataset
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
 * Parsed order with Date objects for time-based operations
 */
export interface ParsedOrder extends Omit<SuperstoreOrder, 'Order Date' | 'Ship Date'> {
  'Order Date': Date;
  'Ship Date': Date;
}

/**
 * Aggregated data for line charts
 */
export interface TimeSeriesData {
  date: Date;
  sales: number;
  profit: number;
  quantity: number;
}

/**
 * Aggregated data by year
 */
export interface YearlyData {
  year: number;
  sales: number;
  profit: number;
  quantity: number;
}

/**
 * Scatter plot data point
 */
export interface ScatterPoint {
  sales: number;
  profit: number;
  quantity: number;
  productName: string;
  customerName: string;
}

/**
 * Customer overview data by region
 */
export interface CustomerOverviewData {
  region: string;
  sales: number;
  quantity: number;
  profit: number;
  customerCount: number;
}
