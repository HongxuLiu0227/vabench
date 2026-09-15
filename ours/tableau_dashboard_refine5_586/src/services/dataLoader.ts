import type { SalesData, ScatterDataPoint, BarChartData } from '../types';

const DATA_URL = '/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv';

/**
 * Normalize CSV headers by removing quotes, trimming whitespace, and removing BOM
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^[\uFEFF\uFFFE]/, '') // Remove BOM
    .replace(/^"(.*)"$/, '$1') // Remove surrounding quotes if present
    .replace(/^"|"$/g, '') // Remove leading/trailing quotes
    .trim();
}

/**
 * Detect and skip preamble rows before the actual CSV header
 * Returns the index of the first row that looks like a header
 */
function detectHeaderRow(lines: string[]): number {
  // Expected headers from Tableau spec
  const expectedHeaders = ['Category', 'Sales', 'Profit', 'Quantity', 'Product Name', 'Sub-Category'];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    const normalizedFields = fields.map(normalizeHeader);

    // Check if this row contains multiple expected headers
    const matchCount = expectedHeaders.filter(h =>
      normalizedFields.some(f => f === h)
    ).length;

    // If we find at least 3 expected headers, this is likely the header row
    if (matchCount >= 3) {
      console.log(`✓ Detected header row at line ${i + 1} (found ${matchCount} expected headers)`);
      return i;
    }
  }

  // Default to first line if no header detected
  console.warn('Could not reliably detect header row, defaulting to first line');
  return 0;
}

/**
 * Parse CSV text into an array of objects with proper handling of quoted fields
 * Handles:
 * - Quoted fields containing commas, quotes, and newlines
 * - Escaped quotes (double quotes "")
 * - BOM (Byte Order Mark) at the start of the file
 * - Quoted or dirty headers (e.g., "Order Date" wrapped in quotes)
 * - Preamble rows before the real header
 * - Whitespace trimming
 */
async function parseCSV(text: string): Promise<SalesData[]> {
  // Remove BOM if present
  const textWithoutBOM = text.replace(/^\uFEFF/, '');

  const lines = textWithoutBOM.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    console.warn('CSV file is empty');
    return [];
  }

  // Detect header row (skip preamble if present)
  const headerRowIndex = detectHeaderRow(lines);

  if (headerRowIndex > 0) {
    console.log(`Skipping ${headerRowIndex} preamble row(s) before header`);
  }

  // Parse headers with proper quote handling
  const headers = parseCSVLine(lines[headerRowIndex]);
  // Normalize headers: trim whitespace, remove BOM, and remove quotes
  const normalizedHeaders = headers.map(normalizeHeader);

  console.log('Parsed headers:', normalizedHeaders);

  const data: SalesData[] = [];
  const numericFields = ['Postal Code', 'Discount', 'Number of Records', 'Profit', 'Profit Ratio', 'Quantity', 'Sales'];

  // Start parsing from the row after the header
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);

    // Validate that we have the right number of columns
    if (values.length !== normalizedHeaders.length) {
      console.warn(`Line ${i + 1}: Expected ${normalizedHeaders.length} columns, got ${values.length}. Skipping row.`, { line, values });
      continue;
    }

    const row: Record<string, string | number> = {};

    normalizedHeaders.forEach((header, index) => {
      const value = values[index] || '';

      // Parse numeric fields
      if (numericFields.includes(header)) {
        const numValue = parseFloat(value);
        row[header] = isNaN(numValue) ? 0 : numValue;
      } else {
        row[header] = value;
      }
    });

    data.push(row as unknown as SalesData);
  }

  console.log(`✓ Parsed ${data.length} data rows from CSV (skipped ${headerRowIndex} preamble rows)`);
  return data;
}

/**
 * Parse a single CSV line, handling quoted fields correctly.
 * This implements RFC 4180 CSV parsing:
 * - Fields may be enclosed in double-quotes
 * - Fields containing commas, quotes, or newlines must be quoted
 * - A double-quote appearing inside a quoted field is escaped by preceding it with another double quote
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside a quoted field
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator outside quotes
      fields.push(current);
      current = '';
      i++;
    } else {
      // Regular character
      current += char;
      i++;
    }
  }

  // Add the last field
  fields.push(current);

  return fields;
}

/**
 * Validate that required Tableau fields exist in the parsed data
 */
function validateTableauFields(data: SalesData[], requiredFields: string[]): void {
  if (data.length === 0) {
    throw new Error('No data parsed from CSV');
  }

  const sampleRow = data[0];
  const availableFields = Object.keys(sampleRow);
  const missingFields: string[] = [];

  console.log('Available fields in parsed data:', availableFields);

  requiredFields.forEach(field => {
    if (!(field in sampleRow)) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Tableau fields: ${missingFields.join(', ')}\n` +
      `Available fields: ${availableFields.join(', ')}\n` +
      `Hint: Check if CSV headers are quoted or have extra whitespace`
    );
  }

  // Validate that numeric fields have valid numbers (not all zeros, which would indicate a parsing issue)
  const numericFields = ['Sales', 'Profit', 'Quantity'];
  numericFields.forEach(field => {
    if (field in sampleRow) {
      // Check if all rows have zero for this field (likely parsing error)
      const allZeros = data.every(row => (row[field as keyof SalesData] as number) === 0);
      if (allZeros) {
        console.warn(`⚠ Warning: All values for field '${field}' are zero. This may indicate a parsing error.`);
      } else {
        // Check sample of values to ensure they're reasonable
        const sampleValues = data.slice(0, 5).map(row => row[field as keyof SalesData] as number);
        const nonZeroCount = sampleValues.filter(v => v !== 0).length;
        console.log(`✓ Field '${field}' has ${nonZeroCount}/5 non-zero values in sample`);
      }
    }
  });

  console.log('✓ All required Tableau fields validated:', requiredFields);
}

/**
 * Load full dataset from CSV with validation
 */
export async function loadSalesData(): Promise<SalesData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    const csvText = await response.text();
    const data = await parseCSV(csvText);

    // Validate that all required Tableau fields are present
    const requiredFields = [
      'Category',
      'Sub-Category',
      'Product Name',
      'Sales',
      'Profit',
      'Quantity'
    ];

    validateTableauFields(data, requiredFields);

    return data;
  } catch (error) {
    console.error('Error loading sales data:', error);
    throw error;
  }
}

/**
 * Aggregate data for scatter plot by product
 */
export function aggregateScatterData(data: SalesData[]): ScatterDataPoint[] {
  const aggregation = new Map<string, ScatterDataPoint>();

  data.forEach(row => {
    const key = row['Product Name'];
    const existing = aggregation.get(key);

    if (existing) {
      existing.sales += Number(row.Sales);
      existing.profit += Number(row.Profit);
      existing.quantity += Number(row.Quantity);
    } else {
      aggregation.set(key, {
        productName: key,
        sales: Number(row.Sales),
        profit: Number(row.Profit),
        quantity: Number(row.Quantity)
      });
    }
  });

  return Array.from(aggregation.values());
}

/**
 * Aggregate data for bar chart by Category and Sub-Category
 */
export function aggregateBarDataByCategory(data: SalesData[]): BarChartData[] {
  const aggregation = new Map<string, BarChartData>();

  data.forEach(row => {
    const key = `${row.Category}|${row['Sub-Category']}`;
    const existing = aggregation.get(key);

    if (existing) {
      existing.sales += Number(row.Sales);
    } else {
      aggregation.set(key, {
        category: row.Category,
        subCategory: row['Sub-Category'],
        sales: Number(row.Sales)
      });
    }
  });

  const result = Array.from(aggregation.values());

  // Sort by sales descending
  result.sort((a, b) => b.sales - a.sales);

  return result;
}

/**
 * Aggregate data for bar chart by Sub-Category and Product Name
 */
export function aggregateBarDataBySubCategory(data: SalesData[]): BarChartData[] {
  const aggregation = new Map<string, BarChartData>();

  data.forEach(row => {
    const key = `${row['Sub-Category']}|${row['Product Name']}`;
    const existing = aggregation.get(key);

    if (existing) {
      existing.sales += Number(row.Sales);
    } else {
      aggregation.set(key, {
        category: row['Sub-Category'],
        subCategory: row['Product Name'],
        sales: Number(row.Sales)
      });
    }
  });

  const result = Array.from(aggregation.values());

  // Sort by sales descending
  result.sort((a, b) => b.sales - a.sales);

  return result;
}
