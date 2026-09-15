/**
 * Baseball player data structure
 */
export interface BaseballPlayer {
  name: string;
  handedness: string;
  height: number;
  weight: number;
  avg: number;
  HR: number;
  weight_kg: number;
  ht_wt_ratio_bin: number;
  number_of_records: number;
  // Tableau calculated fields
  "Bad Hight": boolean;  // Preserving spec's typo
  "Bad Weight": boolean;
  Calculation_41447206859923456: number;  // Ht Wt ratio (bin)
}

/**
 * Filter state for dashboard interactions
 */
export interface FilterState {
  badHeight: boolean;
  badWeight: boolean;
}

/**
 * Selection state for highlighting
 */
export interface SelectionState {
  selectedNames: Set<string>;
  selectedHandedness: Set<string>;
}

/**
 * Aggregated data for charts
 */
export interface AggregatedData {
  category: string;
  value: number;
  series?: string;
}

/**
 * Overview table data
 */
export interface OverviewData {
  handedness: string;
  avg_sum: number;
  height_sum: number;
  hr_sum: number;
  count: number;
  weight_kg_sum: number;
}
