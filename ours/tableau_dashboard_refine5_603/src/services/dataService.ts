import { csvParse } from 'd3-dsv';
import type {
  ProcessedOrder,
  SalesByYear,
  SalesByMonth,
  RegionalMetrics,
  ScatterDataPoint,
} from '../types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Remove BOM character from the beginning of a string
 */
function stripBOM(str: string): string {
  // UTF-8 BOM is 0xEF,0xBB,0xBF
  if (str.charCodeAt(0) === 0xFEFF || str.charCodeAt(0) === 0xBBEF) {
    return str.slice(1);
  }
  // Check for UTF-8 BOM at start
  if (str.startsWith('\uFEFF')) {
    return str.slice(1);
  }
  return str;
}

/**
 * Normalize column names by removing extra quotes, whitespace, BOM artifacts, and line endings
 */
function normalizeColumnName(name: string): string {
  return name
    .trim()
    .replace(/\r$/g, '') // Remove trailing carriage returns from Windows line endings
    .replace(/^"(.*)"$/, '$1') // Remove surrounding quotes
    .replace(/^['"''](.*)['"'']$/, '$1'); // Remove various quote styles
}

/**
 * Safe number conversion that returns 0 for invalid values instead of NaN
 */
function safeNumber(value: string | undefined | null, defaultValue: number = 0): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safe date conversion that validates the date and returns a valid Date object
 */
function safeDate(value: string | undefined | null): Date {
  if (!value) {
    return new Date(); // Return current date as fallback
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date value: "${value}", using current date`);
    return new Date();
  }

  return date;
}

/**
 * Validate that required fields are present in the data
 */
function validateRequiredFields(row: Record<string, string>, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => !row[field] && row[field] !== '');
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Load and parse the CSV data with robust error handling
 */
export async function loadData(): Promise<ProcessedOrder[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.statusText}`);
  }

  let csvText = await response.text();

  // Remove BOM if present
  csvText = stripBOM(csvText);

  // Parse CSV
  const rawData = csvParse(csvText);

  if (rawData.length === 0) {
    throw new Error('No data found in CSV file');
  }

  // Define required fields
  const requiredFields = [
    'Row ID',
    'Order ID',
    'Order Date',
    'Sales',
    'Quantity',
    'Discount',
    'Profit',
    'Region',
    'Customer Name',
    'Product Name'
  ];

  // Process the data with validation
  const processedData: ProcessedOrder[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];

    // Normalize column names in the row
    const normalizedRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeColumnName(key);
      normalizedRow[normalizedKey] = value;
    }

    try {
      // Validate required fields
      validateRequiredFields(normalizedRow, requiredFields);

      const orderDate = safeDate(normalizedRow['Order Date']);
      const shipDate = safeDate(normalizedRow['Ship Date']);

      const processedOrder: ProcessedOrder = {
        'Row ID': safeNumber(normalizedRow['Row ID']),
        'Order ID': String(normalizedRow['Order ID'] || ''),
        'Order Date': String(normalizedRow['Order Date'] || ''),
        'Ship Date': String(normalizedRow['Ship Date'] || ''),
        'Ship Mode': String(normalizedRow['Ship Mode'] || ''),
        'Customer ID': String(normalizedRow['Customer ID'] || ''),
        'Customer Name': String(normalizedRow['Customer Name'] || ''),
        'Segment': String(normalizedRow['Segment'] || ''),
        'Country': String(normalizedRow['Country'] || ''),
        'City': String(normalizedRow['City'] || ''),
        'State': String(normalizedRow['State'] || ''),
        'Postal Code': safeNumber(normalizedRow['Postal Code']),
        'Region': String(normalizedRow['Region'] || ''),
        'Product ID': String(normalizedRow['Product ID'] || ''),
        'Category': String(normalizedRow['Category'] || ''),
        'Sub-Category': String(normalizedRow['Sub-Category'] || ''),
        'Product Name': String(normalizedRow['Product Name'] || ''),
        'Sales': safeNumber(normalizedRow['Sales']),
        'Quantity': safeNumber(normalizedRow['Quantity']),
        'Discount': safeNumber(normalizedRow['Discount']),
        'Profit': safeNumber(normalizedRow['Profit']),
        orderDate,
        shipDate,
        year: orderDate.getFullYear(),
        month: orderDate.getMonth(),
      };

      processedData.push(processedOrder);
    } catch (error) {
      console.warn(`Skipping row ${i + 1} due to validation error:`, error);
      // Continue processing other rows instead of failing completely
    }
  }

  if (processedData.length === 0) {
    throw new Error('No valid data rows found after validation');
  }

  console.log(`Successfully loaded ${processedData.length} valid records from ${rawData.length} total rows`);

  return processedData;
}

/**
 * Aggregate sales by year
 */
export function aggregateSalesByYear(data: ProcessedOrder[]): SalesByYear[] {
  const salesByYear = new Map<number, number>();

  data.forEach((order) => {
    const current = salesByYear.get(order.year) || 0;
    salesByYear.set(order.year, current + order.Sales);
  });

  return Array.from(salesByYear.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Aggregate sales by month
 */
export function aggregateSalesByMonth(data: ProcessedOrder[]): SalesByMonth[] {
  const salesByMonth = new Map<string, number>();

  data.forEach((order) => {
    const monthKey = `${order.year}-${String(order.month).padStart(2, '0')}`;
    const current = salesByMonth.get(monthKey) || 0;
    salesByMonth.set(monthKey, current + order.Sales);
  });

  return Array.from(salesByMonth.entries())
    .map(([monthKey, sales]) => {
      const [year, month] = monthKey.split('-').map(Number);
      return { month: new Date(year, month, 1), sales };
    })
    .sort((a, b) => a.month.getTime() - b.month.getTime());
}

/**
 * Aggregate regional metrics
 */
export function aggregateRegionalMetrics(data: ProcessedOrder[]): RegionalMetrics[] {
  const regionMap = new Map<string, {
    totalDiscount: number;
    totalProfit: number;
    totalQuantity: number;
    totalSales: number;
    customers: Set<string>;
  }>();

  data.forEach((order) => {
    const current = regionMap.get(order.Region) || {
      totalDiscount: 0,
      totalProfit: 0,
      totalQuantity: 0,
      totalSales: 0,
      customers: new Set(),
    };

    current.totalDiscount += order.Discount;
    current.totalProfit += order.Profit;
    current.totalQuantity += order.Quantity;
    current.totalSales += order.Sales;
    current.customers.add(order['Customer Name']);

    regionMap.set(order.Region, current);
  });

  return Array.from(regionMap.entries())
    .map(([region, metrics]) => ({
      region,
      avgDiscount: metrics.totalDiscount / data.filter(d => d.Region === region).length,
      sumProfit: metrics.totalProfit,
      sumQuantity: metrics.totalQuantity,
      sumSales: metrics.totalSales,
      customerCount: metrics.customers.size,
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

/**
 * Aggregate scatterplot data by product
 */
export function aggregateScatterData(data: ProcessedOrder[]): ScatterDataPoint[] {
  const productMap = new Map<string, {
    sales: number;
    profit: number;
    quantity: number;
  }>();

  data.forEach((order) => {
    const current = productMap.get(order['Product Name']) || {
      sales: 0,
      profit: 0,
      quantity: 0,
    };

    current.sales += order.Sales;
    current.profit += order.Profit;
    current.quantity += order.Quantity;

    productMap.set(order['Product Name'], current);
  });

  return Array.from(productMap.entries())
    .map(([productName, metrics]) => ({
      productName,
      sales: metrics.sales,
      profit: metrics.profit,
      quantity: metrics.quantity,
    }))
    .sort((a, b) => b.sales - a.sales); // Sort by sales descending
}
