import { csvParse } from 'd3-dsv';
import type { DSVRowArray } from 'd3-dsv';
import { group, sum, rollup } from 'd3-array';
import type {
  ParsedOrder,
  SalesBySubCategory,
  SalesByYear,
  SalesByMonth,
} from '../types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

// Required fields for Tableau spec compliance
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

/**
 * Normalize CSV header by removing quotes, extra spaces, and whitespace
 * Handles cases like: "Order Date", '"Order Date"', '  "Order Date"  '
 */
function normalizeHeader(header: string): string {
  return header
    .trim()                           // Remove leading/trailing whitespace
    .replace(/^"+|"+$/g, '')          // Remove leading/trailing quotes
    .replace(/\s+/g, ' ');            // Collapse multiple spaces to single space
}

/**
 * Normalize all headers in the parsed CSV data
 * Creates a mapping from original headers to normalized headers
 */
function normalizeHeaders(parsedData: DSVRowArray<string>): DSVRowArray<string> {
  if (parsedData.length === 0) return parsedData;

  // Get original headers from columns property
  const originalHeaders = parsedData.columns || [];
  const headerMapping: { [original: string]: string } = {};

  // Create mapping from original to normalized headers
  originalHeaders.forEach(original => {
    headerMapping[original] = normalizeHeader(original);
  });

  // Remap each row using normalized headers
  const normalizedRows = parsedData.map(row => {
    const normalizedRow: { [key: string]: string } = {};
    Object.entries(row).forEach(([originalKey, value]) => {
      const normalizedKey = headerMapping[originalKey] || normalizeHeader(originalKey);
      normalizedRow[normalizedKey] = value;
    });
    return normalizedRow;
  }) as Array<{ [key: string]: string }>;

  // Return new DSVRowArray with normalized columns
  const normalizedColumns = originalHeaders.map(h => headerMapping[h] || normalizeHeader(h));
  return Object.assign(normalizedRows, { columns: normalizedColumns });
}

/**
 * Validate that required fields exist in the parsed data
 * Throws an error if any required fields are missing
 */
function validateRequiredFields(data: Array<{ [key: string]: string }>): void {
  if (data.length === 0) {
    throw new Error('CSV file is empty or contains no data rows');
  }

  const headers = Object.keys(data[0]);
  const missingFields: string[] = [];

  REQUIRED_FIELDS.forEach(field => {
    if (!headers.includes(field)) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Tableau fields in CSV: ${missingFields.join(', ')}. ` +
      `Found headers: ${headers.join(', ')}`
    );
  }
}

/**
 * Safely parse a number from a string, returning 0 for invalid values
 */
function safeParseNumber(value: string, fieldName: string): number {
  const num = Number(value);
  if (isNaN(num)) {
    console.warn(`Invalid number value for field "${fieldName}": "${value}". Using 0.`);
    return 0;
  }
  return num;
}

/**
 * Parse date string to Date object with robust error handling
 * Handles format: "YYYY-MM-DD" and provides fallback for invalid dates
 */
function parseDate(dateStr: string, fieldName: string = 'date'): Date {
  if (!dateStr || dateStr.trim() === '') {
    console.warn(`Empty date value for field "${fieldName}". Using current date.`);
    return new Date();
  }

  // Clean the date string
  const cleaned = dateStr.trim();

  // Handle format: "YYYY-MM-DD" or "YYYY/MM/DD"
  const parts = cleaned.split(/[-/]/);
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1; // JS months are 0-indexed
    const day = Number(parts[2]);

    // Validate the date components
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month, day);

      // Check if the date is valid
      if (!isNaN(date.getTime()) && date.getFullYear() === year) {
        return date;
      }
    }
  }

  // Fallback: try native Date parsing
  const fallbackDate = new Date(cleaned);
  if (isNaN(fallbackDate.getTime())) {
    console.warn(`Invalid date format for field "${fieldName}": "${dateStr}". Using current date.`);
    return new Date();
  }

  return fallbackDate;
}

/**
 * Load CSV data from public/data directory with robust parsing and validation
 */
export async function loadCsvData(): Promise<ParsedOrder[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  let csvText = await response.text();

  // Check if CSV is empty
  if (!csvText || csvText.trim().length === 0) {
    throw new Error('CSV file is empty');
  }

  // Remove BOM (Byte Order Mark) if present
  // BOM is EF BB BF for UTF-8, which appears as '\uFEFF' in JavaScript
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
    console.log('[Data Loading] Removed BOM from CSV file');
  }

  // Parse CSV using d3-dsv
  let rawOrders = csvParse(csvText);

  // Normalize headers to handle quoted/dirty headers
  rawOrders = normalizeHeaders(rawOrders);

  // Validate that all required fields exist
  validateRequiredFields(rawOrders);

  // Transform and validate each row
  const parsedOrders = rawOrders.map((row: { [key: string]: string }, index: number) => {
    try {
      return {
        rowId: safeParseNumber(row['Row ID'], 'Row ID'),
        orderId: row['Order ID'] || '',
        orderDate: parseDate(row['Order Date'] || '', 'Order Date'),
        shipDate: parseDate(row['Ship Date'] || '', 'Ship Date'),
        shipMode: row['Ship Mode'] || '',
        customerId: row['Customer ID'] || '',
        customerName: row['Customer Name'] || '',
        segment: row['Segment'] || '',
        country: row['Country'] || '',
        city: row['City'] || '',
        state: row['State'] || '',
        postalCode: safeParseNumber(row['Postal Code'], 'Postal Code'),
        region: row['Region'] || '',
        productId: row['Product ID'] || '',
        category: row['Category'] || '',
        subCategory: row['Sub-Category'] || '',
        productName: row['Product Name'] || '',
        sales: safeParseNumber(row['Sales'], 'Sales'),
        quantity: safeParseNumber(row['Quantity'], 'Quantity'),
        discount: safeParseNumber(row['Discount'], 'Discount'),
        profit: safeParseNumber(row['Profit'], 'Profit'),
      };
    } catch (error) {
      console.error(`Error parsing row ${index + 1}:`, error);
      // Return a minimal valid row to prevent complete failure
      return {
        rowId: index,
        orderId: '',
        orderDate: new Date(),
        shipDate: new Date(),
        shipMode: '',
        customerId: '',
        customerName: '',
        segment: '',
        country: '',
        city: '',
        state: '',
        postalCode: 0,
        region: '',
        productId: '',
        category: '',
        subCategory: '',
        productName: '',
        sales: 0,
        quantity: 0,
        discount: 0,
        profit: 0,
      };
    }
  });

  // Validate that we got meaningful data
  if (parsedOrders.length === 0) {
    throw new Error('No valid data rows found in CSV');
  }

  // Log data quality metrics
  const validSalesCount = parsedOrders.filter(d => d.sales > 0).length;
  const validDatesCount = parsedOrders.filter(d => !isNaN(d.orderDate.getTime())).length;

  console.log(`Loaded ${parsedOrders.length} rows from CSV`);
  console.log(`  - Rows with non-zero sales: ${validSalesCount} (${((validSalesCount / parsedOrders.length) * 100).toFixed(1)}%)`);
  console.log(`  - Rows with valid dates: ${validDatesCount} (${((validDatesCount / parsedOrders.length) * 100).toFixed(1)}%)`);

  // Warn if data quality is poor
  if (validSalesCount === 0) {
    console.error('WARNING: All sales values are zero! Charts will be empty.');
  }
  if (validDatesCount === 0) {
    console.error('WARNING: All dates are invalid! Time-based charts will fail.');
  }

  return parsedOrders;
}

/**
 * Aggregate sales by Sub-Category
 */
export function aggregateSalesBySubCategory(data: ParsedOrder[]): SalesBySubCategory[] {
  const grouped = group(data, (d: ParsedOrder) => d.subCategory);

  const aggregated = Array.from(grouped, ([subCategory, orders]) => ({
    subCategory,
    sales: sum(orders, (d: ParsedOrder) => d.sales),
  }));

  // Sort descending by sales
  return aggregated.sort((a, b) => b.sales - a.sales);
}

/**
 * Aggregate sales by Year
 */
export function aggregateSalesByYear(data: ParsedOrder[]): SalesByYear[] {
  const grouped = group(data, (d: ParsedOrder) => d.orderDate.getFullYear());

  const aggregated = Array.from(grouped, ([year, orders]) => ({
    year,
    sales: sum(orders, (d: ParsedOrder) => d.sales),
  }));

  // Sort ascending by year
  return aggregated.sort((a, b) => a.year - b.year);
}

/**
 * Aggregate sales by Month (for time series)
 */
export function aggregateSalesByMonth(data: ParsedOrder[]): SalesByMonth[] {
  // Group by year and month
  const grouped = rollup(
    data,
    (orders: ParsedOrder[]) => sum(orders, (d: ParsedOrder) => d.sales),
    (d: ParsedOrder) => d.orderDate.getFullYear(),
    (d: ParsedOrder) => d.orderDate.getMonth()
  );

  const result: SalesByMonth[] = [];

  // Convert grouped data to flat array
  grouped.forEach((months, year) => {
    months.forEach((sales, month) => {
      result.push({
        month: new Date(year, month, 1),
        sales,
      });
    });
  });

  // Sort by date
  return result.sort((a, b) => a.month.getTime() - b.month.getTime());
}

/**
 * Calculate profit ratio
 */
export function calculateProfitRatio(data: ParsedOrder[]): number {
  const totalSales = sum(data, (d: ParsedOrder) => d.sales);
  const totalProfit = sum(data, (d: ParsedOrder) => d.profit);

  if (totalSales === 0) return 0;
  return totalProfit / totalSales;
}

/**
 * Get top N products by sales
 */
export function getTopProducts(
  data: ParsedOrder[],
  n: number
): Array<{ productName: string; sales: number }> {
  const grouped = group(data, (d: ParsedOrder) => d.productName);

  const aggregated = Array.from(grouped, ([productName, orders]) => ({
    productName,
    sales: sum(orders, (d: ParsedOrder) => d.sales),
  }));

  // Sort descending by sales and take top N
  return aggregated.sort((a, b) => b.sales - a.sales).slice(0, n);
}
