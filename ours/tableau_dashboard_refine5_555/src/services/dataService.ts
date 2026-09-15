import * as d3 from 'd3';
import { parseCSV, validateColumns } from '../utils/csvParser';
import { validateCSVParsing } from '../utils/runtimeValidator';
import type { OrderData, AggregatedByProduct, AggregatedByCategory, AggregatedByYear, AggregatedByMonth } from '../types/data';

const DATA_URL = '/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv';

// Required columns for the OrderData interface
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

// Enable debug mode by setting localStorage.debug = 'true' or URL param ?debug=true
const DEBUG_MODE = typeof window !== 'undefined' && (
  localStorage.getItem('debug') === 'true' ||
  new URLSearchParams(window.location.search).has('debug')
);

let cachedData: OrderData[] | null = null;

export const loadData = async (): Promise<OrderData[]> => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const csvText = await response.text();

    // Debug mode: Run validation
    if (DEBUG_MODE) {
      console.log('Debug mode: Running CSV validation...');
      const validation = await validateCSVParsing(csvText);
      if (!validation.success) {
        console.error('CSV validation failed:', validation.error);
      }
    }

    // Parse CSV with robust parser that handles:
    // - UTF-8 BOM
    // - Windows line endings
    // - Preamble detection
    // - Quoted fields with commas
    const rawData = parseCSV<Record<string, string>>(csvText, {
      autoDetectPreamble: true,
      normalizeHeaders: true,
    });

    // Validate that we have all required columns
    const validation = validateColumns(rawData, REQUIRED_COLUMNS);
    if (!validation.valid) {
      console.error('Missing required columns:', validation.missing);
      throw new Error(`CSV missing required columns: ${validation.missing.join(', ')}`);
    }

    const parsedData: OrderData[] = rawData.map((d) => {
      const sales = parseFloat(String(d['Sales']));
      const quantity = parseFloat(String(d['Quantity']));
      const discount = parseFloat(String(d['Discount']));
      const profit = parseFloat(String(d['Profit']));
      const shippingCost = parseFloat(String(d['Shipping Cost']));
      const postalCode = parseFloat(String(d['Postal Code']));
      const rowId = parseFloat(String(d['Row ID']));

      return {
        'Row ID': isNaN(rowId) ? 0 : rowId,
        'Order ID': String(d['Order ID'] || ''),
        'Order Date': String(d['Order Date'] || ''),
        'Ship Date': String(d['Ship Date'] || ''),
        'Ship Mode': String(d['Ship Mode'] || ''),
        'Customer ID': String(d['Customer ID'] || ''),
        'Customer Name': String(d['Customer Name'] || ''),
        'Segment': String(d['Segment'] || ''),
        'City, State': String(d['City, State'] || ''),
        'Country': String(d['Country'] || ''),
        'Postal Code': isNaN(postalCode) ? 0 : postalCode,
        'Market': String(d['Market'] || ''),
        'Region': String(d['Region'] || ''),
        'Product ID': String(d['Product ID'] || ''),
        'Category': String(d['Category'] || ''),
        'Sub-Category': String(d['Sub-Category'] || ''),
        'Product Name': String(d['Product Name'] || ''),
        'Sales': isNaN(sales) ? 0 : sales,
        'Quantity': isNaN(quantity) ? 0 : quantity,
        'Discount': isNaN(discount) ? 0 : discount,
        'Profit': isNaN(profit) ? 0 : profit,
        'Shipping Cost': isNaN(shippingCost) ? 0 : shippingCost,
        'Order Priority': String(d['Order Priority'] || ''),
      };
    });

    // Filter out any rows with missing critical data
    const filteredData = parsedData.filter(
      (d) => d['Product Name'] && d['Order Date'] && !isNaN(d['Sales'])
    );

    cachedData = filteredData;

    if (DEBUG_MODE) {
      console.log(`✓ Loaded ${filteredData.length} valid rows from CSV (from ${parsedData.length} total rows)`);

      // Log data quality metrics
      const totalSales = d3.sum(filteredData, (d) => d['Sales']);
      const totalProfit = d3.sum(filteredData, (d) => d['Profit']);
      const categories = new Set(filteredData.map((d) => d['Category']));

      console.log(`  Total Sales: $${totalSales.toFixed(2)}`);
      console.log(`  Total Profit: $${totalProfit.toFixed(2)}`);
      console.log(`  Categories: ${Array.from(categories).join(', ')}`);
    } else {
      console.log(`Loaded ${filteredData.length} valid rows from CSV`);
    }

    return cachedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const aggregateByProduct = (data: OrderData[]): AggregatedByProduct[] => {
  const grouped = d3.group(data, (d) => d['Product Name']);

  return Array.from(grouped, ([productName, records]) => {
    return {
      productName,
      sales: d3.sum(records, (d) => d['Sales']) || 0,
      profit: d3.sum(records, (d) => d['Profit']) || 0,
      quantity: d3.sum(records, (d) => d['Quantity']) || 0,
    };
  }).filter((d) => d.sales > 0 || d.profit !== 0);
};

export const aggregateByCategoryAndSubCategory = (
  data: OrderData[]
): AggregatedByCategory[] => {
  const grouped = d3.group(
    data,
    (d) => d['Category'],
    (d) => d['Sub-Category']
  );

  const result: AggregatedByCategory[] = [];

  grouped.forEach((subCategories, category) => {
    subCategories.forEach((records, subCategory) => {
      result.push({
        category,
        subCategory,
        sales: d3.sum(records, (d) => d['Sales']) || 0,
      });
    });
  });

  // Sort by sales descending
  return result.sort((a, b) => b.sales - a.sales);
};

export const aggregateByYear = (data: OrderData[]): AggregatedByYear[] => {
  const parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S');

  const recordsWithYear = data
    .map((d) => {
      const date = parseDate(d['Order Date']);
      return {
        ...d,
        year: date ? date.getFullYear() : null,
      };
    })
    .filter((d) => d.year !== null);

  const grouped = d3.group(recordsWithYear, (d) => d.year);

  return Array.from(grouped, ([year, records]) => ({
    year: year as number,
    sales: d3.sum(records, (d) => d['Sales']) || 0,
  })).sort((a, b) => a.year - b.year);
};

export const aggregateByMonth = (data: OrderData[]): AggregatedByMonth[] => {
  const parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S');

  const recordsWithMonth = data
    .map((d) => {
      const date = parseDate(d['Order Date']);
      if (!date) return null;
      // Truncate to month
      const month = new Date(date.getFullYear(), date.getMonth(), 1);
      return {
        month,
        sales: d['Sales'],
      };
    })
    .filter((d): d is { month: Date; sales: number } => d !== null);

  const grouped = d3.group(recordsWithMonth, (d) => d.month.toISOString());

  return Array.from(grouped, ([monthIso, records]) => ({
    month: new Date(monthIso),
    sales: d3.sum(records, (d) => d.sales) || 0,
  })).sort((a, b) => a.month.getTime() - b.month.getTime());
};
