export interface StockPriceRecord {
  symbol: string;
  date: Date;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface MonthlyAverage {
  yearMonth: string; // Format: "YYYY-MM"
  date: Date; // First day of the month
  averageOpen: number;
  averageClose: number;
}

export interface MaxPriceInfo {
  value: number;
  date: Date;
}

export interface DateRange {
  start?: Date;
  end?: Date;
}

export interface FilterState {
  dateRange: DateRange | null;
}
