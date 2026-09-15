/**
 * Data row structure matching the CSV file
 * Note: Some columns have trailing spaces in the actual CSV
 */
export interface DataRow {
  'DRG Definition': string;
  'Provider Id': number;
  'Provider Name': string;
  'Provider Street Address': string;
  'Provider City': string;
  'Provider State': string;
  'Provider Zip Code': number;
  'Hospital Referral Region Description': string;
  'Total Discharges ': number;
  'Average Covered Charges ': number;
  'Average Total Payments ': number;
  'Average Medicare Payments': number;
  'Census Region': string;
  'Census Region Division': string;
  'Federal Region': string;
  'Economic Analysis Region': string;
  'Provider Latitude': number;
  'Provider Longitude': number;
}

/**
 * Processed provider data with derived fields
 */
export interface ProviderData {
  drgDefinition: string;
  drgDefinitionSplit2: string; // Second part after splitting "XXX - Diagnosis Name" -> "Diagnosis Name"
  providerId: number;
  providerName: string;
  providerState: string;
  providerCity: string;
  hospitalReferralRegion: string;
  hospitalReferralRegionSplit2: string; // Second part after splitting "State - City" -> "City"
  totalDischarges: number;
  averageCoveredCharges: number;
  averageTotalPayments: number;
  averageMedicarePayments: number;
  latitude: number;
  longitude: number;
  diagnosis: string;
  isSepsis: boolean;
}

/**
 * Raw CSV row with string values (before type conversion)
 */
export interface RawCsvRow {
  [key: string]: string;
}

/**
 * Color palette for Provider State
 */
export const STATE_COLORS: Record<string, string> = {
  NJ: '#ff9d9a',
  NY: '#d37295',
  CT: '#b6992d',
  PA: '#9d7660',
  MA: '#7b9d9d',
  CA: '#9db6d3',
  IL: '#d3b69d',
  TX: '#d39db6',
  FL: '#b6d39d',
};

/**
 * Sepsis DRG codes for filtering
 */
export const SEPSIS_DRG_CODES = [
  '870 - SEPTICEMIA OR SEVERE SEPSIS W MV 96+ HOURS',
  '871 - SEPTICEMIA OR SEVERE SEPSIS W/O MV 96+ HOURS W MCC',
  '872 - SEPTICEMIA OR SEVERE SEPSIS W/O MV 96+ HOURS W/O MCC',
];
