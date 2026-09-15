export interface MovieData {
  ranks: number;
  titles: string;
  studios: string;
  gross: number;
  years: Date;
}

export interface StudioAggregation {
  studio: string;
  avgGross: number;
  count: number;
}

export interface StudioYearAggregation {
  studio: string;
  year: number;
  avgGross: number;
  count: number;
}

export type FilterState = string | null;
