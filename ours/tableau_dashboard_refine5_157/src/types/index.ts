/**
 * Raw CSV row interface matching the Superstore data format
 */
export interface RawSuperstoreRow {
  'Row ID': string;
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
  'Postal Code': string;
  Region: string;
  'Product ID': string;
  Category: string;
  'Sub-Category': string;
  'Product Name': string;
  Sales: string;
  Quantity: string;
  Discount: string;
  Profit: string;
}

/**
 * Typed interface for application use after parsing
 */
export interface SuperstoreOrder {
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
 * Aggregated data for line charts
 */
export interface TimeSeriesDataPoint {
  date: Date;
  value: number;
}

/**
 * Aggregated data for bar charts
 */
export interface CategoryDataPoint {
  category: string;
  subCategory?: string;
  value: number;
}

/**
 * Data aggregated by year
 */
export interface YearlyDataPoint {
  year: number;
  value: number;
}
