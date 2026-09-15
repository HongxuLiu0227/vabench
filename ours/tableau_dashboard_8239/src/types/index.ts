// Data types for Superstore dataset
export interface SuperstoreRow {
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
  // Tableau calculated field used for highlight bindings
  'Calculation_6943002545466433537': string;
}

// Filter types
export interface DashboardFilters {
  year?: number | 'All';
  month?: number | 'All';
  category?: string[];
  region?: string[];
  state?: string[];
  subCategory?: string[];
}

// Aggregated data types
export interface YearMonthData {
  month: number;
  monthName: string;
}

export interface CategoryProfit {
  category: string;
  profit: number;
  profitPercent: number;
}

export interface RegionOrderData {
  region: string;
  category: string;
  orderCount: number;
}

export interface StateMetric {
  state: string;
  value: number;
}

export interface YearMonthProfit {
  year: number;
  month: number;
  monthYear: string;
  profit: number;
}

export interface SubCategorySales {
  subCategory: string;
  sales: number;
}

// Color scheme
export const CATEGORY_COLORS: Record<string, string> = {
  'Furniture': '#4e79a7',
  'Technology': '#e15759',
  'Office Supplies': '#f28e2b',
};

export const PRIMARY_COLOR = '#8138f7';
export const HIGHLIGHT_COLOR = '#ff6b6b';
