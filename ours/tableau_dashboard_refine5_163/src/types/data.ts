export interface RawDataRow {
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

export interface DataRow {
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

export interface ProductAggregation {
  productName: string;
  sumSales: number;
  sumProfit: number;
  sumQuantity: number;
}

export interface YearSalesAggregation {
  year: number;
  sumSales: number;
}

export interface RegionAggregation {
  region: string;
  countCustomers: number;
  sumSales: number;
  sumQuantity: number;
  sumProfit: number;
  profitRatio: number;
}
