import type { TweetData } from '../types';

/**
 * Load and parse the pipe-delimited CSV file
 * The data uses es_AR locale (comma as decimal, period as thousands)
 */
export async function loadTweetData(): Promise<TweetData[]> {
  try {
    const response = await fetch('/data/tweets_classification.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const csvText = await response.text();
    return parsePipeDelimitedCSV(csvText);
  } catch (error) {
    console.error('Error loading tweet data:', error);
    throw error;
  }
}

/**
 * Parse pipe-delimited CSV with proper number parsing for es_AR locale
 * Handles comma as decimal separator and period as thousands separator
 * Detects and skips preamble rows before the real header
 */
function parsePipeDelimitedCSV(csvText: string): TweetData[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  // Find the real header row (skipping preamble rows)
  // The real header should contain expected column names like 'id', 'created_at', etc.
  let headerRowIndex = 0;
  const expectedColumns = ['id', 'created_at', 'name', 'followers_count', 'favorite_count', 'retweet_count', 'flag', 'full_text', 'label'];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const potentialHeaders = lines[i].split('|').map(h => normalizeHeader(h));
    const matchCount = potentialHeaders.filter(h => expectedColumns.includes(h)).length;

    // If we find most expected columns, this is likely the header row
    if (matchCount >= 5) {
      headerRowIndex = i;
      break;
    }
  }

  // Extract and normalize headers
  const rawHeaders = lines[headerRowIndex].split('|');
  const headers = rawHeaders.map(h => normalizeHeader(h));

  // Map normalized headers back to their raw positions
  const headerMap = new Map<number, string>();
  headers.forEach((header, index) => {
    if (header) {  // Skip empty headers
      headerMap.set(index, header);
    }
  });

  // Parse data rows (starting after header)
  const data: TweetData[] = [];
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const values = lines[i].split('|').map(v => v.trim());
    if (values.length !== rawHeaders.length) continue;

    const row: Record<string, string | number> = {};
    headerMap.forEach((header, index) => {
      const value = values[index];
      row[header] = parseFieldValue(header, value);
    });

    // Handle the empty string field for the index column (first column is empty due to leading |)
    if (!row[''] && values[0]) {
      row[''] = parseInt(values[0], 10) || 0;
    }

    // Validate required fields and type cast
    const typedRow = row as unknown as TweetData;
    if (typedRow.id && typedRow.name && typedRow.flag) {
      data.push(typedRow);
    }
  }

  return data;
}

/**
 * Normalize CSV header by removing quotes, extra whitespace, and special characters
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^["']+|["']+$/g, '')  // Remove leading/trailing quotes
    .replace(/\s+/g, ' ')             // Normalize whitespace
    .trim();
}

/**
 * Parse field value based on column name and locale
 * Handles quoted values, empty strings, and numeric conversion
 */
function parseFieldValue(fieldName: string, value: string): string | number {
  if (!value || value === '') {
    // Return appropriate default based on field type
    const numericFields = ['followers_count', 'favorite_count', 'retweet_count', 'id', ''];
    return numericFields.includes(fieldName) ? 0 : '';
  }

  // Strip surrounding quotes if present
  const cleanValue = value.replace(/^["']|["']$/g, '').trim();

  // Number fields that need es_AR locale parsing
  const numericFields = [
    'followers_count',
    'favorite_count',
    'retweet_count',
    ''
  ];

  if (numericFields.includes(fieldName)) {
    return parseLocaleNumber(cleanValue);
  }

  // ID field
  if (fieldName === 'id') {
    const parsed = parseInt(cleanValue, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Return as string for text fields
  return cleanValue;
}

/**
 * Parse number with es_AR locale (comma as decimal, period as thousands)
 */
function parseLocaleNumber(value: string): number {
  if (!value) return 0;

  // Remove thousands separators (periods) and replace decimal comma with period
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
}

/**
 * Utility: Group data by field
 */
export function groupByField<T>(data: T[], fieldGetter: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  data.forEach(item => {
    const key = fieldGetter(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });
  return groups;
}

/**
 * Utility: Aggregate count by field
 */
export function aggregateCount<T>(
  data: T[],
  fieldGetter: (item: T) => string
): Array<{ category: string; value: number }> {
  const counts = new Map<string, number>();
  data.forEach(item => {
    const key = fieldGetter(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Utility: Aggregate sum by field
 */
export function aggregateSum<T>(
  data: T[],
  fieldGetter: (item: T) => string,
  valueGetter: (item: T) => number
): Array<{ category: string; value: number }> {
  const sums = new Map<string, number>();
  data.forEach(item => {
    const key = fieldGetter(item);
    const value = valueGetter(item) || 0;
    sums.set(key, (sums.get(key) || 0) + value);
  });

  return Array.from(sums.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Utility: Aggregate by multiple fields (for stacked/grouped views)
 */
export function aggregateByMultiple<T>(
  data: T[],
  fieldGetters: ((item: T) => string)[],
  valueGetter: (item: T) => number
): Array<{ category: string; value: number; [key: string]: string | number }> {
  const aggregates = new Map<string, { value: number; fields: string[] }>();

  data.forEach(item => {
    const keys = fieldGetters.map(getter => getter(item));
    const compositeKey = keys.join('|');
    const value = valueGetter(item) || 0;

    if (!aggregates.has(compositeKey)) {
      aggregates.set(compositeKey, { value: 0, fields: keys });
    }
    const agg = aggregates.get(compositeKey)!;
    agg.value += value;
  });

  return Array.from(aggregates.values())
    .map(agg => ({
      category: agg.fields[0],
      value: agg.value,
      ...agg.fields.reduce((obj, field, i) => ({ ...obj, [`field${i}`]: field }), {})
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Utility: Extract time components
 */
export function extractTimeData(data: TweetData[]): Array<{
  hour: number;
  minute: number;
  count: number;
  label?: string;
  flag?: string;
}> {
  const timeMap = new Map<string, { count: number; label?: string; flag?: string }>();

  data.forEach(tweet => {
    const date = new Date(tweet.created_at);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const key = `${hour}:${minute}`;

    if (!timeMap.has(key)) {
      timeMap.set(key, { count: 0, label: tweet.label, flag: tweet.flag });
    }
    timeMap.get(key)!.count++;
  });

  return Array.from(timeMap.entries())
    .map(([key, data]) => {
      const [hour, minute] = key.split(':').map(Number);
      return { hour, minute, ...data };
    })
    .sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
}
