import * as d3 from 'd3';

export interface SalesData {
  'Row ID': number;
  'Order ID': string;
  'Order Date': Date;
  'Ship Date': Date;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country/Region': string;
  'City': string;
  'State': string;
  'Postal Code': number;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
  ProfitRatio: number;
  Year: number;
}

export interface RegionAggregation {
  Region: string;
  Sales: number;
  Profit: number;
  ProfitRatio: number;
}

export interface StateAggregation {
  State: string;
  Sales: number;
  Profit: number;
  ProfitRatio: number;
  City: string;
  'Country/Region': string;
}

// Function to normalize CSV headers by removing extra quotes and whitespace
// Handles triple-quoted headers like """Row ID""" -> Row ID
// Also handles standard quoted headers like "Order Date" -> Order Date
function normalizeHeader(header: string): string {
  let normalized = header;

  // Remove BOM if present at the start
  normalized = normalized.replace(/^\uFEFF/, '');

  // Trim whitespace
  normalized = normalized.trim();

  // Remove triple quotes wrapping the entire header: """Field""" -> Field
  if (normalized.startsWith('"""') && normalized.endsWith('"""')) {
    normalized = normalized.slice(3, -3);
  }
  // Remove double quotes wrapping the entire header: "Field" -> Field
  else if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }
  // Remove single quotes wrapping the entire header: 'Field' -> Field
  else if (normalized.startsWith("'") && normalized.endsWith("'")) {
    normalized = normalized.slice(1, -1);
  }

  // Trim again after quote removal
  return normalized.trim();
}

// Function to clean CSV data and handle BOM
// The CSV has triple-quoted headers like """Row ID""", """Order Date""", etc.
// We normalize the header line to make field lookup reliable
function cleanCSVData(text: string): string {
  // Remove BOM from the entire text if present
  let cleaned = text.replace(/^\uFEFF/, '');

  // Split into lines
  const lines = cleaned.split(/\r?\n/);

  if (lines.length === 0) return cleaned;

  // Normalize the header line (first non-empty line)
  let headerLineIndex = 0;
  while (headerLineIndex < lines.length && lines[headerLineIndex].trim() === '') {
    headerLineIndex++;
  }

  if (headerLineIndex < lines.length) {
    const headerLine = lines[headerLineIndex];
    const headers = headerLine.split(',');

    // Normalize each header
    const normalizedHeaders = headers.map(normalizeHeader);

    // Replace the header line with normalized version
    lines[headerLineIndex] = normalizedHeaders.join(',');

    // Rejoin lines
    cleaned = lines.join('\n');
  }

  return cleaned;
}

// Function to parse CSV with proper type conversions
// After cleaning, D3 will parse "Field Name" as field named 'Field Name' (without quotes)
function parseDataRow(row: d3.DSVRowString): SalesData {
  // Access fields by their clean names (D3 strips the outer quotes)
  const orderDateStr = row['Order Date'] || '';
  const shipDateStr = row['Ship Date'] || '';
  const salesStr = row['Sales'] || '0';
  const profitStr = row['Profit'] || '0';

  const orderDate = new Date(orderDateStr);
  const shipDate = new Date(shipDateStr);
  const sales = Number(salesStr) || 0;
  const profit = Number(profitStr) || 0;

  // Validate dates
  const isValidDate = (d: Date) => !isNaN(d.getTime());
  const validOrderDate = isValidDate(orderDate) ? orderDate : new Date('1970-01-01');
  const validShipDate = isValidDate(shipDate) ? shipDate : new Date('1970-01-01');

  return {
    'Row ID': Number(row['Row ID']) || 0,
    'Order ID': row['Order ID'] || '',
    'Order Date': validOrderDate,
    'Ship Date': validShipDate,
    'Ship Mode': row['Ship Mode'] || '',
    'Customer ID': row['Customer ID'] || '',
    'Customer Name': row['Customer Name'] || '',
    'Segment': row['Segment'] || '',
    'Country/Region': row['Country/Region'] || '',
    'City': row['City'] || '',
    'State': row['State'] || '',
    'Postal Code': Number(row['Postal Code']) || 0,
    'Region': row['Region'] || '',
    'Product ID': row['Product ID'] || '',
    'Category': row['Category'] || '',
    'Sub-Category': row['Sub-Category'] || '',
    'Product Name': row['Product Name'] || '',
    'Sales': sales,
    'Quantity': Number(row['Quantity']) || 0,
    'Discount': Number(row['Discount']) || 0,
    'Profit': profit,
    ProfitRatio: sales !== 0 ? profit / sales : 0,
    Year: validOrderDate.getFullYear()
  };
}

export async function loadSalesData(): Promise<SalesData[]> {
  try {
    const response = await fetch('/data/TEMP_0nc2r4718q3tv71etu3qn12v6eqk.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    // Clean BOM and normalize triple-quoted headers
    const cleanedText = cleanCSVData(csvText);

    // Parse CSV with proper type conversions
    const parsedData = d3.csvParse(cleanedText, parseDataRow);

    // Validate we got data
    if (!parsedData || parsedData.length === 0) {
      throw new Error('No data parsed from CSV');
    }

    console.log(`Loaded ${parsedData.length} rows from CSV`);
    console.log('Sample row:', parsedData[0]);

    return parsedData;
  } catch (error) {
    console.error('Error loading sales data:', error);
    throw error;
  }
}

export function filterDataByYear(data: SalesData[], year: number): SalesData[] {
  return data.filter(d => d.Year === year);
}

export function aggregateByRegion(data: SalesData[]): RegionAggregation[] {
  const grouped = d3.rollup(
    data,
    v => ({
      Sales: d3.sum(v, d => d.Sales),
      Profit: d3.sum(v, d => d.Profit),
      ProfitRatio: d3.sum(v, d => d.Profit) / d3.sum(v, d => d.Sales) || 0
    }),
    d => d.Region
  );

  return Array.from(grouped, ([Region, values]) => ({
    Region,
    ...values
  }));
}

export function aggregateByState(data: SalesData[]): StateAggregation[] {
  const grouped = d3.rollup(
    data,
    v => ({
      Sales: d3.sum(v, d => d.Sales),
      Profit: d3.sum(v, d => d.Profit),
      ProfitRatio: d3.sum(v, d => d.Profit) / d3.sum(v, d => d.Sales) || 0
    }),
    d => d.State
  );

  return Array.from(grouped, ([State, values]) => ({
    State,
    ...values,
    City: data.find(d => d.State === State)?.City || '',
    'Country/Region': data.find(d => d.State === State)?.['Country/Region'] || ''
  }));
}

export function getUniqueYears(data: SalesData[]): number[] {
  return Array.from(new Set(data.map(d => d.Year))).sort((a, b) => a - b);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}
