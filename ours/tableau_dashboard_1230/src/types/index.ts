/**
 * Baseball player data structure
 */
export interface BaseballPlayer {
  name: string;
  handedness: string;
  height: number;
  weight: number;
  avg: number;
  hr: number;
  htWtRatioBin: number;
  numberOfRecords: number;
  // Calculated fields required by Tableau spec
  badHeight: number;  // Numeric outlier score for height (z-score or similar)
  badWeight: number;  // Numeric outlier score for weight (z-score or similar)
  calculation_41447206859923456: number;  // Tableau calculated field
}

/**
 * Data types for visualizations
 */
export interface FilterState {
  handedness: string[];
}

export interface SelectionState {
  names: string[];
  sourceWorksheet?: string;
}

export type Handedness = 'L' | 'R' | 'B';

/**
 * Processed data for charts
 */
export interface PlayerDataPoint {
  name: string;
  handedness: string;
  height: number;
  weight: number;
  avg: number;
  hr: number;
  heightWeightRatio: number;
  isBadHeight: boolean;
  isBadWeight: boolean;
  // Calculated fields for Tableau spec compatibility
  badHeight: number;  // Numeric outlier score for height
  badWeight: number;  // Numeric outlier score for weight
  calculation_41447206859923456: number;  // Tableau calculated field
}

/**
 * Aggregated data for bar charts
 */
export interface AggregatedBarData {
  category: string;
  value: number;
  handedness?: string;
  name?: string;
}
