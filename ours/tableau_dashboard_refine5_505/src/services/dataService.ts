import Papa from 'papaparse';

export interface SalesData {
  Category: string;
  City: string;
  Country: string;
  'Customer Name': string;
  Manufacturer: string;
  'Order Date': string;
  'Order ID': string;
  'Postal Code': number;
  'Product Name': string;
  Region: string;
  Segment: string;
  'Ship Date': string;
  'Ship Mode': string;
  State: string;
  'Sub-Category': string;
  Discount: number;
  'Number of Records': number;
  Profit: number;
  'Profit Ratio': number;
  Quantity: number;
  Sales: number;
}

/**
 * Normalizes CSV headers by:
 * 1. Stripping BOM (Byte Order Mark) characters
 * 2. Removing extra quotes
 * 3. Trimming whitespace
 */
function normalizeHeader(header: string): string {
  // Remove BOM (U+FEFF) and other common BOM variants
  let cleaned = header.replace(/^[\uFEFF\uFFFE\uEFBBBF]/, '');

  // Remove surrounding quotes if present (including doubled quotes)
  cleaned = cleaned.replace(/^"(.*)"$/, '$1');

  // Replace doubled quotes with single quotes
  cleaned = cleaned.replace(/""/g, '"');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Detects if a row looks like a preamble row (not the actual header).
 * Preamble rows often contain metadata, notes, or non-tabular data.
 */
function isPreambleRow(row: string[]): boolean {
  if (row.length === 0) return true;

  // Check if row looks like it has column-like structure
  // A valid header row should have multiple fields and no sentences
  const textContent = row.join(' ');

  // Skip rows that look like comments or metadata
  if (textContent.startsWith('#') || textContent.startsWith('//')) {
    return true;
  }

  // Skip rows that are too short to be a header (less than 3 columns)
  if (row.length < 3) {
    return true;
  }

  // Check if the row contains common header keywords
  const hasHeaderKeywords = /date|name|id|sales|profit|quantity|category|customer|product|region|segment|discount/i.test(textContent);

  // If it has many words and no header keywords, it's likely a preamble/comment
  const words = textContent.split(/\s+/).filter(w => w.length > 0);
  if (words.length > 15 && !hasHeaderKeywords) {
    return true;
  }

  return false;
}

/**
 * Parses CSV data with robust handling for:
 * - BOM characters in headers
 * - Quoted/dirty headers
 * - Preamble rows before the real header
 * - Proper type coercion for numeric fields
 */
export async function loadCsvData(url: string): Promise<SalesData[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    // First pass: find the real header row
    const lines = csvText.split(/\r?\n/);
    let headerRowIndex = 0;

    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse the line to check if it looks like a header
      const testParse = Papa.parse(line, { skipEmptyLines: true });
      if (testParse.data.length > 0 && testParse.data[0] instanceof Array) {
        const row = testParse.data[0] as string[];
        if (!isPreambleRow(row)) {
          headerRowIndex = i;
          break;
        }
      }
    }

    // Second pass: parse the CSV with the correct header
    const csvData = headerRowIndex > 0 ? lines.slice(headerRowIndex).join('\n') : csvText;

    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        const data = results.data as Record<string, unknown>[];

        // Validate that required fields are present
        const requiredFields: (keyof SalesData)[] = [
          'Order Date', 'Sales', 'Profit', 'Quantity',
          'Category', 'Sub-Category', 'Product Name'
        ];

        if (data.length > 0) {
          const firstRow = data[0];
          const missingFields = requiredFields.filter(field => !(field in firstRow));

          if (missingFields.length > 0) {
            console.warn('Missing required fields:', missingFields);
            console.warn('Available fields:', Object.keys(firstRow));
          }
        }

        // Ensure numeric fields are properly typed
        const processedData = data.map(row => ({
          ...row,
          Sales: ensureNumber(row.Sales),
          Profit: ensureNumber(row.Profit),
          Quantity: ensureNumber(row.Quantity),
          Discount: ensureNumber(row.Discount),
          'Number of Records': ensureNumber(row['Number of Records']),
          'Profit Ratio': ensureNumber(row['Profit Ratio']),
        })) as SalesData[];

        resolve(processedData);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

/**
 * Ensures a value is a number, returning 0 for invalid values
 * Handles currency symbols, commas, percentage signs, and other common numeric formats
 */
function ensureNumber(value: unknown): number {
  // If already a valid number, return it
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  // If null or undefined, return 0
  if (value === null || value === undefined) {
    return 0;
  }

  // If string, try to parse it
  if (typeof value === 'string') {
    const trimmed = value.trim();

    // Handle empty strings
    if (trimmed === '') {
      return 0;
    }

    // Remove common currency symbols, commas, and percentage signs
    const cleaned = trimmed
      .replace(/[$€£¥₹]/g, '')  // Currency symbols
      .replace(/,/g, '')          // Thousand separators
      .replace(/%/g, '')          // Percentage signs
      .trim();

    const parsed = parseFloat(cleaned);

    if (isNaN(parsed)) {
      console.warn('[ensureNumber] Failed to parse numeric value:', value);
      return 0;
    }

    return parsed;
  }

  // For any other type, try to convert to number
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
}

export async function loadSalesData(): Promise<SalesData[]> {
  const url = '/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv';
  console.log('[dataService] Loading sales data from:', url);

  try {
    const data = await loadCsvData(url);
    console.log('[dataService] Successfully loaded', data.length, 'rows');

    // Log data validation sample
    if (data.length > 0) {
      console.log('[dataService] Data validation sample:', {
        'Order Date': data[0]['Order Date'],
        'Sales': data[0].Sales,
        'Profit': data[0].Profit,
        'Quantity': data[0].Quantity,
        'Sub-Category': data[0]['Sub-Category'],
        'Product Name': data[0]['Product Name'],
      });
    }

    return data;
  } catch (error) {
    console.error('[dataService] Failed to load sales data:', error);
    throw error;
  }
}
