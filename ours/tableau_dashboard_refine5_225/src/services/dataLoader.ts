import Papa from 'papaparse';
import type { ParsedSuperstoreRow, SalesByMonth, SalesByYear, SalesBySubCategory, SalesByProduct } from '../types';

const DATA_URL = '/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv';

/**
 * Mapping from Tableau field references to actual CSV column names
 * Tableau uses format: [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[field_type:FieldName:aggregation]
 */
const TABLEAU_FIELD_MAPPING: Record<string, string> = {
  'sum:Sales:qk': 'Sales',
  'sum:Profit:qk': 'Profit',
  'sum:Quantity:qk': 'Quantity',
  'tmn:Order Date:qk': 'Order Date',
  'tmn:Order Date:ok': 'Order Date',
  'yr:Order Date:ok': 'Order Date',
  'none:Sub-Category:nk': 'Sub-Category',
  'none:Product Name:nk': 'Product Name',
  'none:Order Date:nk': 'Order Date',
};

/**
 * Required fields that must exist in the CSV for the dashboard to function
 */
const REQUIRED_FIELDS = [
  'Order Date',
  'Ship Date',
  'Sales',
  'Profit',
  'Quantity',
  'Discount',
  'Sub-Category',
  'Product Name'
];

/**
 * Removes UTF-8 BOM and normalizes whitespace from a string
 */
function normalizeHeaderValue(value: string): string {
  // Remove UTF-8 BOM if present
  let cleaned = value.replace(/^\uFEFF/, '');
  // Remove quotes if the entire value is wrapped in them
  cleaned = cleaned.replace(/^"(.*)"$/, '$1');
  // Remove extra whitespace
  cleaned = cleaned.trim();
  return cleaned;
}

/**
 * Parses Tableau field reference and returns the CSV column name
 * Example: [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk] -> Sales
 */
export function resolveTableauField(tableauField: string): string {
  // Extract the field part between the last pair of brackets
  const match = tableauField.match(/\[([^\]]+)\]$/);
  if (!match) {
    throw new Error(`Invalid Tableau field format: ${tableauField}`);
  }

  const fieldRef = match[1];

  // Look up the field in our mapping
  const csvColumn = TABLEAU_FIELD_MAPPING[fieldRef];
  if (!csvColumn) {
    console.warn(`No mapping found for Tableau field: ${fieldRef}, using as-is`);
    // If the field reference contains a colon, extract just the field name
    const parts = fieldRef.split(':');
    return parts.length > 1 ? parts[1] : fieldRef;
  }

  return csvColumn;
}

/**
 * Validates that required fields exist in the parsed data
 */
function validateRequiredFields(data: Array<Record<string, unknown>>, headers: string[]): void {
  if (data.length === 0) {
    throw new Error('CSV file is empty or could not be parsed');
  }

  const missingFields: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    // Check if field exists in headers (case-insensitive)
    const headerExists = headers.some(h => h.toLowerCase() === field.toLowerCase());
    if (!headerExists) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV: ${missingFields.join(', ')}. ` +
      `Available fields: ${headers.join(', ')}`
    );
  }
}

/**
 * Safe date parser that handles multiple date formats
 */
function parseSafeDate(dateValue: unknown, fieldName: string): Date {
  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  console.warn(`Failed to parse ${fieldName}: ${dateValue}, using current date as fallback`);
  return new Date();
}

/**
 * Safe number parser that returns 0 for invalid values
 */
function parseSafeNumber(value: unknown, fieldName: string): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  console.warn(`Failed to parse ${fieldName}: ${value}, using 0 as fallback`);
  return 0;
}

/**
 * Loads and parses the CSV data with robust error handling and validation
 */
export async function loadData(): Promise<ParsedSuperstoreRow[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  let csvText = await response.text();

  // Remove UTF-8 BOM if present at the start of the file
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeaderValue,
      complete: (results) => {
        try {
          // Get normalized headers
          const headers = results.meta.fields || [];

          // Validate required fields exist
          validateRequiredFields(results.data as Array<Record<string, unknown>>, headers);

          // Create a case-insensitive field lookup
          const fieldMap = new Map<string, string>();
          headers.forEach(h => {
            fieldMap.set(h.toLowerCase(), h);
          });

          // Helper to get field value with case-insensitive lookup
          const getFieldValue = (row: Record<string, unknown>, fieldName: string): unknown => {
            const actualFieldName = fieldMap.get(fieldName.toLowerCase());
            if (!actualFieldName) {
              console.warn(`Field ${fieldName} not found in row`);
              return undefined;
            }
            return row[actualFieldName];
          };

          const parsedData = (results.data as Array<Record<string, unknown>>).map((row, index) => {
            try {
              return {
                'Category': String(getFieldValue(row, 'Category') || ''),
                'City': String(getFieldValue(row, 'City') || ''),
                'Country': String(getFieldValue(row, 'Country') || ''),
                'Customer Name': String(getFieldValue(row, 'Customer Name') || ''),
                'Manufacturer': String(getFieldValue(row, 'Manufacturer') || ''),
                'Order Date': parseSafeDate(getFieldValue(row, 'Order Date'), 'Order Date'),
                'Order ID': String(getFieldValue(row, 'Order ID') || ''),
                'Postal Code': String(getFieldValue(row, 'Postal Code') || ''),
                'Product Name': String(getFieldValue(row, 'Product Name') || ''),
                'Region': String(getFieldValue(row, 'Region') || ''),
                'Segment': String(getFieldValue(row, 'Segment') || ''),
                'Ship Date': parseSafeDate(getFieldValue(row, 'Ship Date'), 'Ship Date'),
                'Ship Mode': String(getFieldValue(row, 'Ship Mode') || ''),
                'State': String(getFieldValue(row, 'State') || ''),
                'Sub-Category': String(getFieldValue(row, 'Sub-Category') || ''),
                'Discount': parseSafeNumber(getFieldValue(row, 'Discount'), 'Discount'),
                'Number of Records': parseSafeNumber(getFieldValue(row, 'Number of Records'), 'Number of Records'),
                'Profit': parseSafeNumber(getFieldValue(row, 'Profit'), 'Profit'),
                'Profit Ratio': parseSafeNumber(getFieldValue(row, 'Profit Ratio'), 'Profit Ratio'),
                'Quantity': parseSafeNumber(getFieldValue(row, 'Quantity'), 'Quantity'),
                'Sales': parseSafeNumber(getFieldValue(row, 'Sales'), 'Sales'),
              } as ParsedSuperstoreRow;
            } catch (error) {
              console.error(`Error parsing row ${index}:`, error);
              throw new Error(`Failed to parse row ${index}: ${error}`);
            }
          });

          console.log(`Successfully loaded ${parsedData.length} rows`);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (err: Error) => {
        reject(new Error(`CSV parsing error: ${err.message}`));
      }
    });
  });
}

export function aggregateSalesByMonth(data: ParsedSuperstoreRow[]): SalesByMonth[] {
  const monthlyMap = new Map<string, number>();

  data.forEach(row => {
    const date = row['Order Date'];
    if (!(date instanceof Date) || isNaN(date.getTime())) return;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + row.Sales);
  });

  return Array.from(monthlyMap.entries())
    .map(([month, sales]) => ({
      month: new Date(month + '-01'),
      sales
    }))
    .sort((a, b) => a.month.getTime() - b.month.getTime());
}

export function aggregateSalesByYear(data: ParsedSuperstoreRow[]): SalesByYear[] {
  const yearlyMap = new Map<number, number>();

  data.forEach(row => {
    const date = row['Order Date'];
    if (!(date instanceof Date) || isNaN(date.getTime())) return;

    const year = date.getFullYear();
    yearlyMap.set(year, (yearlyMap.get(year) || 0) + row.Sales);
  });

  return Array.from(yearlyMap.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}

export function aggregateSalesBySubCategory(data: ParsedSuperstoreRow[]): SalesBySubCategory[] {
  const subCategoryMap = new Map<string, number>();

  data.forEach(row => {
    const subCategory = row['Sub-Category'];
    subCategoryMap.set(subCategory, (subCategoryMap.get(subCategory) || 0) + row.Sales);
  });

  return Array.from(subCategoryMap.entries())
    .map(([subCategory, sales]) => ({ subCategory, sales }))
    .sort((a, b) => b.sales - a.sales); // Sort descending by sales
}

export function aggregateSalesByProduct(data: ParsedSuperstoreRow[]): SalesByProduct[] {
  const productMap = new Map<string, { sales: number; profit: number; quantity: number }>();

  data.forEach(row => {
    const productName = row['Product Name'];
    const current = productMap.get(productName) || { sales: 0, profit: 0, quantity: 0 };
    productMap.set(productName, {
      sales: current.sales + row.Sales,
      profit: current.profit + row.Profit,
      quantity: current.quantity + row.Quantity
    });
  });

  return Array.from(productMap.entries())
    .map(([productName, { sales, profit, quantity }]) => ({
      productName,
      sales,
      profit,
      quantity
    }));
}
