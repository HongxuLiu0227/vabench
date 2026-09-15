import { useState, useEffect } from 'react';
import { timeParse } from 'd3-time-format';
import type { SuperstoreOrder, ParsedOrder } from '../types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Parse CSV date strings to Date objects
 * Date format in CSV: YYYY-MM-DD
 */
const parseDate = timeParse('%Y-%m-%d');

/**
 * Normalize CSV headers by removing BOM, quotes, and extra whitespace
 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^"|"$/g, '') // Remove surrounding quotes
    .trim(); // Remove extra whitespace
}

/**
 * Parse a CSV line, handling quoted fields that may contain commas
 * This is a proper CSV parser that follows RFC 4180
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  fields.push(current);

  return fields;
}

/**
 * Custom CSV parser that handles the data format deterministically
 */
async function loadCsvData(): Promise<ParsedOrder[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  // Split lines handling both Unix and Windows line endings
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    console.warn('CSV file is empty');
    return [];
  }

  // Parse and normalize header
  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map(normalizeHeader);

  // Validate required headers exist
  const requiredHeaders = ['Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Sales', 'Quantity', 'Discount', 'Profit'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    console.error('Missing required headers:', missingHeaders);
    console.error('Available headers:', headers);
    throw new Error(`CSV missing required headers: ${missingHeaders.join(', ')}`);
  }

  // Parse data rows
  const data: ParsedOrder[] = [];
  let parseErrors = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines

    try {
      const fields = parseCsvLine(line);

      if (fields.length < headers.length) {
        console.warn(`Line ${i}: Expected ${headers.length} fields, got ${fields.length}`);
        continue;
      }

      const row: Record<string, string | number> = {};
      headers.forEach((header, index) => {
        let value: string | number = fields[index] || '';

        // Parse numeric fields
        if (['Row ID', 'Postal Code', 'Sales', 'Quantity', 'Discount', 'Profit'].includes(header)) {
          const numValue = parseFloat(value);
          value = isNaN(numValue) ? 0 : numValue;
        }

        row[header] = value;
      });

      // Parse dates - these are critical for the dashboard
      const orderDateStr = row['Order Date'] as string;
      const shipDateStr = row['Ship Date'] as string;

      if (!orderDateStr || !shipDateStr) {
        console.warn(`Line ${i}: Missing date values`);
        continue;
      }

      const orderDate = parseDate(orderDateStr);
      const shipDate = parseDate(shipDateStr);

      if (!orderDate) {
        console.warn(`Line ${i}: Failed to parse Order Date: "${orderDateStr}"`);
        parseErrors++;
        continue;
      }

      if (!shipDate) {
        console.warn(`Line ${i}: Failed to parse Ship Date: "${shipDateStr}"`);
        parseErrors++;
        continue;
      }

      data.push({
        ...(row as unknown as SuperstoreOrder),
        OrderDateObj: orderDate,
        ShipDateObj: shipDate,
        OrderYear: orderDate.getFullYear()
      });
    } catch (error) {
      console.error(`Error parsing line ${i}:`, error);
      parseErrors++;
    }
  }

  console.log(`Parsed ${data.length} rows from CSV (${lines.length - 1} total, ${parseErrors} errors)`);

  if (data.length === 0) {
    throw new Error('No valid data rows parsed from CSV');
  }

  return data;
}

/**
 * Hook to load and parse Superstore data
 */
export function useData() {
  const [data, setData] = useState<ParsedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const parsedData = await loadCsvData();
        setData(parsedData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
