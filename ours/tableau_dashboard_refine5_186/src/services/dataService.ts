import * as d3 from 'd3';
import type { SalesData, AggregatedSalesData, ScatterplotData, YearlySalesData } from '../types';

const DATA_URL = '/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv';

/**
 * Removes UTF-8 BOM if present at the start of the text
 */
function stripBOM(text: string): string {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  // Also check for UTF-8 BOM represented as characters
  if (text.startsWith('\uFEFF')) {
    return text.slice(1);
  }
  return text;
}

/**
 * Detects and skips preamble rows before the actual CSV header
 * Returns the CSV text starting from the header row
 */
function skipPreambleRows(csvText: string): string {
  const lines = csvText.split(/\r?\n/);

  // Expected header columns based on the data specification
  const expectedColumns = [
    'Category', 'City', 'Country', 'Customer Name', 'Manufacturer',
    'Order Date', 'Order ID', 'Postal Code', 'Product Name', 'Region',
    'Segment', 'Ship Date', 'Ship Mode', 'State', 'Sub-Category',
    'Discount', 'Number of Records', 'Profit', 'Profit Ratio', 'Quantity', 'Sales'
  ];

  // Find the header row by looking for expected columns
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    // Split by comma and clean up quotes
    const columns = line.split(',').map(col => {
      const cleaned = col.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
      return cleaned;
    });

    // Check if this row contains most of the expected columns
    const matchCount = columns.filter(col =>
      expectedColumns.some(expected =>
        col === expected || col.includes(expected)
      )
    ).length;

    // If we have a good match (at least 5 columns match), this is likely the header
    if (matchCount >= 5 && columns.length >= 10) {
      headerRowIndex = i;
      break;
    }
  }

  // Return CSV starting from header row
  return lines.slice(headerRowIndex).join('\n');
}

/**
 * Normalizes CSV headers by removing extra quotes and whitespace
 */
function normalizeHeaders(csvText: string): string {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return csvText;

  // Get the header line (should be first line after skipping preamble)
  const headerLine = lines[0];

  // Remove quotes around headers and normalize
  const normalizedHeader = headerLine
    .split(',')
    .map((h) => {
      // Remove surrounding quotes and extra whitespace
      let cleaned = h.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }
      // Remove any remaining double quotes (handling doubled quotes)
      cleaned = cleaned.replace(/""/g, '"');
      return cleaned;
    })
    .join(',');

  lines[0] = normalizedHeader;
  return lines.join('\n');
}

/**
 * Validates that required fields exist in the parsed data
 */
function validateRequiredFields(data: { [key: string]: unknown }[], requiredFields: string[]): void {
  if (data.length === 0) {
    throw new Error('No data found in CSV file');
  }

  const firstRow = data[0];
  const missingFields = requiredFields.filter((field) => !(field in firstRow));

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV: ${missingFields.join(', ')}. ` +
      `Available fields: ${Object.keys(firstRow).join(', ')}`
    );
  }
}

/**
 * Validates data quality to ensure proper numeric values
 */
function validateDataQuality(data: SalesData[]): void {
  if (data.length === 0) {
    throw new Error('No data to validate');
  }

  // Check that critical numeric fields have non-zero values
  const salesValues = data.map((d) => d['Sales']).filter((v) => v > 0);
  const profitValues = data.map((d) => d['Profit']).filter((v) => v !== 0);
  const quantityValues = data.map((d) => d['Quantity']).filter((v) => v > 0);

  if (salesValues.length === 0) {
    throw new Error('All Sales values are zero or missing - this will result in all-zero charts');
  }

  if (profitValues.length === 0) {
    console.warn('Warning: All Profit values are zero or missing');
  }

  if (quantityValues.length === 0) {
    console.warn('Warning: All Quantity values are zero or missing');
  }

  // Check for valid dates (not Jan 1970 which indicates epoch/uninitialized dates)
  const validDates = data.filter((d) => {
    const date = new Date(d['Order Date']);
    return !isNaN(date.getTime()) && date.getFullYear() > 1970;
  });

  if (validDates.length === 0) {
    throw new Error('No valid Order Date values found (all dates are invalid or default to Jan 1970)');
  }

  // Check for NaN values in critical numeric fields
  const nanSalesCount = data.filter((d) => isNaN(d['Sales'])).length;
  const nanProfitCount = data.filter((d) => isNaN(d['Profit'])).length;
  const nanQuantityCount = data.filter((d) => isNaN(d['Quantity'])).length;

  if (nanSalesCount > 0) {
    console.warn(`Warning: ${nanSalesCount} rows have NaN Sales values`);
  }
  if (nanProfitCount > 0) {
    console.warn(`Warning: ${nanProfitCount} rows have NaN Profit values`);
  }
  if (nanQuantityCount > 0) {
    console.warn(`Warning: ${nanQuantityCount} rows have NaN Quantity values`);
  }

  // Calculate date range safely
  const validDateTimestamps = data
    .map((d) => new Date(d['Order Date']).getTime())
    .filter((ts) => !isNaN(ts) && ts > 0);

  if (validDateTimestamps.length === 0) {
    throw new Error('No valid timestamps found in Order Date field');
  }

  const minDate = new Date(Math.min(...validDateTimestamps));
  const maxDate = new Date(Math.max(...validDateTimestamps));

  // Log data quality summary
  console.log('Data quality summary:', {
    totalRows: data.length,
    nonZeroSales: salesValues.length,
    nonZeroProfit: profitValues.length,
    nonZeroQuantity: quantityValues.length,
    validDates: validDates.length,
    nanSalesCount,
    nanProfitCount,
    nanQuantityCount,
    dateRange: {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    }
  });

  // Check if date range is reasonable
  if (maxDate.getFullYear() - minDate.getFullYear() > 100) {
    console.warn('Warning: Date range spans more than 100 years - there may be parsing issues');
  }
}

export async function loadSalesData(): Promise<SalesData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let csvText = await response.text();

    // Remove BOM if present
    csvText = stripBOM(csvText);

    // Skip any preamble rows before the header
    csvText = skipPreambleRows(csvText);

    // Normalize headers
    csvText = normalizeHeaders(csvText);

    const data = d3.csvParse(csvText, (d) => {
      const orderDate = d['Order Date'] ? new Date(d['Order Date']) : new Date();
      return {
        'Category': d['Category'] || '',
        'City': d['City'] || '',
        'Country': d['Country'] || '',
        'Customer Name': d['Customer Name'] || '',
        'Manufacturer': d['Manufacturer'] || '',
        'Order Date': orderDate.toISOString().split('T')[0],
        'Order ID': d['Order ID'] || '',
        'Postal Code': Number(d['Postal Code']) || 0,
        'Product Name': d['Product Name'] || '',
        'Region': d['Region'] || '',
        'Segment': d['Segment'] || '',
        'Ship Date': d['Ship Date'] || '',
        'Ship Mode': d['Ship Mode'] || '',
        'State': d['State'] || '',
        'Sub-Category': d['Sub-Category'] || '',
        'Discount': Number(d['Discount']) || 0,
        'Number of Records': Number(d['Number of Records']) || 0,
        'Profit': Number(d['Profit']) || 0,
        'Profit Ratio': Number(d['Profit Ratio']) || 0,
        'Quantity': Number(d['Quantity']) || 0,
        'Sales': Number(d['Sales']) || 0,
      };
    }) as SalesData[];

    // Validate required fields
    const requiredFields = [
      'Category',
      'City',
      'Country',
      'Customer Name',
      'Manufacturer',
      'Order Date',
      'Order ID',
      'Postal Code',
      'Product Name',
      'Region',
      'Segment',
      'Ship Date',
      'Ship Mode',
      'State',
      'Sub-Category',
      'Discount',
      'Number of Records',
      'Profit',
      'Profit Ratio',
      'Quantity',
      'Sales'
    ];

    validateRequiredFields(data as unknown as { [key: string]: unknown }[], requiredFields);

    // Validate data quality
    validateDataQuality(data);

    return data;
  } catch (error) {
    console.error('Error loading sales data:', error);
    throw error;
  }
}

export function aggregateByCategoryAndSubCategory(data: SalesData[]): AggregatedSalesData[] {
  const grouped = d3.group(
    data,
    (d) => d['Category'],
    (d) => d['Sub-Category']
  );

  const result: AggregatedSalesData[] = [];
  grouped.forEach((subCategories, category) => {
    subCategories.forEach((items, subCategory) => {
      const sales = d3.sum(items, (d) => d['Sales']);
      result.push({
        category,
        subCategory,
        sales,
      });
    });
  });

  return result.sort((a, b) => b.sales - a.sales);
}

export function aggregateBySubCategoryAndProduct(data: SalesData[]): AggregatedSalesData[] {
  const grouped = d3.group(
    data,
    (d) => d['Sub-Category'],
    (d) => d['Product Name']
  );

  const result: AggregatedSalesData[] = [];
  grouped.forEach((products, subCategory) => {
    products.forEach((items, productName) => {
      const sales = d3.sum(items, (d) => d['Sales']);
      result.push({
        category: subCategory,
        subCategory: productName,
        sales,
      });
    });
  });

  return result.sort((a, b) => b.sales - a.sales);
}

export function aggregateForScatterplot(data: SalesData[]): ScatterplotData[] {
  const grouped = d3.group(data, (d) => d['Product Name']);

  const result: ScatterplotData[] = [];
  grouped.forEach((items, productName) => {
    const sales = d3.sum(items, (d) => d['Sales']);
    const profit = d3.sum(items, (d) => d['Profit']);
    const quantity = d3.sum(items, (d) => d['Quantity']);
    result.push({
      productName,
      sales,
      profit,
      quantity,
    });
  });

  return result;
}

export function aggregateByYear(data: SalesData[]): YearlySalesData[] {
  const grouped = d3.group(data, (d) => {
    const date = new Date(d['Order Date']);
    return date.getFullYear();
  });

  const result: YearlySalesData[] = [];
  grouped.forEach((items, year) => {
    const sales = d3.sum(items, (d) => d['Sales']);
    result.push({
      year: Number(year),
      sales,
    });
  });

  return result.sort((a, b) => a.year - b.year);
}
