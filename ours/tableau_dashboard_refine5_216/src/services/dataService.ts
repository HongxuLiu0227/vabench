import { csvParse } from 'd3-dsv';
import type {
  ParsedSalesData,
  YearlySalesData,
  CustomerOverviewData,
  ScatterplotData,
  BarChartData,
} from '../types/dashboard';

const DATA_URL = '/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv';

// Safe number coercion with validation
function coerceNumber(value: unknown, fieldName: string, rowIdx: number): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const num = parseFloat(String(value).replace(/,/g, ''));
  if (isNaN(num)) {
    console.warn(`Invalid numeric value for ${fieldName} at row ${rowIdx}: ${value}`);
    return 0;
  }
  return num;
}

// Safe date coercion with validation
function coerceDate(value: unknown, fieldName: string, rowIdx: number): Date {
  if (value === null || value === undefined || value === '') {
    return new Date(NaN);
  }
  const date = new Date(String(value));
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date value for ${fieldName} at row ${rowIdx}: ${value}`);
    return new Date(NaN);
  }
  return date;
}

// Safe string coercion
function coerceString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

// Normalize header names by removing extra quotes, BOM, and whitespace
function normalizeHeaders(obj: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove BOM, extra quotes, and trim whitespace
    const normalizedKey = key
      .replace(/^\uFEFF/, '') // Remove BOM character
      .replace(/^"+|"+$/g, '') // Remove surrounding quotes
      .trim();
    normalized[normalizedKey] = value;
  }
  return normalized;
}

// Parse CSV string to array of objects with proper type conversion
function parseCSVData(csvText: string): ParsedSalesData[] {
  // Remove BOM from the entire CSV text if present
  const cleanCsvText = csvText.replace(/^\uFEFF/, '');

  const rawData = csvParse(cleanCsvText);

  if (rawData.length === 0) {
    throw new Error('CSV file is empty or could not be parsed');
  }

  // Normalize headers for all rows
  const normalizedData = rawData.map(normalizeHeaders);

  // Check for preamble rows by looking for the first row with valid data
  let dataStartIdx = 0;
  for (let i = 0; i < Math.min(10, normalizedData.length); i++) {
    const row = normalizedData[i];
    // Check if this looks like a data row (has numeric values)
    const sales = coerceNumber(row['Sales'], 'Sales', i);
    const quantity = coerceNumber(row['Quantity'], 'Quantity', i);

    if (!isNaN(sales) || !isNaN(quantity)) {
      dataStartIdx = i;
      break;
    }
  }

  const dataRows = normalizedData.slice(dataStartIdx);

  console.log(`Parsed ${dataRows.length} rows from CSV (skipped ${dataStartIdx} preamble rows)`);

  const parsedData: ParsedSalesData[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowIdx = dataStartIdx + i;

    try {
      const parsedRow: ParsedSalesData = {
        'Row ID': coerceNumber(row['Row ID'], 'Row ID', rowIdx),
        'Order ID': coerceString(row['Order ID']),
        'Order Date': coerceDate(row['Order Date'], 'Order Date', rowIdx),
        'Ship Date': coerceDate(row['Ship Date'], 'Ship Date', rowIdx),
        'Ship Mode': coerceString(row['Ship Mode']),
        'Customer ID': coerceString(row['Customer ID']),
        'Customer Name': coerceString(row['Customer Name']),
        'Segment': coerceString(row['Segment']),
        'Country': coerceString(row['Country']),
        'City': coerceString(row['City']),
        'State': coerceString(row['State']),
        'Postal Code': coerceNumber(row['Postal Code'], 'Postal Code', rowIdx),
        'Region': coerceString(row['Region']),
        'Product ID': coerceString(row['Product ID']),
        'Category': coerceString(row['Category']),
        'Sub-Category': coerceString(row['Sub-Category']),
        'Product Name': coerceString(row['Product Name']),
        'Sales': coerceNumber(row['Sales'], 'Sales', rowIdx),
        'Quantity': coerceNumber(row['Quantity'], 'Quantity', rowIdx),
        'Discount': coerceNumber(row['Discount'], 'Discount', rowIdx),
        'Profit': coerceNumber(row['Profit'], 'Profit', rowIdx),
      };

      // Skip rows with invalid dates (Jan 1970 issue)
      if (isNaN(parsedRow['Order Date'].getTime()) || isNaN(parsedRow['Ship Date'].getTime())) {
        console.warn(`Skipping row ${rowIdx} due to invalid dates`);
        continue;
      }

      parsedData.push(parsedRow);
    } catch (error) {
      console.error(`Error parsing row ${rowIdx}:`, error);
      // Continue with next row instead of failing entirely
    }
  }

  console.log(`Successfully parsed ${parsedData.length} valid rows`);

  if (parsedData.length === 0) {
    throw new Error('No valid data rows found after parsing');
  }

  return parsedData;
}

// Aggregate data by year for Total Sales Each Year
export function aggregateYearlySales(data: ParsedSalesData[]): YearlySalesData[] {
  const yearlyMap = new Map<number, number>();

  data.forEach((row) => {
    const year = row['Order Date'].getFullYear();
    const currentSales = yearlyMap.get(year) || 0;
    const sales = Number(row.Sales) || 0;
    yearlyMap.set(year, currentSales + sales);
  });

  return Array.from(yearlyMap.entries())
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);
}

// Aggregate data by region for Customer Overview
export function aggregateCustomerOverview(data: ParsedSalesData[]): CustomerOverviewData[] {
  const regionMap = new Map<string, {
    sales: number;
    quantity: number;
    profit: number;
    customers: Set<string>;
  }>();

  data.forEach((row) => {
    const region = row.Region;
    const current = regionMap.get(region) || {
      sales: 0,
      quantity: 0,
      profit: 0,
      customers: new Set<string>(),
    };

    // Explicitly convert to numbers to prevent string concatenation
    const sales = Number(row.Sales) || 0;
    const quantity = Number(row.Quantity) || 0;
    const profit = Number(row.Profit) || 0;

    current.sales += sales;
    current.quantity += quantity;
    current.profit += profit;
    current.customers.add(row['Customer Name']);

    regionMap.set(region, current);
  });

  return Array.from(regionMap.entries())
    .map(([region, stats]) => ({
      region,
      sales: stats.sales,
      quantity: stats.quantity,
      profit: stats.profit,
      customerCount: stats.customers.size,
      salesPerCustomer: stats.sales / stats.customers.size,
      profitRatio: stats.profit / stats.sales,
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

// Aggregate data by product for Scatterplot
export function aggregateScatterplotData(data: ParsedSalesData[]): ScatterplotData[] {
  const productMap = new Map<string, {
    sales: number;
    profit: number;
    quantity: number;
  }>();

  data.forEach((row) => {
    const productName = row['Product Name'];
    const current = productMap.get(productName) || {
      sales: 0,
      profit: 0,
      quantity: 0,
    };

    // Explicitly convert to numbers to prevent string concatenation
    const sales = Number(row.Sales) || 0;
    const profit = Number(row.Profit) || 0;
    const quantity = Number(row.Quantity) || 0;

    current.sales += sales;
    current.profit += profit;
    current.quantity += quantity;

    productMap.set(productName, current);
  });

  return Array.from(productMap.entries())
    .map(([productName, stats]) => ({
      productName,
      sales: stats.sales,
      profit: stats.profit,
      quantity: stats.quantity,
    }))
    .sort((a, b) => b.sales - a.sales); // Sort by sales descending
}

// Aggregate data by Category and Sub-Category for Bar chart
export function aggregateBarChartData(data: ParsedSalesData[]): BarChartData[] {
  const categoryMap = new Map<string, Map<string, number>>();

  data.forEach((row) => {
    const category = row.Category;
    const subCategory = row['Sub-Category'];

    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map<string, number>());
    }

    const subCategoryMap = categoryMap.get(category)!;
    const currentSales = subCategoryMap.get(subCategory) || 0;
    const sales = Number(row.Sales) || 0;
    subCategoryMap.set(subCategory, currentSales + sales);
  });

  const result: BarChartData[] = [];

  categoryMap.forEach((subCategoryMap, category) => {
    subCategoryMap.forEach((sales, subCategory) => {
      result.push({
        category,
        subCategory,
        sales,
      });
    });
  });

  // Sort by sales descending
  return result.sort((a, b) => b.sales - a.sales);
}

// Validate aggregated data
function validateAggregatedData(
  yearlySales: YearlySalesData[],
  customerOverview: CustomerOverviewData[],
  scatterplot: ScatterplotData[],
  barChart: BarChartData[]
): void {
  // Check for all-zero or NaN values
  if (yearlySales.length === 0) {
    throw new Error('No yearly sales data generated');
  }

  const totalSales = yearlySales.reduce((sum, y) => sum + y.sales, 0);
  if (totalSales === 0) {
    throw new Error('All sales values are zero - possible parsing issue');
  }

  if (customerOverview.length === 0) {
    throw new Error('No customer overview data generated');
  }

  if (scatterplot.length === 0) {
    throw new Error('No scatterplot data generated');
  }

  if (barChart.length === 0) {
    throw new Error('No bar chart data generated');
  }

  // Check for NaN values
  const hasNaN = yearlySales.some(y => isNaN(y.sales) || isNaN(y.year));
  if (hasNaN) {
    throw new Error('NaN values found in yearly sales data');
  }

  console.log('✅ Data validation passed');
  console.log(`   - Yearly sales: ${yearlySales.length} years, total: $${totalSales.toFixed(2)}`);
  console.log(`   - Customer overview: ${customerOverview.length} regions`);
  console.log(`   - Scatterplot: ${scatterplot.length} products`);
  console.log(`   - Bar chart: ${barChart.length} categories`);
}

// Main data loading function
export async function loadDashboardData() {
  try {
    console.log('Loading dashboard data from:', DATA_URL);

    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText} (${response.status})`);
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV file is empty');
    }

    console.log(`CSV file loaded: ${csvText.length} bytes`);

    const parsedData = parseCSVData(csvText);

    const yearlySales = aggregateYearlySales(parsedData);
    const customerOverview = aggregateCustomerOverview(parsedData);
    const scatterplot = aggregateScatterplotData(parsedData);
    const barChart = aggregateBarChartData(parsedData);

    // Validate all aggregated data
    validateAggregatedData(yearlySales, customerOverview, scatterplot, barChart);

    return {
      yearlySales,
      customerOverview,
      scatterplot,
      barChart,
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    throw error;
  }
}
