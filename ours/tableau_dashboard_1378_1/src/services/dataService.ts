import { csvParse } from 'd3-dsv';
import type { RawDataRow, DiagnosisData } from '../types';

/**
 * Strips UTF-8 BOM from the beginning of a string
 * @param text - The text that may contain a BOM
 * @returns The text with BOM removed if present
 */
export function stripBOM(text: string): string {
  // UTF-8 BOM is U+FEFF, which appears as \uFEFF or as byte sequence EF BB BF
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  // Also handle the string representation of BOM that sometimes appears
  if (text.startsWith('\uFEFF')) {
    return text.slice(1);
  }
  return text;
}

/**
 * Normalizes CSV column headers to remove extra quotes and whitespace
 * Handles cases like """ColumnName""" being normalized to ColumnName
 * @param headers - Array of raw CSV headers
 * @returns Array of normalized header names
 */
export function normalizeHeaders(headers: string[]): string[] {
  return headers.map(header => {
    // Remove any leading/trailing whitespace
    let normalized = header.trim();

    // Remove BOM if present at start
    normalized = stripBOM(normalized);

    // Handle triple quotes and single quotes - remove ALL quotes from start and end
    // This handles both """Column Name""" and "Column Name" patterns
    // Use regex to strip all leading quotes
    normalized = normalized.replace(/^"+/, '');
    // Use regex to strip all trailing quotes
    normalized = normalized.replace(/"+$/, '');

    return normalized;
  });
}

/**
 * Validates that the parsed data contains all required fields
 * @param data - The parsed data to validate
 * @throws Error if required fields are missing
 */
export function validateParsedData(data: RawDataRow[]): void {
  if (data.length === 0) {
    throw new Error('Parsed data is empty - CSV may have preamble rows or malformed headers');
  }

  const requiredFields: (keyof RawDataRow)[] = [
    'DRG Definition',
    'DRG Definition - Split 2',
    'Provider Id',
    'Provider State',
    'Total Discharges ',
    'Average Covered Charges ',
    'Average Medicare Payments'
  ];

  const firstRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in parsed data: ${missingFields.join(', ')}\n` +
      `Available fields: ${Object.keys(firstRow).join(', ')}`
    );
  }

  // Validate numeric fields can be parsed
  const sampleNumericRow = firstRow;
  const numericFields: (keyof RawDataRow)[] = [
    'Total Discharges ',
    'Average Covered Charges ',
    'Average Medicare Payments'
  ];

  for (const field of numericFields) {
    const value = parseNumber(sampleNumericRow[field]);
    if (value === 0 && sampleNumericRow[field] !== '0' && sampleNumericRow[field] !== '') {
      console.warn(
        `Warning: Field '${field}' has non-numeric value '${sampleNumericRow[field]}' that will parse as 0`
      );
    }
  }
}

/**
 * Loads and parses CSV data from the given URL
 * Handles BOM stripping and header normalization for deterministic parsing
 * @param url - The URL to fetch CSV data from
 * @returns Promise resolving to array of parsed raw data rows
 */
export async function loadCsvData(url: string): Promise<RawDataRow[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  let csvText = await response.text();

  // Strip BOM if present to ensure deterministic parsing
  csvText = stripBOM(csvText);

  // Parse the CSV
  const parsedData = csvParse(csvText) as unknown as Record<string, string>[];

  // Get the actual column names from the parsed data
  if (parsedData.length === 0) {
    return [];
  }

  const rawHeaders = Object.keys(parsedData[0]);
  const normalizedHeaders = normalizeHeaders(rawHeaders);

  // Create a mapping from original headers to normalized headers
  const headerMap: Record<string, string> = {};
  rawHeaders.forEach((raw, index) => {
    headerMap[raw] = normalizedHeaders[index];
  });

  // Transform the data to use normalized headers
  const normalizedData = parsedData.map(row => {
    const normalizedRow: Record<string, string> = {};
    Object.entries(row).forEach(([rawKey, value]) => {
      const normalizedKey = headerMap[rawKey];
      normalizedRow[normalizedKey] = value;
    });

    // Add derived field: DRG Definition - Split 2
    // This is the diagnosis name extracted from DRG Definition
    if (normalizedRow['DRG Definition']) {
      normalizedRow['DRG Definition - Split 2'] = extractDiagnosis(normalizedRow['DRG Definition']);
    }

    return normalizedRow as unknown as RawDataRow;
  });

  // Validate the parsed data
  validateParsedData(normalizedData as RawDataRow[]);

  return normalizedData as RawDataRow[];
}

/**
 * Extracts the diagnosis name from DRG Definition field
 * Formula: TRIM(SPLIT([DRG Definition], "-", 2))
 * @param drgDefinition - The full DRG Definition string
 * @returns The extracted diagnosis name
 */
export function extractDiagnosis(drgDefinition: string): string {
  const parts = drgDefinition.split('-');
  if (parts.length >= 2) {
    return parts.slice(1).join('-').trim();
  }
  return drgDefinition.trim();
}

/**
 * Safely parses a string to a number
 * @param value - The string value to parse
 * @returns The parsed number or 0 if parsing fails
 */
export function parseNumber(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Transforms raw CSV data into aggregated diagnosis data
 * Groups by the derived Diagnosis field and calculates aggregations
 * @param rawData - Array of raw data rows
 * @returns Array of aggregated diagnosis data
 */
export function transformData(rawData: RawDataRow[]): DiagnosisData[] {
  // Group by diagnosis
  const grouped = new Map<string, RawDataRow[]>();

  rawData.forEach((row) => {
    const diagnosis = extractDiagnosis(row['DRG Definition']);
    if (!grouped.has(diagnosis)) {
      grouped.set(diagnosis, []);
    }
    grouped.get(diagnosis)!.push(row);
  });

  // Calculate aggregations for each diagnosis
  const aggregated: DiagnosisData[] = [];

  grouped.forEach((rows, diagnosis) => {
    const numberOfRecords = rows.length;
    const totalDischarges = rows.reduce((sum, row) => {
      return sum + parseNumber(row['Total Discharges ']);
    }, 0);
    const averageCoveredCharges = rows.reduce((sum, row) => {
      return sum + parseNumber(row['Average Covered Charges ']);
    }, 0);
    const averageMedicarePayments = rows.reduce((sum, row) => {
      return sum + parseNumber(row['Average Medicare Payments']);
    }, 0);

    aggregated.push({
      diagnosis,
      numberOfRecords,
      totalDischarges,
      averageCoveredCharges,
      averageMedicarePayments,
    });
  });

  return aggregated;
}

/**
 * Loads and transforms the complete dataset
 * @param url - The URL to fetch CSV data from
 * @returns Promise resolving to array of aggregated diagnosis data
 */
export async function loadAndTransformData(
  url: string
): Promise<DiagnosisData[]> {
  const rawData = await loadCsvData(url);
  return transformData(rawData);
}

/**
 * Filters diagnosis data to include only records within the specified range
 * As per Tableau spec: Number of Records between 613 and 3023 (inclusive)
 * @param data - Array of diagnosis data
 * @param min - Minimum number of records (inclusive)
 * @param max - Maximum number of records (inclusive)
 * @returns Filtered array of diagnosis data
 */
export function filterByRecordCount(
  data: DiagnosisData[],
  min: number = 613,
  max: number = 3023
): DiagnosisData[] {
  return data.filter((d) => d.numberOfRecords >= min && d.numberOfRecords <= max);
}
