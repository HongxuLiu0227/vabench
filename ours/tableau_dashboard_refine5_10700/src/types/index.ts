export interface DiabetesRecord {
  encounter_id: number;
  patient_nbr: number;
  race: string;
  gender: string;
  age: string;
  weight: string;
  admission_type_id: number;
  discharge_disposition_id: number;
  admission_source_id: number;
  time_in_hospital: number;
  payer_code: string;
  medical_specialty: string;
  num_lab_procedures: number;
  num_procedures: number;
  num_medications: number;
  number_outpatient: number;
  number_emergency: number;
  number_inpatient: number;
  diag_1: string;
  diag_2: string;
  diag_3: string;
  number_diagnoses: number;
  max_glu_serum: string | null;
  A1Cresult: string | null;
  metformin: string;
  repaglinide: string;
  nateglinide: string;
  chlorpropamide: string;
  glimepiride: string;
  acetohexamide: string;
  glipizide: string;
  glyburide: string;
  tolbutamide: string;
  pioglitazone: string;
  rosiglitazone: string;
  acarbose: string;
  miglitol: string;
  troglitazone: string;
  tolazamide: string;
  examide: string;
  citoglipton: string;
  insulin: string;
  'glyburide-metformin': string;
  'glipizide-metformin': string;
  'glimepiride-pioglitazone': string;
  'metformin-rosiglitazone': string;
  'metformin-pioglitazone': string;
  change: string;
  diabetesMed: string;
  readmitted: string;
}

export interface TransformedDiabetesRecord extends DiabetesRecord {
  readmitted_group: string;
}

export interface StackedBarData {
  category: string;
  series: string;
  value: number;
  percentage: number;
}

export interface FilterState {
  diag_1?: string[];
  diag_2?: string[];
  diag_3?: string[];
  readmitted_group?: string[];
}
