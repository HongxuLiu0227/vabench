/**
 * Runtime validator for CSV parsing
 * Can be used in browser console or for development testing
 */

import { parseCSV, validateColumns } from './csvParser';

const REQUIRED_COLUMNS = [
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

export interface ValidationResult {
  success: boolean;
  rowsParsed: number;
  parseTime: number;
  columnsPresent: boolean;
  missingColumns?: string[];
  sampleRow?: Record<string, string>;
  dataQuality?: {
    totalRows: number;
    validSalesValues: number;
    validProfitValues: number;
    totalSales: number;
    totalProfit: number;
    uniqueProducts: number;
    categories: string[];
  };
  error?: string;
}

/**
 * Validates CSV parsing at runtime
 * @param csvText The CSV text to validate
 * @returns Validation result with detailed information
 */
export async function validateCSVParsing(csvText: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: false,
    rowsParsed: 0,
    parseTime: 0,
    columnsPresent: false,
  };

  try {
    const startTime = performance.now();

    // Parse the CSV
    const data = parseCSV(csvText, {
      autoDetectPreamble: true,
      normalizeHeaders: true,
    });

    const parseTime = performance.now() - startTime;

    result.rowsParsed = data.length;
    result.parseTime = parseTime;

    // Validate columns
    const validation = validateColumns(data, REQUIRED_COLUMNS);
    result.columnsPresent = validation.valid;

    if (!validation.valid) {
      result.missingColumns = validation.missing;
      result.error = `Missing columns: ${validation.missing.join(', ')}`;
      return result;
    }

    // Sample first row
    result.sampleRow = data[0] as Record<string, string>;

    // Data quality metrics
    const salesValues = data.map((d) => parseFloat(String(d['Sales']))).filter((v) => !isNaN(v));
    const profitValues = data.map((d) => parseFloat(String(d['Profit']))).filter((v) => !isNaN(v));
    const uniqueProducts = new Set(data.map((d) => String(d['Product Name'])));
    const categories = new Set(data.map((d) => String(d['Category'])));

    result.dataQuality = {
      totalRows: data.length,
      validSalesValues: salesValues.length,
      validProfitValues: profitValues.length,
      totalSales: salesValues.reduce((a, b) => a + b, 0),
      totalProfit: profitValues.reduce((a, b) => a + b, 0),
      uniqueProducts: uniqueProducts.size,
      categories: Array.from(categories) as string[],
    };

    result.success = true;

    // Log results to console for debugging
    console.log('✓ CSV Validation passed');
    console.log(`  Parsed ${data.length} rows in ${parseTime.toFixed(2)}ms`);
    console.log(`  Total Sales: $${result.dataQuality!.totalSales.toFixed(2)}`);
    console.log(`  Total Profit: $${result.dataQuality!.totalProfit.toFixed(2)}`);
    console.log(`  Categories: ${result.dataQuality!.categories.join(', ')}`);

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('✗ CSV Validation failed:', error);
    return result;
  }
}

/**
 * Loads and validates the CSV from the public/data directory
 */
export async function validateDatasetFromURL(): Promise<ValidationResult> {
  try {
    const response = await fetch('/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const csvText = await response.text();
    return validateCSVParsing(csvText);
  } catch (error) {
    return {
      success: false,
      rowsParsed: 0,
      parseTime: 0,
      columnsPresent: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as { validateDataset?: typeof validateDatasetFromURL }).validateDataset = validateDatasetFromURL;
}
