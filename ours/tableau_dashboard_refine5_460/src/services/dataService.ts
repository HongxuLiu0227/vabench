import { csvParse } from 'd3-dsv';
import type {
  SuperstoreOrder,
  SalesByDate,
  SalesByYear,
  SalesBySubCategory,
  SalesProfitPoint,
} from '../types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Normalize CSV header by removing BOM, quotes, and extra whitespace
 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^\ufeff/, '') // Remove BOM (Byte Order Mark)
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .trim();
}

/**
 * Safe number conversion that handles empty strings, null, and invalid values
 */
function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safe string conversion that handles null and undefined
 */
function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * Validate that a date string is in YYYY-MM-DD format and can be parsed
 */
function validateDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }
  // Check for YYYY-MM-DD format
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(dateStr)) {
    return false;
  }
  // Try to parse and validate it's a real date
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
}

/**
 * Create a normalized row object with cleaned headers
 */
function normalizeRow(rawRow: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawRow)) {
    const normalizedKey = normalizeHeader(key);
    normalized[normalizedKey] = value;
  }
  return normalized;
}

/**
 * Fetch and parse the CSV data with robust error handling and validation
 */
export async function fetchCsvData(): Promise<SuperstoreOrder[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  // Check if CSV is empty
  if (!csvText || csvText.trim().length === 0) {
    throw new Error('CSV file is empty');
  }

  let rawData;
  try {
    rawData = csvParse(csvText);
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Check if parsing returned any data
  if (!rawData || rawData.length === 0) {
    throw new Error('CSV parsing returned no data');
  }

  // Transform and type the data with validation
  const processedData: SuperstoreOrder[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = normalizeRow(rawData[i]);

      // Validate date fields
      const orderDate = safeString(row['Order Date']);
      const shipDate = safeString(row['Ship Date']);

      if (!validateDateString(orderDate)) {
        errors.push(`Row ${i + 2}: Invalid Order Date "${orderDate}"`);
        continue; // Skip rows with invalid dates
      }

      // Extract and validate numeric fields
      const sales = safeNumber(row['Sales'], 0);
      const quantity = safeNumber(row['Quantity'], 0);
      const discount = safeNumber(row['Discount'], 0);
      const profit = safeNumber(row['Profit'], 0);
      const postalCode = safeNumber(row['Postal Code'], 0);
      const rowId = safeNumber(row['Row ID'], 0);

      // Validate that numeric fields are not NaN
      if (isNaN(sales) || isNaN(quantity) || isNaN(discount) || isNaN(profit)) {
        errors.push(`Row ${i + 2}: NaN values detected in numeric fields`);
        continue;
      }

      processedData.push({
        'Row ID': rowId,
        'Order ID': safeString(row['Order ID']),
        'Order Date': orderDate,
        'Ship Date': shipDate,
        'Ship Mode': safeString(row['Ship Mode']),
        'Customer ID': safeString(row['Customer ID']),
        'Customer Name': safeString(row['Customer Name']),
        'Segment': safeString(row['Segment']),
        'Country': safeString(row['Country']),
        'City': safeString(row['City']),
        'State': safeString(row['State']),
        'Postal Code': postalCode,
        'Region': safeString(row['Region']),
        'Product ID': safeString(row['Product ID']),
        'Category': safeString(row['Category']),
        'Sub-Category': safeString(row['Sub-Category']),
        'Product Name': safeString(row['Product Name']),
        'Sales': sales,
        'Quantity': quantity,
        'Discount': discount,
        'Profit': profit,
      });
    } catch (error) {
      errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Log warnings if any rows were skipped
  if (errors.length > 0) {
    console.warn(`Data processing completed with ${errors.length} error(s):`);
    console.warn(errors.slice(0, 10).join('\n')); // Log first 10 errors
    if (errors.length > 10) {
      console.warn(`... and ${errors.length - 10} more errors`);
    }
  }

  if (processedData.length === 0) {
    throw new Error('No valid data rows found after processing');
  }

  console.log(`Successfully loaded ${processedData.length} rows from CSV`);

  return processedData;
}

/**
 * Aggregate sales by month for line chart
 */
export function aggregateSalesByMonth(data: SuperstoreOrder[]): SalesByDate[] {
  const salesByMonth = new Map<string, number>();

  data.forEach((row) => {
    try {
      const date = new Date(row['Order Date']);

      // Validate the date is valid
      if (isNaN(date.getTime()) || date.getFullYear() < 1900 || date.getFullYear() > 2100) {
        console.warn(`Invalid date in aggregateSalesByMonth: ${row['Order Date']}`);
        return;
      }

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const currentSales = salesByMonth.get(monthKey) || 0;

      // Validate sales is a number
      const sales = typeof row.Sales === 'number' && !isNaN(row.Sales) ? row.Sales : 0;
      salesByMonth.set(monthKey, currentSales + sales);
    } catch (error) {
      console.warn(`Error processing row in aggregateSalesByMonth:`, error);
    }
  });

  const result = Array.from(salesByMonth.entries())
    .map(([monthKey, sales]) => ({
      date: new Date(`${monthKey}-01`),
      sales,
    }))
    .filter(item => !isNaN(item.date.getTime())) // Filter out invalid dates
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  console.log(`Aggregated ${result.length} months of sales data`);
  return result;
}

/**
 * Aggregate sales by year for yearly line chart
 */
export function aggregateSalesByYear(data: SuperstoreOrder[]): SalesByYear[] {
  const salesByYear = new Map<number, number>();

  data.forEach((row) => {
    try {
      const date = new Date(row['Order Date']);

      // Validate the date is valid
      if (isNaN(date.getTime()) || date.getFullYear() < 1900 || date.getFullYear() > 2100) {
        console.warn(`Invalid date in aggregateSalesByYear: ${row['Order Date']}`);
        return;
      }

      const year = date.getFullYear();
      const currentSales = salesByYear.get(year) || 0;

      // Validate sales is a number
      const sales = typeof row.Sales === 'number' && !isNaN(row.Sales) ? row.Sales : 0;
      salesByYear.set(year, currentSales + sales);
    } catch (error) {
      console.warn(`Error processing row in aggregateSalesByYear:`, error);
    }
  });

  const result = Array.from(salesByYear.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);

  console.log(`Aggregated ${result.length} years of sales data`);
  return result;
}

/**
 * Aggregate sales by sub-category for horizontal bar chart
 */
export function aggregateSalesBySubCategory(data: SuperstoreOrder[]): SalesBySubCategory[] {
  const salesBySubCategory = new Map<string, number>();

  data.forEach((row) => {
    try {
      const subCategory = row['Sub-Category'];

      // Skip empty sub-categories
      if (!subCategory || subCategory.trim() === '') {
        return;
      }

      const currentSales = salesBySubCategory.get(subCategory) || 0;

      // Validate sales is a number
      const sales = typeof row.Sales === 'number' && !isNaN(row.Sales) ? row.Sales : 0;
      salesBySubCategory.set(subCategory, currentSales + sales);
    } catch (error) {
      console.warn(`Error processing row in aggregateSalesBySubCategory:`, error);
    }
  });

  const result = Array.from(salesBySubCategory.entries())
    .map(([subCategory, sales]) => ({ subCategory, sales }))
    .filter(item => item.sales > 0) // Filter out zero sales
    .sort((a, b) => b.sales - a.sales); // Sort descending by sales

  console.log(`Aggregated ${result.length} sub-categories with sales`);
  return result;
}

/**
 * Prepare data for scatterplot (Sales vs Profit by Product)
 */
export function prepareScatterplotData(data: SuperstoreOrder[]): SalesProfitPoint[] {
  const salesProfitByProduct = new Map<string, { sales: number; profit: number; quantity: number }>();

  data.forEach((row) => {
    try {
      const productName = row['Product Name'];

      // Skip empty product names
      if (!productName || productName.trim() === '') {
        return;
      }

      const current = salesProfitByProduct.get(productName) || { sales: 0, profit: 0, quantity: 0 };

      // Validate numeric fields
      const sales = typeof row.Sales === 'number' && !isNaN(row.Sales) ? row.Sales : 0;
      const profit = typeof row.Profit === 'number' && !isNaN(row.Profit) ? row.Profit : 0;
      const quantity = typeof row.Quantity === 'number' && !isNaN(row.Quantity) ? row.Quantity : 0;

      salesProfitByProduct.set(productName, {
        sales: current.sales + sales,
        profit: current.profit + profit,
        quantity: current.quantity + quantity,
      });
    } catch (error) {
      console.warn(`Error processing row in prepareScatterplotData:`, error);
    }
  });

  const result = Array.from(salesProfitByProduct.entries())
    .map(([productName, { sales, profit, quantity }]) => ({
      sales,
      profit,
      productName,
      quantity,
    }))
    .filter(point => !isNaN(point.sales) && !isNaN(point.profit)); // Filter out invalid points

  console.log(`Prepared ${result.length} product data points for scatterplot`);
  return result;
}
