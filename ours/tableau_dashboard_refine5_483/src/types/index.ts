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
 * Parsed order with Date objects
 */
export interface ParsedOrder {
  rowId: number;
  orderId: string;
  orderDate: Date;
  shipDate: Date;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  country: string;
  city: string;
  state: string;
  postalCode: number;
  region: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
}

/**
 * Aggregated data by Sub-Category
 */
export interface SalesBySubCategory {
  subCategory: string;
  sales: number;
}

/**
 * Aggregated data by Year
 */
export interface SalesByYear {
  year: number;
  sales: number;
}

/**
 * Aggregated data by Month
 */
export interface SalesByMonth {
  month: Date;
  sales: number;
}

/**
 * Chart data types
 */
export interface ChartData {
  key: string;
  value: number;
  label?: string;
}
