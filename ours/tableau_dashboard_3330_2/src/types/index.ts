// Data row types from Q1 CSV (simplified headers)
export interface DataRow {
  'Response ID': number;
  Gender: string;
  Age: string;
  'Marital status': string;
  Ethnicity: string;
  Education: string;
  'Annual income': string;
  'Employment status as a musician': string;
  'Years of experience as a musician': string;
  'After a performance,  consume non-prescription depressants': string;
  'Shows a year': string;
  // PANAS responses (text values)
  Interested: string;
  Distressed: string;
  Excited: string;
  Upset: string;
  Strong: string;
  Guilty: string;
  Scared: string;
  Hostile: string;
  Enthusiastic: string;
  Proud: string;
  Irritable: string;
  Alert: string;
  Ashamed: string;
  Inspired: string;
  Nervous: string;
  Determined: string;
  Attentive: string;
  Jittery: string;
  Active: string;
  Afraid: string;
  // Allow additional dynamic fields
  [key: string]: string | number | null | boolean;
}

// Calculated fields - extended data row with computed PANAS scores
export interface ExtendedDataRow extends DataRow {
  'Response ID': number;
  'Positive-Score': number;
  'Negative Score': number;
  PositiveNegativeScore: number;
  isPositive: boolean;
  isNegative: boolean;
  // Aliases for common demographic fields (from both Q1 and Visulizaton formats)
  'A1. Gender:': string;
  'A2. Age:': string;
  'A3. What is your marital status?  If "other" please specify': string;
  'A4. What is your ethnicity?  If "other" please specify': string;
  'A5. What is your highest level of education?': string;
  'A6. What is your annual income?': string;
  'A7. What is your employment status as a musician?  If "other" please specify': string;
  'A8. How many years of experience do you have as a musician?  If "other" please specify': string;
  // Allow additional fields
  [key: string]: string | number | null | boolean;
}

// Filter state for interactions
export interface FilterState {
  worksheetName: string;
  selectedValues: Set<string>;
  fieldName: string;
}

// Highlight state for interactions
export interface HighlightState {
  worksheetName: string;
  highlightedValues: Set<string>;
  fieldName: string;
}

// Worksheet types
export type WorksheetName =
  | 'Amount of  Negative'
  | 'Amount of  Negative %'
  | 'Amount of Positive'
  | 'Amount of Positive %'
  | 'Annual income - Overall Pie'
  | 'Education - Overall Pie'
  | 'Employment status - Overall Pie'
  | 'Years of experience - Overall Pie';

// Zone positioning
export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
  x_ratio: number;
  y_ratio: number;
  w_ratio: number;
  h_ratio: number;
}

// Pie chart data
export interface PieChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

// Aggregated data for worksheets
export interface AggregatedData {
  category: string;
  count: number;
  sum: number;
  percentage?: number;
}
