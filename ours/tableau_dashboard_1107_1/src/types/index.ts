export interface TripData {
  TripID: string;
  tripduration: string;
  starttime: string;
  stoptime: string;
  'start station id': string;
  'start station name': string;
  'start station latitude': string;
  'start station longitude': string;
  'end station id': string;
  'end station name': string;
  'end station latitude': string;
  'end station longitude': string;
  bikeid: string;
  usertype: string;
  'birth year': string;
  gender: string;
}

export interface ProcessedTripData {
  year: number;
  gender: string;
  genderText: GenderText;
  usertype: string;
  count: number;
}

export type GenderText = 'Male' | 'Female' | 'Unknown';

export interface YearGenderData {
  year: number;
  gender: GenderText;
  count: number;
}

export interface YearData {
  year: number;
  count: number;
  pctDiff: number | null;
}

export interface UserTypeGenderYearData {
  usertype: string;
  gender: GenderText;
  year: number;
  count: number;
}

export interface SelectionState {
  gender: GenderText | null;
}

export const GENDER_COLORS: Record<GenderText, string> = {
  Female: '#4e79a7',
  Male: '#f28e2b',
  Unknown: '#e15759'
};

export const YEAR_COLORS: Record<number, string> = {
  2019: '#4e79a7',
  2020: '#f28e2b'
};
