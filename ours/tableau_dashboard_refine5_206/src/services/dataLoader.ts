import Papa from 'papaparse';

export interface SalesRecord {
  'Row ID': string;
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
  'Sales': string;
  'Quantity': string;
  'Discount': string;
  'Profit': string;
  'Shipping Cost': string;
  'Order Priority': string;
}

export interface ParsedSalesRecord {
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

/**
 * Detect and skip preamble rows to find the actual header row
 * Returns the CSV text starting from the real header row
 */
function detectAndSkipPreamble(csvText: string): string {
  // Remove UTF-8 BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const lines = csvText.split(/\r?\n/);

  // Find the line that contains the actual column headers
  // The real header should contain known column names like "Row ID", "Order Date", etc.
  const knownColumns = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit'];

  let headerLineIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this line contains multiple known column names
    const matchingColumns = knownColumns.filter(col =>
      line.includes(`"${col}"`) || line.includes(`,${col},`) || line.startsWith(`${col},`) || line.endsWith(`,${col}`)
    );

    if (matchingColumns.length >= 3) {
      headerLineIndex = i;
      break;
    }
  }

  if (headerLineIndex === -1) {
    console.warn('Could not detect header row, using first non-empty line');
    // Fallback: find first non-empty line that looks like a header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && line.includes(',')) {
        headerLineIndex = i;
        break;
      }
    }
  }

  if (headerLineIndex === -1) {
    throw new Error('Could not find valid header row in CSV');
  }

  console.log(`Detected header row at index ${headerLineIndex}, skipping ${headerLineIndex} preamble rows`);
  return lines.slice(headerLineIndex).join('\n');
}

/**
 * Normalize CSV headers by removing extra quotes and whitespace
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
    .replace(/"{2,}/g, '"') // Replace multiple quotes with single
    .trim();
}

/**
 * Load and parse CSV data from the public/data directory
 */
export async function loadSalesData(): Promise<ParsedSalesRecord[]> {
  const response = await fetch('/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  // Detect and skip preamble rows
  const cleanCsvText = detectAndSkipPreamble(csvText);

  // Parse CSV with PapaParse
  const result = Papa.parse<SalesRecord>(cleanCsvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  // Validate that we parsed the data correctly
  if (result.data.length === 0) {
    throw new Error('No data rows found after parsing CSV');
  }

  // Check if the first row has valid data
  const firstRow = result.data[0];
  if (!firstRow['Row ID'] || !firstRow['Order ID']) {
    throw new Error('CSV parsing failed: expected columns not found. Headers may be misaligned.');
  }

  console.log(`Successfully parsed ${result.data.length} records from CSV`);

  // Validate that we have the expected columns
  const sampleRow = result.data[0];
  const requiredColumns: Array<keyof SalesRecord> = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit', 'Quantity'];
  const missingColumns = requiredColumns.filter(col => !sampleRow[col]);

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  const validRows = result.data;

  // Transform and parse numeric fields and dates
  return validRows
    .map((row) => {
      const sales = parseFloat(row['Sales']);
      const quantity = parseFloat(row['Quantity']);
      const discount = parseFloat(row['Discount']);
      const profit = parseFloat(row['Profit']);
      const shippingCost = parseFloat(row['Shipping Cost']);

      if (isNaN(sales) || isNaN(quantity) || isNaN(discount) || isNaN(profit) || isNaN(shippingCost)) {
        console.warn('Skipping row with invalid numeric values:', row['Row ID']);
        return null;
      }

      // Parse dates with validation to prevent "Jan 1970" issues
      const orderDateStr = row['Order Date'];
      const shipDateStr = row['Ship Date'];

      if (!orderDateStr || !shipDateStr) {
        console.warn('Skipping row with missing date values:', row['Row ID']);
        return null;
      }

      const orderDate = new Date(orderDateStr);
      const shipDate = new Date(shipDateStr);

      // Validate dates - check if they're valid (not NaN or Jan 1970 which indicates epoch)
      if (isNaN(orderDate.getTime()) || isNaN(shipDate.getTime())) {
        console.warn('Skipping row with invalid dates:', row['Row ID'], orderDateStr, shipDateStr);
        return null;
      }

      // Additional check for dates that are too old (before 1990) or invalid
      if (orderDate.getFullYear() < 1990 || shipDate.getFullYear() < 1990) {
        console.warn('Skipping row with suspicious dates:', row['Row ID'], orderDate, shipDate);
        return null;
      }

      return {
        rowId: row['Row ID'],
        orderId: row['Order ID'],
        orderDate,
        shipDate,
        shipMode: row['Ship Mode'],
        customerId: row['Customer ID'],
        customerName: row['Customer Name'],
        segment: row['Segment'],
        cityState: row['City, State'],
        country: row['Country'],
        postalCode: row['Postal Code'],
        market: row['Market'],
        region: row['Region'],
        productId: row['Product ID'],
        category: row['Category'],
        subCategory: row['Sub-Category'],
        productName: row['Product Name'],
        sales,
        quantity,
        discount,
        profit,
        shippingCost,
        orderPriority: row['Order Priority'],
      };
    })
    .filter((record): record is ParsedSalesRecord => record !== null);
}

/**
 * Validate that the parsed data contains all required Tableau fields
 * This ensures field resolution will work at runtime
 */
export function validateTableauFields(data: ParsedSalesRecord[]): {
  isValid: boolean;
  errors: string[];
  sampleRecord: ParsedSalesRecord | null;
} {
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push('No data records found');
    return { isValid: false, errors, sampleRecord: null };
  }

  const sample = data[0];

  // Check required fields for Tableau worksheets
  const requiredFields: (keyof ParsedSalesRecord)[] = [
    'rowId',
    'orderId',
    'orderDate',
    'sales',
    'profit',
    'quantity',
    'subCategory',
    'productName'
  ];

  for (const field of requiredFields) {
    if (sample[field] === undefined || sample[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check for valid date ranges (not Jan 1970)
  if (sample.orderDate.getFullYear() < 2000) {
    errors.push(`Suspicious order date detected: ${sample.orderDate.toISOString()}`);
  }

  // Check for valid numeric values
  if (isNaN(sample.sales) || sample.sales === 0) {
    errors.push(`Invalid sales value: ${sample.sales}`);
  }

  if (isNaN(sample.profit)) {
    errors.push(`Invalid profit value: ${sample.profit}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sampleRecord: sample
  };
}

/**
 * Aggregate sales by date for line charts
 */
export function aggregateSalesByDate(data: ParsedSalesRecord[]): { date: Date; sales: number }[] {
  const aggregation = new Map<string, number>();

  data.forEach((record) => {
    const dateKey = record.orderDate.toISOString().split('T')[0];
    const current = aggregation.get(dateKey) || 0;
    aggregation.set(dateKey, current + record.sales);
  });

  return Array.from(aggregation.entries())
    .map(([dateStr, sales]) => ({
      date: new Date(dateStr),
      sales,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Aggregate sales by year for line charts
 */
export function aggregateSalesByYear(data: ParsedSalesRecord[]): { year: number; sales: number }[] {
  const aggregation = new Map<number, number>();

  data.forEach((record) => {
    const year = record.orderDate.getFullYear();
    const current = aggregation.get(year) || 0;
    aggregation.set(year, current + record.sales);
  });

  return Array.from(aggregation.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Aggregate sales by sub-category for horizontal bar charts
 */
export function aggregateSalesBySubCategory(
  data: ParsedSalesRecord[]
): { subCategory: string; sales: number }[] {
  const aggregation = new Map<string, number>();

  data.forEach((record) => {
    const current = aggregation.get(record.subCategory) || 0;
    aggregation.set(record.subCategory, current + record.sales);
  });

  return Array.from(aggregation.entries())
    .map(([subCategory, sales]) => ({ subCategory, sales }))
    .sort((a, b) => b.sales - a.sales); // Sort descending by sales
}

/**
 * Aggregate data by product for scatter plot (Sales vs Profit)
 */
export function aggregateSalesProfitByProduct(data: ParsedSalesRecord[]): {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}[] {
  const aggregation = new Map<string, { sales: number; profit: number; quantity: number }>();

  data.forEach((record) => {
    const current = aggregation.get(record.productName) || { sales: 0, profit: 0, quantity: 0 };
    aggregation.set(record.productName, {
      sales: current.sales + record.sales,
      profit: current.profit + record.profit,
      quantity: current.quantity + record.quantity,
    });
  });

  return Array.from(aggregation.entries()).map(([productName, values]) => ({
    productName,
    sales: values.sales,
    profit: values.profit,
    quantity: values.quantity,
  }));
}
