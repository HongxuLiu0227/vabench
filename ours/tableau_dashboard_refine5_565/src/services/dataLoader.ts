import Papa from 'papaparse';
import type { OrderRecord, AggregatedSalesByCategory, SalesByYear, SalesByDate, ScatterPoint } from '../types/data';

const DATA_URL = '/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv';

let cachedData: OrderRecord[] | null = null;

/**
 * Normalize header names by removing:
 * - BOM markers (byte order mark)
 * - Quotes ("...")
 * - Extra whitespace
 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM
    .replace(/^"(.*)"$/, '$1') // Remove surrounding quotes
    .replace(/^"|"$/g, '') // Remove leading/trailing quotes
    .trim();
}

/**
 * Parse date string in format "YYYY-MM-DD HH:MM:SS"
 */
function parseDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === '') return new Date();
  const parts = dateStr.split(' ')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  return new Date();
}

/**
 * Safely convert string to number, returning 0 for invalid values
 */
function safeNumber(value: string): number {
  if (!value || value.trim() === '') return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Find a column value by trying multiple possible header names
 * (handles variations in CSV formatting)
 */
function getColumn(row: Record<string, string>, possibleNames: string[]): string {
  const normalizedKeys = Object.keys(row).reduce((acc, key) => {
    acc[normalizeHeader(key)] = key;
    return acc;
  }, {} as Record<string, string>);

  for (const name of possibleNames) {
    const normalized = normalizeHeader(name);
    if (normalizedKeys[normalized]) {
      return row[normalizedKeys[normalized]] || '';
    }
  }
  return '';
}

/**
 * Parse CSV row with explicit column mapping based on actual CSV headers
 * CSV columns: Row ID, Order ID, Order Date, Ship Date, Ship Mode, Customer ID,
 * Customer Name, Segment, "City, State", Country, Postal Code, Market, Region,
 * Product ID, Category, Sub-Category, Product Name, Sales, Quantity, Discount,
 * Profit, Shipping Cost, Order Priority
 */
function parseCsvRow(row: Record<string, string>): OrderRecord {
  return {
    rowId: safeNumber(getColumn(row, ['Row ID', 'Row ID'])),
    orderId: getColumn(row, ['Order ID']),
    orderDate: parseDate(getColumn(row, ['Order Date'])),
    shipDate: parseDate(getColumn(row, ['Ship Date'])),
    shipMode: getColumn(row, ['Ship Mode']),
    customerId: getColumn(row, ['Customer ID']),
    customerName: getColumn(row, ['Customer Name']),
    segment: getColumn(row, ['Segment']),
    city: getColumn(row, ['City, State', 'City']),
    country: getColumn(row, ['Country']),
    postalCode: getColumn(row, ['Postal Code']),
    region: getColumn(row, ['Market']), // Market maps to region
    subRegion: getColumn(row, ['Region']), // Region maps to subRegion
    productId: getColumn(row, ['Product ID']),
    category: getColumn(row, ['Category']),
    subCategory: getColumn(row, ['Sub-Category']),
    productName: getColumn(row, ['Product Name']),
    sales: safeNumber(getColumn(row, ['Sales'])),
    quantity: safeNumber(getColumn(row, ['Quantity'])),
    discount: safeNumber(getColumn(row, ['Discount'])),
    profit: safeNumber(getColumn(row, ['Profit'])),
    unknown1: getColumn(row, ['Shipping Cost']), // Shipping Cost
    priority: getColumn(row, ['Order Priority']),
  };
}

/**
 * Find the header row index in CSV text
 * Returns the line number where the actual data header starts
 */
function findHeaderRowIndex(lines: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Check if this line contains the actual column headers
    // The header line should start with "Row ID,Order ID,Order Date"
    if (line.startsWith('Row ID,Order ID,Order Date') ||
        line.startsWith('"Row ID","Order ID","Order Date"')) {
      return i;
    }
  }
  // Default to row 4 (5th line) if not found
  return 4;
}

/**
 * Load and parse CSV data with proper preamble handling
 */
export async function loadData(): Promise<OrderRecord[]> {
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise<OrderRecord[]>((resolve, reject) => {
    try {
      // Split into lines and find the actual header row
      const lines = csvText.split(/\r?\n/);
      const headerRowIndex = findHeaderRowIndex(lines);

      if (headerRowIndex >= lines.length) {
        reject(new Error('Could not find header row in CSV'));
        return;
      }

      // Extract the CSV content starting from the header row
      const csvContent = lines.slice(headerRowIndex).join('\n');

      // Parse with PapaParse using the correct header row
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = (results.data as Record<string, string>[])
              .filter((row) => {
                // Skip empty rows
                const keys = Object.keys(row);
                if (keys.length === 0) return false;

                const firstCol = row[keys[0]] || '';
                if (!firstCol || firstCol.trim() === '') return false;

                // Keep only rows with numeric Row ID
                return /^[0-9]+$/.test(firstCol.trim());
              })
              .map((row) => parseCsvRow(row));

            if (data.length === 0) {
              console.error('No data rows found after parsing. Total rows:', results.data.length);
              reject(new Error('No valid data rows found in CSV'));
              return;
            }

            console.log(`Successfully loaded ${data.length} rows from CSV (skipped ${headerRowIndex} preamble rows)`);
            cachedData = data;
            resolve(data);
          } catch (error) {
            console.error('Error parsing CSV data:', error);
            reject(error);
          }
        },
        error: (error: Error) => {
          console.error('PapaParse error:', error);
          reject(error);
        },
      });
    } catch (error) {
      console.error('Error processing CSV:', error);
      reject(error);
    }
  });
}

export async function getScatterPlotData(): Promise<ScatterPoint[]> {
  const data = await loadData();

  // Group by Product Name for the scatter plot
  const productMap = new Map<string, ScatterPoint>();

  data.forEach((record) => {
    const key = record.productName;
    const existing = productMap.get(key);

    if (existing) {
      existing.sales += record.sales;
      existing.profit += record.profit;
      existing.quantity += record.quantity;
    } else {
      productMap.set(key, {
        sales: record.sales,
        profit: record.profit,
        quantity: record.quantity,
        productName: record.productName,
      });
    }
  });

  return Array.from(productMap.values());
}

export async function getBarChartData(): Promise<AggregatedSalesByCategory[]> {
  const data = await loadData();

  // Group by Category and Sub-Category
  const categoryMap = new Map<string, AggregatedSalesByCategory>();

  data.forEach((record) => {
    const key = `${record.category}|${record.subCategory}`;
    const existing = categoryMap.get(key);

    if (existing) {
      existing.sales += record.sales;
    } else {
      categoryMap.set(key, {
        category: record.category,
        subCategory: record.subCategory,
        sales: record.sales,
      });
    }
  });

  // Sort by sales descending
  return Array.from(categoryMap.values()).sort((a, b) => b.sales - a.sales);
}

export async function getSalesByYearData(): Promise<SalesByYear[]> {
  const data = await loadData();

  // Group by year
  const yearMap = new Map<number, number>();

  data.forEach((record) => {
    const year = record.orderDate.getFullYear();
    const existing = yearMap.get(year) || 0;
    yearMap.set(year, existing + record.sales);
  });

  // Convert to array and sort by year
  const result = Array.from(yearMap.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);

  return result;
}

export async function getSalesByDateData(): Promise<SalesByDate[]> {
  const data = await loadData();

  // Group by date (day)
  const dateMap = new Map<string, number>();

  data.forEach((record) => {
    const dateKey = record.orderDate.toISOString().split('T')[0];
    const existing = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, existing + record.sales);
  });

  // Convert to array and sort by date
  const result = Array.from(dateMap.entries())
    .map(([dateStr, sales]) => ({ date: new Date(dateStr), sales }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return result;
}
