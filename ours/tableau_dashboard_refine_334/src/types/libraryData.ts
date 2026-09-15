export interface LibraryData {
  Country: string;
  Region: string;
  'Expenditures  (US Dollars)': number | null;
  'Total Libraries': number | null;
  'Total Librarians': number | null;
  'Total Volumes': number | null;
  'Total Users': number | null;
}

export interface RegionSummary {
  Region: string;
  'Total Libraries': number;
}

export interface CountryDetail {
  Country: string;
  'Expenditures  (US Dollars)': number;
  'Total Users': number;
  'Total Volumes': number;
}

export type MeasureName = 'Expenditures  (US Dollars)' | 'Total Users' | 'Total Volumes';
