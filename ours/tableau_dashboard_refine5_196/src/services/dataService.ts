import Papa from 'papaparse';
import type { OrderData, ScatterDataPoint, LineDataPoint, YearlySalesDataPoint } from '../types';

const DATA_URL = '/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv';

/**
 * Normalize CSV headers by removing quotes, extra whitespace, and BOM
 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^[\uFEFF]+/, '') // Remove BOM
    .replace(/^["']+|["']+$/g, '') // Remove surrounding quotes
    .trim();
}

/**
 * Detect and skip preamble rows to find the actual CSV header
 * Returns the index of the header row (line number starting from 0)
 */
function findHeaderRowIndex(lines: string[]): number {
  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    // Parse the line to check if it contains expected column headers
    const columns = line.split(',').map(col => normalizeHeader(col));

    // Check if this looks like the header by looking for known required fields
    const hasRowId = columns.some(col =>
      col.toLowerCase().includes('row id') || col === 'Row ID'
    );
    const hasOrderId = columns.some(col =>
      col.toLowerCase().includes('order id') || col === 'Order ID'
    );
    const hasOrderDate = columns.some(col =>
      col.toLowerCase().includes('order date') || col === 'Order Date'
    );
    const hasSales = columns.some(col =>
      col.toLowerCase().includes('sales') || col === 'Sales'
    );

    // If we find multiple expected fields, this is likely the header
    if (hasRowId && hasOrderId && hasOrderDate && hasSales) {
      return i;
    }
  }

  // Fallback: if no header found, assume it's at line 0
  console.warn('Could not detect header row, assuming line 0');
  return 0;
}

/**
 * Load and parse the CSV data file with robust preamble detection
 */
export async function loadCsvData(): Promise<OrderData[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const csvText = await response.text();

  // Split into lines and detect header row
  const lines = csvText.split(/\r?\n/);
  const headerRowIndex = findHeaderRowIndex(lines);

  if (headerRowIndex > 0) {
    console.log(`Detected CSV preamble: skipping ${headerRowIndex} rows, header at line ${headerRowIndex}`);
  }

  // Extract only the data portion (from header onwards)
  const dataLines = lines.slice(headerRowIndex);
  const cleanCsvText = dataLines.join('\n');

  return new Promise((resolve, reject) => {
    Papa.parse<OrderData>(cleanCsvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        // Validate that we got the expected columns
        if (results.data.length === 0) {
          reject(new Error('No data rows found in CSV'));
          return;
        }

        // Verify first row has expected fields
        const firstRow = results.data[0];
        const hasRowId = 'Row ID' in firstRow || 'row id' in firstRow;
        const hasSales = 'Sales' in firstRow || 'sales' in firstRow;

        if (!hasRowId || !hasSales) {
          console.warn('Parsed data may be missing expected fields. First row keys:', Object.keys(firstRow));
        }

        // Ensure all numeric fields are properly typed
        const typedData = results.data.map((row) => {
          const typedRow: Record<string, string | number> = {};
          for (const [key, value] of Object.entries(row)) {
            // Try to convert to number for known numeric fields
            if (['Sales', 'Quantity', 'Discount', 'Profit', 'Shipping Cost', 'Postal Code', 'Row ID'].includes(key)) {
              typedRow[key] = typeof value === 'number' ? value : parseFloat(value as string) || 0;
            } else {
              typedRow[key] = value as string;
            }
          }
          return typedRow as unknown as OrderData;
        });

        resolve(typedData);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

/**
 * Get field value from row with case-insensitive fallback
 */
function getFieldValue(row: OrderData, fieldName: string): string | number | undefined {
  if (fieldName in row) return row[fieldName as keyof OrderData];

  // Try case-insensitive lookup
  const lowerFieldName = fieldName.toLowerCase();
  const key = Object.keys(row).find(k => k.toLowerCase() === lowerFieldName);
  return key ? row[key as keyof OrderData] : undefined;
}

/**
 * Parse numeric values safely
 */
export function parseNumeric(value: string | number | undefined | null): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Transform data for scatterplot visualization
 */
export function transformScatterData(data: OrderData[]): ScatterDataPoint[] {
  return data
    .filter((row) => {
      const sales = getFieldValue(row, 'Sales');
      const profit = getFieldValue(row, 'Profit');
      return sales !== undefined && profit !== undefined;
    })
    .map((row) => ({
      sales: parseNumeric(getFieldValue(row, 'Sales')),
      profit: parseNumeric(getFieldValue(row, 'Profit')),
      quantity: parseNumeric(getFieldValue(row, 'Quantity')),
      productName: String(getFieldValue(row, 'Product Name') || ''),
      orderId: String(getFieldValue(row, 'Order ID') || ''),
    }));
}

/**
 * Transform and aggregate data for line chart by month
 */
export function transformLineData(data: OrderData[]): LineDataPoint[] {
  const monthlySales = new Map<string, number>();

  data.forEach((row) => {
    const orderDate = getFieldValue(row, 'Order Date');
    const sales = getFieldValue(row, 'Sales');

    if (orderDate && sales) {
      let date: Date;
      // Check if orderDate is already a Date object
      if (Object.prototype.toString.call(orderDate) === '[object Date]') {
        date = orderDate as unknown as Date;
      } else {
        date = new Date(String(orderDate));
      }

      // Validate date
      if (!isNaN(date.getTime())) {
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const salesValue = parseNumeric(sales);
        monthlySales.set(monthYear, (monthlySales.get(monthYear) || 0) + salesValue);
      }
    }
  });

  return Array.from(monthlySales.entries())
    .map(([monthYear, sales]) => {
      const [year, month] = monthYear.split('-').map(Number);
      return {
        date: new Date(year, month - 1, 1),
        monthYear,
        sales,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Transform and aggregate data for yearly sales
 */
export function transformYearlySalesData(data: OrderData[]): YearlySalesDataPoint[] {
  const yearlySales = new Map<number, number>();

  data.forEach((row) => {
    const orderDate = getFieldValue(row, 'Order Date');
    const sales = getFieldValue(row, 'Sales');

    if (orderDate && sales) {
      let date: Date;
      // Check if orderDate is already a Date object
      if (Object.prototype.toString.call(orderDate) === '[object Date]') {
        date = orderDate as unknown as Date;
      } else {
        date = new Date(String(orderDate));
      }

      // Validate date
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const salesValue = parseNumeric(sales);
        yearlySales.set(year, (yearlySales.get(year) || 0) + salesValue);
      }
    }
  });

  return Array.from(yearlySales.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}
