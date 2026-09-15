import { csvParse } from 'd3-dsv';
import type { SuperstoreOrder, ScatterplotDataPoint, BarChartDataPoint, KPIMetrics } from './types';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Normalize column names by removing BOM, quotes, and whitespace
 * This handles CSV files with BOM markers or dirty headers
 * Handles cases like "Order Date", ""Order Date"", or even """Order Date"""
 */
function normalizeColumnName(name: string): string {
  // Remove BOM (Byte Order Mark) - U+FEFF
  let cleaned = name.replace(/^\uFEFF/, '');

  // Remove repeated quotes at the start and end
  // Handles "Order Date", ""Order Date"", """Order Date""", etc.
  cleaned = cleaned.replace(/^"+|"+$/g, '');

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Detect and skip preamble rows before the actual CSV header
 * Returns the index of the first row that contains the header
 */
function detectHeaderRow(rows: string[]): number {
  // Known header columns from the Superstore dataset
  const expectedColumns = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit', 'Quantity'];

  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    const normalizedHeaders = row.split(',').map(h => normalizeColumnName(h));

    // Check if this row contains a significant number of expected columns
    const matchCount = expectedColumns.filter(col =>
      normalizedHeaders.some(h => h.includes(col))
    ).length;

    // If we find at least 3 expected columns, this is likely the header row
    if (matchCount >= 3) {
      return i;
    }
  }

  // Default to first row if no header detected
  return 0;
}

/**
 * Load and parse the Superstore Orders CSV data
 * Handles preamble rows, BOM markers, and dirty quoted headers
 */
export const loadData = async (): Promise<SuperstoreOrder[]> => {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const csvText = await response.text();

  // Split into lines to detect header row
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Detect and skip preamble rows
  const headerRowIndex = detectHeaderRow(lines);
  const dataLines = lines.slice(headerRowIndex);

  // Parse the CSV starting from the detected header row
  const rawData = csvParse(dataLines.join('\n'));

  if (rawData.length === 0) {
    throw new Error('No data rows found after parsing CSV');
  }

  // Normalize all column names to handle BOM, quotes, and whitespace
  const normalizedData = rawData.map((row: Record<string, unknown>) => {
    const normalizedRow: Record<string, unknown> = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = normalizeColumnName(key);
      normalizedRow[normalizedKey] = row[key];
    });
    return normalizedRow as unknown as SuperstoreOrder;
  });

  // Convert numeric fields using normalized column names
  // Coerce to numbers to prevent string aggregation issues
  const processedData = normalizedData.map(d => ({
    ...d,
    'Row ID': Number(d['Row ID']) || 0,
    'Sales': Number(d['Sales']) || 0,
    'Quantity': Number(d['Quantity']) || 0,
    'Discount': Number(d['Discount']) || 0,
    'Profit': Number(d['Profit']) || 0,
    'Postal Code': Number(d['Postal Code']) || 0,
    'Order Date': d['Order Date'] || '',
    'Ship Date': d['Ship Date'] || ''
  }));

  // Validate that we have meaningful data
  const totalSales = processedData.reduce((sum, d) => sum + d.Sales, 0);
  if (totalSales === 0) {
    console.warn('Warning: All Sales values are zero. Data may not have been parsed correctly.');
  }

  return processedData;
};

/**
 * Calculate KPI metrics from raw data
 */
export const calculateKPIs = (data: SuperstoreOrder[]): KPIMetrics => {
  const totalSales = data.reduce((sum, d) => sum + d.Sales, 0);
  const totalProfit = data.reduce((sum, d) => sum + d.Profit, 0);
  const profitRatio = totalSales !== 0 ? totalProfit / totalSales : 0;

  return {
    totalSales,
    totalProfit,
    profitRatio
  };
};

/**
 * Aggregate data for scatterplot (by Product Name)
 * Matches Tableau spec: LOD on Product Name, SUM of Sales, Profit, Quantity
 */
export const aggregateScatterplotData = (data: SuperstoreOrder[]): ScatterplotDataPoint[] => {
  const aggregation = new Map<string, ScatterplotDataPoint>();

  data.forEach(d => {
    const key = d['Product Name'];
    if (!aggregation.has(key)) {
      aggregation.set(key, {
        productName: key,
        sales: 0,
        profit: 0,
        quantity: 0
      });
    }
    const point = aggregation.get(key)!;
    // Explicitly coerce to numbers to prevent string concatenation
    point.sales += Number(d.Sales) || 0;
    point.profit += Number(d.Profit) || 0;
    point.quantity += Number(d.Quantity) || 0;
  });

  return Array.from(aggregation.values());
};

/**
 * Aggregate data for Sales by Sub-Category chart
 * Matches Tableau spec: horizontal ranked bar by Sub-Category
 */
export const aggregateSalesBySubCategory = (data: SuperstoreOrder[]): BarChartDataPoint[] => {
  const aggregation = new Map<string, number>();

  data.forEach(d => {
    const key = d['Sub-Category'];
    aggregation.set(key, (aggregation.get(key) || 0) + d.Sales);
  });

  return Array.from(aggregation.entries())
    .map(([subCategory, sales]) => ({
      category: subCategory,
      subCategory,
      sales
    }))
    .sort((a, b) => b.sales - a.sales); // Sort descending by Sales
};

/**
 * Aggregate data for Category/Sub-Category bar chart
 * Matches Tableau spec: hierarchical Category / Sub-Category
 */
export const aggregateCategorySubCategoryData = (data: SuperstoreOrder[]): BarChartDataPoint[] => {
  const aggregation = new Map<string, number>();

  data.forEach(d => {
    // Create hierarchical key: "Category - Sub-Category"
    const key = `${d.Category} - ${d['Sub-Category']}`;
    aggregation.set(key, (aggregation.get(key) || 0) + d.Sales);
  });

  return Array.from(aggregation.entries())
    .map(([categoryWithSub, sales]) => {
      const [category, subCategory] = categoryWithSub.split(' - ');
      return {
        category,
        subCategory,
        sales
      };
    })
    .sort((a, b) => b.sales - a.sales); // Sort descending by Sales
};
