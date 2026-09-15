import Papa from 'papaparse';

/**
 * Normalizes CSV header names by stripping quotes, BOM, and extra whitespace.
 * Handles cases like """Row ID""" → "Row ID"
 */
function normalizeHeaderName(value: string): string {
  let text = (value || '').replace('\ufeff', '').trim();

  // Strip matching quotes from both ends (handles """, ''', etc.)
  while (text.length >= 2 && text[0] === text[text.length - 1] && (text[0] === '"' || text[0] === "'")) {
    text = text.slice(1, -1).trim();
  }

  // Normalize internal whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Normalizes all headers in a PapaParse result object
 */
function normalizeHeaders<T extends Record<string, unknown>>(data: T[]): T[] {
  if (!data || data.length === 0) return data;

  const firstRow = data[0];

  // Build mapping from old keys to normalized keys
  const keyMap: Record<string, string> = {};
  for (const key of Object.keys(firstRow)) {
    const normalized = normalizeHeaderName(key);
    keyMap[key] = normalized;
  }

  // Transform all rows with normalized keys
  return data.map(row => {
    const newRow: Record<string, unknown> = {};
    for (const [oldKey, value] of Object.entries(row)) {
      newRow[keyMap[oldKey]] = value;
    }
    return newRow as T;
  });
}

export interface OrderRecord {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country/Region': string;
  'City': string;
  'State': string;
  'Postal Code': number;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
}

export interface ParsedOrderRecord {
  'Row ID': number;
  'Order ID': string;
  'Order Date': Date;
  'Ship Date': Date;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country/Region': string;
  'City': string;
  'State': string;
  'Postal Code': number;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
  'Order Year': number;
}

export async function loadOrdersData(): Promise<ParsedOrderRecord[]> {
  const response = await fetch('/data/Orders (Sample - Superstore).csv');
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<OrderRecord>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Normalize headers to handle triple-quoted CSV headers
          const normalizedData = normalizeHeaders(results.data as unknown as Record<string, unknown>[]);

          const parsed = normalizedData.map((row): ParsedOrderRecord => ({
            'Row ID': Number(row['Row ID']) || 0,
            'Order ID': String(row['Order ID'] || ''),
            'Order Date': new Date(row['Order Date'] as string),
            'Ship Date': new Date(row['Ship Date'] as string),
            'Ship Mode': String(row['Ship Mode'] || ''),
            'Customer ID': String(row['Customer ID'] || ''),
            'Customer Name': String(row['Customer Name'] || ''),
            'Segment': String(row['Segment'] || ''),
            'Country/Region': String(row['Country/Region'] || ''),
            'City': String(row['City'] || ''),
            'State': String(row['State'] || ''),
            'Postal Code': Number(row['Postal Code']) || 0,
            'Region': String(row['Region'] || ''),
            'Product ID': String(row['Product ID'] || ''),
            'Category': String(row['Category'] || ''),
            'Sub-Category': String(row['Sub-Category'] || ''),
            'Product Name': String(row['Product Name'] || ''),
            'Sales': Number(row['Sales']) || 0,
            'Quantity': Number(row['Quantity']) || 0,
            'Discount': Number(row['Discount']) || 0,
            'Profit': Number(row['Profit']) || 0,
            'Order Year': new Date(row['Order Date'] as string).getFullYear(),
          }));
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      },
      error: (err: unknown) => {
        reject(err);
      }
    });
  });
}

export async function loadCsv<T extends Record<string, unknown> = Record<string, unknown>>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Normalize headers to handle quoted/dirty CSV headers
        const normalizedData = normalizeHeaders(results.data as T[]);
        resolve(normalizedData as T[]);
      },
      error: (err: unknown) => {
        reject(err);
      }
    });
  });
}
