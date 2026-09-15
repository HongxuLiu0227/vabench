/**
 * Raw data interface for Superstore Orders
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
 * Processed order with parsed dates
 */
export interface ProcessedOrder extends SuperstoreOrder {
  orderDate: Date;
  shipDate: Date;
  year: number;
  month: number;
}

/**
 * Aggregated data by year for sales
 */
export interface SalesByYear {
  year: number;
  sales: number;
}

/**
 * Aggregated data by month for sales
 */
export interface SalesByMonth {
  month: Date;
  sales: number;
}

/**
 * Regional metrics data
 */
export interface RegionalMetrics {
  region: string;
  avgDiscount: number;
  sumProfit: number;
  sumQuantity: number;
  sumSales: number;
  customerCount: number;
}

/**
 * Scatterplot data point
 */
export interface ScatterDataPoint {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}
