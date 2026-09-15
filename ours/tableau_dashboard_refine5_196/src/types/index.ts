/**
 * Type definitions for the Tableau dashboard data model
 */

export interface OrderData {
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

export interface ScatterDataPoint {
  sales: number;
  profit: number;
  quantity: number;
  productName: string;
  orderId: string;
}

export interface LineDataPoint {
  date: Date;
  sales: number;
  monthYear: string;
}

export interface YearlySalesDataPoint {
  year: number;
  sales: number;
}

export interface AggregatedSalesByDate {
  date: Date;
  monthYear: string;
  totalSales: number;
}

export interface AggregatedSalesByYear {
  year: number;
  totalSales: number;
}
