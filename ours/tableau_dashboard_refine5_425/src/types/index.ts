/**
 * Raw data structure from CSV
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
  'Sales': string | number;
  'Quantity': number;
  'Discount': number;
  'Profit': string | number;
}

/**
 * Parsed and typed data structure
 */
export interface OrderData {
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
 * Aggregated sales by time period
 */
export interface SalesByTime {
  date: Date;
  sales: number;
  year?: number;
  month?: number;
}

/**
 * Aggregated metrics by region
 */
export interface RegionMetrics {
  region: string;
  avgDiscount: number;
  sumProfit: number;
  sumQuantity: number;
  sumSales: number;
  countCustomers: number;
}

/**
 * Filter state for dashboard
 */
export interface FilterState {
  region?: string;
  category?: string;
  segment?: string;
}
