export interface SalesData {
  'Category': string;
  'City': string;
  'Country': string;
  'Customer Name': string;
  'Manufacturer': string;
  'Order Date': string;
  'Order ID': string;
  'Postal Code': number;
  'Product Name': string;
  'Region': string;
  'Segment': string;
  'Ship Date': string;
  'Ship Mode': string;
  'State': string;
  'Sub-Category': string;
  'Discount': number;
  'Number of Records': number;
  'Profit': number;
  'Profit Ratio': number;
  'Quantity': number;
  'Sales': number;
}

export interface AggregatedSalesData {
  category: string;
  subCategory: string;
  productName?: string;
  sales: number;
  profit?: number;
  quantity?: number;
  year?: number;
}

export interface ScatterplotData {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

export interface YearlySalesData {
  year: number;
  sales: number;
}
