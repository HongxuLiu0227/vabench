export interface ABTestingData {
  client_id: number;
  visitor_id: string;
  visit_id: string;
  process_step: string;
  date_time: string;
  clnt_tenure_yr: number;
  clnt_tenure_mnth: number;
  clnt_age: number;
  gendr: string;
  num_accts: number;
  bal: number;
  calls_6_mnth: number;
  logons_6_mnth: number;
  Variation: string;
}

export interface ABTestingDataWithAgeGroup extends ABTestingData {
  age_group: string;
}

export type ProcessStep = 'start' | 'step_1' | 'step_2' | 'step_3' | 'confirm';
export type Gender = 'U' | 'M' | 'F' | 'X';
export type Variation = 'Control' | 'Test' | 'Unknown';
export type AgeGroup = 'Age 17-30' | 'Age 31-40' | 'Age 41-55' | 'Age 56-70' | 'Age 71 and above';

export interface AggregatedDataPoint {
  category: string;
  series?: string;
  value: number;
  count?: number;
}

export interface FilterState {
  variation: Variation | null;
  process_step?: ProcessStep | null;
  gendr?: Gender | null;
  age_group?: AgeGroup | null;
}
