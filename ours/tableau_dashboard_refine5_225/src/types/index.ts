export interface SuperstoreRow {
  'Category': string;
  'City': string;
  'Country': string;
  'Customer Name': string;
  'Manufacturer': string;
  'Order Date': string;
  'Order ID': string;
  'Postal Code': string;
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

export interface ParsedSuperstoreRow extends Omit<SuperstoreRow, 'Order Date' | 'Ship Date'> {
  'Order Date': Date;
  'Ship Date': Date;
}

export interface SalesByMonth {
  month: Date;
  sales: number;
}

export interface SalesByYear {
  year: number;
  sales: number;
}

export interface SalesBySubCategory {
  subCategory: string;
  sales: number;
}

export interface SalesByProduct {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}
