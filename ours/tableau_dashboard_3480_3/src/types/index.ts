/**
 * Data types for CitiBike trip data
 */

export interface CitiBikeTrip {
  'Trip Duration': number;
  'Start Time': string;
  'Stop Time': string;
  'Start Station ID': number;
  'Start Station Name': string;
  'Start Station Latitude': number;
  'Start Station Longitude': number;
  'End Station ID': number;
  'End Station Name': string;
  'End Station Latitude': number;
  'End Station Longitude': number;
  'Bike ID': number;
  'User Type': string;
  'Birth Year': string | number;
  'Gender': number;
}

export interface ParsedTrip {
  tripDuration: number;
  startTime: Date;
  stopTime: Date;
  startStationId: number;
  startStationName: string;
  endStationId: number;
  endStationName: string;
  bikeId: number;
  userType: string;
  birthYear: number | null;
  gender: number; // 0=Undefined, 1=Male, 2=Female
  hourOfDay: number;
  dayOfMonth: number;
  weekday: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  month: number;
  year: number;
  mdyStartTimeSet: string; // MDY(Start Time) Set - formatted date for filtering/grouping
}

export interface GenderTripsByHour {
  hour: number;
  gender: number;
  count: number;
}

export interface DayTripsByMonth {
  day: number;
  weekday: number;
  count: number;
}

export type FilterState = {
  selectedDay: number | null;
};

export type SelectionType = 'day' | 'gender' | 'hour' | 'weekday';
