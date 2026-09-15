export interface MarsData {
  '': number;
  earth_date: string;
  sol: number;
  ls: number;
  month: string;
  min_temp: number;
  max_temp: number;
  pressure: number;
  Season: string;
  // Tableau calculated fields
  Calculation_1174595120371273730?: string; // Sol (group)
  Calculation_1174595120362745857?: string; // Unknown calculation
  Calculation_1174595120373465091?: string; // Temperature fluctuation category
}

export interface AggregatedMarsData {
  month: string;
  avg_min_temp: number;
  avg_max_temp: number;
  avg_pressure: number;
  sum_sol: number;
  count: number;
  Season: string;
}

export interface TemperatureData {
  month: string;
  measure: 'avg:max_temp' | 'avg:min_temp';
  value: number;
}

export interface SolData {
  sol: number;
  max_temp: number;
  month: string;
  Season: string;
}

export interface PressureData {
  month: string;
  avg_pressure: number;
  Season: string;
}

export interface SeasonSolData {
  season: string;
  sum_sol: number;
}
