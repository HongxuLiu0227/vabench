export interface OfficeSupplyData {
  Order_Date: Date;
  'Sales Region': string;
  'Sales representative': string;
  Item: string;
  'Units Sold': number;
  'Unit Price': number;
  Revenue: number;
  Year: number;
  Month: number;
  YearMonth: string; // Format: "YYYY-MM"
}

export interface DashboardFilterState {
  selectedSalesRep: string | null;
  selectedItem: string | null;
  selectedDate: string | null; // Format: "YYYY-MM"
}

export interface AggregatedDataPoint {
  category: string;
  value: number;
  series?: string;
}

export interface MonthlyDataPoint {
  date: Date;
  yearMonth: string;
  value: number;
  series?: string;
}

export interface TableMeasure {
  Item: string;
  Revenue: number;
  'Units Sold': number;
}

// Color palette for Item encoding
export const ITEM_COLORS: Record<string, string> = {
  'Binder': '#4e79a7',
  'Pencil': '#59a14f',
  'Pen Set': '#76b7b2',
  'Pen': '#e15759',
  'Desk': '#f28e2b',
};

export type FilterType = 'selectedSalesRep' | 'selectedItem' | 'selectedDate';
