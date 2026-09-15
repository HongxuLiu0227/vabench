export type DataRow = {
  'Category': string;
  'City': string;
  'Country': string;
  'Customer Name': string;
  'Manufacturer': string;
  'Order Date': Date;
  'Order ID': string;
  'Postal Code': string;
  'Product Name': string;
  'Region': string;
  'Segment': string;
  'Ship Date': Date;
  'Ship Mode': string;
  'State': string;
  'Sub-Category': string;
  'Discount': number;
  'Number of Records': number;
  'Profit': number;
  'Profit Ratio': number;
  'Quantity': number;
  'Sales': number;
};

export type RegionMetrics = {
  Region: string;
  Sales: number;
  Quantity: number;
  Profit: number;
  ProfitRatio: number;
  CustomerCount: number;
};

export type MonthlySales = {
  Month: Date;
  Sales: number;
};

export type YearlySales = {
  Year: number;
  Sales: number;
};

export type ProductMetrics = {
  ProductName: string;
  Sales: number;
  Profit: number;
  Quantity: number;
};

export type MeasureType = 'Sales' | 'Quantity' | 'Profit' | 'ProfitRatio';
