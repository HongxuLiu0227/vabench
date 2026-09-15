/**
 * Data loading and transformation service
 */
import { csvParse } from 'd3-dsv';
import type { ParsedTrip, GenderTripsByHour, DayTripsByMonth } from '../types';

// Type for D3 CSV parsed row
type DSVRow = { [key: string]: string };

const DATA_URL = '/data/TEMP_1o6gr4v0a4irtf1f3ekzg1cc6xxs.csv';

/**
 * Normalize CSV header by removing BOM and extra quotes
 * Handles cases like:
 * - ﻿"""Trip Duration""" -> Trip Duration
 * - "Start Time" -> Start Time
 * - ""Stop Time"" -> Stop Time
 * - After D3 parsing: '"Trip Duration"' -> Trip Duration
 */
function normalizeHeader(header: string): string {
  // Remove BOM if present
  let cleaned = header.replace(/^\uFEFF/, '');

  // D3 csvParse may leave escaped quotes, handle all cases
  // 1. Remove ALL leading and trailing quotes (handles double and triple quotes)
  cleaned = cleaned.replace(/^"+|"+$/g, '');

  // 2. If there are still quotes around the content (D3 escape case), remove them
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }

  // 3. Trim any whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Create a mapping from raw CSV headers to normalized field names
 */
function createHeaderMapping(rawHeaders: string[]): Map<string, string> {
  const mapping = new Map<string, string>();

  for (const rawHeader of rawHeaders) {
    const normalized = normalizeHeader(rawHeader);
    mapping.set(rawHeader, normalized);
  }

  return mapping;
}

/**
 * Get value from CSV row using normalized field name
 */
function getFieldValue(row: DSVRow, headerMapping: Map<string, string>, fieldName: string): string {
  // Try to find the raw header that maps to this field name
  for (const [rawHeader, normalized] of headerMapping.entries()) {
    if (normalized === fieldName) {
      return row[rawHeader] || '';
    }
  }

  // Fallback: try direct access
  return row[fieldName] || '';
}

/**
 * Parse date string in format "2016-11-07 16:53:24"
 */
function parseDateTime(dateStr: string): Date {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    // Try alternative format
    const parts = dateStr.split(/[- :]/);
    if (parts.length >= 6) {
      const [year, month, day, hour, minute, second] = parts.map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
    }
  }
  return parsed;
}

/**
 * Parse a trip record from CSV to typed structure
 */
function parseTrip(trip: DSVRow, headerMapping: Map<string, string>): ParsedTrip {
  const startTimeStr = getFieldValue(trip, headerMapping, 'Start Time');
  const stopTimeStr = getFieldValue(trip, headerMapping, 'Stop Time');

  const startTime = parseDateTime(startTimeStr);
  const stopTime = parseDateTime(stopTimeStr);

  // Format MDY(Start Time) Set as a date string in format "M/D/YYYY" for Tableau compatibility
  const month = startTime.getMonth() + 1;
  const day = startTime.getDate();
  const year = startTime.getFullYear();
  const mdyStartTimeSet = `${month}/${day}/${year}`;

  return {
    tripDuration: Number(getFieldValue(trip, headerMapping, 'Trip Duration')) || 0,
    startTime,
    stopTime,
    startStationId: Number(getFieldValue(trip, headerMapping, 'Start Station ID')) || 0,
    startStationName: getFieldValue(trip, headerMapping, 'Start Station Name') || '',
    endStationId: Number(getFieldValue(trip, headerMapping, 'End Station ID')) || 0,
    endStationName: getFieldValue(trip, headerMapping, 'End Station Name') || '',
    bikeId: Number(getFieldValue(trip, headerMapping, 'Bike ID')) || 0,
    userType: getFieldValue(trip, headerMapping, 'User Type') || '',
    birthYear: getFieldValue(trip, headerMapping, 'Birth Year')
      ? Number(getFieldValue(trip, headerMapping, 'Birth Year'))
      : null,
    gender: Number(getFieldValue(trip, headerMapping, 'Gender')) || 0,
    hourOfDay: startTime.getHours(),
    dayOfMonth: startTime.getDate(),
    weekday: startTime.getDay(),
    month,
    year,
    mdyStartTimeSet,
  };
}

/**
 * Load and parse CSV data with header normalization
 */
export async function loadTripData(): Promise<ParsedTrip[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
  }

  let csvText = await response.text();

  // Remove BOM if present at the start of the file
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const rawData = csvParse(csvText);

  // Create header mapping for normalized field access
  const headerMapping = createHeaderMapping(rawData.columns);

  return rawData.map((trip: DSVRow) => parseTrip(trip, headerMapping)).filter(trip => {
    // Filter out invalid records
    return !isNaN(trip.startTime.getTime()) &&
           trip.dayOfMonth >= 1 &&
           trip.dayOfMonth <= 31 &&
           trip.hourOfDay >= 0 &&
           trip.hourOfDay <= 23;
  });
}

/**
 * Aggregate trips by hour and gender
 */
export function aggregateByHourAndGender(
  trips: ParsedTrip[],
  selectedDay: number | null = null
): GenderTripsByHour[] {
  let filteredTrips = trips;

  // Filter by selected day if provided
  if (selectedDay !== null) {
    filteredTrips = trips.filter(t => t.dayOfMonth === selectedDay);
  }

  // Filter by gender (exclude 0=Undefined as per Tableau spec)
  filteredTrips = filteredTrips.filter(t => t.gender === 1 || t.gender === 2);

  // Create aggregation map
  const aggMap = new Map<string, number>();

  for (const trip of filteredTrips) {
    const key = `${trip.hourOfDay}-${trip.gender}`;
    aggMap.set(key, (aggMap.get(key) || 0) + 1);
  }

  // Convert to array
  const result: GenderTripsByHour[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const gender of [1, 2]) {
      const count = aggMap.get(`${hour}-${gender}`) || 0;
      result.push({ hour, gender, count });
    }
  }

  return result;
}

/**
 * Aggregate trips by day of month and weekday
 */
export function aggregateByDayAndWeekday(
  trips: ParsedTrip[]
): DayTripsByMonth[] {
  // Create aggregation map
  const aggMap = new Map<string, number>();

  for (const trip of trips) {
    const key = `${trip.dayOfMonth}-${trip.weekday}`;
    aggMap.set(key, (aggMap.get(key) || 0) + 1);
  }

  // Convert to array and sort by day
  const result: DayTripsByMonth[] = [];
  for (let day = 1; day <= 30; day++) {
    for (let weekday = 0; weekday < 7; weekday++) {
      const count = aggMap.get(`${day}-${weekday}`) || 0;
      if (count > 0) {
        result.push({ day, weekday, count });
      }
    }
  }

  return result.sort((a, b) => a.day - b.day);
}

/**
 * Get total count per day (for sorting)
 */
export function getTotalCountByDay(trips: ParsedTrip[]): Map<number, number> {
  const countMap = new Map<number, number>();

  for (const trip of trips) {
    countMap.set(trip.dayOfMonth, (countMap.get(trip.dayOfMonth) || 0) + 1);
  }

  return countMap;
}
