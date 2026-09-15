export interface SelectionState {
  sheet: string;
  field: string;
  values: string[] | number[];
}

export interface HighlightState {
  enabled: boolean;
  sourceSheet: string;
  field: string;
  values: Set<string | number>;
}

export interface FilterState {
  enabled: boolean;
  sourceSheet: string;
  field: string;
  values: Set<string | number>;
}

export interface DashboardInteraction {
  highlights: Map<string, HighlightState>;
  filters: Map<string, FilterState>;
}
