import { csvParse } from 'd3-dsv';
import type { CitiBikeTrip, StationData, WorksheetData } from '../types';

// Normalize CSV headers by removing BOM, triple quotes, and extra whitespace
export function normalizeCsvHeaders(csvText: string): string {
  // Remove UTF-8 BOM if present
  const text = csvText.replace(/^\uFEFF/, '');

  // Split into lines
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return text;

  // Process the header line (first non-empty line)
  let headerLineIndex = 0;
  while (headerLineIndex < lines.length && lines[headerLineIndex].trim() === '') {
    headerLineIndex++;
  }

  if (headerLineIndex >= lines.length) return text;

  // Normalize headers: remove triple quotes and any surrounding quotes
  lines[headerLineIndex] = lines[headerLineIndex]
    .split(',')
    .map(header => {
      let normalized = header.trim();

      // Iteratively remove quotes from the outside
      // Handle: """field""" -> field, "field" -> field
      while (normalized.startsWith('"') && normalized.endsWith('"')) {
        normalized = normalized.slice(1, -1);
      }

      // Trim any remaining whitespace
      normalized = normalized.trim();

      // Re-add single quotes for d3-dsv
      return `"${normalized}"`;
    })
    .join(',');

  return lines.join('\n');
}

// Parse CSV data from raw text
function parseCsvData(csvText: string): CitiBikeTrip[] {
  // Normalize headers first
  const normalizedCsv = normalizeCsvHeaders(csvText);

  const parsed = csvParse(normalizedCsv);

  return parsed.map((row: Record<string, string>) => ({
    tripduration: Number(row['tripduration']) || 0,
    starttime: new Date(row['starttime'] || ''),
    stoptime: new Date(row['stoptime'] || ''),
    'start station id': Number(row['start station id']) || 0,
    'start station name': (row['start station name'] || '').trim(),
    'start station latitude': Number(row['start station latitude']) || 0,
    'start station longitude': Number(row['start station longitude']) || 0,
    'end station id': Number(row['end station id']) || 0,
    'end station name': (row['end station name'] || '').trim(),
    'end station latitude': Number(row['end station latitude']) || 0,
    'end station longitude': Number(row['end station longitude']) || 0,
    bikeid: Number(row['bikeid']) || 0,
    usertype: (row['usertype'] || '').trim(),
    'birth year': Number(row['birth year']) || 0,
    gender: (row['gender'] || '').trim(),
  }));
}

// Aggregate data by station
function aggregateByStation(data: CitiBikeTrip[], stationType: 'start' | 'end'): Map<string, number> {
  const stationKey = stationType === 'start' ? 'start station name' : 'end station name';
  const counts = new Map<string, number>();

  for (const trip of data) {
    const station = trip[stationKey];
    if (station) {
      counts.set(station, (counts.get(station) || 0) + 1);
    }
  }

  return counts;
}

// Get top N stations
function getTopStations(counts: Map<string, number>, n: number = 10): StationData[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([stationName, count]) => ({ stationName, count }));
}

// Get bottom N stations
function getBottomStations(counts: Map<string, number>, n: number = 10): StationData[] {
  return Array.from(counts.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map(([stationName, count]) => ({ stationName, count }));
}

// Get citymap data (stations with coordinates)
function getCitymapData(data: CitiBikeTrip[], stationType: 'start' | 'end'): StationData[] {
  const stationKey = stationType === 'start' ? 'start station name' : 'end station name';
  const latKey = stationType === 'start' ? 'start station latitude' : 'end station latitude';
  const lonKey = stationType === 'start' ? 'start station longitude' : 'end station longitude';

  const stationMap = new Map<string, { count: number; latitude: number; longitude: number }>();

  for (const trip of data) {
    const station = trip[stationKey];
    const lat = trip[latKey];
    const lon = trip[lonKey];

    if (station && lat !== 0 && lon !== 0) {
      const existing = stationMap.get(station);
      if (existing) {
        existing.count += 1;
      } else {
        stationMap.set(station, { count: 1, latitude: lat, longitude: lon });
      }
    }
  }

  // Sort by count descending
  return Array.from(stationMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([stationName, { count, latitude, longitude }]) => ({
      stationName,
      count,
      latitude,
      longitude,
    }));
}

// Process all data into worksheet data
export function processWorksheetData(data: CitiBikeTrip[]): WorksheetData {
  const startCounts = aggregateByStation(data, 'start');
  const endCounts = aggregateByStation(data, 'end');

  return {
    top10Start: getTopStations(startCounts, 10),
    bottom10Start: getBottomStations(startCounts, 10),
    top10End: getTopStations(endCounts, 10),
    bottom10End: getBottomStations(endCounts, 10),
    citymapStart: getCitymapData(data, 'start'),
    citymapEnd: getCitymapData(data, 'end'),
  };
}

// Main function to load and process data
export async function loadData(): Promise<WorksheetData> {
  const response = await fetch('/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv');
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const csvText = await response.text();
  const data = parseCsvData(csvText);

  return processWorksheetData(data);
}

// Normalize CSV headers from an array of row objects
function normalizeRowHeaders(rows: Array<Record<string, string>>): Array<Record<string, string>> {
  if (rows.length === 0) return rows;

  // Get the original headers from the first row
  const originalHeaders = Object.keys(rows[0]);

  // Create a mapping from original to normalized headers
  const headerMap: Record<string, string> = {};
  originalHeaders.forEach(header => {
    let normalized = header.trim();

    // Iteratively remove quotes from the outside
    // Handle: """field""" -> field, "field" -> field
    while (normalized.startsWith('"') && normalized.endsWith('"')) {
      normalized = normalized.slice(1, -1);
    }

    // Trim any remaining whitespace
    normalized = normalized.trim();

    headerMap[header] = normalized;
  });

  // Remap each row with normalized headers
  return rows.map(row => {
    const newRow: Record<string, string> = {};
    originalHeaders.forEach(originalHeader => {
      const normalizedHeader = headerMap[originalHeader];
      newRow[normalizedHeader] = row[originalHeader];
    });
    return newRow;
  });
}

// Process raw CSV data (parsed as generic records)
export function processRawCsvData(parsedData: Array<Record<string, string>>): WorksheetData {
  // Normalize headers first
  const normalizedData = normalizeRowHeaders(parsedData);

  // Convert generic records to CitiBikeTrip objects
  const citiBikeTrips: CitiBikeTrip[] = normalizedData.map((row) => ({
    tripduration: Number(row['tripduration']) || 0,
    starttime: new Date(row['starttime'] || ''),
    stoptime: new Date(row['stoptime'] || ''),
    'start station id': Number(row['start station id']) || 0,
    'start station name': (row['start station name'] || '').trim(),
    'start station latitude': Number(row['start station latitude']) || 0,
    'start station longitude': Number(row['start station longitude']) || 0,
    'end station id': Number(row['end station id']) || 0,
    'end station name': (row['end station name'] || '').trim(),
    'end station latitude': Number(row['end station latitude']) || 0,
    'end station longitude': Number(row['end station longitude']) || 0,
    bikeid: Number(row['bikeid']) || 0,
    usertype: (row['usertype'] || '').trim(),
    'birth year': Number(row['birth year']) || 0,
    gender: (row['gender'] || '').trim(),
  }));

  return processWorksheetData(citiBikeTrips);
}

// Re-process data with filters applied
export function applyFilters(
  data: CitiBikeTrip[],
  startStation: string | null,
  endStation: string | null
): CitiBikeTrip[] {
  let filtered = data;

  if (startStation) {
    filtered = filtered.filter(trip => trip['start station name'] === startStation);
  }

  if (endStation) {
    filtered = filtered.filter(trip => trip['end station name'] === endStation);
  }

  return filtered;
}
