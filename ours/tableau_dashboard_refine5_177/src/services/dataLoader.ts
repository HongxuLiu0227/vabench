import Papa from 'papaparse';

// Data type definitions based on the Superstore Orders CSV structure
export interface SuperstoreOrder {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  Segment: string;
  Country: string;
  City: string;
  State: string;
  'Postal Code': number;
  Region: string;
  'Product ID': string;
  Category: string;
  'Sub-Category': string;
  'Product Name': string;
  Sales: number;
  Quantity: number;
  Discount: number;
  Profit: number;
}

// Aggregated data types for charts
export interface SalesByCategory {
  category: string;
  subCategory: string;
  sales: number;
}

export interface RegionSummary {
  region: string;
  sales: number;
  quantity: number;
  profit: number;
  customerCount: number;
}

export interface ScatterPoint {
  productName: string;
  sales: number;
  profit: number;
  quantity: number;
}

export interface YearlySales {
  year: number;
  sales: number;
}

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Normalize header by removing BOM, extra quotes, and whitespace
 */
function normalizeHeader(header: string): string {
  let normalized = header;

  // Remove BOM character
  if (normalized.startsWith('\uFEFF')) {
    normalized = normalized.substring(1);
  }

  // Remove wrapping quotes (handles repeated quotes like `"Order Date"`)
  normalized = normalized.replace(/^"+|"+$/g, '');

  // Trim whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Safely convert a value to a number, returning 0 if invalid
 */
function safeNumber(value: string | number | undefined | null): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'NaN' || trimmed === 'null' || trimmed === 'undefined') {
      return 0;
    }
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Parse date string in YYYY-MM-DD format deterministically
 */
function parseDate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    return new Date(NaN);
  }

  // Handle ISO format (YYYY-MM-DD)
  const parts = dateString.trim().split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[2], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }

  // Fallback to standard date parsing
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? new Date(NaN) : parsed;
}

/**
 * Validate that required fields exist in the data
 */
function validateRequiredFields(data: unknown[]): void {
  if (data.length === 0) {
    throw new Error('No data found in CSV file');
  }

  const requiredFields: (keyof SuperstoreOrder)[] = [
    'Category',
    'Sub-Category',
    'Sales',
    'Region',
    'Customer Name',
    'Quantity',
    'Profit',
    'Product Name',
    'Order Date'
  ];

  const firstRow = data[0] as Record<string, unknown>;
  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV data: ${missingFields.join(', ')}`
    );
  }
}

/**
 * Load and parse the CSV data file with robust error handling
 */
export async function loadSuperstoreData(): Promise<SuperstoreOrder[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<SuperstoreOrder>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: normalizeHeader,
        complete: (results) => {
          try {
            // Validate required fields exist
            validateRequiredFields(results.data);

            // Process and clean data
            const processedData = results.data
              .filter((row) => {
                // Filter out rows with missing critical data
                return row.Category &&
                       row['Order Date'] &&
                       !isNaN(parseDate(row['Order Date']).getTime());
              })
              .map((row) => ({
                ...row,
                Sales: safeNumber(row.Sales),
                Quantity: safeNumber(row.Quantity),
                Discount: safeNumber(row.Discount),
                Profit: safeNumber(row.Profit),
                'Postal Code': safeNumber(row['Postal Code']),
                'Row ID': safeNumber(row['Row ID']),
              }));

            if (processedData.length === 0) {
              throw new Error('No valid data rows found after filtering');
            }

            console.log(`Successfully loaded ${processedData.length} rows from CSV`);
            resolve(processedData);
          } catch (error) {
            reject(new Error(`Data processing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

/**
 * Aggregate sales by Category and Sub-Category for horizontal bar chart
 */
export function aggregateSalesByCategory(data: SuperstoreOrder[]): SalesByCategory[] {
  const aggregation = new Map<string, SalesByCategory>();

  data.forEach((row) => {
    const category = row.Category?.trim() || 'Unknown';
    const subCategory = row['Sub-Category']?.trim() || 'Unknown';
    const key = `${category}-${subCategory}`;
    const existing = aggregation.get(key);

    if (existing) {
      existing.sales += Number(row.Sales) || 0;
    } else {
      aggregation.set(key, {
        category,
        subCategory,
        sales: Number(row.Sales) || 0,
      });
    }
  });

  // Convert to array and sort by sales descending (for ranked bar chart)
  return Array.from(aggregation.values())
    .filter(item => item.sales > 0) // Filter out zero or negative sales
    .sort((a, b) => b.sales - a.sales);
}

/**
 * Aggregate metrics by Region for customer overview
 */
export function aggregateByRegion(data: SuperstoreOrder[]): RegionSummary[] {
  const aggregation = new Map<string, RegionSummary>();
  const customerSetByRegion = new Map<string, Set<string>>();

  data.forEach((row) => {
    const region = row.Region?.trim() || 'Unknown';
    const existing = aggregation.get(region);

    if (!customerSetByRegion.has(region)) {
      customerSetByRegion.set(region, new Set());
    }
    customerSetByRegion.get(region)!.add(row['Customer Name']?.trim() || 'Unknown');

    if (existing) {
      existing.sales += Number(row.Sales) || 0;
      existing.quantity += Number(row.Quantity) || 0;
      existing.profit += Number(row.Profit) || 0;
    } else {
      aggregation.set(region, {
        region,
        sales: Number(row.Sales) || 0,
        quantity: Number(row.Quantity) || 0,
        profit: Number(row.Profit) || 0,
        customerCount: 0,
      });
    }
  });

  // Update customer counts
  aggregation.forEach((value, region) => {
    value.customerCount = customerSetByRegion.get(region)?.size || 0;
  });

  return Array.from(aggregation.values());
}

/**
 * Prepare scatter plot data (aggregated by Product Name)
 */
export function prepareScatterData(data: SuperstoreOrder[]): ScatterPoint[] {
  const aggregation = new Map<string, ScatterPoint>();

  data.forEach((row) => {
    const productName = row['Product Name']?.trim() || 'Unknown';
    const existing = aggregation.get(productName);

    if (existing) {
      existing.sales += Number(row.Sales) || 0;
      existing.profit += Number(row.Profit) || 0;
      existing.quantity += Number(row.Quantity) || 0;
    } else {
      aggregation.set(productName, {
        productName,
        sales: Number(row.Sales) || 0,
        profit: Number(row.Profit) || 0,
        quantity: Number(row.Quantity) || 0,
      });
    }
  });

  return Array.from(aggregation.values())
    .filter(point => point.sales > 0 || point.profit !== 0); // Filter out completely empty points
}

/**
 * Aggregate sales by year for line chart
 */
export function aggregateSalesByYear(data: SuperstoreOrder[]): YearlySales[] {
  const aggregation = new Map<number, number>();

  data.forEach((row) => {
    const date = parseDate(row['Order Date']);
    const year = date.getFullYear();

    // Skip invalid dates
    if (isNaN(year) || year < 1900 || year > 2100) {
      console.warn(`Invalid date found: ${row['Order Date']}`);
      return;
    }

    const existing = aggregation.get(year);
    const sales = Number(row.Sales) || 0;
    if (existing !== undefined) {
      aggregation.set(year, existing + sales);
    } else {
      aggregation.set(year, sales);
    }
  });

  // Convert to array and sort by year
  return Array.from(aggregation.entries())
    .filter(([, sales]) => sales > 0) // Filter out zero sales
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}
