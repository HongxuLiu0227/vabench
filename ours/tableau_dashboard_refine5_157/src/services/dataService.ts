import { timeParse, timeMonth, timeYear } from 'd3';
import { rollup, sum } from 'd3';
import type {
  RawSuperstoreRow,
  SuperstoreOrder,
  TimeSeriesDataPoint,
  CategoryDataPoint,
  YearlyDataPoint,
} from '../types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';
const parseDate = timeParse('%Y-%m-%d');
const parseDateAlt = timeParse('%m/%d/%Y');

/**
 * Parse date string to Date object
 */
function parseOrderDate(dateStr: string): Date {
  const parsed = parseDate(dateStr) || parseDateAlt(dateStr);
  return parsed || new Date();
}

/**
 * Simple CSV parser
 */
function parseCSV(text: string): RawSuperstoreRow[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  // Remove BOM if present
  const bom = String.fromCharCode(0xFEFF);
  const headers = lines[0].split(',').map(h => h.trim().replace(new RegExp('^' + bom), ''));
  const result: RawSuperstoreRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(currentCell);
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell);

    if (cells.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = cells[index]?.trim() || '';
      });
      result.push(row as unknown as RawSuperstoreRow);
    }
  }

  return result;
}

/**
 * Load and parse CSV data from the public directory
 */
export async function loadData(): Promise<SuperstoreOrder[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const csvText = await response.text();
  const rawData = parseCSV(csvText);

  return rawData.map((d): SuperstoreOrder => ({
    rowId: Number(d['Row ID']) || 0,
    orderId: d['Order ID'] || '',
    orderDate: parseOrderDate(d['Order Date']),
    shipDate: parseOrderDate(d['Ship Date']),
    shipMode: d['Ship Mode'] || '',
    customerId: d['Customer ID'] || '',
    customerName: d['Customer Name'] || '',
    segment: d.Segment || '',
    country: d.Country || '',
    city: d.City || '',
    state: d.State || '',
    postalCode: Number(d['Postal Code']) || 0,
    region: d.Region || '',
    productId: d['Product ID'] || '',
    category: d.Category || '',
    subCategory: d['Sub-Category'] || '',
    productName: d['Product Name'] || '',
    sales: Number(d.Sales) || 0,
    quantity: Number(d.Quantity) || 0,
    discount: Number(d.Discount) || 0,
    profit: Number(d.Profit) || 0,
  }));
}

/**
 * Aggregate sales by month for line chart
 */
export function aggregateSalesByMonth(data: SuperstoreOrder[]): TimeSeriesDataPoint[] {
  const grouped = rollup(
    data,
    (v: SuperstoreOrder[]) => sum(v, (d: SuperstoreOrder) => d.sales),
    (d: SuperstoreOrder) => timeMonth(d.orderDate).toISOString()
  );

  const result = Array.from(grouped, ([key, value]) => ({
    date: new Date(key),
    value,
  }));

  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Aggregate sales by category and sub-category for horizontal bar chart
 */
export function aggregateSalesByCategory(data: SuperstoreOrder[]): CategoryDataPoint[] {
  const grouped = rollup(
    data,
    (v: SuperstoreOrder[]) => sum(v, (d: SuperstoreOrder) => d.sales),
    (d: SuperstoreOrder) => d.category,
    (d: SuperstoreOrder) => d.subCategory
  );

  const result: CategoryDataPoint[] = [];

  grouped.forEach((subCategories, category) => {
    subCategories.forEach((value, subCategory) => {
      result.push({
        category,
        subCategory,
        value,
      });
    });
  });

  // Sort descending by value
  return result.sort((a, b) => b.value - a.value);
}

/**
 * Aggregate sales by year for yearly line chart
 */
export function aggregateSalesByYear(data: SuperstoreOrder[]): YearlyDataPoint[] {
  const grouped = rollup(
    data,
    (v: SuperstoreOrder[]) => sum(v, (d: SuperstoreOrder) => d.sales),
    (d: SuperstoreOrder) => timeYear(d.orderDate).toISOString()
  );

  const result = Array.from(grouped, ([key, value]) => ({
    year: new Date(key).getFullYear(),
    value,
  }));

  return result.sort((a, b) => a.year - b.year);
}

/**
 * Calculate total sales
 */
export function calculateTotalSales(data: SuperstoreOrder[]): number {
  return sum(data, (d: SuperstoreOrder) => d.sales);
}

/**
 * Calculate total profit
 */
export function calculateTotalProfit(data: SuperstoreOrder[]): number {
  return sum(data, (d: SuperstoreOrder) => d.profit);
}

/**
 * Calculate profit ratio
 */
export function calculateProfitRatio(data: SuperstoreOrder[]): number {
  const totalSales = calculateTotalSales(data);
  const totalProfit = calculateTotalProfit(data);
  return totalSales !== 0 ? totalProfit / totalSales : 0;
}
