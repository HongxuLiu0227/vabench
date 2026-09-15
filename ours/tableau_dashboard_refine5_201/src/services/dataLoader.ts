export interface SalesData {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'City, State': string;
  'Country': string;
  'Postal Code': string;
  'Market': string;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
  'Shipping Cost': number;
  'Order Priority': string;
}

/**
 * Parse a single CSV line, handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  // Trim and normalize each value
  return values.map(v => v.trim());
}

/**
 * Normalize header names by removing extra quotes and whitespace
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
    .replace(/"{2,}/g, '"')  // Replace multiple quotes with single
    .trim();
}

/**
 * Parse CSV text into array of objects
 * Handles the specific format of the Orders CSV file with preamble rows
 */
export function parseCSV(text: string): SalesData[] {
  // Split by line endings but keep all lines (including empty ones)
  // to preserve row indices for preamble detection
  const lines = text.split(/\r?\n/);

  // Detect the header row by looking for known column names
  // The real header contains "Row ID", "Order ID", "Sales", etc.
  let headerRowIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('Row ID') && line.includes('Order ID') && line.includes('Sales')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.error('Could not find header row in CSV');
    return [];
  }

  // Parse header row with proper handling of quoted fields
  const headers = parseCSVLine(lines[headerRowIndex]).map(normalizeHeader);

  // Parse data rows
  const result: SalesData[] = [];

  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line handling quoted fields
    const values = parseCSVLine(line);

    // Skip rows that don't have enough columns
    if (values.length < headers.length) {
      continue;
    }

    // Create row object with proper type coercion
    const row: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';

      // Parse numeric fields
      if (['Row ID', 'Sales', 'Quantity', 'Discount', 'Profit', 'Shipping Cost', 'Postal Code'].includes(header)) {
        const num = parseFloat(value);
        row[header] = isNaN(num) ? 0 : num;
      } else {
        row[header] = value;
      }
    });

    result.push(row as unknown as SalesData);
  }

  // Validate that we got data
  if (result.length === 0) {
    console.warn('No data rows parsed from CSV');
  } else {
    console.log(`Successfully parsed ${result.length} rows from CSV`);
  }

  return result;
}

/**
 * Load CSV data from URL
 */
export async function loadCSV(url: string): Promise<SalesData[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return parseCSV(text);
}

/**
 * Load the main Orders dataset
 */
export async function loadOrdersData(): Promise<SalesData[]> {
  return loadCSV('/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');
}
