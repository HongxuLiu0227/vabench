import * as d3 from 'd3';
import type { ParsedRecord } from '../types';

const DATA_URL = '/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv';

/**
 * Required fields for Tableau visualization
 * Maps to the tableau_spec.json field requirements
 */
const REQUIRED_FIELDS = [
  'Category',
  'City',
  'Country',
  'Customer Name',
  'Manufacturer',
  'Order Date',
  'Order ID',
  'Postal Code',
  'Product Name',
  'Region',
  'Segment',
  'Ship Date',
  'Ship Mode',
  'State',
  'Sub-Category',
  'Discount',
  'Number of Records',
  'Profit',
  'Profit Ratio',
  'Quantity',
  'Sales'
] as const;

/**
 * Numeric fields that require proper parsing
 * Exported for validation and testing purposes
 */
export const NUMERIC_FIELDS = [
  'Discount',
  'Number of Records',
  'Profit',
  'Profit Ratio',
  'Quantity',
  'Sales'
] as const;

/**
 * Date fields that require Date object parsing
 * Exported for validation and testing purposes
 */
export const DATE_FIELDS = [
  'Order Date',
  'Ship Date'
] as const;


/**
 * Checks if a row looks like a valid data row (not a preamble)
 */
function isValidDataRow(row: d3.DSVRowString): boolean {
  // A valid data row should have Order Date in a reasonable format
  const orderDate = row['Order Date'];
  if (!orderDate || typeof orderDate !== 'string') return false;

  // Check if it looks like a date (YYYY-MM-DD format)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return datePattern.test(orderDate);
}

/**
 * Parses a string value to a number with validation
 * Returns null if parsing fails, allowing caller to handle errors
 */
function parseNumeric(value: string, fieldName: string): number {
  if (value === null || value === undefined || value === '') {
    throw new Error(`Missing value for numeric field: ${fieldName}`);
  }

  const trimmed = value.trim();
  const parsed = Number(trimmed);

  if (isNaN(parsed)) {
    throw new Error(`Invalid numeric value "${value}" for field: ${fieldName}`);
  }

  return parsed;
}

/**
 * Parses a date string to a Date object with validation
 */
function parseDate(value: string, fieldName: string): Date {
  if (value === null || value === undefined || value === '') {
    throw new Error(`Missing value for date field: ${fieldName}`);
  }

  const trimmed = value.trim();
  const date = new Date(trimmed);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value "${value}" for field: ${fieldName}`);
  }

  // Check for Jan 1970 (epoch) which indicates a parsing error
  if (date.getTime() === 0 && trimmed !== '1970-01-01' && trimmed !== '1970-01-01 00:00:00') {
    throw new Error(`Date parsed as epoch (invalid format) "${value}" for field: ${fieldName}`);
  }

  return date;
}

/**
 * Gets a value from a row, trying both BOM-prefixed and normal keys
 */
function getRowValue(row: d3.DSVRowString, fieldName: string): string {
  // Try BOM-prefixed version first
  const bomKey = `\uFEFF${fieldName}`;
  if (row[bomKey] !== undefined) {
    return row[bomKey];
  }

  // Try normal key
  if (row[fieldName] !== undefined) {
    return row[fieldName];
  }

  // Try quoted version
  const quotedKey = `"${fieldName}"`;
  if (row[quotedKey] !== undefined) {
    return row[quotedKey];
  }

  // Field is missing
  throw new Error(`Required field "${fieldName}" not found in CSV row`);
}

/**
 * Validates that all required fields are present in the parsed data
 */
function validateFields(data: d3.DSVRowString[]): void {
  if (data.length === 0) {
    throw new Error('CSV file is empty or no valid data rows found');
  }

  const firstRow = data[0];
  const missingFields: string[] = [];

  // Check each required field
  for (const field of REQUIRED_FIELDS) {
    let found = false;

    // Check various key formats
    if (firstRow[`\uFEFF${field}`] !== undefined) found = true;
    else if (firstRow[field] !== undefined) found = true;
    else if (firstRow[`"${field}"`] !== undefined) found = true;

    if (!found) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV: ${missingFields.join(', ')}\n` +
      `Available fields: ${Object.keys(firstRow).join(', ')}`
    );
  }
}

/**
 * Detects and skips preamble rows before the actual CSV header
 * Returns the index of the header row
 */
function detectHeaderRow(lines: string[]): number {
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this line looks like a header (contains field names)
    const hasKnownFields = REQUIRED_FIELDS.some(field =>
      line.includes(field) || line.includes(`"${field}"`)
    );

    if (hasKnownFields) {
      return i;
    }
  }

  // Default to first line if no header found
  return 0;
}

/**
 * Loads and parses the CSV data with robust error handling
 * Throws descriptive errors if parsing fails, preventing silent bad parses
 */
export const loadData = async (): Promise<ParsedRecord[]> => {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} while fetching ${DATA_URL}`);
  }

  const csvText = await response.text();

  // Detect and skip preamble rows
  const lines = csvText.split('\n');
  const headerRowIndex = detectHeaderRow(lines);

  if (headerRowIndex > 0) {
    console.warn(`Detected and skipped ${headerRowIndex} preamble rows before CSV header`);
  }

  // Extract data starting from header
  const dataText = lines.slice(headerRowIndex).join('\n');

  // Parse CSV with d3
  const rawData = d3.csvParse(dataText);

  if (!rawData || rawData.length === 0) {
    throw new Error('Failed to parse CSV or CSV is empty');
  }

  // Validate that all required fields are present
  validateFields(rawData);

  const parsedData: ParsedRecord[] = [];
  const errors: Array<{row: number, error: string}> = [];

  // Parse each row with validation
  rawData.forEach((row: d3.DSVRowString, index: number) => {
    try {
      // Skip non-data rows
      if (!isValidDataRow(row)) {
        console.warn(`Skipping row ${index + 1}: does not appear to be a valid data row`);
        return;
      }

      // Parse all fields into a complete record
      const parsedRow: ParsedRecord = {
        "Category": getRowValue(row, 'Category'),
        "City": getRowValue(row, 'City'),
        "Country": getRowValue(row, 'Country'),
        "Customer Name": getRowValue(row, 'Customer Name'),
        "Manufacturer": getRowValue(row, 'Manufacturer'),
        "Order Date": parseDate(getRowValue(row, 'Order Date'), 'Order Date'),
        "Order ID": getRowValue(row, 'Order ID'),
        "Postal Code": String(getRowValue(row, 'Postal Code')),
        "Product Name": getRowValue(row, 'Product Name'),
        "Region": getRowValue(row, 'Region'),
        "Segment": getRowValue(row, 'Segment'),
        "Ship Date": parseDate(getRowValue(row, 'Ship Date'), 'Ship Date'),
        "Ship Mode": getRowValue(row, 'Ship Mode'),
        "State": getRowValue(row, 'State'),
        "Sub-Category": getRowValue(row, 'Sub-Category'),
        "Discount": parseNumeric(getRowValue(row, 'Discount'), 'Discount'),
        "Number of Records": parseNumeric(getRowValue(row, 'Number of Records'), 'Number of Records'),
        "Profit": parseNumeric(getRowValue(row, 'Profit'), 'Profit'),
        "Profit Ratio": parseNumeric(getRowValue(row, 'Profit Ratio'), 'Profit Ratio'),
        "Quantity": parseNumeric(getRowValue(row, 'Quantity'), 'Quantity'),
        "Sales": parseNumeric(getRowValue(row, 'Sales'), 'Sales')
      };

      parsedData.push(parsedRow);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push({
        row: index + 1,
        error: errorMessage
      });
    }
  });

  // If we have parsing errors, report them
  if (errors.length > 0) {
    console.error(`Failed to parse ${errors.length} rows:`);
    errors.slice(0, 5).forEach(({row, error}) => {
      console.error(`  Row ${row}: ${error}`);
    });

    if (errors.length > 5) {
      console.error(`  ... and ${errors.length - 5} more errors`);
    }

    // If we couldn't parse ANY rows, throw an error
    if (parsedData.length === 0) {
      throw new Error(
        `Failed to parse all CSV rows. First error: ${errors[0].error}\n` +
        `This may indicate a format mismatch or corrupted data.`
      );
    }

    console.warn(`Continuing with ${parsedData.length} successfully parsed rows`);
  }

  if (parsedData.length === 0) {
    throw new Error('No valid data rows found in CSV after parsing');
  }

  console.log(`Successfully loaded ${parsedData.length} records from CSV`);

  return parsedData;
};
