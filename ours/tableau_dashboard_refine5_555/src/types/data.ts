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
  'Postal Code': number;
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

export interface AggregatedByProduct {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

export interface AggregatedByCategory {
  category: string;
  subCategory: string;
  sales: number;
}

export interface AggregatedByYear {
  year: number;
  sales: number;
}

export interface AggregatedByMonth {
  month: Date;
  sales: number;
}
