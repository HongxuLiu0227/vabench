import { csvParse } from 'd3-dsv';
import type { CitiBikeTrip, CitiBikeTripRaw, HourlyData, TripTimeType } from '../types';

const DATA_URL = '/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv';

/**
 * Fetch CSV data from public/data directory
 */
export async function fetchCsvData(): Promise<string> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

/**
 * Normalize CSV headers by removing BOM, triple quotes, and extra whitespace
 * Handles cases like:
 * - UTF-8 BOM (byte order mark): strips U+FEFF from start of file
 * - Triple quotes: """tripduration""" -> tripduration
 * - Double quotes: "tripduration" -> tripduration
 * - Extra whitespace: "  tripduration  " -> tripduration
 */
function normalizeCsvHeaders(csvText: string): string {
  const lines = csvText.split('\n');
  if (lines.length === 0) return csvText;

  // Process the header line (first line)
  let headerLine = lines[0];

  // Remove UTF-8 BOM if present
  headerLine = headerLine.replace(/^\uFEFF/, '');

  // Remove triple quotes: """fieldname""" -> fieldname
  headerLine = headerLine.replace(/"""([^"]+)"""/g, '$1');

  // Remove any double quotes that wrap single fields: "fieldname" -> fieldname
  headerLine = headerLine.replace(/"([^"]+)"/g, '$1');

  // Trim extra whitespace
  headerLine = headerLine.trim();

  // Keep the rest of the lines as-is
  lines[0] = headerLine;
  return lines.join('\n');
}

/**
 * Parse raw CSV row into typed CitiBikeTrip
 */
function parseTripRow(row: CitiBikeTripRaw): CitiBikeTrip {
  return {
    tripduration: Number(row['tripduration']) || 0,
    starttime: new Date(row['starttime']),
    stoptime: new Date(row['stoptime']),
    startStationId: Number(row['start station id']) || 0,
    startStationName: row['start station name'] || '',
    startStationLatitude: Number(row['start station latitude']) || 0,
    startStationLongitude: Number(row['start station longitude']) || 0,
    endStationId: Number(row['end station id']) || 0,
    endStationName: row['end station name'] || '',
    endStationLatitude: Number(row['end station latitude']) || 0,
    endStationLongitude: Number(row['end station longitude']) || 0,
    bikeid: Number(row['bikeid']) || 0,
    usertype: row['usertype'] || '',
    birthYear: Number(row['birth year']) || 0,
    gender: Number(row['gender']) || 0,
    tableName: row['Table Name'],
  };
}

/**
 * Load and parse CitiBike trip data
 */
export async function loadCitiBikeData(): Promise<CitiBikeTrip[]> {
  try {
    const csvText = await fetchCsvData();
    // Normalize headers to handle triple quotes
    const normalizedCsv = normalizeCsvHeaders(csvText);
    const rawData = csvParse(normalizedCsv) as unknown as CitiBikeTripRaw[];
    return rawData.map(parseTripRow);
  } catch (error) {
    console.error('Error loading CitiBike data:', error);
    throw error;
  }
}

/**
 * Aggregate trip data by hour for chart visualization
 */
export function aggregateByHour(data: CitiBikeTrip[], type: TripTimeType): HourlyData[] {
  // Initialize all 24 hours with count 0
  const hourlyCounts = new Array(24).fill(0).map((_, hour) => ({ hour, count: 0 }));

  // Count trips by hour
  for (const trip of data) {
    const date = type === 'start' ? trip.starttime : trip.stoptime;
    const hour = date.getHours();
    if (hour >= 0 && hour < 24) {
      hourlyCounts[hour].count++;
    }
  }

  return hourlyCounts;
}

/**
 * React hook to load and process CitiBike data
 */
export async function loadDashboardData() {
  const trips = await loadCitiBikeData();

  const startHourlyData = aggregateByHour(trips, 'start');
  const endHourlyData = aggregateByHour(trips, 'end');

  return {
    trips,
    startHourlyData,
    endHourlyData,
  };
}
