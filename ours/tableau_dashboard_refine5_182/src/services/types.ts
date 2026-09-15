export interface SuperstoreData {
  'Row ID': number;
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
  'Postal Code': number;
  Region: string;
  'Product ID': string;
  Category: string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
}

export interface ProductAggregation {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

export interface RegionAggregation {
  region: string;
  avgDiscount: number;
  sumProfit: number;
  sumQuantity: number;
  sumSales: number;
  profitRatio: number;
}

export interface MonthlySales {
  month: Date;
  sales: number;
}

export interface YearlySales {
  year: number;
  sales: number;
}
