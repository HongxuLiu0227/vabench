/**
 * Data service for loading and processing Superstore Orders data
 */

import Papa from 'papaparse';
import type {
  SuperstoreOrder,
  AggregatedSalesBySubCategory,
  AggregatedSalesByCategorySubCategory,
  AggregatedSalesByYear,
  ScatterPlotData,
} from '../types/data';

const DATA_URL = '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

/**
 * Normalize CSV headers by removing BOM, extra quotes, and whitespace
 */
function normalizeHeaders(csvText: string): string {
  // Remove BOM if present
  const normalized = csvText.replace(/^\uFEFF/, '');

  // Find the end of the first line (header row)
  const firstLineEnd = normalized.indexOf('\n');
  if (firstLineEnd === -1) {
    return normalized;
  }

  const headerLine = normalized.substring(0, firstLineEnd);
  const restOfFile = normalized.substring(firstLineEnd + 1);

  // Clean up headers: remove extra quotes and whitespace
  const cleanedHeaders = headerLine
    .split(',')
    .map((header) => {
      let cleaned = header.trim();
      // Remove wrapping quotes if present (handle both single and double quotes)
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
          (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }
      // Remove any remaining quotes
      cleaned = cleaned.replace(/^["']+|["']+$/g, '');
      return cleaned;
    })
    .join(',');

  return cleanedHeaders + '\n' + restOfFile;
}

/**
 * Validate that required fields exist in parsed data
 */
function validateParsedData(data: Partial<SuperstoreOrder>[]): void {
  if (data.length === 0) {
    throw new Error('CSV file appears to be empty or failed to parse');
  }

  // Check for critical fields in the first row
  const firstRow = data[0];
  const requiredFields = ['Sales', 'Profit', 'Quantity', 'Order Date', 'Category', 'Sub-Category', 'Product Name'];
  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in CSV: ${missingFields.join(', ')}`);
  }
}

/**
 * Load and parse the CSV data
 */
export async function loadData(): Promise<SuperstoreOrder[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  let csvText = await response.text();

  // Normalize headers to handle BOM, quotes, and whitespace
  csvText = normalizeHeaders(csvText);

  return new Promise((resolve, reject) => {
    Papa.parse<SuperstoreOrder>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Validate that we got data
          if (!results.data || results.data.length === 0) {
            throw new Error('CSV parsing produced no data');
          }

          // Validate required fields exist
          validateParsedData(results.data);

          // Parse numeric fields explicitly to avoid string concatenation issues
          const data = results.data.map((row: Partial<SuperstoreOrder>, index: number) => {
            // Skip completely empty rows
            if (Object.keys(row).length === 0) {
              return null;
            }

            const processed: SuperstoreOrder = {
              ...row,
              'Sales': Number(row['Sales']) || 0,
              'Profit': Number(row['Profit']) || 0,
              'Quantity': Number(row['Quantity']) || 0,
              'Discount': Number(row['Discount']) || 0,
              'Postal Code': Number(row['Postal Code']) || 0,
              'Row ID': Number(row['Row ID']) || index,
              'Order ID': row['Order ID'] || '',
              'Order Date': row['Order Date'] || '',
              'Ship Date': row['Ship Date'] || '',
              'Ship Mode': row['Ship Mode'] || '',
              'Customer ID': row['Customer ID'] || '',
              'Customer Name': row['Customer Name'] || '',
              'Segment': row['Segment'] || '',
              'Country': row['Country'] || '',
              'City': row['City'] || '',
              'State': row['State'] || '',
              'Region': row['Region'] || '',
              'Product ID': row['Product ID'] || '',
              'Category': row['Category'] || '',
              'Sub-Category': row['Sub-Category'] || '',
              'Product Name': row['Product Name'] || '',
            };

            // Validate that critical numeric fields are actually numbers
            if (isNaN(processed.Sales) || isNaN(processed.Profit) || isNaN(processed.Quantity)) {
              console.warn(`Row ${index} has invalid numeric values:`, row);
            }

            return processed;
          }).filter((row): row is SuperstoreOrder => row !== null);

          if (data.length === 0) {
            throw new Error('All rows were filtered out during parsing');
          }

          console.log(`Successfully loaded ${data.length} rows from CSV`);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Aggregate sales by Sub-Category (for P9517__sales_by_sub_category)
 */
export function aggregateSalesBySubCategory(data: SuperstoreOrder[]): AggregatedSalesBySubCategory[] {
  const aggregation = new Map<string, number>();

  data.forEach((row) => {
    const subCategory = row['Sub-Category'];
    const sales = row['Sales'];

    // Skip rows with missing or invalid sub-category
    if (!subCategory || subCategory === '') {
      return;
    }

    aggregation.set(subCategory, (aggregation.get(subCategory) || 0) + sales);
  });

  const result = Array.from(aggregation.entries())
    .map(([subCategory, sales]) => ({ 'Sub-Category': subCategory, Sales: sales }))
    .sort((a, b) => b.Sales - a.Sales); // Sort descending for ranked bar

  console.log(`Aggregated sales by sub-category: ${result.length} sub-categories`);
  return result;
}

/**
 * Aggregate sales by Category and Sub-Category (for P121__bar)
 */
export function aggregateSalesByCategorySubCategory(data: SuperstoreOrder[]): AggregatedSalesByCategorySubCategory[] {
  const aggregation = new Map<string, { category: string; sales: number }>();

  data.forEach((row) => {
    const category = row['Category'];
    const subCategory = row['Sub-Category'];

    // Skip rows with missing category or sub-category
    if (!category || !subCategory || category === '' || subCategory === '') {
      return;
    }

    const key = `${category}|${subCategory}`;
    aggregation.set(key, {
      category: category,
      sales: (aggregation.get(key)?.sales || 0) + row['Sales'],
    });
  });

  const result = Array.from(aggregation.entries())
    .map(([key, value]) => {
      const [, subCategory] = key.split('|');
      return {
        'Category': value.category,
        'Sub-Category': subCategory,
        'Sales': value.sales,
      };
    })
    .sort((a, b) => b.Sales - a.Sales); // Sort descending for ranked bar

  console.log(`Aggregated sales by category/sub-category: ${result.length} combinations`);
  return result;
}

/**
 * Aggregate sales by year (for P1225__total_sales_each_year)
 */
export function aggregateSalesByYear(data: SuperstoreOrder[]): AggregatedSalesByYear[] {
  const aggregation = new Map<number, number>();

  data.forEach((row) => {
    let year: number;

    // Handle different date formats
    const orderDateStr = row['Order Date'];

    // If it's a string in YYYY-MM-DD format (ISO 8601)
    if (typeof orderDateStr === 'string') {
      // Extract year from YYYY-MM-DD format
      const yearMatch = orderDateStr.match(/^(\d{4})-/);
      if (yearMatch) {
        year = parseInt(yearMatch[1], 10);
      } else {
        // Fallback to Date parsing
        const parsedDate = new Date(orderDateStr);
        year = parsedDate.getFullYear();
        // Check for invalid date (NaN or unreasonably old dates)
        if (isNaN(year) || year < 1900 || year > 2100) {
          console.warn(`Invalid date format: ${orderDateStr}, skipping row`);
          return;
        }
      }
    } else {
      console.warn(`Unexpected date type: ${typeof orderDateStr}, skipping row`);
      return;
    }

    const sales = row['Sales'];
    aggregation.set(year, (aggregation.get(year) || 0) + sales);
  });

  const result = Array.from(aggregation.entries())
    .map(([year, sales]) => ({ 'Year': year.toString(), 'Sales': sales }))
    .sort((a, b) => a.Year.localeCompare(b.Year)); // Sort by year

  console.log(`Aggregated sales by year: ${result.length} years`);
  return result;
}

/**
 * Aggregate scatter plot data by Product Name (for P121__scatterplot)
 */
export function aggregateScatterPlotData(data: SuperstoreOrder[]): ScatterPlotData[] {
  const aggregation = new Map<string, { sales: number; profit: number; quantity: number }>();

  data.forEach((row) => {
    const productName = row['Product Name'];

    // Skip rows with missing product name
    if (!productName || productName === '') {
      return;
    }

    aggregation.set(productName, {
      sales: (aggregation.get(productName)?.sales || 0) + row['Sales'],
      profit: (aggregation.get(productName)?.profit || 0) + row['Profit'],
      quantity: (aggregation.get(productName)?.quantity || 0) + row['Quantity'],
    });
  });

  const result = Array.from(aggregation.entries()).map(([productName, values]) => ({
    'Product Name': productName,
    'Sales': values.sales,
    'Profit': values.profit,
    'Quantity': values.quantity,
  }));

  console.log(`Aggregated scatter plot data: ${result.length} products`);
  return result;
}

/**
 * Load all dashboard data
 */
export async function loadDashboardData() {
  const rawData = await loadData();

  console.log('=== Dashboard Data Loading Summary ===');
  console.log(`Raw data rows loaded: ${rawData.length}`);

  const result = {
    salesBySubCategory: aggregateSalesBySubCategory(rawData),
    salesByCategorySubCategory: aggregateSalesByCategorySubCategory(rawData),
    salesByYear: aggregateSalesByYear(rawData),
    scatterPlotData: aggregateScatterPlotData(rawData),
  };

  console.log('=== Aggregation Complete ===');
  console.log(`Sales by Sub-Category: ${result.salesBySubCategory.length} records`);
  console.log(`Sales by Category/Sub-Category: ${result.salesByCategorySubCategory.length} records`);
  console.log(`Sales by Year: ${result.salesByYear.length} records`);
  console.log(`Scatter Plot Data: ${result.scatterPlotData.length} records`);

  // Validate that we have data for all charts
  if (result.salesBySubCategory.length === 0) {
    throw new Error('No data aggregated for Sales by Sub-Category chart');
  }
  if (result.salesByCategorySubCategory.length === 0) {
    throw new Error('No data aggregated for Sales by Category/Sub-Category chart');
  }
  if (result.salesByYear.length === 0) {
    throw new Error('No data aggregated for Sales by Year chart');
  }
  if (result.scatterPlotData.length === 0) {
    throw new Error('No data aggregated for Scatter Plot chart');
  }

  return result;
}
