import * as d3 from 'd3';
import type { TripData, YearGenderData, YearData, UserTypeGenderYearData, GenderText } from '../types';

const mapGenderToText = (gender: string): GenderText => {
  if (gender === '1') return 'Male';
  if (gender === '2') return 'Female';
  return 'Unknown';
};

const extractYear = (starttime: string): number => {
  const date = new Date(starttime);
  return date.getFullYear();
};

export const processTripData = (data: TripData[]): YearGenderData[] => {
  const grouped = new Map<string, number>();

  data.forEach(trip => {
    const year = extractYear(trip.starttime);
    const genderText = mapGenderToText(trip.gender);
    const key = `${year}-${genderText}`;
    grouped.set(key, (grouped.get(key) || 0) + 1);
  });

  return Array.from(grouped.entries()).map(([key, count]) => {
    const [year, gender] = key.split('-');
    return {
      year: parseInt(year),
      gender: gender as GenderText,
      count
    };
  });
};

export const calculateOverallYOY = (data: YearGenderData[]): YearData[] => {
  const yearTotals = new Map<number, number>();

  data.forEach(item => {
    yearTotals.set(item.year, (yearTotals.get(item.year) || 0) + item.count);
  });

  const sortedYears = Array.from(yearTotals.keys()).sort((a, b) => a - b);
  const result: YearData[] = [];

  sortedYears.forEach((year, index) => {
    const count = yearTotals.get(year)!;
    const pctDiff = index === 0 ? null : ((count - (yearTotals.get(sortedYears[index - 1]) || 0)) / (yearTotals.get(sortedYears[index - 1]) || 1)) * 100;
    result.push({ year, count, pctDiff });
  });

  return result;
};

export const calculateFemaleYOY = (data: YearGenderData[]): YearGenderData[] => {
  const femaleData = data.filter(d => d.gender === 'Female');
  const yearCounts = new Map<number, number>();

  femaleData.forEach(item => {
    yearCounts.set(item.year, (yearCounts.get(item.year) || 0) + item.count);
  });

  const sortedYears = Array.from(yearCounts.keys()).sort((a, b) => a - b);
  const result: YearGenderData[] = [];

  sortedYears.forEach((year) => {
    const count = yearCounts.get(year)!;
    result.push({ year, gender: 'Female', count });
  });

  return result;
};

export const processUserTypeGenderYear = (data: TripData[]): UserTypeGenderYearData[] => {
  const grouped = new Map<string, number>();

  data.forEach(trip => {
    const year = extractYear(trip.starttime);
    const genderText = mapGenderToText(trip.gender);
    const usertype = trip.usertype || 'Unknown';
    const key = `${usertype}-${genderText}-${year}`;
    grouped.set(key, (grouped.get(key) || 0) + 1);
  });

  return Array.from(grouped.entries()).map(([key, count]) => {
    const [usertype, gender, year] = key.split('-');
    return {
      usertype,
      gender: gender as GenderText,
      year: parseInt(year),
      count
    };
  }).sort((a, b) => b.count - a.count);
};

export const getAllGenderYears = (data: YearGenderData[]): Set<GenderText> => {
  const genders = new Set<GenderText>();
  data.forEach(item => genders.add(item.gender));
  return genders;
};

export const getYears = (data: YearData[] | YearGenderData[]): number[] => {
  const years = new Set<number>();
  data.forEach(item => years.add(item.year));
  return Array.from(years).sort((a, b) => a - b);
};

/**
 * Normalizes CSV headers by removing extra quotes and whitespace
 * Handles cases like """ColumnName""" -> ColumnName
 */
const normalizeHeaders = (csvText: string): string => {
  const lines = csvText.split('\n');
  if (lines.length === 0) return csvText;

  // Process the header line (first non-empty line)
  let headerIndex = 0;
  while (headerIndex < lines.length && lines[headerIndex].trim() === '') {
    headerIndex++;
  }

  if (headerIndex >= lines.length) return csvText;

  const headerLine = lines[headerIndex];
  const normalizedHeader = headerLine
    .split(',')
    .map(col => {
      // Remove triple quotes and any surrounding quotes
      let cleaned = col.trim();
      // Handle """column""" -> column
      cleaned = cleaned.replace(/^"{3,}/, '').replace(/"{3,}$/, '');
      // Handle "column" -> column
      cleaned = cleaned.replace(/^"{1,}/, '').replace(/"{1,}$/, '');
      return cleaned;
    })
    .join(',');

  lines[headerIndex] = normalizedHeader;

  return lines.join('\n');
};

/**
 * Parses CSV with header normalization and proper type coercion
 */
const parseTripCSV = (csvText: string): TripData[] => {
  // Normalize headers first
  const normalizedText = normalizeHeaders(csvText);

  // Parse with D3
  const rawData = d3.csvParse(normalizedText);

  // Validate and coerce data
  return rawData.map((row: any, index) => {
    // Access fields using normalized header names
    // D3 csvParse returns an array of objects with clean keys
    const tripID = row['TripID'];
    const starttime = row['starttime'];

    // Skip rows that don't have required fields
    if (!tripID && !starttime) {
      console.warn(`Skipping row ${index}: missing required fields`, row);
      return null;
    }

    return {
      TripID: tripID || '',
      tripduration: row['tripduration'] || '',
      starttime: starttime || '',
      stoptime: row['stoptime'] || '',
      'start station id': row['start station id'] || '',
      'start station name': row['start station name'] || '',
      'start station latitude': row['start station latitude'] || '',
      'start station longitude': row['start station longitude'] || '',
      'end station id': row['end station id'] || '',
      'end station name': row['end station name'] || '',
      'end station latitude': row['end station latitude'] || '',
      'end station longitude': row['end station longitude'] || '',
      bikeid: row['bikeid'] || '',
      usertype: row['usertype'] || '',
      'birth year': row['birth year'] || '',
      gender: row['gender'] || ''
    };
  }).filter((row): row is TripData => row !== null);
};

export const loadData = async (): Promise<TripData[]> => {
  const response = await fetch('/data/TEMP_0wf32yc0donotc13aoxty1ndxfqb.csv');
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.statusText}`);
  }
  const csvText = await response.text();
  const data = parseTripCSV(csvText);

  if (data.length === 0) {
    throw new Error('No valid data rows found after parsing CSV');
  }

  console.log(`Loaded ${data.length} trip records`);
  return data;
};

export const loadDataWithRetry = async (retries = 3): Promise<TripData[]> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await loadData();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Failed to load data after retries');
};
