/**
 * Raw CSV row structure matching the data file
 * Column names are normalized (quotes removed, BOM stripped) during parsing
 */
export interface RawDataRow {
  'DRG Definition': string;
  'DRG Definition - Split 2': string;
  'Provider Id': string;
  'Provider Name': string;
  'Provider Street Address': string;
  'Provider City': string;
  'Provider State': string;
  'Provider Zip Code': string;
  'Hospital Referral Region Description': string;
  'Total Discharges ': string;
  'Average Covered Charges ': string;
  'Average Total Payments ': string;
  'Average Medicare Payments': string;
  'Census Region': string;
  'Census Region Division': string;
  'Federal Region': string;
  'Economic Analysis Region': string;
  'Provider Latitude': string;
  'Provider Longitude': string;
}

/**
 * Aggregated diagnosis data after grouping and transformation
 */
export interface DiagnosisData {
  diagnosis: string;
  numberOfRecords: number;
  totalDischarges: number;
  averageCoveredCharges: number;
  averageMedicarePayments: number;
}

/**
 * Filter state for dashboard interactions
 */
export interface FilterState {
  selectedDiagnosis: string | null;
}

/**
 * Props for tooltip display
 */
export interface TooltipData {
  diagnosis: string;
  numberOfRecords?: number;
  totalDischarges?: number;
  averageCoveredCharges?: number;
  averageMedicarePayments?: number;
}

