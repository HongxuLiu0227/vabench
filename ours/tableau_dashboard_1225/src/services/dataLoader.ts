import { csvParse } from 'd3-dsv';
import { timeParse } from 'd3-time-format';
import type { ParsedSalesData } from '../types/data';
import { validateTableauFields } from '../utils/fieldMapping';

const parseDate = timeParse('%Y-%m-%d');

/**
 * Normalize CSV headers by removing extra quotes and BOM
 * Handles triple-quoted headers like """Row ID""","""Order ID""" -> Row ID,Order ID
 */
function normalizeCsvHeaders(csvText: string): string {
  const lines = csvText.split('\n');
  if (lines.length === 0) return csvText;

  // Remove BOM if present at the start of the file
  if (lines[0].startsWith('\uFEFF')) {
    lines[0] = lines[0].slice(1);
  }

  // Normalize the header line (first non-empty line)
  let headerIndex = 0;
  while (headerIndex < lines.length && lines[headerIndex].trim() === '') {
    headerIndex++;
  }

  if (headerIndex >= lines.length) return csvText;

  const headerLine = lines[headerIndex];

  // Remove BOM from header line if present
  const cleanHeaderLine = headerLine.replace(/^\uFEFF/, '');

  // Parse triple-quoted CSV headers properly
  // Pattern: """Field1""","""Field2""","""Field3""" -> Field1,Field2,Field3
  const normalizedHeader = cleanHeaderLine
    .split(',') // Split by comma first
    .map(field => {
      // Remove triple quotes: """Field""" -> Field
      return field
        .replace(/^"""/g, '')  // Remove opening triple quotes
        .replace(/"""$/g, '')  // Remove closing triple quotes
        .replace(/^"/g, '')    // Remove opening single quote (if any)
        .replace(/"$/g, '');   // Remove closing single quote (if any)
    })
    .join(',');  // Join back with regular commas

  lines[headerIndex] = normalizedHeader;
  return lines.join('\n');
}

/**
 * Normalize field names by stripping extra quotes
 * This ensures field lookups work correctly after CSV parsing
 */
function normalizeFieldName(fieldName: string): string {
  return fieldName
    .replace(/^"+/, '')   // Remove leading quotes
    .replace(/"+$/, '');  // Remove trailing quotes
}

/**
 * Load CSV data from the public/data directory
 */
export async function loadCsvData(): Promise<ParsedSalesData[]> {
  const response = await fetch('/data/TEMP_0zzmslq10iuq6s16eyxoz0l4yeax.csv');
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const csvText = await response.text();
  const normalizedCsv = normalizeCsvHeaders(csvText);
  const rawData = csvParse(normalizedCsv);

  // Track statistics for validation
  let validRows = 0;
  let skippedRows = 0;

  // Validate Tableau field mapping on first row
  if (rawData.length > 0) {
    const firstRow = rawData[0];
    const normalizedFirstRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(firstRow)) {
      normalizedFirstRow[normalizeFieldName(key)] = value;
    }

    const fieldValidation = validateTableauFields(normalizedFirstRow);
    if (!fieldValidation.isValid) {
      console.error('Missing required Tableau fields:', fieldValidation.missingFields);
      console.error('Available fields:', fieldValidation.availableFields.slice(0, 10), '...');
      throw new Error(
        `CSV data is missing required Tableau fields: ${fieldValidation.missingFields.join(', ')}`
      );
    }
    console.log('✓ All required Tableau fields are present in CSV data');
  }

  const parsedData = rawData.map((row: any, index: number) => {
    // Normalize all field names before access
    const normalizedRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      normalizedRow[normalizeFieldName(key)] = value;
    }

    // Validate required fields exist
    const requiredFields = ['Row ID', 'Order Date', 'Ship Date', 'Sales', 'Profit', 'Quantity', 'Discount'];
    for (const field of requiredFields) {
      if (!(field in normalizedRow)) {
        console.warn(`Row ${index}: Missing required field '${field}'. Available fields:`, Object.keys(normalizedRow).slice(0, 5));
        skippedRows++;
        return null;
      }
    }

    const orderDate = parseDate(normalizedRow['Order Date']);
    const shipDate = parseDate(normalizedRow['Ship Date']);

    if (!orderDate || !shipDate) {
      console.warn(`Row ${index}: Invalid date format (Order Date: ${normalizedRow['Order Date']}, Ship Date: ${normalizedRow['Ship Date']})`);
      skippedRows++;
      return null;
    }

    // Coerce numeric fields to numbers
    const sales = parseNumber(normalizedRow['Sales']);
    const profit = parseNumber(normalizedRow['Profit']);
    const quantity = parseNumber(normalizedRow['Quantity']);
    const discount = parseNumber(normalizedRow['Discount']);
    const postalCode = parseNumber(normalizedRow['Postal Code']);

    // Check for NaN values
    if (isNaN(sales) || isNaN(profit) || isNaN(quantity) || isNaN(discount)) {
      console.warn(`Row ${index}: Invalid numeric values (Sales: ${sales}, Profit: ${profit}, Quantity: ${quantity}, Discount: ${discount})`);
      skippedRows++;
      return null;
    }

    validRows++;

    return {
      'Row ID': parseNumber(normalizedRow['Row ID']),
      'Order ID': String(normalizedRow['Order ID'] || ''),
      'Order Date': orderDate,
      'Ship Date': shipDate,
      'Ship Mode': String(normalizedRow['Ship Mode'] || ''),
      'Customer ID': String(normalizedRow['Customer ID'] || ''),
      'Customer Name': String(normalizedRow['Customer Name'] || ''),
      'Segment': String(normalizedRow['Segment'] || ''),
      'Country/Region': String(normalizedRow['Country/Region'] || ''),
      'City': String(normalizedRow['City'] || ''),
      'State': String(normalizedRow['State'] || ''),
      'Postal Code': postalCode,
      'Region': String(normalizedRow['Region'] || ''),
      'Product ID': String(normalizedRow['Product ID'] || ''),
      'Category': String(normalizedRow['Category'] || ''),
      'Sub-Category': String(normalizedRow['Sub-Category'] || ''),
      'Product Name': String(normalizedRow['Product Name'] || ''),
      'Sales': sales,
      'Quantity': quantity,
      'Discount': discount,
      'Profit': profit,
      'Year': orderDate.getFullYear(),
    } as ParsedSalesData;
  }).filter((row): row is ParsedSalesData => row !== null);

  console.log(`Data loading complete: ${validRows} valid rows, ${skippedRows} skipped rows`);
  return parsedData;
}

/**
 * Parse numeric fields explicitly to avoid string concatenation
 */
export function parseNumber(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  return parseFloat(value);
}
