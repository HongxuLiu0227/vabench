/**
 * Raw Superstore Order record from CSV
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
export interface ParsedOrder extends SuperstoreOrder {
  OrderDateObj: Date;
  ShipDateObj: Date;
  OrderYear: number;
}

/**
 * Aggregated sales by product (for scatterplot)
 */
export interface ProductSalesData {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

/**
 * Aggregated sales by category/sub-category (for bar chart)
 */
export interface CategorySalesData {
  category: string;
  subCategory: string;
  sales: number;
}

/**
 * Aggregated sales by year (for line chart)
 */
export interface YearlySalesData {
  year: number;
  sales: number;
}

/**
 * Customer overview data with multiple measures
 */
export interface CustomerOverviewData {
  region: string;
  sales: number;
  quantity: number;
  profit: number;
  profitRatio: number;
}
