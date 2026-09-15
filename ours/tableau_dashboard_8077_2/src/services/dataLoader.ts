import * as d3Dsv from 'd3-dsv';
import type { CitiBikeTrip } from '../types/citibike';

const DATA_URL = '/data/JC-201701-citibike-tripdata.csv';

/**
 * Normalizes CSV headers by stripping excessive quotes and BOM
 *
 * The source CSV file contains headers with triple quotes like:
 * """tripduration""","""starttime""","""stoptime""",...
 *
 * And may include a BOM (Byte Order Mark) at the start of the file.
 *
 * D3's csvParse preserves these quotes and BOM in the column names, which breaks
 * field lookups. This function normalizes the headers by:
 * 1. Stripping BOM character (byte order mark)
 * 2. Stripping triple quotes: """field""" -> field
 * 3. Stripping double quotes: "field" -> field
 *
 * This ensures deterministic field name matching regardless of how
 * the CSV was generated.
 */
function normalizeHeaders(row: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    // Strip BOM, then triple quotes: """field""" -> field, then double quotes
    // Also handle cases where d3-dsv may have already stripped outer quotes
    let normalizedKey = key.replace(/^\uFEFF/, '');  // Strip BOM

    // Handle triple quotes: """field""" -> field
    normalizedKey = normalizedKey.replace(/^"{3}(.+?)"{3}$/, '$1');

    // Handle double quotes: "field" -> field
    normalizedKey = normalizedKey.replace(/^"(.+)"$/, '$1');

    // Strip any leading/trailing whitespace that may remain
    normalizedKey = normalizedKey.trim();

    normalized[normalizedKey] = value;
  }
  return normalized;
}

/**
 * Loads and parses the CitiBike trip data CSV file
 *
 * This function:
 * 1. Fetches the CSV from /data/JC-201701-citibike-tripdata.csv
 * 2. Parses it using d3-dsv's csvParse
 * 3. Normalizes headers to handle triple-quoted fieldnames
 * 4. Coerces fields to appropriate types (number, Date, string)
 * 5. Provides fallback values (0, empty string) for missing/invalid data
 *
 * Returns an array of CitiBikeTrip objects with properly typed fields
 */
export async function loadCitiBikeData(): Promise<CitiBikeTrip[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  const rawData = d3Dsv.csvParse(csvText);

  return rawData.map((row: Record<string, string>) => {
    // Normalize headers to handle triple-quoted fieldnames
    const normalizedRow = normalizeHeaders(row);

    return {
      tripduration: Number(normalizedRow['tripduration']) || 0,
      starttime: new Date(normalizedRow['starttime'] || ''),
      stoptime: new Date(normalizedRow['stoptime'] || ''),
      'start station id': Number(normalizedRow['start station id']) || 0,
      'start station name': String(normalizedRow['start station name'] || '').trim(),
      'start station latitude': Number(normalizedRow['start station latitude']) || 0,
      'start station longitude': Number(normalizedRow['start station longitude']) || 0,
      'end station id': Number(normalizedRow['end station id']) || 0,
      'end station name': String(normalizedRow['end station name'] || '').trim(),
      'end station latitude': Number(normalizedRow['end station latitude']) || 0,
      'end station longitude': Number(normalizedRow['end station longitude']) || 0,
      bikeid: Number(normalizedRow['bikeid']) || 0,
      usertype: String(normalizedRow['usertype'] || '').trim(),
      'birth year': normalizedRow['birth year'] ? Number(normalizedRow['birth year']) : '',
      gender: Number(normalizedRow['gender']) || 0,
    };
  });
}

export function aggregateByStartStation(data: CitiBikeTrip[]): Map<string, number> {
  const aggregation = new Map<string, number>();

  data.forEach((trip) => {
    const stationName = trip['start station name'];
    if (stationName) {
      aggregation.set(stationName, (aggregation.get(stationName) || 0) + 1);
    }
  });

  return aggregation;
}

export function aggregateByEndStation(data: CitiBikeTrip[]): Map<string, number> {
  const aggregation = new Map<string, number>();

  data.forEach((trip) => {
    const stationName = trip['end station name'];
    const stationId = trip['end station id'];
    if (stationName && stationId && stationId !== 0) {
      aggregation.set(stationName, (aggregation.get(stationName) || 0) + 1);
    }
  });

  return aggregation;
}

/**
 * Station names to exclude as per Tableau spec filter
 * These are excluded test stations that should not be displayed
 */
const EXCLUDED_STATION_NAMES = new Set([
  'Indiana',
  "JSQ Don't Use",
  "WS Don't Use"
]);

export function getEndStationLocations(data: CitiBikeTrip[]): Map<string, { latitude: number; longitude: number; count: number }> {
  const locations = new Map<string, { latitude: number; longitude: number; count: number }>();

  data.forEach((trip) => {
    const stationName = trip['end station name'];
    const stationId = trip['end station id'];
    const latitude = trip['end station latitude'];
    const longitude = trip['end station longitude'];

    // Apply Tableau filter exclusions:
    // 1. Exclude stations with null/zero coordinates
    // 2. Exclude specific station names (Indiana, JSQ Don't Use, WS Don't Use)
    if (stationName &&
        stationId &&
        stationId !== 0 &&
        latitude !== 0 &&
        longitude !== 0 &&
        !EXCLUDED_STATION_NAMES.has(stationName)) {
      const existing = locations.get(stationName);
      if (existing) {
        existing.count += 1;
      } else {
        locations.set(stationName, { latitude, longitude, count: 1 });
      }
    }
  });

  return locations;
}
