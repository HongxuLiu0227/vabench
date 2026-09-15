/**
 * Parsed CitiBike trip record with Date objects
 * Raw CSV fields are normalized by the csvParser utility
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
}

/**
 * Aggregated trip data by year
 */
export interface TripDataByYear {
  year: number;
  count: number;
}

/**
 * Percent growth data by year
 */
export interface PercentGrowthByYear {
  year: number;
  percentGrowth: number | null; // null for first year with no previous year
}

/**
 * Highlight selection state
 */
export interface HighlightSelection {
  year?: number;
  month?: number;
}

/**
 * Data for line chart rendering
 */
export interface LineChartData {
  year: number;
  value: number;
}

/**
 * Props for line chart component
 */
export interface LineChartProps {
  data: LineChartData[];
  title: string;
  width: number;
  height: number;
  colorScale: (value: number) => string | number;
  selectedYear?: number | null;
  onYearClick?: (year: number) => void;
  isPercentage?: boolean;
}
