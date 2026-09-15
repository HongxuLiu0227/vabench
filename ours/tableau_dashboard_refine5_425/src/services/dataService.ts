import { csvParse } from 'd3-dsv';
import type {
  OrderData,
  SalesByTime,
  RegionMetrics,
  FilterState,
} from '../types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Strip BOM (Byte Order Mark) from text
 */
function stripBOM(text: string): string {
  // UTF-8 BOM is \uFEFF
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

/**
 * Normalize CSV headers by removing extra quotes, whitespace, and BOM
 */
function normalizeHeaders(headers: string[]): Record<string, string> {
  const normalized: Record<string, string> = {};
  headers.forEach(header => {
    // Remove quotes, extra whitespace, and BOM
    const clean = header
      .replace(/^[\uFEFF"\s]+/, '')  // Remove leading BOM, quotes, whitespace
      .replace(/["\s]+$/, '');        // Remove trailing quotes and whitespace
    normalized[header] = clean;
  });
  return normalized;
}

/**
 * Parse date string safely, returning null for invalid dates
 * Prevents "Jan 1970" (Unix epoch) dates from invalid parsing
 */
function parseDateSafe(dateStr: string | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  // Try parsing the date
  const date = new Date(dateStr);

  // Check if date is valid (not NaN)
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string: "${dateStr}"`);
    return null;
  }

  // Check for suspicious dates (e.g., Unix epoch)
  if (date.getFullYear() === 1970 && date.getMonth() === 0 && date.getDate() === 1) {
    const originalYear = dateStr.match(/(\d{4})/)?.[1];
    if (originalYear && originalYear !== '1970') {
      console.warn(`Date parsing mismatch - input: "${dateStr}", parsed: ${date.toISOString()}`);
      return null;
    }
  }

  return date;
}

/**
 * Load data from CSV file with robust parsing and validation
 */
export async function loadData(): Promise<OrderData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let csvText = await response.text();

    // Strip BOM to prevent header parsing issues
    csvText = stripBOM(csvText);

    const rawData = csvParse(csvText);

    if (rawData.length === 0) {
      throw new Error('CSV file is empty or could not be parsed');
    }

    // Normalize headers to handle quoted/dirty column names
    const headers = Object.keys(rawData[0]);
    const headerMap = normalizeHeaders(headers);

    // Track parsing statistics
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const parsedData = rawData.map((row, index) => {
      try {
        // Use normalized headers for field lookups
        const getField = (fieldName: string) => {
          // Try exact match first
          if (row[fieldName] !== undefined) return row[fieldName];

          // Try finding normalized header
          for (const [rawHeader, normalizedHeader] of Object.entries(headerMap)) {
            if (normalizedHeader === fieldName && row[rawHeader] !== undefined) {
              return row[rawHeader];
            }
          }

          return undefined;
        };

        // Parse and validate dates
        const orderDateStr = getField('Order Date');
        const shipDateStr = getField('Ship Date');
        const orderDate = parseDateSafe(orderDateStr);
        const shipDate = parseDateSafe(shipDateStr);

        if (!orderDate) {
          throw new Error(`Invalid Order Date: "${orderDateStr}"`);
        }
        if (!shipDate) {
          throw new Error(`Invalid Ship Date: "${shipDateStr}"`);
        }

        // Validate required fields exist
        const region = getField('Region') || '';
        const sales = parseNumericField(getField('Sales'));
        const profit = parseNumericField(getField('Profit'));

        const parsed = {
          rowId: Number(getField('Row ID')) || 0,
          orderId: getField('Order ID') || '',
          orderDate,
          shipDate,
          shipMode: getField('Ship Mode') || '',
          customerId: getField('Customer ID') || '',
          customerName: getField('Customer Name') || '',
          segment: getField('Segment') || '',
          country: getField('Country') || '',
          city: getField('City') || '',
          state: getField('State') || '',
          postalCode: Number(getField('Postal Code')) || 0,
          region,
          productId: getField('Product ID') || '',
          category: getField('Category') || '',
          subCategory: getField('Sub-Category') || '',
          productName: getField('Product Name') || '',
          sales,
          quantity: Number(getField('Quantity')) || 0,
          discount: Number(getField('Discount')) || 0,
          profit,
        };

        successCount++;
        return parsed;
      } catch (err) {
        errorCount++;
        const errorMsg = `Row ${index + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        errors.push(errorMsg);

        // Return a minimal valid record to prevent downstream failures
        // but with zero values to indicate parsing issues
        return {
          rowId: index,
          orderId: `ERROR_${index}`,
          orderDate: new Date(1970, 0, 1), // Fallback to epoch for errors
          shipDate: new Date(1970, 0, 1),
          shipMode: '',
          customerId: '',
          customerName: '',
          segment: '',
          country: '',
          city: '',
          state: '',
          postalCode: 0,
          region: '',
          productId: '',
          category: '',
          subCategory: '',
          productName: '',
          sales: 0,
          quantity: 0,
          discount: 0,
          profit: 0,
        };
      }
    });

    // Log parsing statistics
    console.log(`Data loading complete: ${successCount} successful, ${errorCount} errors`);

    if (errors.length > 0 && errors.length <= 10) {
      console.warn('Parsing errors:', errors);
    } else if (errors.length > 10) {
      console.warn(`First 10 parsing errors:`, errors.slice(0, 10));
      console.warn(`... and ${errors.length - 10} more errors`);
    }

    // Validate data quality
    validateDataQuality(parsedData);

    return parsedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

/**
 * Validate data quality after parsing
 * Detects common issues that lead to all-zero charts, NaN filters, or Jan 1970 timelines
 */
function validateDataQuality(data: OrderData[]): void {
  if (data.length === 0) {
    throw new Error('Data validation failed: No data loaded');
  }

  // Check for all-zero metrics (indicates parsing failure)
  const totalSales = data.reduce((sum, row) => sum + Number(row.sales), 0);
  const totalProfit = data.reduce((sum, row) => sum + Number(row.profit), 0);
  const totalQuantity = data.reduce((sum, row) => sum + Number(row.quantity), 0);

  if (totalSales === 0) {
    console.error('Validation WARNING: All sales values are zero - possible parsing failure');
  }
  if (totalProfit === 0 && data.some(row => row.profit !== 0)) {
    console.warn('Validation NOTE: Total profit is zero (may be legitimate)');
  }
  if (totalQuantity === 0) {
    console.error('Validation WARNING: All quantity values are zero - possible parsing failure');
  }

  // Check for Jan 1970 dates (Unix epoch - indicates invalid date parsing)
  const epochDateCount = data.filter(row => {
    return row.orderDate.getFullYear() === 1970 &&
           row.orderDate.getMonth() === 0 &&
           row.orderDate.getDate() === 1;
  }).length;

  if (epochDateCount > 0) {
    console.error(`Validation ERROR: ${epochDateCount} rows have Jan 1970 dates - date parsing failed`);
  }

  // Check for missing regions (breaks region-based charts)
  const missingRegions = data.filter(row => !row.region || row.region === '').length;
  if (missingRegions > 0) {
    console.error(`Validation ERROR: ${missingRegions} rows have missing region values`);
  }

  // Check date range
  const validDates = data.filter(row => row.orderDate.getFullYear() >= 2000 && row.orderDate.getFullYear() <= 2100);
  if (validDates.length === 0) {
    console.error('Validation ERROR: No valid dates found in expected range');
  } else {
    const minDate = new Date(Math.min(...data.map(row => row.orderDate.getTime())));
    const maxDate = new Date(Math.max(...data.map(row => row.orderDate.getTime())));
    console.log(`Data quality: Date range from ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]}`);
  }

  // Summary statistics
  console.log(`Data quality summary: ${data.length} rows loaded`);
  console.log(`  - Total Sales: ${totalSales.toFixed(2)}`);
  console.log(`  - Total Profit: ${totalProfit.toFixed(2)}`);
  console.log(`  - Regions: ${new Set(data.map(row => row.region)).size}`);
  console.log(`  - Categories: ${new Set(data.map(row => row.category)).size}`);
}

/**
 * Parse numeric fields - handle both string and number inputs
 */
function parseNumericField(value: string | number | undefined): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Filter data based on filter state
 */
export function filterData(data: OrderData[], filters: FilterState): OrderData[] {
  return data.filter((row) => {
    if (filters.region && row.region !== filters.region) return false;
    if (filters.category && row.category !== filters.category) return false;
    if (filters.segment && row.segment !== filters.segment) return false;
    return true;
  });
}

/**
 * Aggregate sales by month for P121__line (tmn:Order Date)
 */
export function aggregateSalesByMonth(data: OrderData[]): SalesByTime[] {
  const aggregation = new Map<string, SalesByTime>();

  data.forEach((row) => {
    const date = row.orderDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;

    if (!aggregation.has(key)) {
      aggregation.set(key, {
        date: new Date(year, month, 1),
        sales: 0,
        year,
        month,
      });
    }

    const entry = aggregation.get(key)!;
    entry.sales += Number(row.sales);
  });

  return Array.from(aggregation.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Aggregate sales by year for P1225__total_sales_each_year (yr:Order Date)
 */
export function aggregateSalesByYear(data: OrderData[]): SalesByTime[] {
  const aggregation = new Map<number, SalesByTime>();

  data.forEach((row) => {
    const year = row.orderDate.getFullYear();

    if (!aggregation.has(year)) {
      aggregation.set(year, {
        date: new Date(year, 0, 1),
        sales: 0,
        year,
      });
    }

    const entry = aggregation.get(year)!;
    entry.sales += Number(row.sales);
  });

  return Array.from(aggregation.values()).sort((a, b) => a.year! - b.year!);
}

/**
 * Aggregate metrics by region for P2648__discount_overview_by_region
 * Multiple measures: avg Discount, sum Profit, sum Quantity, sum Sales, count distinct Customer Name
 */
export function aggregateByRegion(data: OrderData[]): RegionMetrics[] {
  type AggregationEntry = {
    region: string;
    avgDiscount: number;
    sumProfit: number;
    sumQuantity: number;
    sumSales: number;
    countCustomers: Set<string>;
    rowCount: number;
  };

  const aggregation = new Map<string, AggregationEntry>();

  data.forEach((row) => {
    const region = row.region;

    if (!aggregation.has(region)) {
      aggregation.set(region, {
        region,
        avgDiscount: 0,
        sumProfit: 0,
        sumQuantity: 0,
        sumSales: 0,
        countCustomers: new Set<string>(),
        rowCount: 0,
      });
    }

    const entry = aggregation.get(region)!;
    entry.avgDiscount += Number(row.discount);
    entry.sumProfit += Number(row.profit);
    entry.sumQuantity += Number(row.quantity);
    entry.sumSales += Number(row.sales);
    entry.countCustomers.add(row.customerName);
    entry.rowCount += 1;
  });

  // Calculate averages and convert Set to count
  const result: RegionMetrics[] = Array.from(aggregation.values()).map((entry) => {
    return {
      region: entry.region,
      avgDiscount: entry.rowCount > 0 ? entry.avgDiscount / entry.rowCount : 0,
      sumProfit: entry.sumProfit,
      sumQuantity: entry.sumQuantity,
      sumSales: entry.sumSales,
      countCustomers: entry.countCustomers.size,
    };
  });

  return result;
}

/**
 * Get unique values for filters
 */
export function getUniqueRegions(data: OrderData[]): string[] {
  return Array.from(new Set(data.map((d) => d.region))).sort();
}

export function getUniqueCategories(data: OrderData[]): string[] {
  return Array.from(new Set(data.map((d) => d.category))).sort();
}

export function getUniqueSegments(data: OrderData[]): string[] {
  return Array.from(new Set(data.map((d) => d.segment))).sort();
}

/**
 * Calculate KPIs
 */
export function calculateTotalSales(data: OrderData[]): number {
  return data.reduce((sum, row) => sum + Number(row.sales), 0);
}

export function calculateTotalProfit(data: OrderData[]): number {
  return data.reduce((sum, row) => sum + Number(row.profit), 0);
}

export function calculateProfitRatio(data: OrderData[]): number {
  const totalSales = calculateTotalSales(data);
  const totalProfit = calculateTotalProfit(data);
  return totalSales !== 0 ? totalProfit / totalSales : 0;
}
