import * as d3 from 'd3';
import type { TripData, FilterState } from '../types';

const DATA_URL = '/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv';

interface CSVRow {
  [key: string]: string | undefined;
}

/**
 * Normalize CSV headers by removing quote wrapping
 * Handles: "field", """field""", field, etc.
 * Returns clean field name without quotes
 */
function normalizeHeader(header: string): string {
  if (!header) return header;
  const trimmed = header.trim();
  // Remove triple quotes: """field""" -> field
  let cleaned = trimmed.replace(/^"""+|"""+$/g, '');
  // Remove any remaining double quotes
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  return cleaned;
}

/**
 * Robust CSV parser that handles quoted headers and preamble rows
 * 1. Reads raw CSV text
 * 2. Finds the real header row (skips preamble if present)
 * 3. Normalizes header names
 * 4. Parses data with clean headers
 */
function parseCSVRobust(csvText: string): d3.DSVRowArray {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Detect header row by looking for common column patterns
  // Valid headers should contain expected column names
  const expectedColumns = ['tripduration', 'starttime', 'stoptime', 'usertype', 'gender', 'birth year'];
  let headerRowIndex = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    // Normalize and check for expected columns
    const normalizedLine = line.split(',').map((h: string) => normalizeHeader(h).toLowerCase());
    const matchCount = expectedColumns.filter(col =>
      normalizedLine.some((h: string) => h.includes(col))
    ).length;

    // If we find at least 3 expected columns, this is likely the header
    if (matchCount >= 3) {
      headerRowIndex = i;
      break;
    }
  }

  // Extract header row and normalize it
  const headerLine = lines[headerRowIndex];
  const rawHeaders = headerLine.split(',').map((h: string) => h.trim());
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  // Extract data rows (everything after header)
  const dataLines = lines.slice(headerRowIndex + 1);

  // Reconstruct CSV with clean headers for D3 to parse
  const cleanCSV = [normalizedHeaders.join(','), ...dataLines].join('\n');

  // Parse with D3
  return d3.csvParse(cleanCSV);
}

// Age group bins as specified in requirements
const AGE_GROUP_BINS = [
  { min: 17, max: 20, label: '17-20' },
  { min: 21, max: 30, label: '21-30' },
  { min: 31, max: 40, label: '31-40' },
  { min: 41, max: 50, label: '41-50' },
  { min: 51, max: 60, label: '51-60' },
  { min: 61, max: 70, label: '61-70' },
  { min: 71, max: 150, label: '71+' }
];

export function getAgeGroup(age: number | null): string {
  if (age === null || age === undefined || isNaN(age)) {
    return 'Unknown';
  }

  const bin = AGE_GROUP_BINS.find(b => age >= b.min && age <= b.max);
  return bin?.label || 'Unknown';
}

export async function loadTripData(): Promise<TripData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rawData = parseCSVRobust(csvText);

    console.log(`Loaded ${rawData.length} rows from CSV`);
    console.log('Sample raw columns:', rawData.length > 0 ? Object.keys(rawData[0]) : []);

    const processedData: TripData[] = rawData.map((row: CSVRow) => {
      // Parse date fields - headers are now normalized
      const starttime = new Date(row['starttime'] || '');
      const stoptime = new Date(row['stoptime'] || '');

      // Validate dates
      const isValidStartTime = !isNaN(starttime.getTime());
      const validStarttime = isValidStartTime ? starttime : new Date();

      // Parse numeric fields explicitly
      const birthYear = row['birth year'];
      const parsedBirthYear = birthYear && birthYear.trim() !== '' && birthYear !== '\\N'
        ? parseFloat(birthYear)
        : null;

      // Calculate age (assuming 2020 as the data year)
      let age: number | null = null;
      if (parsedBirthYear && !isNaN(parsedBirthYear) && parsedBirthYear > 1900 && parsedBirthYear <= 2021) {
        age = 2020 - parsedBirthYear;
      }

      // Get age group
      const ageGroup = getAgeGroup(age);

      // Extract month from valid start time
      const month = isValidStartTime ? validStarttime.getMonth() : 0;

      // Clean gender value
      let gender: 'Male' | 'Female' | 'Unknown' = 'Unknown';
      const genderRaw = row['gender'] || 'Unknown';
      if (typeof genderRaw === 'string') {
        const genderLower = genderRaw.toLowerCase().trim();
        if (genderLower === '1' || genderLower === 'male') {
          gender = 'Male';
        } else if (genderLower === '2' || genderLower === 'female') {
          gender = 'Female';
        } else {
          gender = 'Unknown';
        }
      }

      // Clean usertype value
      let usertype: 'Customer' | 'Subscriber' = 'Customer';
      const usertypeRaw = row['usertype'] || 'Customer';
      if (typeof usertypeRaw === 'string') {
        const usertypeClean = usertypeRaw.trim();
        usertype = (usertypeClean === 'Subscriber') ? 'Subscriber' : 'Customer';
      }

      return {
        tripduration: parseFloat(row['tripduration'] || '0') || 0,
        starttime: validStarttime,
        stoptime: !isNaN(stoptime.getTime()) ? stoptime : validStarttime,
        startStationId: parseInt(row['start station id'] || '0') || 0,
        startStationName: row['start station name'] || '',
        startStationLatitude: parseFloat(row['start station latitude'] || '0') || 0,
        startStationLongitude: parseFloat(row['start station longitude'] || '0') || 0,
        endStationId: parseInt(row['end station id'] || '0') || 0,
        endStationName: row['end station name'] || '',
        endStationLatitude: parseFloat(row['end station latitude'] || '0') || 0,
        endStationLongitude: parseFloat(row['end station longitude'] || '0') || 0,
        bikeid: parseInt(row['bikeid'] || '0') || 0,
        usertype,
        birthYear: parsedBirthYear,
        gender,
        age,
        ageGroup,
        month,
        cnt: 1 // Count field for Tableau aggregations
      };
    }).filter(d => d !== null);

    console.log(`Processed ${processedData.length} valid records`);

    // Log sample data for validation
    if (processedData.length > 0) {
      const sample = processedData[0];
      console.log('Sample record:', {
        tripduration: sample.tripduration,
        starttime: sample.starttime.toISOString(),
        usertype: sample.usertype,
        gender: sample.gender,
        age: sample.age,
        ageGroup: sample.ageGroup
      });
    }

    return processedData;
  } catch (error) {
    console.error('Error loading trip data:', error);
    throw error;
  }
}

export function filterData(data: TripData[], filters: Partial<FilterState>): TripData[] {
  return data.filter(row => {
    // Filter by gender
    if (filters.gender && filters.gender !== row.gender) {
      return false;
    }

    // Filter by usertype
    if (filters.usertype && filters.usertype !== row.usertype) {
      return false;
    }

    // Filter by ageGroup
    if (filters.ageGroup && filters.ageGroup !== row.ageGroup) {
      return false;
    }

    // Filter by month
    if (filters.month !== undefined && filters.month !== null && row.month !== filters.month) {
      return false;
    }

    return true;
  });
}
