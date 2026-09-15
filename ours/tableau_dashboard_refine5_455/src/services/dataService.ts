import { csvParse } from 'd3-dsv';
import type { DSVRowString } from 'd3-dsv';
import type {
  ParsedOrderRecord,
  ScatterplotData,
  BarChartData,
  YearlySalesData,
  CustomerOverviewData,
} from '../types';

const DATA_URL = '/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv';

/**
 * Parse a CSV record string to proper types with robust error handling
 */
function parseOrderRecord(d: DSVRowString): ParsedOrderRecord {
  // Helper function to safely parse numbers
  const parseNumber = (value: string | number | null | undefined, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const str = String(value).replace(/,/g, '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
  };

  // Helper function to safely parse dates
  // Expected format: "2014-10-02 00:00:00" or similar
  const parseDate = (value: string | number | Date | null | undefined): Date => {
    if (!value) return new Date(NaN);
    const str = String(value).trim();
    const date = new Date(str);
    return isNaN(date.getTime()) ? new Date(NaN) : date;
  };

  // Helper function to safely parse strings
  const parseString = (value: string | number | null | undefined, defaultValue: string = ''): string => {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return String(value).trim();
  };

  return {
    rowId: parseNumber(d['Row ID'], 0),
    orderId: parseString(d['Order ID']),
    orderDate: parseDate(d['Order Date']),
    shipDate: parseDate(d['Ship Date']),
    shipMode: parseString(d['Ship Mode']),
    customerId: parseString(d['Customer ID']),
    customerName: parseString(d['Customer Name']),
    segment: parseString(d['Segment']),
    cityState: parseString(d['City, State']),
    country: parseString(d['Country']),
    postalCode: parseNumber(d['Postal Code'], 0),
    market: parseString(d['Market']),
    region: parseString(d['Region']),
    productId: parseString(d['Product ID']),
    category: parseString(d['Category']),
    subCategory: parseString(d['Sub-Category']),
    productName: parseString(d['Product Name']),
    sales: parseNumber(d['Sales'], 0),
    quantity: parseNumber(d['Quantity'], 0),
    discount: parseNumber(d['Discount'], 0),
    profit: parseNumber(d['Profit'], 0),
    shippingCost: parseNumber(d['Shipping Cost'], 0),
    orderPriority: parseString(d['Order Priority']),
  };
}

/**
 * Strip UTF-8 BOM (Byte Order Mark) if present
 */
function stripBOM(text: string): string {
  // UTF-8 BOM is \uFEFF
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

/**
 * Normalize CSV column names by removing extra quotes and trimming whitespace
 */
function normalizeColumnName(name: string): string {
  return name
    .trim()
    .replace(/^"+|"+$/g, '') // Remove surrounding quotes
    .replace(/"{2,}/g, '"') // Replace repeated quotes with single quote
    .trim();
}

/**
 * Skip preamble rows and extract the actual CSV data
 * The CSV has 4 preamble rows before the real header:
 * - Row 1: Description text
 * - Row 2: Empty
 * - Row 3: Description text
 * - Row 4: Empty
 * - Row 5: Actual header
 */
function extractActualCSV(csvText: string): string {
  const lines = csvText.split(/\r?\n/);
  // Skip first 4 lines (preamble), keep everything from line 5 onwards
  const actualLines = lines.slice(4);
  return actualLines.join('\n');
}

/**
 * Load and parse CSV data from the public directory
 */
export async function loadData(): Promise<ParsedOrderRecord[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    let csvText = await response.text();

    // Step 1: Remove BOM if present
    csvText = stripBOM(csvText);

    // Step 2: Skip preamble rows and extract actual CSV
    csvText = extractActualCSV(csvText);

    // Step 3: Parse CSV
    const rawData = csvParse(csvText);

    // Step 4: Normalize column names in each row
    const normalizedData = rawData.map((row) => {
      const normalized: DSVRowString = {};
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          normalized[normalizeColumnName(key)] = row[key];
        }
      }
      return normalized;
    });

    // Step 5: Validate that we have the expected columns
    if (normalizedData.length > 0) {
      const firstRow = normalizedData[0];
      const requiredColumns = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit', 'Quantity', 'Category', 'Sub-Category', 'Region', 'Customer Name'];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));

      if (missingColumns.length > 0) {
        console.warn('Warning: Missing expected columns:', missingColumns);
        console.warn('Available columns:', Object.keys(firstRow));
      }
    }

    const parsedData = normalizedData.map(parseOrderRecord);

    // Validate data quality
    const validation = validateDataQuality(parsedData);
    if (!validation.isValid) {
      console.error('Data validation failed:', validation.errors);
      throw new Error(`CSV data validation failed: ${validation.errors.join('; ')}`);
    }

    console.log(`Successfully loaded ${parsedData.length} records from CSV`);
    return parsedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

/**
 * Validate that the parsed data contains valid values for required fields
 * This prevents silent bad parses that lead to all-zero charts or NaN filters
 */
export function validateDataQuality(data: ParsedOrderRecord[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push('No data loaded from CSV');
    return { isValid: false, errors };
  }

  // Check for valid dates (not NaN)
  const validDateCount = data.filter(d => !isNaN(d.orderDate.getTime())).length;
  if (validDateCount === 0) {
    errors.push('All Order Date values are invalid - check date format in CSV');
  } else if (validDateCount < data.length * 0.9) {
    errors.push(`More than 10% of Order Date values are invalid (${validDateCount}/${data.length} valid)`);
  }

  // Check for non-zero sales
  const nonZeroSales = data.filter(d => d.sales > 0).length;
  if (nonZeroSales === 0) {
    errors.push('All Sales values are zero - check number parsing');
  } else if (nonZeroSales < data.length * 0.5) {
    errors.push(`More than 50% of Sales values are zero (${nonZeroSales}/${data.length} non-zero)`);
  }

  // Check for non-zero profit (allowing negative profits)
  const validProfit = data.filter(d => d.profit !== 0).length;
  if (validProfit === 0) {
    errors.push('All Profit values are zero - check number parsing');
  }

  // Check for non-zero quantity
  const nonZeroQuantity = data.filter(d => d.quantity > 0).length;
  if (nonZeroQuantity === 0) {
    errors.push('All Quantity values are zero - check number parsing');
  }

  // Check for required categorical fields
  const missingCategory = data.filter(d => !d.category || d.category === '').length;
  if (missingCategory > data.length * 0.5) {
    errors.push(`More than 50% of Category values are missing (${missingCategory}/${data.length} missing)`);
  }

  const missingRegion = data.filter(d => !d.region || d.region === '').length;
  if (missingRegion > data.length * 0.5) {
    errors.push(`More than 50% of Region values are missing (${missingRegion}/${data.length} missing)`);
  }

  const missingCustomerName = data.filter(d => !d.customerName || d.customerName === '').length;
  if (missingCustomerName > data.length * 0.5) {
    errors.push(`More than 50% of Customer Name values are missing (${missingCustomerName}/${data.length} missing)`);
  }

  // Log warnings but don't fail if there are some issues
  if (errors.length > 0) {
    console.warn('Data quality validation warnings:', errors);
  }

  // Data is considered valid if we have at least some valid records
  const isValid = validDateCount > 0 && nonZeroSales > 0;
  return { isValid, errors };
}

/**
 * Aggregate data for scatterplot: group by Product Name
 */
export function aggregateScatterplotData(data: ParsedOrderRecord[]): ScatterplotData[] {
  const grouped = new Map<string, ScatterplotData>();

  data.forEach((record) => {
    const key = record.productName;
    if (!grouped.has(key)) {
      grouped.set(key, {
        productName: key,
        sales: 0,
        profit: 0,
        quantity: 0,
      });
    }
    const item = grouped.get(key)!;
    item.sales += record.sales;
    item.profit += record.profit;
    item.quantity += record.quantity;
  });

  return Array.from(grouped.values());
}

/**
 * Aggregate data for bar chart: group by Category and Sub-Category
 */
export function aggregateBarChartData(data: ParsedOrderRecord[]): BarChartData[] {
  const grouped = new Map<string, BarChartData>();

  data.forEach((record) => {
    const key = `${record.category}|${record.subCategory}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        category: record.category,
        subCategory: record.subCategory,
        sales: 0,
      });
    }
    const item = grouped.get(key)!;
    item.sales += record.sales;
  });

  // Sort by sales descending for ranking
  return Array.from(grouped.values()).sort((a, b) => b.sales - a.sales);
}

/**
 * Aggregate data for yearly sales: group by year
 */
export function aggregateYearlySalesData(data: ParsedOrderRecord[]): YearlySalesData[] {
  const grouped = new Map<number, YearlySalesData>();

  data.forEach((record) => {
    const year = record.orderDate.getFullYear();
    if (!grouped.has(year)) {
      grouped.set(year, {
        year,
        sales: 0,
      });
    }
    const item = grouped.get(year)!;
    item.sales += record.sales;
  });

  // Sort by year ascending
  return Array.from(grouped.values()).sort((a, b) => a.year - b.year);
}

/**
 * Aggregate data for customer overview: group by Region
 */
export function aggregateCustomerOverviewData(data: ParsedOrderRecord[]): CustomerOverviewData[] {
  const grouped = new Map<string, CustomerOverviewData>();
  const customerCounts = new Map<string, Set<string>>();

  data.forEach((record) => {
    const key = record.region;

    // Track unique customers
    if (!customerCounts.has(key)) {
      customerCounts.set(key, new Set());
    }
    customerCounts.get(key)!.add(record.customerName);

    if (!grouped.has(key)) {
      grouped.set(key, {
        region: key,
        numberOfCustomers: 0,
        sales: 0,
        quantity: 0,
        profit: 0,
        profitRatio: 0,
      });
    }
    const item = grouped.get(key)!;
    item.sales += record.sales;
    item.quantity += record.quantity;
    item.profit += record.profit;
  });

  // Calculate final metrics
  const result = Array.from(grouped.values());
  result.forEach((item) => {
    item.numberOfCustomers = customerCounts.get(item.region)?.size || 0;
    item.profitRatio = item.sales !== 0 ? item.profit / item.sales : 0;
  });

  // Sort by region name
  return result.sort((a, b) => a.region.localeCompare(b.region));
}
