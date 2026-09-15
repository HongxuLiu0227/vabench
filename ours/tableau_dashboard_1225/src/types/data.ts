export interface SalesData {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country/Region': string;
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

export interface ParsedSalesData extends Omit<SalesData, 'Order Date' | 'Ship Date'> {
  'Order Date': Date;
  'Ship Date': Date;
  Year: number;
}

export interface YearlySales {
  year: number;
  sales: number;
}

export interface YearlyProfit {
  year: number;
  profit: number;
}

export interface SubCategorySales {
  subCategory: string;
  sales: number;
}

export interface SubCategoryProfit {
  subCategory: string;
  profit: number;
}
