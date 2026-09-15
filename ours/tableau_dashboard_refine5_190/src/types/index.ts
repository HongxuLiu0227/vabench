/**
 * Type definitions for the Superstore Orders dataset
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
  'Sales': string;
  'Quantity': string;
  'Discount': string;
  'Profit': string;
}

/**
 * Parsed order with numeric fields converted
 */
export interface ParsedOrder {
  'Row ID': number;
  'Order ID': string;
  'Order Date': Date;
  'Ship Date': Date;
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
 * Aggregated data for Customer Overview worksheet
 */
export interface CustomerOverviewData {
  region: string;
  customerCount: number;
  sales: number;
  quantity: number;
  profit: number;
  profitRatio: number;
}

/**
 * Data point for Scatterplot worksheet
 */
export interface ScatterplotData {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

/**
 * Aggregated data for Discount Overview by Region worksheet
 */
export interface DiscountOverviewData {
  region: string;
  discount: number;
  profit: number;
  quantity: number;
  sales: number;
  profitRatio: number;
}
