import { loadTableauCSV, validateFields } from '../utils/csvParser';
import type {
  CitiBikeTrip,
  TripDataByYear,
  PercentGrowthByYear,
  LineChartData,
} from '../types';

const DATA_URL = '/data/TableauTemp_1f56vnx1u34eds13ml2di1i0hdr8.csv';

// Required fields from Tableau spec
const REQUIRED_FIELDS = [
  'stoptime',
  'starttime',
  'tripduration',
  'start station id',
  'start station name',
  'bikeid',
  'usertype',
  'birth year',
  'gender'
];

/**
 * Parse a raw CSV row (with normalized headers) to CitiBikeTrip
 */
function parseTripRecord(d: Record<string, string>): CitiBikeTrip {
  // Parse numeric fields with validation
  const parseNumber = (value: string, fieldName: string): number => {
    const num = Number(value);
    if (isNaN(num)) {
      console.warn(`Invalid numeric value for ${fieldName}: "${value}", using 0`);
      return 0;
    }
    return num;
  };

  // Parse date fields with validation
  const parseDate = (value: string, fieldName: string): Date => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value for ${fieldName}: "${value}", using epoch`);
      return new Date(0);
    }
    return date;
  };

  return {
    tripduration: parseNumber(d['tripduration'] || '0', 'tripduration'),
    starttime: parseDate(d['starttime'] || '', 'starttime'),
    stoptime: parseDate(d['stoptime'] || '', 'stoptime'),
    startStationId: parseNumber(d['start station id'] || '0', 'start station id'),
    startStationName: d['start station name'] || 'Unknown',
    startStationLatitude: parseNumber(d['start station latitude'] || '0', 'start station latitude'),
    startStationLongitude: parseNumber(d['start station longitude'] || '0', 'start station longitude'),
    endStationId: parseNumber(d['end station id'] || '0', 'end station id'),
    endStationName: d['end station name'] || 'Unknown',
    endStationLatitude: parseNumber(d['end station latitude'] || '0', 'end station latitude'),
    endStationLongitude: parseNumber(d['end station longitude'] || '0', 'end station longitude'),
    bikeid: parseNumber(d['bikeid'] || '0', 'bikeid'),
    usertype: d['usertype'] || 'Unknown',
    birthYear: parseNumber(d['birth year'] || '0', 'birth year'),
    gender: parseNumber(d['gender'] || '0', 'gender'),
  };
}

/**
 * Load and parse CSV data with deterministic validation
 */
export async function loadCitiBikeData(): Promise<CitiBikeTrip[]> {
  try {
    const parsedData = await loadTableauCSV(DATA_URL);

    // Validate required fields exist
    const validation = validateFields(parsedData, REQUIRED_FIELDS);
    if (!validation.valid) {
      throw new Error(
        `Missing required fields in CSV: ${validation.missing.join(', ')}. ` +
        `Available fields: ${parsedData.columns.join(', ')}`
      );
    }

    // Check we have data rows
    if (parsedData.length === 0) {
      throw new Error('CSV file contains no data rows');
    }

    console.log(`Loading ${parsedData.length} trip records...`);

    // Parse each record with validation
    const trips = parsedData.map(parseTripRecord);

    // Validate parsed data
    const validTrips = trips.filter(trip => {
      const hasValidDates = !isNaN(trip.starttime.getTime()) && !isNaN(trip.stoptime.getTime());
      const hasValidYear = trip.stoptime.getFullYear() > 1970 && trip.stoptime.getFullYear() < 2100;
      return hasValidDates && hasValidYear;
    });

    if (validTrips.length === 0) {
      throw new Error('No valid trip records found after parsing. All records appear to have invalid dates or data.');
    }

    if (validTrips.length < trips.length) {
      console.warn(`Filtered out ${trips.length - validTrips.length} invalid records out of ${trips.length} total`);
    }

    console.log(`Successfully loaded ${validTrips.length} valid trip records`);

    return validTrips;
  } catch (error) {
    console.error('Error loading CitiBike data:', error);
    throw error;
  }
}

/**
 * Aggregate data by year (count of trips)
 */
export function aggregateTripsByYear(trips: CitiBikeTrip[]): TripDataByYear[] {
  const yearMap = new Map<number, number>();

  trips.forEach((trip) => {
    const year = trip.stoptime.getFullYear();
    const count = yearMap.get(year) || 0;
    yearMap.set(year, count + 1);
  });

  return Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Filter trips by month (1-4 for first quarter)
 */
export function filterByMonths(trips: CitiBikeTrip[], months: number[]): CitiBikeTrip[] {
  return trips.filter((trip) => {
    const month = trip.stoptime.getMonth() + 1; // Convert 0-indexed to 1-indexed
    return months.includes(month);
  });
}

/**
 * Calculate year-over-year percentage growth
 */
export function calculatePercentGrowth(
  tripsByYear: TripDataByYear[]
): PercentGrowthByYear[] {
  return tripsByYear.map((current, index) => {
    if (index === 0) {
      return { year: current.year, percentGrowth: null };
    }
    const previous = tripsByYear[index - 1];
    const percentGrowth =
      ((current.count - previous.count) / previous.count) * 100;
    return { year: current.year, percentGrowth };
  });
}

/**
 * Transform TripDataByYear to LineChartData for Sheet 13 and Sheet 13 (2)
 */
export function toLineChartData(tripsByYear: TripDataByYear[]): LineChartData[] {
  return tripsByYear.map((item) => ({
    year: item.year,
    value: item.count,
  }));
}

/**
 * Transform PercentGrowthByYear to LineChartData for Sheet 13 (3) and Sheet 13 (4)
 */
export function toGrowthLineChartData(
  growthData: PercentGrowthByYear[]
): LineChartData[] {
  return growthData.map((item) => ({
    year: item.year,
    value: item.percentGrowth ?? 0,
  }));
}
