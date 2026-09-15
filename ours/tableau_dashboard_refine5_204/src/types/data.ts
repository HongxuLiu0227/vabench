/**
 * Data types for Superstore Orders dataset
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

export interface AggregatedSalesBySubCategory {
  'Sub-Category': string;
  'Sales': number;
  [key: string]: string | number;
}

export interface AggregatedSalesByCategorySubCategory {
  'Category': string;
  'Sub-Category': string;
  'Sales': number;
  [key: string]: string | number;
}

export interface AggregatedSalesByYear {
  'Year': string;
  'Sales': number;
  [key: string]: string | number;
}

export interface ScatterPlotData {
  'Product Name': string;
  'Sales': number;
  'Profit': number;
  'Quantity': number;
}

export type CategoryType = 'Furniture' | 'Office Supplies' | 'Technology';
export type SubCategoryType = string;
export type RegionType = 'West' | 'East' | 'Central' | 'South';
export type SegmentType = 'Consumer' | 'Corporate' | 'Home Office';
