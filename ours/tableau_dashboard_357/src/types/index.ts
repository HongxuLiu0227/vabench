/**
 * Application Types
 */

import type { TransformedData } from '../services/dataLoader';

export type SelectionFilter = Set<number>;

export interface FilterState {
  selectedIndices: SelectionFilter;
  sourceSheet: string | null;
}

export interface DashboardState {
  filterState: FilterState;
  data: TransformedData[];
}

export interface ScatterPlotProps {
  data: TransformedData[];
  width: number;
  height: number;
  title: string;
  xField: keyof TransformedData;
  yField: keyof TransformedData;
  colorField: keyof TransformedData;
  colorScale: Map<string, string>;
  filterState: FilterState;
  onSelectionChange: (indices: Set<number>) => void;
  disabled?: boolean;
}

export interface BarChartProps {
  data: TransformedData[];
  width: number;
  height: number;
  title: string;
  categoryField: keyof TransformedData;
  filterState: FilterState;
  highlightField?: keyof TransformedData;
}

export interface LegendProps {
  title?: string;
  categories: string[];
  colorScale: Map<string, string>;
}

export interface WorksheetSpec {
  name: string;
  chartType: string;
  xField: string;
  yField: string;
  colorField?: string;
  title: string;
  zone: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

// Re-export TransformedData for convenience
export type { TransformedData } from '../services/dataLoader';
