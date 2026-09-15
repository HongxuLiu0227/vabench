import * as Papa from 'papaparse';

export interface OrderRecord {
  'Row ID': string;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  Segment: string;
  'City, State': string;
  Country: string;
  'Postal Code': string;
  Market: string;
  Region: string;
  'Product ID': string;
  Category: string;
  'Sub-Category': string;
  'Product Name': string;
  Sales: string;
  Quantity: string;
  Discount: string;
  Profit: string;
  'Shipping Cost': string;
  'Order Priority': string;
}

// Required fields for Tableau worksheets
const REQUIRED_FIELDS = [
  'Row ID',
  'Order ID',
  'Order Date',
  'Ship Date',
  'Ship Mode',
  'Customer ID',
  'Customer Name',
  'Segment',
  'City, State',
  'Country',
  'Postal Code',
  'Market',
  'Region',
  'Product ID',
  'Category',
  'Sub-Category',
  'Product Name',
  'Sales',
  'Quantity',
  'Discount',
  'Profit',
  'Shipping Cost',
  'Order Priority'
];

/**
 * Normalizes CSV headers by:
 * 1. Removing extra quotes
 * 2. Trimming whitespace
 * 3. Standardizing format
 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^"+|"+$/g, '') // Remove surrounding quotes
    .trim()
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Validates that all required fields are present in the parsed data
 */
function validateRequiredFields(headers: string[]): void {
  const normalizedHeaders = headers.map(normalizeHeader);
  const missingFields = REQUIRED_FIELDS.filter(
    field => !normalizedHeaders.includes(field)
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Tableau fields in CSV: ${missingFields.join(', ')}. ` +
      `Found headers: ${normalizedHeaders.join(', ')}`
    );
  }
}

/**
 * Detects and skips preamble rows before the actual CSV header.
 * Preamble rows are identified by:
 * 1. Not having the expected column count
 * 2. Missing critical field names (like 'Row ID', 'Order Date')
 */
function findHeaderRow(lines: string[]): number {
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];

    // Parse the line with PapaParse to handle quoted fields correctly
    const parsed = Papa.parse(line, {
      skipEmptyLines: true,
      transformHeader: normalizeHeader
    });

    if (parsed.data.length === 0) continue;

    const headers = parsed.data[0] as string[];
    const normalizedHeaders = headers.map(normalizeHeader);

    // Check if this row looks like a header by checking for critical fields
    const hasRowId = normalizedHeaders.some(h => h === 'Row ID');
    const hasOrderDate = normalizedHeaders.some(h => h === 'Order Date');
    const hasSales = normalizedHeaders.some(h => h === 'Sales');
    const hasColumnCount = normalizedHeaders.length >= 20; // Expected column count

    if (hasRowId && hasOrderDate && hasSales && hasColumnCount) {
      return i;
    }
  }

  throw new Error(
    'Could not find valid CSV header row. ' +
    'Expected to find headers with "Row ID", "Order Date", and "Sales" columns.'
  );
}

export interface ParsedOrder {
  rowId: string;
  orderId: string;
  orderDate: Date;
  shipDate: Date;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  cityState: string;
  country: string;
  postalCode: string;
  market: string;
  region: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
  shippingCost: number;
  orderPriority: string;
}

export async function loadOrdersData(): Promise<ParsedOrder[]> {
  const response = await fetch('/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`);
  }

  const csvText = await response.text();

  try {
    // Split into lines and detect preamble
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    const headerRowIndex = findHeaderRow(lines);

    // Extract data starting from header row
    const dataLines = lines.slice(headerRowIndex);
    const csvData = dataLines.join('\n');

    return new Promise((resolve, reject) => {
      Papa.parse<OrderRecord>(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: normalizeHeader,
        complete: (results) => {
          try {
            // Validate headers
            if (results.meta.fields) {
              validateRequiredFields(results.meta.fields);
            }

            // Filter out any remaining invalid rows
            const validRows = results.data.filter(row => {
              // Row is valid if it has a Row ID that's a number
              const rowId = row['Row ID'];
              return rowId && rowId !== 'Row ID' && !isNaN(parseInt(rowId, 10));
            });

            const parsed = validRows
              .map(row => parseOrderRow(row))
              .filter((order): order is ParsedOrder => order !== null);

            if (parsed.length === 0) {
              throw new Error(
                'No valid data rows found after parsing. ' +
                'All rows were filtered out during validation.'
              );
            }

            console.log(`Successfully loaded ${parsed.length} order records from ${validRows.length} valid rows`);
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse CSV data');
  }
}

function parseOrderRow(row: OrderRecord): ParsedOrder | null {
  try {
    // Coerce quantitative fields to numbers, defaulting to 0 for invalid values
    const sales = parseFloat(String(row.Sales).trim()) || 0;
    const quantity = parseFloat(String(row.Quantity).trim()) || 0;
    const discount = parseFloat(String(row.Discount).trim()) || 0;
    const profit = parseFloat(String(row.Profit).trim()) || 0;
    const shippingCost = parseFloat(String(row['Shipping Cost']).trim()) || 0;

    // Parse dates - handle multiple date formats
    const orderDateStr = String(row['Order Date']).trim();
    const shipDateStr = String(row['Ship Date']).trim();

    const orderDate = parseDate(orderDateStr);
    const shipDate = parseDate(shipDateStr);

    // Validate that we have a valid order date
    if (!orderDate || isNaN(orderDate.getTime())) {
      console.warn(`Invalid order date for row ${row['Row ID']}: ${orderDateStr}`);
      return null;
    }

    // Validate required string fields are present
    if (!row['Row ID'] || !row['Order ID'] || !row['Product ID']) {
      console.warn(`Missing required ID fields in row`);
      return null;
    }

    return {
      rowId: String(row['Row ID']).trim(),
      orderId: String(row['Order ID']).trim(),
      orderDate,
      shipDate: shipDate || orderDate, // Fallback to order date if ship date is invalid
      shipMode: String(row['Ship Mode'] || '').trim(),
      customerId: String(row['Customer ID'] || '').trim(),
      customerName: String(row['Customer Name'] || '').trim(),
      segment: String(row.Segment || '').trim(),
      cityState: String(row['City, State'] || '').trim(),
      country: String(row.Country || '').trim(),
      postalCode: String(row['Postal Code'] || '').trim(),
      market: String(row.Market || '').trim(),
      region: String(row.Region || '').trim(),
      productId: String(row['Product ID']).trim(),
      category: String(row.Category || '').trim(),
      subCategory: String(row['Sub-Category'] || '').trim(),
      productName: String(row['Product Name'] || '').trim(),
      sales,
      quantity,
      discount,
      profit,
      shippingCost,
      orderPriority: String(row['Order Priority'] || '').trim()
    };
  } catch (error) {
    console.error('Error parsing row:', error, row);
    return null;
  }
}

/**
 * Parses date strings in various formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  // Try parsing with Date constructor first
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try manual parsing for common formats
  // Format: YYYY-MM-DD HH:MM:SS
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/);
  if (isoMatch) {
    const [, year, month, day, hour, minute, second] = isoMatch;
    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      hour ? parseInt(hour, 10) : 0,
      minute ? parseInt(minute, 10) : 0,
      second ? parseInt(second, 10) : 0
    );
  }

  return null;
}

// Data aggregation helpers
export function aggregateByYear(orders: ParsedOrder[]) {
  const aggregation = new Map<number, number>();

  orders.forEach(order => {
    const year = order.orderDate.getFullYear();
    const current = aggregation.get(year) || 0;
    aggregation.set(year, current + order.sales);
  });

  return Array.from(aggregation.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}

export function aggregateByMonth(orders: ParsedOrder[]) {
  const aggregation = new Map<string, number>();

  orders.forEach(order => {
    const year = order.orderDate.getFullYear();
    const month = order.orderDate.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const current = aggregation.get(key) || 0;
    aggregation.set(key, current + order.sales);
  });

  return Array.from(aggregation.entries())
    .map(([key, sales]) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month, sales, dateKey: key };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

export function aggregateBySubCategory(orders: ParsedOrder[]) {
  const aggregation = new Map<string, { sales: number; count: number }>();

  orders.forEach(order => {
    const key = order.subCategory;
    const current = aggregation.get(key) || { sales: 0, count: 0 };
    aggregation.set(key, {
      sales: current.sales + order.sales,
      count: current.count + 1
    });
  });

  return Array.from(aggregation.entries())
    .map(([subCategory, data]) => ({
      subCategory,
      sales: data.sales,
      count: data.count
    }))
    .sort((a, b) => b.sales - a.sales); // Descending by sales
}

export function aggregateScatterData(orders: ParsedOrder[]) {
  const aggregation = new Map<string, {
    sales: number;
    profit: number;
    quantity: number;
    productName: string;
  }>();

  orders.forEach(order => {
    const key = order.productId;
    const current = aggregation.get(key);

    if (current) {
      current.sales += order.sales;
      current.profit += order.profit;
      current.quantity += order.quantity;
    } else {
      aggregation.set(key, {
        sales: order.sales,
        profit: order.profit,
        quantity: order.quantity,
        productName: order.productName
      });
    }
  });

  return Array.from(aggregation.values());
}
