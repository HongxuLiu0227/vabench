import { csvParse } from 'd3-dsv';
import type { TripData, RawCsvRow } from '../types/tripData';

const DATA_FILES = [
  '/data/JC-201701-citibike-tripdata.csv',
  '/data/JC-201702-citibike-tripdata.csv',
  '/data/JC-201703-citibike-tripdata.csv',
  '/data/JC-201704-citibike-tripdata.csv',
  '/data/JC-201705-citibike-tripdata.csv',
  '/data/JC-201706-citibike-tripdata.csv',
  '/data/JC-201707-citibike-tripdata.csv',
  '/data/JC-201708 citibike-tripdata.csv',
  '/data/JC-201709-citibike-tripdata.csv',
  '/data/JC-201710-citibike-tripdata.csv',
  '/data/JC-201711-citibike-tripdata.csv',
  '/data/JC-201712-citibike-tripdata.csv',
];

function normalizeFieldName(key: string): string {
  const lowerKey = key.toLowerCase().trim();

  // Map various possible field names to normalized versions
  // Handle both lowercase format ("tripduration") and Title Case format ("Trip Duration")
  if (lowerKey.includes('tripduration') || lowerKey.includes('trip duration')) {
    return 'tripduration';
  }
  if (lowerKey.includes('starttime') || lowerKey.includes('start time')) {
    return 'starttime';
  }
  if (lowerKey.includes('stoptime') || lowerKey.includes('stop time')) {
    return 'stoptime';
  }
  if (lowerKey.includes('start station id')) {
    return 'start station id';
  }
  if (lowerKey.includes('start station name')) {
    return 'start station name';
  }
  if (lowerKey.includes('start station latitude')) {
    return 'start station latitude';
  }
  if (lowerKey.includes('start station longitude')) {
    return 'start station longitude';
  }
  if (lowerKey.includes('end station id')) {
    return 'end station id';
  }
  if (lowerKey.includes('end station name')) {
    return 'end station name';
  }
  if (lowerKey.includes('end station latitude')) {
    return 'end station latitude';
  }
  if (lowerKey.includes('end station longitude')) {
    return 'end station longitude';
  }
  // Handle both "bikeid" and "bike id"
  if (lowerKey.includes('bikeid') || lowerKey === 'bike id') {
    return 'bikeid';
  }
  // Handle both "usertype" and "user type"
  if (lowerKey.includes('usertype') || lowerKey === 'user type') {
    return 'usertype';
  }
  if (lowerKey.includes('birth year') || lowerKey.includes('birth year')) {
    return 'birth year';
  }
  if (lowerKey.includes('gender')) {
    return 'gender';
  }

  return lowerKey;
}

function normalizeRow(row: RawCsvRow): TripData | null {
  try {
    // Normalize field names
    const normalized: RawCsvRow = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = normalizeFieldName(key);
      normalized[normalizedKey] = row[key];
    });

    // Helper function to parse numeric values, handling NULL, empty strings, and invalid values
    const parseNumber = (value: string | undefined | null): number => {
      if (value === null || value === undefined || value === '' || value === 'NULL' || value === 'null') {
        return 0;
      }
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    // Parse numeric values
    const tripDuration = parseNumber(normalized['tripduration']);
    const startStationId = parseNumber(normalized['start station id']);
    const startStationLatitude = parseNumber(normalized['start station latitude']);
    const startStationLongitude = parseNumber(normalized['start station longitude']);
    const endStationId = parseNumber(normalized['end station id']);
    const endStationLatitude = parseNumber(normalized['end station latitude']);
    const endStationLongitude = parseNumber(normalized['end station longitude']);
    const bikeId = parseNumber(normalized['bikeid']);
    const birthYear = parseNumber(normalized['birth year']);
    const gender = parseNumber(normalized['gender']);

    // Parse dates, validate they're valid dates
    const startTimeStr = normalized['starttime'] || '';
    const stopTimeStr = normalized['stoptime'] || '';
    const startTime = new Date(startTimeStr);
    const stopTime = new Date(stopTimeStr);

    // Check if dates are valid (not Invalid Date)
    if (isNaN(startTime.getTime()) || isNaN(stopTime.getTime())) {
      console.warn('Invalid date detected:', { startTime: startTimeStr, stopTime: stopTimeStr });
      return null;
    }

    // Get string fields, handle NULL values
    const startStationName = (normalized['start station name'] || '').replace(/^NULL$/i, '').replace(/^"NULL"$/i, '');
    const endStationName = (normalized['end station name'] || '').replace(/^NULL$/i, '').replace(/^"NULL"$/i, '');
    const userType = (normalized['usertype'] || '').replace(/^NULL$/i, '').replace(/^"NULL"$/i, '');

    // Filter out records with invalid coordinates (both latitude and longitude are 0)
    // This matches the Tableau exclusion filter for (0.0, 0.0)
    if (endStationLatitude === 0 && endStationLongitude === 0) {
      return null;
    }

    // Ensure station names are present
    if (!startStationName || !endStationName) {
      console.warn('Missing station name:', { startStationName, endStationName });
      return null;
    }

    return {
      tripDuration,
      startTime,
      stopTime,
      startStationId,
      startStationName,
      startStationLatitude,
      startStationLongitude,
      endStationId,
      endStationName,
      endStationLatitude,
      endStationLongitude,
      bikeId,
      userType,
      birthYear,
      gender,
    };
  } catch (error) {
    console.warn('Error normalizing row:', error);
    return null;
  }
}

/**
 * Detects if the CSV has preamble rows before the actual header.
 * Returns the line number where the real header starts (0-indexed).
 * A valid header line must contain known field names.
 */
function detectHeaderStart(lines: string[]): number {
  // Known field variations that indicate a real header
  const knownFieldPatterns = [
    'tripduration', 'trip duration',
    'starttime', 'start time',
    'stoptime', 'stop time',
    'start station',
    'end station',
    'bikeid', 'bike id',
    'usertype', 'user type'
  ];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].toLowerCase().trim();

    // Check if this line contains known field patterns
    const matchCount = knownFieldPatterns.filter(pattern =>
      line.includes(pattern)
    ).length;

    // If we find multiple known field patterns, this is likely the header
    if (matchCount >= 3) {
      return i;
    }
  }

  // Default to first line if no clear header found
  return 0;
}

async function loadSingleCsv(url: string): Promise<TripData[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const csvText = await response.text();

    // Split into lines to detect preamble
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      console.warn(`Empty CSV file: ${url}`);
      return [];
    }

    // Detect where the actual header starts
    const headerLineIndex = detectHeaderStart(lines);

    if (headerLineIndex > 0) {
      console.info(`Detected ${headerLineIndex} preamble row(s) in ${url}`);
    }

    // Reconstruct CSV without preamble rows
    const cleanedCsvText = lines.slice(headerLineIndex).join('\n');

    const parsedData = csvParse(cleanedCsvText);

    if (parsedData.length === 0) {
      console.warn(`No data rows found in ${url}`);
      return [];
    }

    // Log sample of parsed fields for debugging
    const sampleFields = Object.keys(parsedData[0]);
    console.debug(`Parsed ${url}. Fields:`, sampleFields.join(', '));

    const tripData: TripData[] = [];
    let skippedCount = 0;

    parsedData.forEach((row, index) => {
      const normalized = normalizeRow(row as RawCsvRow);
      if (normalized) {
        tripData.push(normalized);
      } else {
        skippedCount++;
        if (skippedCount <= 5) {
          // Only log first 5 skipped rows to avoid spam
          console.debug(`Skipped row ${index} in ${url}:`, row);
        }
      }
    });

    console.log(`Loaded ${tripData.length} valid trip records from ${url} (skipped ${skippedCount} invalid rows)`);
    return tripData;
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
    return [];
  }
}

export async function loadAllData(): Promise<TripData[]> {
  try {
    console.log(`Starting to load ${DATA_FILES.length} CSV files...`);
    const allDataPromises = DATA_FILES.map(url => loadSingleCsv(url));
    const allDataArrays = await Promise.all(allDataPromises);

    // Flatten array of arrays
    const allData = allDataArrays.flat();

    console.log(`✓ Successfully loaded ${allData.length} total trip records from ${DATA_FILES.length} files`);

    // Validate that we have the expected fields by checking a sample record
    if (allData.length > 0) {
      const sample = allData[0];
      const requiredFields: (keyof TripData)[] = [
        'endStationName',
        'endStationLatitude',
        'endStationLongitude',
        'startStationName'
      ];

      const missingFields = requiredFields.filter(field => sample[field] === undefined || sample[field] === null);

      if (missingFields.length > 0) {
        console.error('❌ Missing required Tableau fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('✓ All required Tableau fields are present:', {
        endStationName: sample.endStationName,
        endStationLatitude: sample.endStationLatitude,
        endStationLongitude: sample.endStationLongitude,
        startStationName: sample.startStationName
      });

      // Log data quality metrics
      const validCoords = allData.filter(d =>
        d.endStationLatitude !== 0 && d.endStationLongitude !== 0
      ).length;
      console.log(`✓ Data quality: ${validCoords}/${allData.length} records have valid coordinates`);
    } else {
      console.warn('⚠ Warning: No data was loaded from any files');
    }

    return allData;
  } catch (error) {
    console.error('❌ Error loading data:', error);
    throw error;
  }
}

export async function loadDataForMonth(month: number): Promise<TripData[]> {
  const monthIndex = month - 1; // Convert 1-based month to 0-based index
  if (monthIndex < 0 || monthIndex >= DATA_FILES.length) {
    console.error(`Invalid month: ${month}`);
    return [];
  }

  return loadSingleCsv(DATA_FILES[monthIndex]);
}
