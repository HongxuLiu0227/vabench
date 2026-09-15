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
 * Aggregated data types for visualizations
 */
export interface SalesByDate {
  date: Date;
  sales: number;
}

export interface SalesByYear {
  year: number;
  sales: number;
}

export interface SalesBySubCategory {
  subCategory: string;
  sales: number;
}

export interface SalesProfitPoint {
  sales: number;
  profit: number;
  productName: string;
  quantity: number;
}
