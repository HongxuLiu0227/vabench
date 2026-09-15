export interface OrderData {
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
  'Postal Code': string;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
  'Market': string;
}

export interface AggregatedSalesBySegment {
  Segment: string;
  Sales: number;
  Percentage: number;
}

export interface AggregatedSalesByMarket {
  Country: string;
  Market: string;
  Sales: number;
  Profit: number;
}

export interface ScatterPoint {
  Category: string;
  Market: string;
  Region: string;
  Sales: number;
  Profit: number;
  Segment: string;
}

export interface FilterState {
  selectedSegment: string | null;
  selectedMarket: string | null;
}
