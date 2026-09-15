/**
 * NOTE: CSV Header Normalization
 *
 * The CSV files may have headers with various quoting patterns:
 * - """TripID""" (triple quotes)
 * - "tripduration" (single double quotes)
 * - TripID (no quotes)
 *
 * Our dataService handles all these patterns automatically through
 * field accessors that normalize header names by stripping quotes
 * and performing case-insensitive lookups.
 *
 * We do NOT define a strict TripData interface with quoted field names
 * because that would be fragile. Instead, we rely on the robust parsing
 * in dataService.ts which handles all quoting variations.
 */

/**
 * Processed trip data with derived fields
 * This is the main data structure used throughout the application
 */
export interface ProcessedTripData {
  tripId: number;
  tripDuration: number;
  tripDurationMinutes: number;
  startTime: Date;
  stopTime: Date;
  startStationId: number;
  startStationName: string;
  startStationLatitude: number;
  startStationLongitude: number;
  endStationId: number;
  endStationName: string;
  endStationLatitude: number;
  endStationLongitude: number;
  bikeId: number;
  userType: string;
  birthYear: number;
  gender: number;
  genderText: GenderText;
  month: string; // Month abbreviation (Jan, Feb, etc.)
  year: number;
}

/**
 * Mapping from Tableau field names to internal field names
 * This ensures we can resolve all Tableau spec fields at runtime
 */
export const TABLEAU_FIELD_MAPPING: Record<string, keyof ProcessedTripData> = {
  // Tableau spec fields → Internal fields
  'TripID': 'tripId',
  'tripduration': 'tripDuration',
  'starttime': 'startTime',
  'stoptime': 'stopTime',
  'start station id': 'startStationId',
  'start station name': 'startStationName',
  'start station latitude': 'startStationLatitude',
  'start station longitude': 'startStationLongitude',
  'end station id': 'endStationId',
  'end station name': 'endStationName',
  'end station latitude': 'endStationLatitude',
  'end station longitude': 'endStationLongitude',
  'bikeid': 'bikeId',
  'usertype': 'userType',
  'birth year': 'birthYear',
  'gender': 'gender',

  // Calculated/derived fields
  'Gender Text': 'genderText',
  'Month': 'month',
  'Year': 'year',
};

/**
 * Gender text values
 */
export type GenderText = 'Male' | 'Female' | 'Unknown';

/**
 * Filter state for dashboard interactions
 */
export interface FilterState {
  selectedMonth: string | null;
  selectedUserType: string | null;
  selectedGender: string | null;
}

/**
 * Aggregated trip data by month
 */
export interface MonthlyTripData {
  month: string;
  monthIndex: number;
  count: number;
  avgDuration: number;
}

/**
 * Percentage data by month and category
 */
export interface MonthlyPercentageData {
  month: string;
  monthIndex: number;
  category: string;
  value: number;
  percentage: number;
}

/**
 * Data point for tooltip display
 */
export interface TooltipData {
  month: string;
  count?: number;
  avgDuration?: number;
  percentage?: number;
  category?: string;
}

/**
 * Highlight state for interactions
 */
export interface HighlightState {
  measureName: string | null;
  gender: string | null;
  userType: string | null;
  month: string | null;
}
