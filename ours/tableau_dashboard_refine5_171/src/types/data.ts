/**
 * Type definitions for the Orders dataset
 */

export interface OrderRow {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'City, State': string;
  'Country': string;
  'Postal Code': string | number;
  'Market': string;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
  'Shipping Cost': number;
  'Order Priority': string;
}

export interface SalesBySubCategory {
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
}

export interface ScatterDataPoint {
  Sales: number;
  Profit: number;
  Quantity: number;
  'Product Name': string;
}

export interface LineDataPoint {
  date: Date;
  year: number;
  Sales: number;
}

export interface YearlySalesDataPoint {
  year: number;
  Sales: number;
}
