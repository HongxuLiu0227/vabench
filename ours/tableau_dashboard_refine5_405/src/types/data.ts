/**
 * Raw CSV data type matching the Tableau export
 */
export interface SalesDataRaw {
  'Category': string;
  'City': string;
  'Country': string;
  'Customer Name': string;
  'Manufacturer': string;
  'Order Date': string;
  'Order ID': string;
  'Postal Code': string | number;
  'Product Name': string;
  'Region': string;
  'Segment': string;
  'Ship Date': string;
  'Ship Mode': string;
  'State': string;
  'Sub-Category': string;
  'Discount': string | number;
  'Number of Records': string | number;
  'Profit': string | number;
  'Profit Ratio': string | number;
  'Quantity': string | number;
  'Sales': string | number;
}

/**
 * Parsed and typed sales data
 */
export interface SalesData {
  category: string;
  city: string;
  country: string;
  customerName: string;
  manufacturer: string;
  orderDate: Date;
  orderId: string;
  postalCode: number;
  productName: string;
  region: string;
  segment: string;
  shipDate: Date;
  shipMode: string;
  state: string;
  subCategory: string;
  discount: number;
  numberOfRecords: number;
  profit: number;
  profitRatio: number;
  quantity: number;
  sales: number;
}

/**
 * Aggregated data for Discount Overview by Region
 */
export interface DiscountOverviewData {
  region: string;
  avgDiscount: number;
  sumProfit: number;
  profitRatio: number;
  sumQuantity: number;
  sumSales: number;
}

/**
 * Aggregated data for Sales by Sub-Category
 */
export interface SalesBySubCategoryData {
  subCategory: string;
  sumSales: number;
}

/**
 * Aggregated data for Scatterplot
 */
export interface ScatterplotData {
  productName: string;
  sumSales: number;
  sumProfit: number;
  sumQuantity: number;
}
