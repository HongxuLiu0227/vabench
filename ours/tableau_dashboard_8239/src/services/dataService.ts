import { csvParse } from 'd3-dsv';
import type { SuperstoreRow, DashboardFilters, YearMonthData, CategoryProfit, RegionOrderData, StateMetric, YearMonthProfit, SubCategorySales } from '../types';

const DATA_URL = '/data/federated_0r0vorq1eq42zb19jd94c0.csv';

/**
 * Normalize CSV header by:
 * 1. Removing BOM (Byte Order Mark) if present
 * 2. Stripping line endings (\r, \n, \r\n)
 * 3. Stripping ALL surrounding quote characters (handles 1-4+ quote layers)
 * 4. Trimming whitespace
 */
function normalizeHeader(header: string): string {
  // Remove BOM if present (UTF-8 BOM is \uFEFF)
  let cleaned = header.replace(/^\uFEFF/, '');

  // Remove line endings (handle both \r\n and \r or \n)
  cleaned = cleaned.replace(/\r\n?|\n/g, '');

  // Remove ALL leading quotes (handles double/triple quoted headers like """Row ID""")
  while (cleaned.startsWith('"')) {
    cleaned = cleaned.slice(1);
  }

  // Remove ALL trailing quotes
  while (cleaned.endsWith('"')) {
    cleaned = cleaned.slice(0, -1);
  }

  // Trim whitespace
  cleaned = cleaned.trim();

  // Additional safeguard: if the result still has quotes at start/end, remove them
  // This handles edge cases where quotes might have been embedded
  while (cleaned.startsWith('"')) {
    cleaned = cleaned.slice(1);
  }
  while (cleaned.endsWith('"')) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned;
}

/**
 * Create a mapping from raw CSV headers to normalized headers
 * This ensures deterministic field lookups regardless of quote inconsistencies
 */
function createHeaderMapping(rawHeaders: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  rawHeaders.forEach(raw => {
    const normalized = normalizeHeader(raw);
    mapping.set(raw, normalized);
    // Also map the normalized version to itself for direct access
    mapping.set(normalized, normalized);
  });
  return mapping;
}

// Parse CSV string to typed array
function parseSuperstoreData(csvText: string): SuperstoreRow[] {
  // Remove BOM from the entire CSV text before parsing
  const csvTextNoBOM = csvText.replace(/^\uFEFF/, '');

  const parsed = csvParse(csvTextNoBOM);

  // Create header mapping for deterministic field access
  const rawHeaders = parsed.columns || Object.keys(parsed[0] || {});
  const headerMap = createHeaderMapping(rawHeaders);

  // Helper function to get value by trying multiple possible keys
  const getValue = (row: any, fieldName: string): string => {
    // First try direct access with normalized name
    if (row[fieldName] !== undefined) return row[fieldName];

    // Try all raw headers to find a match
    for (const [rawHeader, normalized] of headerMap.entries()) {
      if (normalized === fieldName && row[rawHeader] !== undefined) {
        return row[rawHeader];
      }
    }

    return '';
  };

  return parsed.map((row: any) => {
    const rowData: any = {};

    // Use normalized field names from the contract
    const fieldMappings: Record<string, keyof SuperstoreRow> = {
      'Row ID': 'Row ID',
      'Order ID': 'Order ID',
      'Order Date': 'Order Date',
      'Ship Date': 'Ship Date',
      'Ship Mode': 'Ship Mode',
      'Customer ID': 'Customer ID',
      'Customer Name': 'Customer Name',
      'Segment': 'Segment',
      'Country': 'Country',
      'City': 'City',
      'State': 'State',
      'Postal Code': 'Postal Code',
      'Region': 'Region',
      'Product ID': 'Product ID',
      'Category': 'Category',
      'Sub-Category': 'Sub-Category',
      'Product Name': 'Product Name',
      'Sales': 'Sales',
      'Quantity': 'Quantity',
      'Discount': 'Discount',
      'Profit': 'Profit'
    };

    for (const [csvField, typeField] of Object.entries(fieldMappings)) {
      const rawValue = getValue(row, csvField);

      // Type coercion based on field
      if (typeField === 'Row ID' || typeField === 'Postal Code') {
        rowData[typeField] = Number(rawValue) || 0;
      } else if (typeField === 'Sales' || typeField === 'Quantity' || typeField === 'Discount' || typeField === 'Profit') {
        rowData[typeField] = Number(rawValue) || 0;
      } else {
        rowData[typeField] = String(rawValue || '');
      }
    }

    // Add Tableau calculated field for highlight bindings (Blank dimension)
    // This field is used by Tableau for highlight/filter interactions
    rowData['Calculation_6943002545466433537'] = '';

    return rowData as SuperstoreRow;
  }).filter((row): row is SuperstoreRow => {
    // Filter out completely empty rows
    return row['Order ID'] !== '' || row['Row ID'] !== 0;
  });
}

// Apply filters to data
export function applyFilters(data: SuperstoreRow[], filters: DashboardFilters): SuperstoreRow[] {
  let filtered = data;

  if (filters.year && filters.year !== 'All') {
    filtered = filtered.filter(row => {
      const date = new Date(row['Order Date']);
      return date.getFullYear() === filters.year;
    });
  }

  if (filters.month && filters.month !== 'All') {
    filtered = filtered.filter(row => {
      const date = new Date(row['Order Date']);
      return date.getMonth() + 1 === filters.month;
    });
  }

  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter(row => filters.category!.includes(row['Category']));
  }

  if (filters.region && filters.region.length > 0) {
    filtered = filtered.filter(row => filters.region!.includes(row['Region']));
  }

  if (filters.state && filters.state.length > 0) {
    filtered = filtered.filter(row => filters.state!.includes(row['State']));
  }

  if (filters.subCategory && filters.subCategory.length > 0) {
    filtered = filtered.filter(row => filters.subCategory!.includes(row['Sub-Category']));
  }

  return filtered;
}

// Get unique years
export function getYears(data: SuperstoreRow[]): number[] {
  const years = new Set<number>();
  data.forEach(row => {
    const date = new Date(row['Order Date']);
    years.add(date.getFullYear());
  });
  return Array.from(years).sort((a, b) => a - b);
}

// Get unique months
export function getMonths(_data: SuperstoreRow[]): YearMonthData[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return monthNames.map((monthName, month) => ({
    month: month + 1,
    monthName
  }));
}

// Aggregate profit by category
export function getCategoryProfits(data: SuperstoreRow[]): CategoryProfit[] {
  const categoryMap = new Map<string, number>();

  data.forEach(row => {
    const current = categoryMap.get(row['Category']) || 0;
    categoryMap.set(row['Category'], current + row['Profit']);
  });

  const totalProfit = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

  return Array.from(categoryMap.entries())
    .map(([category, profit]) => ({
      category,
      profit,
      profitPercent: totalProfit > 0 ? (profit / totalProfit) * 100 : 0
    }))
    .sort((a, b) => b.profit - a.profit);
}

// Aggregate orders by region and category
export function getRegionCategoryOrders(data: SuperstoreRow[]): RegionOrderData[] {
  const regionCategoryMap = new Map<string, Map<string, number>>();
  const orderIds = new Map<string, Set<string>>();

  data.forEach(row => {
    const key = `${row['Region']}-${row['Category']}`;
    if (!regionCategoryMap.has(key)) {
      regionCategoryMap.set(key, new Map());
    }
    const categoryMap = regionCategoryMap.get(key)!;
    const current = categoryMap.get(row['Category']) || 0;
    categoryMap.set(row['Category'], current + 1);

    // Track unique order IDs
    const orderKey = `${row['Region']}`;
    if (!orderIds.has(orderKey)) {
      orderIds.set(orderKey, new Set());
    }
    orderIds.get(orderKey)!.add(row['Order ID']);
  });

  const result: RegionOrderData[] = [];
  regionCategoryMap.forEach((categoryMap, key) => {
    const [region, category] = key.split('-');
    result.push({
      region,
      category,
      orderCount: categoryMap.get(category) || 0
    });
  });

  return result.sort((a, b) => b.orderCount - a.orderCount);
}

// Aggregate profit by state
export function getStateProfits(data: SuperstoreRow[]): StateMetric[] {
  const stateMap = new Map<string, number>();

  data.forEach(row => {
    const current = stateMap.get(row['State']) || 0;
    stateMap.set(row['State'], current + row['Profit']);
  });

  return Array.from(stateMap.entries())
    .map(([state, value]) => ({ state, value }))
    .sort((a, b) => b.value - a.value);
}

// Aggregate quantity by state
export function getStateQuantities(data: SuperstoreRow[]): StateMetric[] {
  const stateMap = new Map<string, number>();

  data.forEach(row => {
    const current = stateMap.get(row['State']) || 0;
    stateMap.set(row['State'], current + row['Quantity']);
  });

  return Array.from(stateMap.entries())
    .map(([state, value]) => ({ state, value }))
    .sort((a, b) => b.value - a.value);
}

// Aggregate profit by year and month
export function getYearMonthProfits(data: SuperstoreRow[]): YearMonthProfit[] {
  const yearMonthMap = new Map<string, number>();

  data.forEach(row => {
    const date = new Date(row['Order Date']);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;
    const current = yearMonthMap.get(key) || 0;
    yearMonthMap.set(key, current + row['Profit']);
  });

  return Array.from(yearMonthMap.entries())
    .map(([key, profit]) => {
      const [year, month] = key.split('-').map(Number);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        year,
        month,
        monthYear: `${monthNames[month - 1]} ${year}`,
        profit
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
}

// Get top sub-categories by sales
export function getTopSubCategorySales(data: SuperstoreRow[], limit: number = 5): SubCategorySales[] {
  const subCategoryMap = new Map<string, number>();

  data.forEach(row => {
    const current = subCategoryMap.get(row['Sub-Category']) || 0;
    subCategoryMap.set(row['Sub-Category'], current + row['Sales']);
  });

  return Array.from(subCategoryMap.entries())
    .map(([subCategory, sales]) => ({ subCategory, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

// Get total quantity
export function getTotalQuantity(data: SuperstoreRow[]): number {
  return data.reduce((sum, row) => sum + row['Quantity'], 0);
}

// Get total profit
export function getTotalProfit(data: SuperstoreRow[]): number {
  return data.reduce((sum, row) => sum + row['Profit'], 0);
}

// Main data loader
export async function loadSuperstoreData(): Promise<SuperstoreRow[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    // Validate CSV is not empty
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV file is empty');
    }

    const parsedData = parseSuperstoreData(csvText);

    // Validate parsed data
    if (!parsedData || parsedData.length === 0) {
      throw new Error('Failed to parse CSV: no data rows found');
    }

    // Validate that critical fields have non-zero values (catch silent parse failures)
    const sampleRow = parsedData[0];
    const hasValidData = sampleRow &&
                        sampleRow['Sales'] !== 0 ||
                        sampleRow['Profit'] !== 0 ||
                        sampleRow['Quantity'] !== 0;

    if (!hasValidData && parsedData.length > 1) {
      // Check if all rows are all zeros (sign of parse failure)
      const allZero = parsedData.every(row =>
        row['Sales'] === 0 && row['Profit'] === 0 && row['Quantity'] === 0
      );
      if (allZero) {
        console.warn('Warning: All parsed rows have zero values - possible parsing issue');
        console.warn('Sample row:', sampleRow);
      }
    }

    console.log(`Successfully loaded ${parsedData.length} rows from ${DATA_URL}`);
    console.log('Sample row:', {
      'Order ID': sampleRow['Order ID'],
      'Order Date': sampleRow['Order Date'],
      'Sales': sampleRow['Sales'],
      'Profit': sampleRow['Profit'],
      'Quantity': sampleRow['Quantity']
    });

    return parsedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}
