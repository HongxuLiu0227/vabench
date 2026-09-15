import * as d3 from 'd3';
import type { BikeTripData, UsertypeAgeData, UsertypeGenderData, DashboardFilter } from '../types';

const DATA_URL = '/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv';

/**
 * Map gender integer code to human-readable name
 */
function mapGenderToName(gender: number): 'Unknown' | 'Male' | 'Female' {
  switch (gender) {
    case 0:
      return 'Unknown';
    case 1:
      return 'Male';
    case 2:
      return 'Female';
    default:
      return 'Unknown';
  }
}

/**
 * Parse and transform raw CSV data into processed bike trip data
 */
function parseBikeTripData(d: d3.DSVRowString): BikeTripData {
  const birthYear = Number(d['birth year']);
  const gender = Number(d['gender']);

  return {
    tripduration: Number(d['tripduration']),
    starttime: new Date(d['starttime']),
    stoptime: new Date(d['stoptime']),
    startStationId: Number(d['start station id']),
    startStationName: d['start station name'],
    startStationLatitude: Number(d['start station latitude']),
    startStationLongitude: Number(d['start station longitude']),
    endStationId: Number(d['end station id']),
    endStationName: d['end station name'],
    endStationLatitude: Number(d['end station latitude']),
    endStationLongitude: Number(d['end station longitude']),
    bikeid: Number(d['bikeid']),
    usertype: d['usertype'] as 'Subscriber' | 'Customer',
    birthYear,
    gender,
    age: birthYear > 1900 && birthYear <= 2021 ? 2021 - birthYear : 0,
    genderName: mapGenderToName(gender),
  };
}

/**
 * Normalize CSV headers by removing extra quotes, whitespace, and BOM
 *
 * This function handles various CSV header format issues:
 * - BOM (Byte Order Mark) at the start of files
 * - Triple-quoted headers: """tripduration""" -> tripduration
 * - Double-quoted headers: "starttime" -> starttime
 * - Extra whitespace around headers
 *
 * @param csvText - Raw CSV text as a string
 * @returns Normalized CSV text with clean headers
 */
function normalizeCsvHeaders(csvText: string): string {
  const lines = csvText.split('\n');
  if (lines.length === 0) return csvText;

  // Normalize only the header line (first line)
  let headerLine = lines[0];

  // Remove UTF-8 BOM if present at the start
  headerLine = headerLine.replace(/^\uFEFF/, '');

  // Remove carriage return (Windows line endings) if present
  headerLine = headerLine.replace(/\r$/, '');

  // First pass: replace triple-quoted headers
  // Pattern: """fieldname""" -> fieldname
  headerLine = headerLine.replace(/"""([^"]+)"""/g, '$1');

  // Second pass: replace any remaining double-quoted headers
  // Pattern: "fieldname" -> fieldname
  // This is done after triple-quote replacement to avoid re-matching
  headerLine = headerLine.replace(/"([^"]+)"/g, '$1');

  // Trim any leading/trailing whitespace from the entire header line
  headerLine = headerLine.trim();

  // Update the header line
  lines[0] = headerLine;

  // Rejoin the lines
  return lines.join('\n');
}

/**
 * Load and parse the bike trip CSV data
 *
 * This function performs the following steps:
 * 1. Fetches the CSV file from the data URL
 * 2. Normalizes CSV headers (removes quotes, BOM, extra whitespace)
 * 3. Parses the normalized CSV using D3
 * 4. Transforms and validates the data
 * 5. Filters out invalid records (e.g., impossible ages)
 *
 * @returns Promise resolving to an array of processed bike trip data
 * @throws Error if fetching or parsing fails
 */
export async function loadBikeData(): Promise<BikeTripData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    // CRITICAL: Normalize CSV headers BEFORE parsing
    // This handles triple-quoted headers ("""field"""), double-quoted headers,
    // BOM characters, and extra whitespace that would cause field lookup failures
    const normalizedCsv = normalizeCsvHeaders(csvText);

    // Parse the normalized CSV text
    const rawData = d3.csvParse(normalizedCsv);

    // Transform raw CSV rows into strongly-typed BikeTripData objects
    const processedData = rawData
      .map(parseBikeTripData)
      .filter((trip) => {
        // Filter out records with invalid age (too old or missing data)
        // Age > 0 ensures birth year was valid
        // Age < 120 ensures the data is reasonable
        return trip.age > 0 && trip.age < 120;
      });

    return processedData;
  } catch (error) {
    console.error('Error loading bike data:', error);
    throw error;
  }
}

/**
 * Aggregate data by usertype and calculate average age
 */
export function aggregateUsertypeByAge(data: BikeTripData[]): UsertypeAgeData[] {
  const aggregated = d3.rollup(
    data,
    (v: BikeTripData[]) => ({
      count: v.length,
      sumAge: d3.sum(v, (d: BikeTripData) => d.age) as number,
    }),
    (d: BikeTripData) => d.usertype
  );

  const result: UsertypeAgeData[] = Array.from(aggregated, ([usertype, stats]): UsertypeAgeData => ({
    usertype: usertype as 'Subscriber' | 'Customer',
    avgAge: stats.sumAge / stats.count,
    count: stats.count,
  }));

  // Sort by avg age descending
  return result.sort((a, b) => b.avgAge - a.avgAge);
}

/**
 * Aggregate data by usertype and gender
 */
export function aggregateUsertypeByGender(data: BikeTripData[]): UsertypeGenderData[] {
  const aggregated = d3.rollup(
    data,
    (v: BikeTripData[]) => v.length,
    (d: BikeTripData) => d.usertype,
    (d: BikeTripData) => d.genderName
  );

  const result: UsertypeGenderData[] = [];
  aggregated.forEach((genderMap, usertype) => {
    genderMap.forEach((count, genderName) => {
      result.push({
        usertype: usertype as 'Subscriber' | 'Customer',
        genderName: genderName as 'Unknown' | 'Male' | 'Female',
        count: count as number,
      });
    });
  });

  // Sort by count descending
  return result.sort((a, b) => b.count - a.count);
}

/**
 * Apply dashboard filters to the dataset
 */
export function applyFilters(data: BikeTripData[], filters: DashboardFilter): BikeTripData[] {
  let filtered = data;

  if (filters.usertype) {
    filtered = filtered.filter((d) => d.usertype === filters.usertype);
  }

  if (filters.genderName) {
    filtered = filtered.filter((d) => d.genderName === filters.genderName);
  }

  return filtered;
}
