import Papa from 'papaparse';
import type { OrderData } from '../types';

/**
 * Normalize CSV header names by stripping BOM, quotes, and extra whitespace
 * This handles dirty headers like '"Order Date"' or '  Order Date  '
 */
function normalizeHeaderName(header: string): string {
  // Remove BOM character
  let text = header.replace('\ufeff', '');

  // Strip outer matching quotes
  while (text.length >= 2) {
    const firstChar = text[0];
    const lastChar = text[text.length - 1];
    if ((firstChar === '"' || firstChar === "'") && firstChar === lastChar) {
      text = text.slice(1, -1);
    } else {
      break;
    }
  }

  // Normalize whitespace
  text = text.trim().replace(/\s+/g, ' ');

  return text;
}

/**
 * Map Region to Continent for cross-datasource compatibility
 * This derived field is used in highlight_bindings that reference multiple data sources
 */
function getContinentFromRegion(region: string): string {
  const continentMap: Record<string, string> = {
    'North America': 'North America',
    'Latam': 'South America',
    'EMEA': 'Europe',
    'AsiaPac': 'Asia',
    'Central': 'North America',
    'East': 'North America',
    'West': 'North America',
    'South': 'North America',
    'Canada': 'North America',
  };
  return continentMap[region] || 'Unknown';
}

/**
 * Normalize all headers in a parsed CSV result
 */
function normalizeHeaders(results: Papa.ParseResult<unknown>): Record<string, unknown>[] {
  if (!results.meta.fields) {
    return results.data as Record<string, unknown>[];
  }

  const fieldMap = new Map<string, string>();
  results.meta.fields.forEach((field) => {
    const normalized = normalizeHeaderName(field);
    fieldMap.set(field, normalized);
  });

  // Rename fields in each data row
  return (results.data as Record<string, unknown>[]).map(row => {
    const normalizedRow: Record<string, unknown> = {};
    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = fieldMap.get(key) || normalizeHeaderName(key);
      normalizedRow[normalizedKey] = value;
    });
    return normalizedRow;
  });
}

export async function loadOrdersData(): Promise<OrderData[]> {
  try {
    const response = await fetch('/data/Superstore Sales Training_Orders.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Normalize headers to handle BOM and quoted/dirty headers
          const normalizedData = normalizeHeaders(results as Papa.ParseResult<unknown>);

          // Ensure numeric fields are properly parsed and add derived Continent field
          const typedData: OrderData[] = normalizedData.map((row: Record<string, unknown>) => {
            const region = String(row.Region || '');
            return {
              ...row,
              'Row': Number(row['Row']) || 0,
              Sales: Number(row.Sales) || 0,
              Profit: Number(row.Profit) || 0,
              Discount: Number(row.Discount) || 0,
              'Unit Price': Number(row['Unit Price']) || 0,
              'Order Quantity': Number(row['Order Quantity']) || 0,
              'Shipping Cost': Number(row['Shipping Cost']) || 0,
              'Product Base Margin': Number(row['Product Base Margin']) || 0,
              'Order': Number(row.Order) || 0,
              'Customer': Number(row.Customer) || 0,
              'Postal Code': Number(row['Postal Code']) || 0,
              // Add derived Continent field for cross-datasource compatibility
              'Continent': getContinentFromRegion(region),
            } as OrderData;
          });

          resolve(typedData);
        },
        error: (error: unknown) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading orders data:', error);
    throw error;
  }
}
