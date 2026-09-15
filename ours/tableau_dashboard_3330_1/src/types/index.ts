// Data row types from the CSV
// Note: Field names are normalized (no-break spaces converted to regular spaces, collapsed spaces, trimmed)
export interface DataRow {
  'Response ID': string | number;
  'Date submitted': string | null;
  'Last page': string | number;
  'Consent to Participate:   I understand that by clicking the "Yes" button below, I agree to take part in this study under the terms and conditions outlined in the survey preamble and consent section above.': string;
  'A1. Gender:': string;
  'A2. Age:': string;
  'A3. What is your marital status? If "other" please specify': string;
  'A3. What is your marital status? If "other" please specify [Comment]': string | null;
  'A4. What is your ethnicity? If "other" please specify': string;
  'A4. What is your ethnicity? If "other" please specify [Comment]': string | null;
  'A5. What is your highest level of education?': string;
  'A6. What is your annual income?': string;
  'A7. What is your employment status as a musician? If "other" please specify': string;
  'A7. What is your employment status as a musician? If "other" please specify [Comment]': string | null;
  'A8. How many years of experience do you have as a musician? If "other" please specify': string;
  'A8. How many years of experience do you have as a musician? If "other" please specify [Comment]': string | null;
  'After a performance,  consume non-prescription depressants': string;
  'Shows a year': string;
  [key: string]: string | number | null | undefined;
}

// PANAS score fields (calculated from B questions)
export interface PANASScores {
  positiveScore: number;
  negativeScore: number;
  positiveNegativeScore: number;
}

// Augmented data row with calculated scores
export interface AugmentedDataRow extends DataRow, PANASScores {}

// Aggregated data for charts
export interface AggregatedData {
  category: string;
  value: number;
  percentage: number;
}

// Filter state
export interface FilterState {
  positiveNegativeFilter: 'positive' | 'negative' | 'all' | null;
  ageFilter: string[];
  ethnicityFilter: string[];
  genderFilter: string[];
  maritalStatusFilter: string[];
  [key: string]: string[] | 'positive' | 'negative' | 'all' | null;
}

// Highlight state
export interface HighlightState {
  field: string | null;
  value: string | null;
}

// Chart color mapping
export interface ColorMap {
  [key: string]: string;
}

// Worksheet props
export interface WorksheetProps {
  data: AugmentedDataRow[];
  filters: FilterState;
  highlights: HighlightState;
  onHighlight: (field: string, value: string | null) => void;
  onFilter?: (filterType: keyof FilterState, value: unknown) => void;
}

// KPI Card props
export interface KPICardProps {
  label: string;
  value: number;
  percentage: string;
  type: 'positive' | 'negative';
  onClick?: () => void;
}

// Pie Chart props
export interface PieChartProps {
  data: AggregatedData[];
  title: string;
  colorMap: ColorMap;
  dimension: keyof DataRow;
  highlights: HighlightState;
  onHighlight: (field: string, value: string | null) => void;
  showLegend?: boolean;
  legendPosition?: 'right' | 'above';
}

// Legend props
export interface LegendProps {
  title?: string;
  colorMap: ColorMap;
  data: AggregatedData[];
}

// Dashboard zone layout
export interface DashboardZone {
  x: number;
  y: number;
  width: number;
  height: number;
  normalized: {
    x_ratio: number;
    y_ratio: number;
    w_ratio: number;
    h_ratio: number;
  };
}

// Worksheet metadata from tableau spec
export interface WorksheetSpec {
  name: string;
  chart_type: string;
  slices: string[];
  encodings: {
    color?: Array<{ column: string; pane_index: number }>;
  };
  filter?: Array<{
    class: string;
    column: string;
    expression?: { group: string; items?: string[] };
  }>;
  title_runs?: Array<{ text: string; style: { bold?: string; fontalignment?: string } }>;
  manual_sort?: string[];
}
