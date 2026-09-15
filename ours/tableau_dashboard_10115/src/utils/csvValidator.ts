/**
 * CSV Validation and Normalization Utilities
 * Ensures deterministic parsing of Tableau source data
 */

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  headerFields: string[];
}

/**
 * Normalize CSV header field names by removing:
 * - BOM (Byte Order Mark) characters
 * - Leading/trailing whitespace
 * - Repeated quotes (e.g., "Order Date" → Order Date)
 */
export function normalizeHeaderFieldName(fieldName: string): string {
  return fieldName
    .replace(/^\ufeff/, '') // Remove UTF-8 BOM
    .trim() // Remove leading/trailing whitespace
    .replace(/^"+|"+$/g, ''); // Remove surrounding quotes if present
}

/**
 * Normalize all headers in a CSV row
 */
export function normalizeHeaders(headers: string[]): string[] {
  return headers.map(normalizeHeaderFieldName);
}

/**
 * Detect and skip preamble rows before the actual CSV header
 * Looks for rows that don't contain expected data field patterns
 */
export function detectHeaderRow(lines: string[], expectedFields: string[] = []): number {
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    // Parse the line as CSV (simple split for header detection)
    const fields = line.split(',');
    const normalizedFields = normalizeHeaders(fields);

    // Check if this row looks like a header
    // It should contain some expected field names
    if (expectedFields.length > 0) {
      const matchCount = normalizedFields.filter(f =>
        expectedFields.some(expected => f.toLowerCase().includes(expected.toLowerCase()))
      ).length;

      // If we match at least 2 expected fields, this is likely the header
      if (matchCount >= 2) {
        return i;
      }
    }

    // If no expected fields provided, assume first non-empty row is header
    // but skip rows that look like metadata (e.g., starting with "#", "Source:", etc.)
    const lowerLine = line.toLowerCase();
    if (!lowerLine.startsWith('#') &&
        !lowerLine.startsWith('source') &&
        !lowerLine.startsWith('data') &&
        !lowerLine.startsWith('note')) {
      return i;
    }
  }

  // Default to first row if no clear header found
  return 0;
}

/**
 * Validate CSV structure and content
 */
export function validateCSVStructure(
  csvText: string,
  requiredFields: string[]
): CSVValidationResult {
  const result: CSVValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    rowCount: 0,
    headerFields: []
  };

  // Split into lines (handle both Unix and Windows line endings)
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    result.isValid = false;
    result.errors.push('CSV file is empty');
    return result;
  }

  // Detect header row
  const headerRowIndex = detectHeaderRow(lines, requiredFields);
  if (headerRowIndex > 0) {
    result.warnings.push(`Skipped ${headerRowIndex} preamble row(s) before header`);
  }

  // Parse header
  const headerLine = lines[headerRowIndex];
  const rawHeaders = headerLine.split(',');
  result.headerFields = normalizeHeaders(rawHeaders);

  // Check for required fields
  const missingFields = requiredFields.filter(required => {
    return !result.headerFields.some(header =>
      header.toLowerCase().includes(required.toLowerCase()) ||
      required.toLowerCase().includes(header.toLowerCase())
    );
  });

  if (missingFields.length > 0) {
    result.isValid = false;
    result.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Count data rows
  result.rowCount = lines.length - headerRowIndex - 1;

  if (result.rowCount <= 0) {
    result.isValid = false;
    result.errors.push('CSV file contains no data rows');
  }

  // Check for duplicate headers
  const duplicates = result.headerFields.filter((field, index) =>
    result.headerFields.indexOf(field) !== index
  );
  if (duplicates.length > 0) {
    result.warnings.push(`Duplicate headers found: ${[...new Set(duplicates)].join(', ')}`);
  }

  return result;
}

/**
 * Test function to validate the suicide trend CSV
 */
export async function validateSuicideTrendCSV(): Promise<CSVValidationResult> {
  try {
    const response = await fetch('/data/suicide trend.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    // Required fields based on Tableau spec
    const requiredFields = [
      'country',
      'year',
      'sex',
      'age',
      'suicides_no',
      'population',
      'generation',
      'gdp_for_year',
      'gdp_per_capita'
    ];

    return validateCSVStructure(csvText, requiredFields);
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation failed: ${error}`],
      warnings: [],
      rowCount: 0,
      headerFields: []
    };
  }
}
