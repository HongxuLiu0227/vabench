import { csvParse } from 'd3-dsv';

/**
 * TABLEAU CALCULATION FIELDS (Computed, not in source CSV)
 * --------------------------------------------------------
 * The following fields are computed at runtime and do not exist in the source CSV:
 * - Calculation_345932813618278400: Profit Ratio (Profit / Sales)
 * - Calculation_345932813629575169: Sales per Customer (Total Sales / Customer Count)
 *
 * These fields are added during data processing to match Tableau's calculated fields.
 */

/**
 * Normalize CSV headers by removing extra quotes and BOM.
 * Handles cases like """Order Date""" → "Order Date"
 * Also removes UTF-8 BOM if present.
 *
 * This function processes the raw CSV text to clean up malformed headers
 * where field names are wrapped in triple quotes (e.g., """Row ID""").
 * It strips the triple quotes and normalizes to clean field names.
 */
function normalizeCsvHeaders(csvText: string): string {
  // Remove UTF-8 BOM if present
  let text = csvText.replace(/^\uFEFF/, '');

  const lines = text.split('\n');
  if (lines.length === 0) return text;

  // Process the header line (first non-empty line)
  let headerIndex = 0;
  while (headerIndex < lines.length && lines[headerIndex].trim() === '') {
    headerIndex++;
  }

  if (headerIndex >= lines.length) return text;

  const headerLine = lines[headerIndex];
  const originalHeader = headerLine;

  // Handle triple-quoted headers: """Field Name""" → Field Name
  // This pattern matches triple quotes at the start and end of field names
  const normalizedHeader = headerLine
    .split(',')
    .map(field => {
      // Remove triple quotes from the start and end
      let cleaned = field.trim();
      // Match pattern: """Field Name"""
      const tripleQuoteMatch = cleaned.match(/^"""(.+?)"""$/);
      if (tripleQuoteMatch) {
        return tripleQuoteMatch[1];
      }
      // Fallback: remove any surrounding quotes (single or double)
      cleaned = cleaned.replace(/^["']+|["']+$/g, '');
      return cleaned;
    })
    .join(',');

  lines[headerIndex] = normalizedHeader;

  // Log normalization if any changes were made
  if (originalHeader !== normalizedHeader) {
    console.info('CSV header normalized:');
    console.info('  Before:', originalHeader.substring(0, 100) + (originalHeader.length > 100 ? '...' : ''));
    console.info('  After: ', normalizedHeader.substring(0, 100) + (normalizedHeader.length > 100 ? '...' : ''));
  }

  return lines.join('\n');
}

// Raw data type from CSV
export interface RawDataRow {
  'Row ID': string;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country': string;
  'City': string;
  'State': string;
  'Postal Code': string;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': string;
  'Quantity': string;
  'Discount': string;
  'Profit': string;
}

// Processed data type
export interface DataRow {
  rowId: number;
  orderId: string;
  orderDate: Date;
  shipDate: Date;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  country: string;
  city: string;
  state: string;
  postalCode: number;
  region: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
  year: number;
  profitRatio: number;
  // Tableau calculation field mappings
  'Calculation_345932813618278400': number; // Profit Ratio
  'Calculation_345932813629575169': number; // Sales per Customer (computed at aggregation level)
}

// Aggregated data by customer
export interface CustomerData {
  customerName: string;
  region: string;
  segment: string;
  category: string;
  sales: number;
  profit: number;
  profitRatio: number;
  quantity: number;
  salesPerCustomer: number;
  customerCount: number;
  // Tableau calculation field mappings
  'Calculation_345932813618278400': number; // Profit Ratio
  'Calculation_345932813629575169': number; // Sales per Customer
}

// Aggregated data by region
export interface RegionData {
  region: string;
  sales: number;
  profit: number;
  profitRatio: number;
  quantity: number;
  salesPerCustomer: number;
  customerCount: number;
  // Tableau calculation field mappings
  'Calculation_345932813618278400': number; // Profit Ratio
  'Calculation_345932813629575169': number; // Sales per Customer
}

// Measure names for Customer Overview
export type MeasureName = 'Sales per Customer' | 'Sales' | 'Quantity' | 'Profit' | 'Profit Ratio';

// Load and parse CSV data
export async function loadData(): Promise<DataRow[]> {
  try {
    const response = await fetch('/data/TEMP_1u7hox51ox1io4183hb2v01q3nst.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    // Normalize headers to handle triple-quoted field names and BOM
    const normalizedCsv = normalizeCsvHeaders(csvText);
    const rawData = csvParse(normalizedCsv) as RawDataRow[];

    // Validate parsing succeeded
    if (rawData.length === 0) {
      throw new Error('CSV parsing failed: No data rows found');
    }

    // Check if critical fields are accessible by testing the first row
    const firstRow = rawData[0];
    const hasOrderDate = 'Order Date' in firstRow;
    const hasRegion = 'Region' in firstRow;
    const hasSales = 'Sales' in firstRow;

    if (!hasOrderDate || !hasRegion || !hasSales) {
      console.error('First row keys:', Object.keys(firstRow));
      throw new Error(
        `CSV parsing failed: Missing critical fields. ` +
        `Found keys: ${Object.keys(firstRow).slice(0, 5).join(', ')}...`
      );
    }

    const processedData = rawData.map((row: RawDataRow) => {
      const sales = Number(row['Sales']) || 0;
      const profit = Number(row['Profit']) || 0;
      const profitRatio = sales !== 0 ? profit / sales : 0;

      // Parse dates safely, defaulting to null if invalid
      const orderDateStr = row['Order Date'] || '';
      const shipDateStr = row['Ship Date'] || '';
      const orderDate = new Date(orderDateStr);
      const shipDate = new Date(shipDateStr);

      // Check if dates are valid
      const isValidOrderDate = !isNaN(orderDate.getTime());
      const isValidShipDate = !isNaN(shipDate.getTime());

      if (!isValidOrderDate) {
        console.warn(`Invalid Order Date: "${orderDateStr}" for row ${row['Row ID']}`);
      }

      return {
        rowId: Number(row['Row ID']) || 0,
        orderId: row['Order ID'] || '',
        orderDate: isValidOrderDate ? orderDate : new Date(),
        shipDate: isValidShipDate ? shipDate : new Date(),
        shipMode: row['Ship Mode'] || '',
        customerId: row['Customer ID'] || '',
        customerName: row['Customer Name'] || '',
        segment: row['Segment'] || '',
        country: row['Country'] || '',
        city: row['City'] || '',
        state: row['State'] || '',
        postalCode: Number(row['Postal Code']) || 0,
        region: row['Region'] || '',
        productId: row['Product ID'] || '',
        category: row['Category'] || '',
        subCategory: row['Sub-Category'] || '',
        productName: row['Product Name'] || '',
        sales,
        quantity: Number(row['Quantity']) || 0,
        discount: Number(row['Discount']) || 0,
        profit,
        year: isValidOrderDate ? orderDate.getFullYear() : new Date().getFullYear(),
        profitRatio,
        // Tableau calculation fields (row-level, will be recalculated at aggregation level)
        'Calculation_345932813618278400': profitRatio,
        'Calculation_345932813629575169': sales, // Row-level sales, aggregated to "Sales per Customer" later
      };
    });

    // Validate processed data has meaningful values
    const totalSales = processedData.reduce((sum, row) => sum + row.sales, 0);
    const validRegions = new Set(processedData.map(row => row.region)).size;

    if (totalSales === 0) {
      console.warn('Warning: Total sales is 0. Check if Sales field parsed correctly.');
    }

    if (validRegions === 0) {
      console.warn('Warning: No valid regions found. Check if Region field parsed correctly.');
    }

    // Validate Tableau calculation fields exist
    const firstProcessedRow = processedData[0];
    if (firstProcessedRow) {
      const hasProfitRatioCalc = 'Calculation_345932813618278400' in firstProcessedRow;
      const hasSalesPerCustomerCalc = 'Calculation_345932813629575169' in firstProcessedRow;

      if (!hasProfitRatioCalc || !hasSalesPerCustomerCalc) {
        console.warn('Warning: Tableau calculation fields may be missing. Keys found:', Object.keys(firstProcessedRow).filter(k => k.startsWith('Calculation')));
      } else {
        console.info('✓ Tableau calculation fields validated successfully:');
        console.info('  - Calculation_345932813618278400 (Profit Ratio):', firstProcessedRow['Calculation_345932813618278400']);
        console.info('  - Calculation_345932813629575169 (Sales per Customer):', firstProcessedRow['Calculation_345932813629575169']);
      }
    }

    console.info(`Loaded ${processedData.length} rows with ${validRegions} regions. Total sales: ${totalSales.toFixed(2)}`);

    return processedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Filter data based on selected filters
export function filterData(
  data: DataRow[],
  filters: {
    year?: string;
    segment?: string;
    region?: string;
    category?: string;
  }
): DataRow[] {
  return data.filter((row) => {
    if (filters.year && filters.year !== 'All' && row.year.toString() !== filters.year) {
      return false;
    }
    if (filters.segment && filters.segment !== 'All' && row.segment !== filters.segment) {
      return false;
    }
    if (filters.region && filters.region !== 'All' && row.region !== filters.region) {
      return false;
    }
    if (filters.category && filters.category !== 'All' && row.category !== filters.category) {
      return false;
    }
    return true;
  });
}

// Aggregate data by customer
export function aggregateByCustomer(data: DataRow[]): CustomerData[] {
  const customerMap = new Map<string, CustomerData>();

  data.forEach((row) => {
    const existing = customerMap.get(row.customerName);
    if (existing) {
      existing.sales += row.sales;
      existing.profit += row.profit;
      existing.quantity += row.quantity;
      existing.customerCount += 1;
    } else {
      const initialProfitRatio = row.sales !== 0 ? row.profit / row.sales : 0;
      customerMap.set(row.customerName, {
        customerName: row.customerName,
        region: row.region,
        segment: row.segment,
        category: row.category,
        sales: row.sales,
        profit: row.profit,
        profitRatio: initialProfitRatio,
        quantity: row.quantity,
        salesPerCustomer: 0, // Will be calculated
        customerCount: 1,
        // Tableau calculation fields (temporary values, will be recalculated)
        'Calculation_345932813618278400': initialProfitRatio,
        'Calculation_345932813629575169': row.sales,
      });
    }
  });

  // Calculate sales per customer and profit ratio
  const result = Array.from(customerMap.values()).map((customer) => {
    const salesPerCustomer = customer.customerCount > 0 ? customer.sales / customer.customerCount : 0;
    const profitRatio = customer.sales !== 0 ? customer.profit / customer.sales : 0;
    return {
      ...customer,
      salesPerCustomer,
      profitRatio,
      // Tableau calculation fields
      'Calculation_345932813618278400': profitRatio,
      'Calculation_345932813629575169': salesPerCustomer,
    };
  });

  return result;
}

// Aggregate data by region
export function aggregateByRegion(data: DataRow[]): RegionData[] {
  const regionMap = new Map<string, RegionData>();
  const customerSetPerRegion = new Map<string, Set<string>>();

  data.forEach((row) => {
    const existing = regionMap.get(row.region);
    if (existing) {
      existing.sales += row.sales;
      existing.profit += row.profit;
      existing.quantity += row.quantity;
    } else {
      regionMap.set(row.region, {
        region: row.region,
        sales: row.sales,
        profit: row.profit,
        profitRatio: 0,
        quantity: row.quantity,
        salesPerCustomer: 0,
        customerCount: 0,
        // Tableau calculation fields (temporary values, will be recalculated)
        'Calculation_345932813618278400': 0,
        'Calculation_345932813629575169': 0,
      });
      customerSetPerRegion.set(row.region, new Set());
    }
    customerSetPerRegion.get(row.region)!.add(row.customerName);
  });

  // Calculate derived metrics
  const result = Array.from(regionMap.values()).map((region) => {
    const customerCount = customerSetPerRegion.get(region.region)!.size;
    const salesPerCustomer = customerCount > 0 ? region.sales / customerCount : 0;
    const profitRatio = region.sales !== 0 ? region.profit / region.sales : 0;
    return {
      ...region,
      customerCount,
      salesPerCustomer,
      profitRatio,
      // Tableau calculation fields
      'Calculation_345932813618278400': profitRatio,
      'Calculation_345932813629575169': salesPerCustomer,
    };
  });

  return result;
}

// Get unique values for filters
export function getUniqueValues(data: DataRow[], field: keyof DataRow): string[] {
  const uniqueSet = new Set<string>();
  data.forEach((row) => {
    const value = row[field];
    if (typeof value === 'string') {
      uniqueSet.add(value);
    }
  });
  return Array.from(uniqueSet).sort();
}

// Get unique years
export function getUniqueYears(data: DataRow[]): string[] {
  const uniqueSet = new Set<number>();
  data.forEach((row) => {
    uniqueSet.add(row.year);
  });
  return Array.from(uniqueSet).sort().map((y) => y.toString());
}
