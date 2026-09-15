export type DataRow = {
  'Date Made Public': string;
  Company: string;
  Location: string;
  'Type of breach': string;
  'Type of organization': string;
  'Records Breached': string;
  'Total Records': string;
  'Description of incident': string;
  'Information Source': string;
  'Source URL': string;
};

export type DataPoint = {
  date: Date;
  year: number;
  company: string;
  location: string;
  breachType: string;
  orgType: string;
  recordsBreached: number | null;
  totalRecords: number;
  description: string;
  infoSource: string;
  sourceUrl: string;
};

export type FilterState = {
  year: number | null;
  breachType: string | null;
};

export type BreachTypeCount = {
  breachType: string;
  count: number;
};

export type InfoSourceCount = {
  infoSource: string;
  breachType: string;
  count: number;
};

export type PieSlice = {
  breachType: string;
  year: number;
  count: number;
  percentage: number;
};
