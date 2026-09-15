import Papa from 'papaparse';
import type {
  OrderRow,
  ParsedOrderRow,
  ProductAggregation,
  CategoryAggregation,
  RegionAggregation,
} from '../types/data';

const DATA_URL = '/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv';

/**
 * Required Tableau fields from the render contract
 * These must be present in the CSV for proper dashboard functionality
 */
const REQUIRED_FIELDS = [
  'Row ID',
  'Order ID',
  'Order Date',
  'Ship Date',
  'Ship Mode',
  'Customer ID',
  'Customer Name',
  'Segment',
  'City, State',
  'Country',
  'Postal Code',
  'Market',
  'Region',
  'Product ID',
  'Category',
  'Sub-Category',
  'Product Name',
  'Sales',
  'Quantity',
  'Discount',
  'Profit',
  'Shipping Cost',
  'Order Priority',
];

/**
 * Validate that all required Tableau fields are present in the parsed data
 * @throws Error if any required fields are missing
 */
function validateRequiredFields(data: OrderRow[]): void {
  if (data.length === 0) {
    throw new Error('No data rows found in CSV after parsing');
  }

  const sampleRow = data[0];
  const missingFields: string[] = [];

  REQUIRED_FIELDS.forEach(field => {
    if (!(field in sampleRow)) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Tableau fields in CSV: ${missingFields.join(', ')}\n` +
      `Available fields: ${Object.keys(sampleRow).join(', ')}`
    );
  }
}

/**
 * Parse CSV string and convert to typed array
 * Includes robust error handling for numeric fields to prevent NaN values
 */
function parseOrderRow(row: OrderRow, index: number): ParsedOrderRow {
  const safeParseFloat = (value: string, fieldName: string): number => {
    if (value === null || value === undefined || value === '') {
      console.warn(`Row ${index}: Empty value for ${fieldName}, defaulting to 0`);
      return 0;
    }
    const parsed = parseFloat(String(value).trim());
    if (isNaN(parsed)) {
      console.warn(`Row ${index}: Invalid numeric value for ${fieldName}: "${value}", defaulting to 0`);
      return 0;
    }
    return parsed;
  };

  const safeParseInt = (value: string, fieldName: string): number => {
    if (value === null || value === undefined || value === '') {
      console.warn(`Row ${index}: Empty value for ${fieldName}, defaulting to 0`);
      return 0;
    }
    const parsed = parseInt(String(value).trim(), 10);
    if (isNaN(parsed)) {
      console.warn(`Row ${index}: Invalid integer value for ${fieldName}: "${value}", defaulting to 0`);
      return 0;
    }
    return parsed;
  };

  return {
    rowId: safeParseInt(row['Row ID'], 'Row ID'),
    orderId: String(row['Order ID'] || '').trim(),
    orderDate: String(row['Order Date'] || '').trim(),
    shipDate: String(row['Ship Date'] || '').trim(),
    shipMode: String(row['Ship Mode'] || '').trim(),
    customerId: String(row['Customer ID'] || '').trim(),
    customerName: String(row['Customer Name'] || '').trim(),
    segment: String(row['Segment'] || '').trim(),
    cityState: String(row['City, State'] || '').trim(),
    country: String(row['Country'] || '').trim(),
    postalCode: String(row['Postal Code'] || '').trim(),
    market: String(row['Market'] || '').trim(),
    region: String(row['Region'] || '').trim(),
    productId: String(row['Product ID'] || '').trim(),
    category: String(row['Category'] || '').trim(),
    subCategory: String(row['Sub-Category'] || '').trim(),
    productName: String(row['Product Name'] || '').trim(),
    sales: safeParseFloat(row['Sales'], 'Sales'),
    quantity: safeParseFloat(row['Quantity'], 'Quantity'),
    discount: safeParseFloat(row['Discount'], 'Discount'),
    profit: safeParseFloat(row['Profit'], 'Profit'),
    shippingCost: safeParseFloat(row['Shipping Cost'], 'Shipping Cost'),
    orderPriority: String(row['Order Priority'] || '').trim(),
  };
}

/**
 * Detect and skip preamble rows to find the real header row
 * Preamble rows are typically rows that don't start with expected column names
 */
function findHeaderRow(lines: string[]): number {
  // Expected column names that should appear in the header, in order
  // We check the first few columns to ensure we find the real header
  const expectedFirstColumns = ['Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse the line properly handling quoted fields
    const parseResult = Papa.parse<string[]>(line, {
      skipEmptyLines: false,
    });

    if (parseResult.errors.length > 0 || !parseResult.data[0]) {
      continue;
    }

    const columns = parseResult.data[0].map(col => normalizeHeader(col).trim());

    // Check if the first few columns match the expected pattern
    // We require at least 3 of the first 5 expected columns to match
    let matchCount = 0;
    for (let j = 0; j < Math.min(expectedFirstColumns.length, columns.length); j++) {
      if (columns[j] === expectedFirstColumns[j]) {
        matchCount++;
      }
    }

    // Require at least 3 matching columns to identify this as the header
    if (matchCount >= 3) {
      console.log(`Found header at row ${i + 1} (0-indexed: ${i}) with ${matchCount} matching columns`);
      return i;
    }
  }

  // Fallback: return 5th row (index 4) as that's where the header is in this dataset
  console.warn('Could not reliably detect header row, using fallback to row 5');
  return Math.min(4, lines.length - 1);
}

/**
 * Normalize CSV headers by removing quotes, extra whitespace, and special characters
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"+|"+$/g, '') // Remove surrounding quotes
    .replace(/"+/g, '"') // Replace multiple quotes with single quote
    .trim();
}

/**
 * Load and parse CSV data from public directory
 * Handles preamble rows and normalizes headers
 */
export async function loadOrderData(): Promise<ParsedOrderRow[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n');

    // Find the real header row (skip preamble)
    const headerRowIndex = findHeaderRow(lines);

    if (headerRowIndex >= lines.length - 1) {
      throw new Error('Could not find valid header row in CSV');
    }

    // Extract header and data rows
    const headerLine = lines[headerRowIndex];
    const dataLines = lines.slice(headerRowIndex + 1).filter(line => line.trim());

    // Parse header properly handling quoted fields
    const headerParseResult = Papa.parse<string[]>(headerLine, {
      skipEmptyLines: false,
    });
    const normalizedHeaders = headerParseResult.data[0].map(h => normalizeHeader(h));

    // Reconstruct CSV with properly quoted headers
    const quotedHeaders = normalizedHeaders.map(h =>
      h.includes(',') ? `"${h}"` : h
    );
    const normalizedCsv = [quotedHeaders.join(','), ...dataLines].join('\n');

    return new Promise((resolve, reject) => {
      Papa.parse<OrderRow>(normalizedCsv, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        complete: (results) => {
          // Validate that all required fields are present
          try {
            validateRequiredFields(results.data);
          } catch (validationError) {
            reject(validationError);
            return;
          }

          const parsedData = results.data.map((row, index) => parseOrderRow(row, index));

          // Log summary of parsed data to prevent silent bad parses
          console.log(`Successfully parsed ${parsedData.length} rows from CSV`);
          console.log('Sample row:', parsedData[0]);
          console.log('Data quality check:', {
            totalRows: parsedData.length,
            nonZeroSales: parsedData.filter(r => r.sales > 0).length,
            nonZeroProfit: parsedData.filter(r => r.profit !== 0).length,
            validDates: parsedData.filter(r => r.orderDate && r.orderDate !== '1970-01-01').length,
            regions: new Set(parsedData.map(r => r.region)).size,
          });

          resolve(parsedData);
        },
        error: (err: Error) => {
          reject(err);
        },
      });
    });
  } catch (error) {
    console.error('Error loading order data:', error);
    throw error;
  }
}

/**
 * Aggregate data by Product Name for scatterplot
 */
export function aggregateByProduct(data: ParsedOrderRow[]): ProductAggregation[] {
  const productMap = new Map<string, ProductAggregation>();

  data.forEach((row) => {
    const existing = productMap.get(row.productName);
    if (existing) {
      existing.sales = Number(existing.sales) + Number(row.sales);
      existing.profit = Number(existing.profit) + Number(row.profit);
      existing.quantity = Number(existing.quantity) + Number(row.quantity);
    } else {
      productMap.set(row.productName, {
        productName: row.productName,
        sales: Number(row.sales),
        profit: Number(row.profit),
        quantity: Number(row.quantity),
      });
    }
  });

  return Array.from(productMap.values());
}

/**
 * Aggregate data by Category and Sub-Category for bar chart
 */
export function aggregateByCategory(data: ParsedOrderRow[]): CategoryAggregation[] {
  const categoryMap = new Map<string, CategoryAggregation>();

  data.forEach((row) => {
    const key = `${row.category}|${row.subCategory}`;
    const existing = categoryMap.get(key);
    if (existing) {
      existing.sales = Number(existing.sales) + Number(row.sales);
    } else {
      categoryMap.set(key, {
        category: row.category,
        subCategory: row.subCategory,
        sales: Number(row.sales),
      });
    }
  });

  return Array.from(categoryMap.values());
}

/**
 * Aggregate data by Region for discount overview
 */
export function aggregateByRegion(data: ParsedOrderRow[]): RegionAggregation[] {
  const regionMap = new Map<string, RegionAggregation>();
  const customerSetMap = new Map<string, Set<string>>();

  data.forEach((row) => {
    const existing = regionMap.get(row.region);
    const customers = customerSetMap.get(row.region) || new Set<string>();

    customers.add(row.customerName);
    customerSetMap.set(row.region, customers);

    if (existing) {
      existing.sumSales = Number(existing.sumSales) + Number(row.sales);
      existing.sumProfit = Number(existing.sumProfit) + Number(row.profit);
      existing.sumQuantity = Number(existing.sumQuantity) + Number(row.quantity);
      existing.sumShippingCost = Number(existing.sumShippingCost) + Number(row.shippingCost);
      existing.countDistinctCustomers = customers.size;
      // Recalculate average discount
      existing.avgDiscount =
        Number(existing.avgDiscount) + (Number(row.discount) - Number(existing.avgDiscount)) / customers.size;
    } else {
      regionMap.set(row.region, {
        region: row.region,
        avgDiscount: Number(row.discount),
        sumProfit: Number(row.profit),
        sumShippingCost: Number(row.shippingCost),
        sumQuantity: Number(row.quantity),
        sumSales: Number(row.sales),
        countDistinctCustomers: 1,
      });
    }
  });

  return Array.from(regionMap.values());
}

/**
 * Custom hook to load and process all dashboard data
 */
export async function loadDashboardData() {
  const rawData = await loadOrderData();

  return {
    rawData,
    productData: aggregateByProduct(rawData),
    categoryData: aggregateByCategory(rawData),
    regionData: aggregateByRegion(rawData),
  };
}
