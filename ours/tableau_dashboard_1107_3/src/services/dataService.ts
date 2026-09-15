import { csvParse } from 'd3-dsv';
import { timeFormat } from 'd3-time-format';
import type { ProcessedTripData, GenderText, MonthlyTripData, MonthlyPercentageData } from '../types/data';
import { runValidations } from '../utils/tableauFieldValidator';

const DATA_URL = '/data/TEMP_0wf32yc0donotc13aoxty1ndxfqb.csv';

/**
 * Normalize CSV header by removing all quotes, BOM, and trimming whitespace
 * This handles headers like:
 * - BOM + mixed quotes
 * - Triple quotes: """tripduration"""
 * - Double quotes: "starttime"
 * - No quotes: TripID
 * and converts them all to a clean, consistent format
 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark) if present
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
    .replace(/^"+|"+$/g, '') // Remove again for nested quotes
    .trim();
}

/**
 * Create a field accessor that works with both dirty and clean headers
 * Returns the value from a row object, trying multiple header formats
 *
 * This function handles various CSV header quoting patterns:
 * - BOM + triple quotes
 * - Triple quotes: """tripduration"""
 * - Double quotes: "starttime"
 * - No quotes: TripID
 */
function createFieldAccessor(rawFieldName: string): (row: Record<string, string>) => string {
  // Generate possible variations of the field name
  // Order matters: most specific patterns first
  const variations = [
    rawFieldName,                    // As provided (e.g., "TripID")
    `"${rawFieldName}"`,             // Single-wrapped (e.g., "\"TripID\"")
    `""${rawFieldName}""`,           // Double-wrapped (e.g., "\"\"TripID\"\"")
    `"""${rawFieldName}"""`,         // Triple-wrapped (e.g., "\"\"\"TripID\"\"\"")
  ];

  return (row: Record<string, string>) => {
    // Try direct access first (fastest)
    if (row[rawFieldName] !== undefined) {
      return row[rawFieldName];
    }

    // Try each variation
    for (const key of variations) {
      if (row[key] !== undefined) {
        return row[key];
      }
    }

    // Fallback: search through all keys (case-insensitive, quote-agnostic)
    const normalizedTarget = normalizeHeader(rawFieldName).toLowerCase();
    for (const rowKey of Object.keys(row)) {
      if (normalizeHeader(rowKey).toLowerCase() === normalizedTarget) {
        return row[rowKey];
      }
    }

    // If we get here in development, log a warning
    if (import.meta.env.DEV) {
      console.warn(`Field accessor could not find value for "${rawFieldName}"`);
      console.warn('Available keys:', Object.keys(row).slice(0, 5));
    }

    // Return empty string if field not found (will be caught by validation)
    return '';
  };
}

// Pre-create field accessors for better performance
// These are ordered by most likely pattern first for performance
const accessors = {
  tripId: createFieldAccessor('TripID'),
  tripDuration: createFieldAccessor('tripduration'),
  startTime: createFieldAccessor('starttime'),
  stopTime: createFieldAccessor('stoptime'),
  startStationId: createFieldAccessor('start station id'),
  startStationName: createFieldAccessor('start station name'),
  startStationLatitude: createFieldAccessor('start station latitude'),
  startStationLongitude: createFieldAccessor('start station longitude'),
  endStationId: createFieldAccessor('end station id'),
  endStationName: createFieldAccessor('end station name'),
  endStationLatitude: createFieldAccessor('end station latitude'),
  endStationLongitude: createFieldAccessor('end station longitude'),
  bikeId: createFieldAccessor('bikeid'),
  userType: createFieldAccessor('usertype'),
  birthYear: createFieldAccessor('birth year'),
  gender: createFieldAccessor('gender'),
};

// Export for testing
export { accessors };

/**
 * Parse gender code to text
 */
function parseGenderText(gender: number): GenderText {
  if (gender === 1) return 'Male';
  if (gender === 2) return 'Female';
  return 'Unknown';
}

/**
 * Get month abbreviation from date
 */
const getMonthAbbreviation = timeFormat('%b');

/**
 * Process raw trip data from CSV row
 */
function processTripData(raw: Record<string, string>): ProcessedTripData {
  const startTimeStr = accessors.startTime(raw);
  const stopTimeStr = accessors.stopTime(raw);
  const tripDurationStr = accessors.tripDuration(raw);

  const startTime = new Date(startTimeStr);
  const stopTime = new Date(stopTimeStr);
  const tripDuration = Number(tripDurationStr);
  const tripDurationMinutes = tripDuration / 60;

  return {
    tripId: Number(accessors.tripId(raw)),
    tripDuration,
    tripDurationMinutes,
    startTime,
    stopTime,
    startStationId: Number(accessors.startStationId(raw)),
    startStationName: accessors.startStationName(raw),
    startStationLatitude: Number(accessors.startStationLatitude(raw)),
    startStationLongitude: Number(accessors.startStationLongitude(raw)),
    endStationId: Number(accessors.endStationId(raw)),
    endStationName: accessors.endStationName(raw),
    endStationLatitude: Number(accessors.endStationLatitude(raw)),
    endStationLongitude: Number(accessors.endStationLongitude(raw)),
    bikeId: Number(accessors.bikeId(raw)),
    userType: accessors.userType(raw),
    birthYear: Number(accessors.birthYear(raw)),
    gender: Number(accessors.gender(raw)),
    genderText: parseGenderText(Number(accessors.gender(raw))),
    month: getMonthAbbreviation(startTime),
    year: startTime.getFullYear(),
  };
}

/**
 * Validate that the CSV contains all required fields
 * Throws a detailed error if any required fields are missing
 */
function validateCsvHeaders(rawData: Record<string, string>[]): void {
  if (rawData.length === 0) {
    throw new Error('CSV file is empty');
  }

  const firstRow = rawData[0];
  const availableFields = new Set(
    Object.keys(firstRow).map(k => normalizeHeader(k).toLowerCase())
  );

  const requiredFields = [
    'tripid',
    'tripduration',
    'starttime',
    'stoptime',
    'start station id',
    'start station name',
    'start station latitude',
    'start station longitude',
    'end station id',
    'end station name',
    'end station latitude',
    'end station longitude',
    'bikeid',
    'usertype',
    'birth year',
    'gender',
  ];

  const missingFields = requiredFields.filter(field => !availableFields.has(field.toLowerCase()));

  if (missingFields.length > 0) {
    throw new Error(
      `CSV is missing required fields: ${missingFields.join(', ')}\n` +
      `Available fields: ${Array.from(availableFields).join(', ')}`
    );
  }

  // Log successful field detection for debugging
  console.log('✓ All required CSV fields validated successfully');
}

/**
 * Normalize all headers in a parsed CSV row object
 * This creates a new row object with clean, normalized keys
 */
function normalizeRowHeaders(row: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const cleanKey = normalizeHeader(key);
    normalized[cleanKey] = value;
  }
  return normalized;
}

/**
 * Fetch and parse trip data from CSV
 */
export async function fetchTripData(): Promise<ProcessedTripData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    // Parse CSV
    const rawData = csvParse(csvText);

    // Normalize all headers immediately after parsing
    // This converts """TripID""" -> TripID, """tripduration""" -> tripduration, etc.
    const normalizedData = rawData.map(normalizeRowHeaders);

    // Validate headers before processing
    validateCsvHeaders(normalizedData);

    // Process each row
    const processedData = normalizedData.map(processTripData);

    // Validate that we got valid data
    if (processedData.length === 0) {
      throw new Error('No valid data rows found in CSV');
    }

    console.log(`✓ Successfully loaded ${processedData.length} trip records`);

    // Run Tableau field validation and data quality checks
    // In development mode, this helps catch issues early
    if (import.meta.env.DEV) {
      const validation = runValidations(processedData);
      if (!validation.overallValid) {
        console.warn('Data validation completed with warnings. Charts may still render but could have issues.');
      }
    }

    return processedData;
  } catch (error) {
    console.error('✗ Error fetching trip data:', error);
    throw error;
  }
}

/**
 * Aggregate data by month for Trips Over Time chart
 */
export function aggregateMonthlyTrips(
  data: ProcessedTripData[],
  filters?: { month?: string | null; userType?: string | null; gender?: string | null }
): MonthlyTripData[] {
  let filteredData = data;

  // Apply filters
  if (filters?.month) {
    filteredData = filteredData.filter(d => d.month === filters.month);
  }
  if (filters?.userType) {
    filteredData = filteredData.filter(d => d.userType === filters.userType);
  }
  if (filters?.gender) {
    filteredData = filteredData.filter(d => d.genderText === filters.gender);
  }

  // Group by month
  const monthMap = new Map<string, ProcessedTripData[]>();
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  monthOrder.forEach(month => monthMap.set(month, []));

  filteredData.forEach(d => {
    const existing = monthMap.get(d.month) || [];
    existing.push(d);
    monthMap.set(d.month, existing);
  });

  // Calculate aggregates
  const result: MonthlyTripData[] = [];
  monthOrder.forEach((month, index) => {
    const monthData = monthMap.get(month) || [];
    const count = monthData.length;
    const avgDuration = count > 0
      ? monthData.reduce((sum, d) => sum + d.tripDurationMinutes, 0) / count
      : 0;

    result.push({
      month,
      monthIndex: index,
      count,
      avgDuration,
    });
  });

  return result;
}

/**
 * Aggregate percentage data by month and category
 *
 * Per Tableau contract, the Gender chart has filter_members: ["Female", "Unknown"],
 * so when aggregating by gender, we must exclude "Male" from the results.
 */
export function aggregateMonthlyPercentages(
  data: ProcessedTripData[],
  categoryField: 'userType' | 'genderText',
  filters?: { month?: string | null; userType?: string | null; gender?: string | null }
): MonthlyPercentageData[] {
  let filteredData = data;

  // For gender field, apply the contract-mandated filter: only Female and Unknown
  // This is from the Tableau spec filter_members for "Pct of Trips by Gender"
  if (categoryField === 'genderText') {
    filteredData = filteredData.filter(d => d.genderText === 'Female' || d.genderText === 'Unknown');
  }

  // Apply additional filters (but not the one we're grouping by)
  if (filters?.month && categoryField !== 'userType' && categoryField !== 'genderText') {
    filteredData = filteredData.filter(d => d.month === filters.month);
  }
  if (filters?.userType && categoryField !== 'userType') {
    filteredData = filteredData.filter(d => d.userType === filters.userType);
  }
  if (filters?.gender && categoryField !== 'genderText') {
    filteredData = filteredData.filter(d => d.genderText === filters.gender);
  }

  // Group by month and category
  const monthCategoryMap = new Map<string, Map<string, ProcessedTripData[]>>();
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  monthOrder.forEach(month => {
    monthCategoryMap.set(month, new Map());
  });

  filteredData.forEach(d => {
    const category = d[categoryField] as string;
    const monthMap = monthCategoryMap.get(d.month);
    if (monthMap) {
      const existing = monthMap.get(category) || [];
      existing.push(d);
      monthMap.set(category, existing);
    }
  });

  // Calculate percentages
  const result: MonthlyPercentageData[] = [];
  const allCategories = new Set<string>();

  // First pass: collect all categories
  monthCategoryMap.forEach((categoryMap) => {
    categoryMap.forEach((_, category) => {
      allCategories.add(category);
    });
  });

  // Second pass: calculate percentages
  monthOrder.forEach((month, monthIndex) => {
    const categoryMap = monthCategoryMap.get(month);
    if (!categoryMap) return;

    const monthTotal = Array.from(categoryMap.values()).reduce((sum, arr) => sum + arr.length, 0);

    allCategories.forEach(category => {
      const categoryData = categoryMap.get(category) || [];
      const count = categoryData.length;
      const percentage = monthTotal > 0 ? (count / monthTotal) * 100 : 0;

      result.push({
        month,
        monthIndex,
        category,
        value: count,
        percentage,
      });
    });
  });

  return result;
}

/**
 * Get unique values for a field
 */
export function getUniqueValues<T extends keyof ProcessedTripData>(
  data: ProcessedTripData[],
  field: T
): Set<ProcessedTripData[T]> {
  return new Set(data.map(d => d[field]));
}
