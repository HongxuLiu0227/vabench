/**
 * Type definitions for Tourism Canada data
 * Matches the CSV structure from /data/df.csv
 */

export interface DataRow {
  '': number; // F1 - index column
  Year: string;
  Location: string;
  Indicators: string;
  Products: string;
  UOM: string;
  'Scalar Factor': string;
  Value: number;
}

export type LocationGroup = 'Alberta' | 'British Columbia' | 'Ontario' | 'Quebec' | 'Other';

export type IndicatorType =
  | 'Domestic demand'
  | 'International demand (exports)'
  | 'Interprovincial demand (exports)'
  | 'Total demand'
  | 'Total domestic supply'
  | 'Exports'
  | 'Imports'
  | 'International imports'
  | 'Interprovincial imports'
  | 'Tourism product ratio';

export interface TourismData {
  location: string;
  locationGroup: LocationGroup;
  year: number;
  indicator: IndicatorType;
  product: string;
  uom: string;
  scalarFactor: string;
  value: number;
}

export interface GrowthRateData {
  location: string;
  locationGroup: LocationGroup;
  year: number;
  growthRate: number;
  totalDemand: number;
}

export interface PieChartData {
  locationGroup: LocationGroup;
  indicator: IndicatorType;
  value: number;
  percentOfTotal: number;
}

export interface MapDataPoint {
  location: string;
  latitude: number;
  longitude: number;
  value: number;
  year: number;
  indicator: string;
}

export interface BarChartData {
  location: string;
  locationGroup: LocationGroup;
  year: number;
  value: number;
}

// Color mapping constants from Tableau spec
export const LOCATION_GROUP_COLORS: Record<LocationGroup, string> = {
  'Quebec': '#17becf',
  'Ontario': '#2ca02c',
  'Alberta': '#9467bd',
  'British Columbia': '#e377c2',
  'Other': '#c7c7c7'
};

export const INDICATOR_COLORS: Record<string, string> = {
  'Interprovincial imports': '#26897e',
  'Interprovincial demand (exports)': '#3ca8bc',
  'Total demand': '#3ca8bc',
  'International demand (exports)': '#4e9f50',
  'Domestic demand': '#87d180'
};

// Category orders from spec
export const LOCATION_GROUP_ORDER: LocationGroup[] = ['British Columbia', 'Ontario', 'Alberta', 'Quebec'];

export const VALID_INDICATORS_FOR_PIE: IndicatorType[] = [
  'Domestic demand',
  'International demand (exports)',
  'Interprovincial demand (exports)',
  'Total demand'
];
