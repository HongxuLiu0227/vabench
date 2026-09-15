import Papa from 'papaparse';
import type {
  SuperstoreOrder,
  AggregatedSalesByCategory,
  AggregatedSalesBySubCategory,
  SalesByYear,
  ScatterPlotData,
} from '../types';
import { runAndLogValidation } from '../utils/tableauValidator';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

// Required fields for Tableau data validation
const REQUIRED_FIELDS = [
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

let cachedData: SuperstoreOrder[] | null = null;

/**
 * Normalizes CSV headers by:
 * 1. Removing BOM character (UTF-8 BOM: \uFEFF)
 * 2. Removing surrounding quotes
 * 3. Trimming whitespace
 * 4. Handling double-quote escaping
 */
function normalizeHeader(header: string): string {
  let normalized = header;

  // Remove BOM character if present
  normalized = normalized.replace(/^\uFEFF/, '');

  // Remove surrounding quotes (handle both single and double quotes)
  normalized = normalized.replace(/^['"]+|['"]+$/g, '');

  // Trim whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Detects and skips preamble rows before the actual CSV header.
 * Returns the line number where the real header starts (0-indexed).
 */
function detectHeaderStart(lines: string[]): number {
  const PREAMBLE_PATTERNS = [
    /^(#|;|\/\*)/, // Comment lines
    /^\s*$/, // Empty lines
    /^(Note|Info|Warning|Error|Metadata|Data|Export)/i, // Common metadata markers
  ];

  // Look for a line that contains our expected fields
  const EXPECTED_FIELD_SIGNATURES = [
    'Order Date',
    'Ship Date',
    'Customer Name',
    'Product Name',
    'Sales',
    'Quantity',
    'Profit',
  ];

  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const line = lines[i].trim();

    // Skip preamble patterns
    if (PREAMBLE_PATTERNS.some(pattern => pattern.test(line))) {
      continue;
    }

    // Check if this line contains our expected fields
    const normalizedLine = normalizeHeader(line);
    const matchCount = EXPECTED_FIELD_SIGNATURES.filter(field =>
      normalizedLine.includes(field)
    ).length;

    // If we find at least 3 expected fields, this is likely the header
    if (matchCount >= 3) {
      return i;
    }
  }

  // Default to first line if no header detected
  return 0;
}

/**
 * Validates that all required fields are present in the parsed data
 */
function validateRequiredFields(headers: string[]): void {
  const normalizedHeaders = headers.map(normalizeHeader);
  const missingFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!normalizedHeaders.includes(field)) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV data: ${missingFields.join(', ')}. ` +
      `Found fields: ${normalizedHeaders.join(', ')}`
    );
  }
}

/**
 * Coerces a value to a number, providing detailed error logging
 */
function coerceToNumber(value: string | number | null | undefined, fieldName: string, rowNumber: number): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }

    // Warn about failed parsing
    console.warn(
      `Row ${rowNumber}: Failed to parse ${fieldName} as number: "${value}". Using 0 instead.`
    );
    return 0;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  console.warn(
    `Row ${rowNumber}: Unexpected type for ${fieldName}: ${typeof value}. Using 0 instead.`
  );
  return 0;
}

export async function loadSuperstoreData(): Promise<SuperstoreOrder[]> {
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  // Split into lines to detect preamble
  const lines = csvText.split(/\r?\n/);
  const headerLineIndex = detectHeaderStart(lines);

  let csvToParse = csvText;
  if (headerLineIndex > 0) {
    console.info(`Detected and skipping ${headerLineIndex} preamble rows before CSV header`);
    // Reconstruct CSV starting from the detected header line
    csvToParse = lines.slice(headerLineIndex).join('\n');
  }

  return new Promise((resolve, reject) => {
    Papa.parse<SuperstoreOrder>(csvToParse, {
      header: true,
      dynamicTyping: false, // We'll do our own type coercion for better error handling
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        try {
          // Validate required fields
          validateRequiredFields(results.meta.fields || []);

          // Parse and validate each row
          const parsedData = (results.data as Array<Partial<SuperstoreOrder> & Record<string, string | number | null | undefined>>).map((row, index: number) => {
            const rowNumber = index + 2; // +2 because: 1 for header, 1 for 0-indexing

            return {
              ...row,
              'Row ID': coerceToNumber(row['Row ID'], 'Row ID', rowNumber),
              'Order ID': String(row['Order ID'] || ''),
              'Order Date': String(row['Order Date'] || ''),
              'Ship Date': String(row['Ship Date'] || ''),
              'Ship Mode': String(row['Ship Mode'] || ''),
              'Customer ID': String(row['Customer ID'] || ''),
              'Customer Name': String(row['Customer Name'] || ''),
              'Segment': String(row['Segment'] || ''),
              'Country': String(row['Country'] || ''),
              'City': String(row['City'] || ''),
              'State': String(row['State'] || ''),
              'Postal Code': coerceToNumber(row['Postal Code'], 'Postal Code', rowNumber),
              'Region': String(row['Region'] || ''),
              'Product ID': String(row['Product ID'] || ''),
              'Category': String(row['Category'] || ''),
              'Sub-Category': String(row['Sub-Category'] || ''),
              'Product Name': String(row['Product Name'] || ''),
              'Sales': coerceToNumber(row['Sales'], 'Sales', rowNumber),
              'Quantity': coerceToNumber(row['Quantity'], 'Quantity', rowNumber),
              'Discount': coerceToNumber(row['Discount'], 'Discount', rowNumber),
              'Profit': coerceToNumber(row['Profit'], 'Profit', rowNumber),
            };
          });

          // Validate we have data
          if (parsedData.length === 0) {
            throw new Error('CSV file appears to be empty or all rows were filtered out');
          }

          // Run Tableau validation
          try {
            runAndLogValidation(parsedData);
          } catch (validationError) {
            // Log validation error but still return data
            // This allows the app to show partial data while highlighting issues
            console.error('Tableau validation warning:', validationError);
          }

          console.info(`Successfully loaded ${parsedData.length} rows from CSV`);

          cachedData = parsedData;
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

export async function getAggregatedSalesByCategory(): Promise<AggregatedSalesByCategory[]> {
  const data = await loadSuperstoreData();

  const aggregation = new Map<string, AggregatedSalesByCategory>();

  data.forEach((row) => {
    const key = `${row.Category}|${row['Sub-Category']}`;
    const existing = aggregation.get(key);

    // Ensure numeric values before aggregation
    const salesValue = typeof row.Sales === 'number' ? row.Sales : parseFloat(String(row.Sales || '0'));

    if (existing) {
      existing.sales += salesValue;
    } else {
      aggregation.set(key, {
        category: row.Category,
        subCategory: row['Sub-Category'],
        sales: salesValue,
      });
    }
  });

  // Sort by sales descending, then by category and sub-category
  return Array.from(aggregation.values()).sort((a, b) => {
    if (b.sales !== a.sales) {
      return b.sales - a.sales;
    }
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.subCategory.localeCompare(b.subCategory);
  });
}

export async function getAggregatedSalesBySubCategory(): Promise<AggregatedSalesBySubCategory[]> {
  const data = await loadSuperstoreData();

  const aggregation = new Map<string, number>();

  data.forEach((row) => {
    const subCategory = row['Sub-Category'];

    // Ensure numeric value before aggregation
    const salesValue = typeof row.Sales === 'number' ? row.Sales : parseFloat(String(row.Sales || '0'));

    const existing = aggregation.get(subCategory);

    if (existing !== undefined) {
      aggregation.set(subCategory, existing + salesValue);
    } else {
      aggregation.set(subCategory, salesValue);
    }
  });

  // Sort by sales descending
  return Array.from(aggregation.entries())
    .map(([subCategory, sales]) => ({ subCategory, sales }))
    .sort((a, b) => b.sales - a.sales);
}

export async function getSalesByYear(): Promise<SalesByYear[]> {
  const data = await loadSuperstoreData();

  const aggregation = new Map<number, number>();

  data.forEach((row) => {
    const year = new Date(row['Order Date']).getFullYear();

    // Ensure numeric value before aggregation
    const salesValue = typeof row.Sales === 'number' ? row.Sales : parseFloat(String(row.Sales || '0'));

    const existing = aggregation.get(year);

    if (existing !== undefined) {
      aggregation.set(year, existing + salesValue);
    } else {
      aggregation.set(year, salesValue);
    }
  });

  // Sort by year ascending
  return Array.from(aggregation.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}

export async function getScatterPlotData(): Promise<ScatterPlotData[]> {
  const data = await loadSuperstoreData();

  const aggregation = new Map<string, ScatterPlotData>();

  data.forEach((row) => {
    const existing = aggregation.get(row['Product Name']);

    // Ensure numeric values before aggregation
    const salesValue = typeof row.Sales === 'number' ? row.Sales : parseFloat(String(row.Sales || '0'));
    const profitValue = typeof row.Profit === 'number' ? row.Profit : parseFloat(String(row.Profit || '0'));
    const quantityValue = typeof row.Quantity === 'number' ? row.Quantity : parseFloat(String(row.Quantity || '0'));

    if (existing) {
      existing.sales += salesValue;
      existing.profit += profitValue;
      existing.quantity += quantityValue;
    } else {
      aggregation.set(row['Product Name'], {
        productName: row['Product Name'],
        sales: salesValue,
        profit: profitValue,
        quantity: quantityValue,
      });
    }
  });

  return Array.from(aggregation.values());
}
