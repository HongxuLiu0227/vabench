export interface TripData {
  tripduration: number;
  starttime: Date;
  stoptime: Date;
  startStationId: number;
  startStationName: string;
  startStationLatitude: number;
  startStationLongitude: number;
  endStationId: number;
  endStationName: string;
  endStationLatitude: number;
  endStationLongitude: number;
  bikeid: number;
  usertype: 'Customer' | 'Subscriber';
  birthYear: number | null;
  gender: 'Male' | 'Female' | 'Unknown';
  age: number | null;
  ageGroup: string;
  month: number;
  cnt: number; // Count field for Tableau aggregations
}

export interface FilterState {
  gender?: string;
  usertype?: string;
  ageGroup?: string;
  month?: number;
}

export type FilterAction = {
  type: 'SET_FILTER';
  key: keyof FilterState;
  value: string | number | undefined;
} | {
  type: 'RESET_FILTERS';
};

export interface ChartDataPoint {
  category: string;
  series?: string;
  value: number;
}

export interface StackedBarData {
  category: string;
  [key: string]: string | number;
}
