/**
 * Data loading service for fetching and parsing CSV data
 */

import Papa from 'papaparse';
import type { OrderRow, SalesBySubCategory, ScatterDataPoint, LineDataPoint, YearlySalesDataPoint } from '../types/data';
import { validateTableauData, logValidationResult } from '../utils/dataValidator';

const DATA_URL = '/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv';

// Required fields from Tableau spec that must be present
const REQUIRED_FIELDS = [
  'Row ID',
  'Order ID',
  'Order Date',
  'Sales',
  'Profit',
  'Quantity',
  'Sub-Category',
  'Product Name'
];

/**
 * Normalize CSV header names by:
 * - Removing surrounding quotes
 * - Trimming whitespace
 * - Removing extra quote characters
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"+|"+$/g, '') // Remove surrounding quotes
    .replace(/"+/g, '"')     // Replace multiple quotes with single
    .trim();
}

/**
 * Detect and skip preamble rows to find the real header row.
 * The real header is identified by looking for known column names.
 */
function findHeaderRow(lines: string[]): number {
  const knownColumns = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit'];

  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse the line to check if it contains known column names
    const parsed = Papa.parse<string>(line, {
      skipEmptyLines: true
    });

    if (parsed.data && parsed.data.length > 0) {
      const rowData = parsed.data[0];
      if (Array.isArray(rowData)) {
        const headers = rowData.map(normalizeHeader);
        const matchCount = knownColumns.filter((col: string) =>
          headers.some((h: string) => h.includes(col))
        ).length;

        // If we find at least 3 known columns, this is likely the header row
        if (matchCount >= 3) {
          return i;
        }
      }
    }
  }

  // Fallback: assume line 4 (0-indexed) is the header (5th line)
  return 4;
}

/**
 * Validate that all required fields are present in the headers
 */
function validateHeaders(headers: string[]): void {
  const normalizedHeaders = headers.map(normalizeHeader);
  const missingFields = REQUIRED_FIELDS.filter(field =>
    !normalizedHeaders.includes(field)
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV: ${missingFields.join(', ')}. ` +
      `Found headers: ${normalizedHeaders.join(', ')}`
    );
  }
}

/**
 * Remove BOM (Byte Order Mark) from the beginning of a string
 */
function removeBOM(str: string): string {
  if (str.charCodeAt(0) === 0xFEFF) {
    return str.slice(1);
  }
  return str;
}

/**
 * Load and parse the Orders CSV file with robust handling of:
 * - Preamble rows before the real header
 * - Quoted/dirty headers
 * - BOM characters
 * - Required field validation
 */
export async function loadOrdersData(): Promise<OrderRow[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  let csvText = await response.text();

  // Remove BOM if present
  csvText = removeBOM(csvText);

  // First, split into lines to find the header row
  const rawLines = csvText.split(/\r?\n/);

  // Find the actual header row (skip preamble)
  const headerRowIndex = findHeaderRow(rawLines);

  console.log(`CSV header row found at index ${headerRowIndex}`);

  // Extract the CSV content starting from the header row
  const csvContent = rawLines.slice(headerRowIndex).join('\n');

  // Parse the CSV content with PapaParse to handle quoted fields properly
  // When using header: true, PapaParse returns data as array of objects
  const parseResult = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  if (parseResult.errors.length > 0) {
    console.warn('CSV parsing warnings:', parseResult.errors);
  }

  if (!parseResult.data || parseResult.data.length === 0) {
    throw new Error('No data found in CSV after parsing');
  }

  // Get headers from PapaParse's meta
  const headers = parseResult.meta.fields || [];
  const dataObjects = parseResult.data as Record<string, string>[];

  console.log('Parsed headers:', headers);

  // Validate that required fields are present
  validateHeaders(headers);

  console.log(`Found ${headers.length} columns`);

  // Parse data rows - PapaParse already converted to objects with normalized headers
  const parsedData: OrderRow[] = [];
  let skippedRows = 0;

  for (const rowObj of dataObjects) {
    if (!rowObj || Object.keys(rowObj).length === 0) {
      skippedRows++;
      continue;
    }

    const order: Partial<OrderRow> & Record<string, string | number> = {};

    // Process each field from the row object
    for (const header of headers) {
      const normalized = normalizeHeader(header);
      const value = rowObj[header];

      // Skip fields not in our expected set
      if (!REQUIRED_FIELDS.includes(normalized) &&
          !['Ship Date', 'Ship Mode', 'Customer ID', 'Customer Name', 'Segment',
            'City, State', 'Country', 'Postal Code', 'Market', 'Region',
            'Product ID', 'Category', 'Discount', 'Shipping Cost', 'Order Priority'
           ].includes(normalized)) {
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        // Convert numeric fields
        if (['Row ID', 'Sales', 'Quantity', 'Discount', 'Profit', 'Shipping Cost'].includes(normalized)) {
          order[normalized] = Number(value) || 0;
        } else if (normalized === 'Postal Code') {
          // Postal Code might be numeric or string
          order[normalized] = isNaN(Number(value)) ? value : Number(value);
        } else {
          order[normalized] = value;
        }
      } else {
        // Set default values for missing fields
        if (['Row ID', 'Sales', 'Quantity', 'Discount', 'Profit', 'Shipping Cost'].includes(normalized)) {
          order[normalized] = 0;
        } else {
          order[normalized] = '';
        }
      }
    }

    // Only add rows that have at least the essential fields
    if (order['Order ID'] && order['Order Date']) {
      parsedData.push(order as OrderRow);
    } else {
      skippedRows++;
    }
  }

  if (parsedData.length === 0) {
    throw new Error('No valid data rows found in CSV after parsing');
  }

  console.log(`Successfully loaded ${parsedData.length} rows from CSV (skipped ${skippedRows} invalid/empty rows)`);

  // Validate the loaded data
  const validationResult = validateTableauData(parsedData);
  logValidationResult(validationResult);

  if (!validationResult.valid) {
    throw new Error(`Data validation failed: ${validationResult.errors.join('; ')}`);
  }

  return parsedData;
}

/**
 * Export validation function for use in QA/build stages
 */
export { validateTableauData, logValidationResult } from '../utils/dataValidator';

/**
 * Aggregate sales by Sub-Category and Product Name for the horizontal ranked bar chart
 */
export async function loadSalesBySubCategory(): Promise<SalesBySubCategory[]> {
  const orders = await loadOrdersData();

  // Group by Sub-Category and Product Name, then sum Sales
  const aggregated = new Map<string, SalesBySubCategory>();

  for (const order of orders) {
    const key = `${order['Sub-Category']}|${order['Product Name']}`;
    const existing = aggregated.get(key);

    if (existing) {
      existing.Sales += order.Sales;
    } else {
      aggregated.set(key, {
        'Sub-Category': order['Sub-Category'],
        'Product Name': order['Product Name'],
        'Sales': order.Sales
      });
    }
  }

  // Sort by Sales descending
  return Array.from(aggregated.values()).sort((a, b) => b.Sales - a.Sales);
}

/**
 * Load data for scatterplot (Sales vs Profit, colored by Sales, sized by Quantity)
 */
export async function loadScatterplotData(): Promise<ScatterDataPoint[]> {
  const orders = await loadOrdersData();

  return orders.map(order => ({
    Sales: order.Sales,
    Profit: order.Profit,
    Quantity: order.Quantity,
    'Product Name': order['Product Name']
  }));
}

/**
 * Load data for line chart (Sales over time, grouped by month)
 */
export async function loadLineChartData(): Promise<LineDataPoint[]> {
  const orders = await loadOrdersData();

  // Group by date (month/year)
  const aggregated = new Map<string, LineDataPoint>();

  for (const order of orders) {
    const date = new Date(order['Order Date']);
    if (isNaN(date.getTime())) continue; // Skip invalid dates

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const existing = aggregated.get(monthKey);

    if (existing) {
      existing.Sales += order.Sales;
    } else {
      aggregated.set(monthKey, {
        date: date,
        year: date.getFullYear(),
        Sales: order.Sales
      });
    }
  }

  // Sort by date
  return Array.from(aggregated.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Load data for yearly sales line chart
 */
export async function loadYearlySalesData(): Promise<YearlySalesDataPoint[]> {
  const orders = await loadOrdersData();

  // Group by year
  const aggregated = new Map<number, YearlySalesDataPoint>();

  for (const order of orders) {
    const date = new Date(order['Order Date']);
    if (isNaN(date.getTime())) continue; // Skip invalid dates

    const year = date.getFullYear();

    const existing = aggregated.get(year);

    if (existing) {
      existing.Sales += order.Sales;
    } else {
      aggregated.set(year, {
        year: year,
        Sales: order.Sales
      });
    }
  }

  // Sort by year
  return Array.from(aggregated.values()).sort((a, b) => a.year - b.year);
}
