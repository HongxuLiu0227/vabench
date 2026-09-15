export interface HospitalData {
  facility_name: string;
  'facility_name (questao5)': string;
  city: string;
  state: string;
  score_avg_infection: number;
  score_avg_eficacia: number;
  Number_of_Records: number;
}

export interface MeasureValue {
  measure_name: string;
  value: number;
}

export interface FacilityWithMeasures {
  facility_name: string;
  measures: MeasureValue[];
}

export interface StateRecord {
  state: string;
  count: number;
  avg_infection: number;
}

export interface SelectionState {
  worksheet: string;
  selectedItems: string[];
  timestamp: number;
}

export interface FilterState {
  enabled: boolean;
  sourceWorksheet: string;
  filters: Record<string, string | number | boolean>;
}
