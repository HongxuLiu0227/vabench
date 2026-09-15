export interface OrderData {
  'Row': number;
  'Order Priority': string;
  'Order Date': string;
  'Order': number;
  'Discount': number;
  'Unit Price': number;
  'Order Quantity': number;
  'Sales': number;
  'Profit': number;
  'Shipping Cost': number;
  'Product Base Margin': number;
  'Department': string;
  'Container': string;
  'Category': string;
  'Item': string;
  'Customer Segment': string;
  'Customer': number;
  'Customer Name': string;
  'Region': string;
  'State': string;
  'Country / Region': string;
  'City': string;
  'Postal Code': number;
  'Ship Date': string;
  'Ship Mode': string;
  'SubRegion': string;
  // Derived field for cross-datasource compatibility
  'Continent': string;
}

export interface SalesBySegmentData {
  segment: string;
  sales: number;
}

export interface PlotOfSalesData {
  category: string;
  customerSegment: string;
  sales: number;
  profit: number;
}

export interface SalesByRegionData {
  country: string;
  sales: number;
  profit: number;
}

export interface FilterState {
  selectedSegment: string | null;
  selectedRegion: string | null;
}
