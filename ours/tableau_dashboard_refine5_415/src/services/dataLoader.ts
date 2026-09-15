import Papa from 'papaparse';
import type { SuperstoreOrder, ParsedOrder } from '../types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Normalize CSV headers by removing extra quotes and whitespace
 * This handles dirty headers like `"Order Date"` or `  "Sales"  `
 */
function normalizeHeader(header: string): string {
  let normalized = header.trim();
  // Remove repeated quotes that sometimes appear in CSV exports
  normalized = normalized.replace(/^"+|"+$/g, '');
  // Remove any remaining whitespace
  normalized = normalized.trim();
  return normalized;
}

/**
 * Parse a date string safely, handling multiple formats
 */
function safeParseDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) {
    return dateStr;
  }

  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error(`Invalid date value: ${dateStr}`);
  }

  // Try parsing with Date constructor first
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try parsing YYYY-MM-DD format manually (more reliable)
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  throw new Error(`Unable to parse date: ${dateStr}`);
}

/**
 * Validate that all required Tableau fields exist in the CSV
 */
function validateRequiredFields(headers: string[]): void {
  const requiredFields = [
    'Row ID',
    'Order ID',
    'Order Date',
    'Ship Date',
    'Ship Mode',
    'Customer ID',
    'Customer Name',
    'Segment',
    'Country',
    'City',
    'State',
    'Postal Code',
    'Region',
    'Product ID',
    'Category',
    'Sub-Category',
    'Product Name',
    'Sales',
    'Quantity',
    'Discount',
    'Profit',
  ];

  const missingFields = requiredFields.filter(field => !headers.includes(field));
  if (missingFields.length > 0) {
    throw new Error(
      `CSV is missing required fields: ${missingFields.join(', ')}\n` +
      `Found fields: ${headers.join(', ')}`
    );
  }
}

/**
 * Load and parse the Superstore Orders CSV data
 * Enhanced with robust error handling and validation
 */
export async function loadSuperstoreData(): Promise<ParsedOrder[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    const parseErrors: string[] = [];

    Papa.parse<SuperstoreOrder>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader, // Normalize headers to handle quoted/dirty headers
      complete: (results) => {
        try {
          // Validate headers
          const headers = results.meta.fields || [];
          validateRequiredFields(headers);

          // Track parsing statistics
          let validRows = 0;
          let skippedInvalidDates = 0;
          let skippedInvalidRows = 0;

          // Parse dates and convert to ParsedOrder
          const parsedData: ParsedOrder[] = results.data
            .filter((row): row is SuperstoreOrder => {
              const isValid = row !== null && typeof row === 'object';
              if (!isValid) skippedInvalidRows++;
              return isValid;
            })
            .map((row) => {
              try {
                return {
                  ...row,
                  'Order Date': safeParseDate(row['Order Date']),
                  'Ship Date': safeParseDate(row['Ship Date']),
                };
              } catch (error) {
                skippedInvalidDates++;
                parseErrors.push(
                  `Row parse error: ${error instanceof Error ? error.message : String(error)}`
                );
                return null;
              }
            })
            .filter((row): row is ParsedOrder => {
              if (row === null) return false;
              const isValid = !isNaN(row['Order Date'].getTime()) && !isNaN(row['Ship Date'].getTime());
              if (!isValid) skippedInvalidDates++;
              return isValid;
            });

          validRows = parsedData.length;

          // Warn if we lost data during parsing (but don't fail unless we have NO data)
          if (skippedInvalidDates > 0) {
            console.warn(`Warning: Skipped ${skippedInvalidDates} rows with invalid dates`);
          }
          if (skippedInvalidRows > 0) {
            console.warn(`Warning: Skipped ${skippedInvalidRows} invalid rows`);
          }

          // Ensure we have data
          if (validRows === 0) {
            throw new Error(
              'No valid data rows found after parsing. ' +
              'This may indicate a CSV format issue or date parsing problem.'
            );
          }

          // Validate that we have non-zero metrics
          const salesValues = parsedData.map(row => Number(row.Sales)).filter(n => !isNaN(n) && n !== 0);
          if (salesValues.length === 0) {
            throw new Error(
              'All Sales values are zero or NaN. ' +
              'This will cause all-zero charts and may indicate a data quality issue.'
            );
          }

          console.log(`Successfully loaded ${validRows} rows from CSV`);
          console.log(`Found ${salesValues.length} non-zero Sales values`);

          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Failed to parse data: ${error}`));
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

/**
 * Cache for loaded data to avoid repeated fetches
 */
let cachedData: ParsedOrder[] | null = null;

/**
 * Get data with caching
 */
export async function getSuperstoreData(): Promise<ParsedOrder[]> {
  if (cachedData) {
    return cachedData;
  }
  cachedData = await loadSuperstoreData();
  return cachedData;
}

/**
 * Clear the data cache
 */
export function clearDataCache(): void {
  cachedData = null;
}
