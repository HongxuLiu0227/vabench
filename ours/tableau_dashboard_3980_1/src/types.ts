/**
 * Raw CSV data structure for CitiBike trip records
 */
export interface CitiBikeTripRaw {
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
  'Table Name'?: string;
}

/**
 * Parsed and typed CitiBike trip record
 */
export interface CitiBikeTrip {
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
  usertype: string;
  birthYear: number;
  gender: number;
  tableName?: string;
}

/**
 * Aggregated hourly data for charts
 */
export interface HourlyData {
  hour: number;
  count: number;
}

/**
 * Chart type for trip start or end
 */
export type TripTimeType = 'start' | 'end';

/**
 * Props for the PeakHoursLineChart component
 */
export interface PeakHoursLineChartProps {
  data: HourlyData[];
  title: string;
  type: TripTimeType;
  highlightedHour: number | null;
  onHourHover: (hour: number | null) => void;
}

/**
 * Highlight state for dashboard interactions
 */
export interface HighlightState {
  hour: number | null;
  source: TripTimeType | null;
}
