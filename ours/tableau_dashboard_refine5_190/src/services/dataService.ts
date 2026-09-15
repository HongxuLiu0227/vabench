import { csvParse } from 'd3-dsv';
import type { ParsedOrder, CustomerOverviewData, ScatterplotData, DiscountOverviewData } from '../types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Raw CSV row type (all values are strings)
 */
type RawCSVRow = {
  [key: string]: string;
};

/**
 * Normalize CSV headers by trimming whitespace and removing extra quotes
 * This handles cases where headers might have leading/trailing spaces or quote characters
 */
function normalizeHeaders(row: RawCSVRow): RawCSVRow {
  const normalized: RawCSVRow = {};
  for (const [key, value] of Object.entries(row)) {
    // Trim whitespace and remove any surrounding quotes
    const normalizedKey = key.trim().replace(/^"+|"+$/g, '');
    normalized[normalizedKey] = value;
  }
  return normalized;
}

/**
 * Parse CSV string into array of objects
 * Handles BOM (Byte Order Mark) at the start of the file
 * Normalizes headers to handle quoted or dirty header names
 */
function parseCSV(text: string): RawCSVRow[] {
  // Remove BOM if present (UTF-8 BOM is 0xEF,0xBB,0xBF)
  let cleanedText = text;
  if (text.charCodeAt(0) === 0xFEFF) {
    cleanedText = text.slice(1);
  }

  const parsed = csvParse(cleanedText) as unknown as RawCSVRow[];

  // Normalize headers for each row
  return parsed.map(normalizeHeaders);
}

/**
 * Required fields that must be present in the CSV
 */
const REQUIRED_FIELDS = [
  'Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode',
  'Customer ID', 'Customer Name', 'Segment', 'Country', 'City', 'State',
  'Postal Code', 'Region', 'Product ID', 'Category', 'Sub-Category',
  'Product Name', 'Sales', 'Quantity', 'Discount', 'Profit'
];

/**
 * Validate that required fields exist in parsed CSV data
 */
function validateRequiredFields(data: RawCSVRow[]): void {
  if (data.length === 0) {
    throw new Error('CSV file is empty or contains no data rows');
  }

  const firstRow = data[0];
  const missingFields = REQUIRED_FIELDS.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV: ${missingFields.join(', ')}\n` +
      `Available fields: ${Object.keys(firstRow).join(', ')}`
    );
  }
}

/**
 * Parse date string safely, handling various date formats
 * Returns null for invalid dates instead of creating "Invalid Date" objects
 */
function parseDateSafe(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  // Try parsing the date
  const date = new Date(dateStr);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date value: "${dateStr}"`);
    return null;
  }

  // Check for obviously wrong dates (like year 1970 which indicates parsing failure)
  if (date.getFullYear() === 1970 && dateStr.indexOf('1970') === -1) {
    console.warn(`Date parsed as epoch (1970), indicates parsing failure: "${dateStr}"`);
    return null;
  }

  return date;
}

/**
 * Convert string numeric fields to numbers and date strings to Date objects
 */
function parseOrder(order: RawCSVRow): ParsedOrder {
  const orderDate = parseDateSafe(order['Order Date'] || '');
  const shipDate = parseDateSafe(order['Ship Date'] || '');

  return {
    'Row ID': Number(order['Row ID'] || '0'),
    'Order ID': String(order['Order ID'] || ''),
    'Order Date': orderDate || new Date(), // Fallback to current date if invalid
    'Ship Date': shipDate || new Date(),   // Fallback to current date if invalid
    'Ship Mode': String(order['Ship Mode'] || ''),
    'Customer ID': String(order['Customer ID'] || ''),
    'Customer Name': String(order['Customer Name'] || ''),
    'Segment': String(order['Segment'] || ''),
    'Country': String(order['Country'] || ''),
    'City': String(order['City'] || ''),
    'State': String(order['State'] || ''),
    'Postal Code': Number(order['Postal Code'] || '0'),
    'Region': String(order['Region'] || ''),
    'Product ID': String(order['Product ID'] || ''),
    'Category': String(order['Category'] || ''),
    'Sub-Category': String(order['Sub-Category'] || ''),
    'Product Name': String(order['Product Name'] || ''),
    'Sales': Number(order['Sales'] || '0'),
    'Quantity': Number(order['Quantity'] || '0'),
    'Discount': Number(order['Discount'] || '0'),
    'Profit': Number(order['Profit'] || '0'),
  };
}

/**
 * Fetch and parse the CSV data
 */
export async function fetchData(): Promise<ParsedOrder[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const text = await response.text();
    const rawOrders = parseCSV(text);

    // Validate that required fields exist
    validateRequiredFields(rawOrders);

    return rawOrders.map(parseOrder);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

/**
 * Calculate profit ratio
 */
function calculateProfitRatio(totalProfit: number, totalSales: number): number {
  if (totalSales === 0) return 0;
  return totalProfit / totalSales;
}

/**
 * Aggregate data for Customer Overview worksheet
 * Groups by Region and calculates: Customer Count (distinct), Sales, Quantity, Profit, Profit Ratio
 */
export function aggregateCustomerOverview(data: ParsedOrder[]): CustomerOverviewData[] {
  const regionMap = new Map<string, {
    customers: Set<string>;
    sales: number;
    quantity: number;
    profit: number;
  }>();

  data.forEach(order => {
    const region = order.Region;
    if (!regionMap.has(region)) {
      regionMap.set(region, {
        customers: new Set(),
        sales: 0,
        quantity: 0,
        profit: 0
      });
    }
    const regionData = regionMap.get(region)!;
    regionData.customers.add(order['Customer ID']);
    regionData.sales += order.Sales;
    regionData.quantity += order.Quantity;
    regionData.profit += order.Profit;
  });

  return Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    customerCount: stats.customers.size,
    sales: stats.sales,
    quantity: stats.quantity,
    profit: stats.profit,
    profitRatio: calculateProfitRatio(stats.profit, stats.sales)
  }));
}

/**
 * Aggregate data for Scatterplot worksheet
 * Groups by Product Name and calculates: Sales, Profit, Quantity
 */
export function aggregateScatterplotData(data: ParsedOrder[]): ScatterplotData[] {
  const productMap = new Map<string, {
    sales: number;
    profit: number;
    quantity: number;
  }>();

  data.forEach(order => {
    const productName = order['Product Name'];
    if (!productMap.has(productName)) {
      productMap.set(productName, {
        sales: 0,
        profit: 0,
        quantity: 0
      });
    }
    const productData = productMap.get(productName)!;
    productData.sales += order.Sales;
    productData.profit += order.Profit;
    productData.quantity += order.Quantity;
  });

  return Array.from(productMap.entries()).map(([productName, stats]) => ({
    productName,
    sales: stats.sales,
    profit: stats.profit,
    quantity: stats.quantity
  }));
}

/**
 * Aggregate data for Discount Overview by Region worksheet
 * Groups by Region and calculates: Average Discount, Profit, Quantity, Sales, Profit Ratio
 */
export function aggregateDiscountOverview(data: ParsedOrder[]): DiscountOverviewData[] {
  const regionMap = new Map<string, {
    discounts: number[];
    profit: number;
    quantity: number;
    sales: number;
  }>();

  data.forEach(order => {
    const region = order.Region;
    if (!regionMap.has(region)) {
      regionMap.set(region, {
        discounts: [],
        profit: 0,
        quantity: 0,
        sales: 0
      });
    }
    const regionData = regionMap.get(region)!;
    regionData.discounts.push(order.Discount);
    regionData.profit += order.Profit;
    regionData.quantity += order.Quantity;
    regionData.sales += order.Sales;
  });

  return Array.from(regionMap.entries()).map(([region, stats]) => {
    const avgDiscount = stats.discounts.length > 0
      ? stats.discounts.reduce((sum, d) => sum + d, 0) / stats.discounts.length
      : 0;
    return {
      region,
      discount: avgDiscount,
      profit: stats.profit,
      quantity: stats.quantity,
      sales: stats.sales,
      profitRatio: calculateProfitRatio(stats.profit, stats.sales)
    };
  });
}
