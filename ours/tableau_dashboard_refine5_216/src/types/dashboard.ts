// Raw data row from CSV
export interface SalesDataRow {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  Segment: string;
  Country: string;
  City: string;
  State: string;
  'Postal Code': number;
  Region: string;
  'Product ID': string;
  Category: string;
  'Sub-Category': string;
  'Product Name': string;
  Sales: number;
  Quantity: number;
  Discount: number;
  Profit: number;
}

// Parsed and processed data with Date objects
export interface ParsedSalesData {
  'Row ID': number;
  'Order ID': string;
  'Order Date': Date;
  'Ship Date': Date;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  Segment: string;
  Country: string;
  City: string;
  State: string;
  'Postal Code': number;
  Region: string;
  'Product ID': string;
  Category: string;
  'Sub-Category': string;
  'Product Name': string;
  Sales: number;
  Quantity: number;
  Discount: number;
  Profit: number;
}

// Aggregated data by year for Total Sales Each Year chart
export interface YearlySalesData {
  year: number;
  sales: number;
}

// Customer Overview data
export interface CustomerOverviewData {
  region: string;
  salesPerCustomer: number;
  sales: number;
  quantity: number;
  profit: number;
  profitRatio: number;
  customerCount: number;
}

// Measure type for Customer Overview
export type MeasureType = 'salesPerCustomer' | 'sales' | 'quantity' | 'profit' | 'profitRatio';

// Scatterplot data
export interface ScatterplotData {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

// Bar chart data
export interface BarChartData {
  category: string;
  subCategory: string;
  sales: number;
}
