/**
 * Raw CSV data structure from CitiBike trip data
 */
export interface RawBikeTripData {
  'tripduration': string;
  'starttime': string;
  'stoptime': string;
  'start station id': string;
  'start station name': string;
  'start station latitude': string;
  'start station longitude': string;
  'end station id': string;
  'end station name': string;
  'end station latitude': string;
  'end station longitude': string;
  'bikeid': string;
  'usertype': string;
  'birth year': string;
  'gender': string;
}

/**
 * Processed bike trip data with calculated fields
 */
export interface BikeTripData {
  tripduration: number;
  starttime: Date;
  stoptime: Date;
  startStationId: number;
  startStationName: string;
  startStationLatitude: number;
  startStationLongitude: number;
  endStationId: number;
  endStationName: string;
  endStationLatitude: number;
  endStationLongitude: number;
  bikeid: number;
  usertype: 'Subscriber' | 'Customer';
  birthYear: number;
  gender: number; // 0=Unknown, 1=Male, 2=Female
  age: number; // Calculated as 2021 - birthYear
  genderName: 'Unknown' | 'Male' | 'Female'; // Mapped from gender
}

/**
 * Aggregated data for Usertype by Age chart
 */
export interface UsertypeAgeData {
  usertype: 'Subscriber' | 'Customer';
  avgAge: number;
  count: number;
}

/**
 * Aggregated data for Usertype by Gender chart
 */
export interface UsertypeGenderData {
  usertype: 'Subscriber' | 'Customer';
  genderName: 'Unknown' | 'Male' | 'Female';
  count: number;
}

/**
 * Filter state for dashboard interactions
 */
export interface DashboardFilter {
  usertype?: 'Subscriber' | 'Customer';
  genderName?: 'Unknown' | 'Male' | 'Female';
}

/**
 * Selection state for highlight interactions
 */
export interface SelectionState {
  worksheet: string;
  field: string;
  value: string | number;
}
