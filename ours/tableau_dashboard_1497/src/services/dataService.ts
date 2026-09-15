import * as d3Dsv from 'd3-dsv';
import type {
  SalesData,
  SalesTypeData,
  SalesWithItemsData,
  ItemsWithCategoryData,
  PayTypeWithYearData,
} from '../types';

const DATA_URL = '/data/federated_07pow0c0ytbl181cit8kw1.csv';

/**
 * Normalize CSV headers by removing:
 * 1. BOM (Byte Order Mark) characters like
 * 2. Triple quotes like """Channel Type"""
 * 3. Double quotes like "Channel Type"
 *
 * This handles Tableau exports that wrap headers in multiple quotes.
 */
const normalizeHeader = (header: string): string => {
  // Remove BOM if present
  let cleaned = header.replace(/^\uFEFF/, '');

  // Remove triple quotes: """Field Name""" -> Field Name
  cleaned = cleaned.replace(/^"{3}(.+)"{3}$/, '$1');

  // Remove double quotes: "Field Name" -> Field Name
  cleaned = cleaned.replace(/^"(.+)"$/, '$1');

  return cleaned;
};

/**
 * Preprocess CSV text to normalize triple-quoted headers.
 * Handles Tableau exports with headers like: """Channel Type""","""Pay Type"""
 * by converting them to: "Channel Type","Pay Type"
 */
const preprocessCSVHeaders = (csvText: string): string => {
  // Split into lines
  const lines = csvText.split(/\r?\n/);

  if (lines.length === 0) return csvText;

  // Process the header line (first non-empty line)
  let headerIndex = 0;
  while (headerIndex < lines.length && lines[headerIndex].trim() === '') {
    headerIndex++;
  }

  if (headerIndex >= lines.length) return csvText;

  const headerLine = lines[headerIndex];

  // Replace triple quotes around headers: """Field Name""" -> "Field Name"
  const normalizedHeader = headerLine.replace(/"{3}([^"]+)"{3}/g, '"$1"');

  lines[headerIndex] = normalizedHeader;

  return lines.join('\n');
};

/**
 * Parse CSV with automatic header normalization.
 * This function handles quoted headers and BOM characters commonly found in Tableau exports.
 */
const parseCSVWithNormalization = (csvText: string): d3Dsv.DSVRowArray => {
  // Preprocess to normalize triple quotes in headers
  const preprocessed = preprocessCSVHeaders(csvText);

  const parsed = d3Dsv.csvParse(preprocessed);

  // Create a normalized version of the data
  const normalizedData = parsed.map((row) => {
    const normalizedRow: d3Dsv.DSVRowString = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeHeader(key);
      normalizedRow[normalizedKey] = value;
    }
    return normalizedRow;
  }) as d3Dsv.DSVRowArray;

  // Update columns to use normalized names
  normalizedData.columns = parsed.columns.map(normalizeHeader);

  return normalizedData;
};

export const loadData = async (): Promise<SalesData[]> => {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.statusText}`);
  }
  const csvText = await response.text();
  const rawData = parseCSVWithNormalization(csvText);

  // Convert numeric fields and map to SalesData type
  return rawData.map((d: d3Dsv.DSVRowString) => ({
    'Channel Type': d['Channel Type'] || '',
    'Pay Type': d['Pay Type'] || '',
    'Item Category': d['Item Category'] || '',
    'Item ID': Number(d['Item ID']) || 0,
    'Item code': d['Item code'] || '',
    'Item Name': d['Item Name'] || '',
    'Employee ID': Number(d['Employee ID']) || 0,
    'Employee Code': d['Employee Code'] || '',
    'Employee Name': d['Employee Name'] || '',
    'Employee Locations': d['Employee Locations'] || '',
    'Employee Country': d['Employee Country'] || '',
    'Manager': d['Manager'] || '',
    'Department': d['Department'] || '',
    'Sales Date': d['Sales Date'] || '',
    'Sales_Cost': Number(d['Sales_Cost']) || 0,
    'Sales_Amt': Number(d['Sales_Amt']) || 0,
    'Sales_Qty': Number(d['Sales_Qty']) || 0,
    'Sales Type': d['Sales Type'] || '',
    'Customer ID': Number(d['Customer ID']) || 0,
    'Customer Name': d['Customer Name'] || '',
    'Customer Location': d['Customer Location'] || '',
    'Customer Country': d['Customer Country'] || '',
  } as SalesData));
};

export const aggregateSalesTypes = (data: SalesData[]): SalesTypeData[] => {
  const aggregated = new Map<string, SalesTypeData>();

  data.forEach((row) => {
    const key = row['Sales Type'];
    const existing = aggregated.get(key);
    const salesAmt = Number(row['Sales_Amt']);

    if (existing) {
      existing.salesAmt += salesAmt;
    } else {
      aggregated.set(key, {
        salesType: key,
        salesAmt: salesAmt,
        channelType: row['Channel Type'],
      });
    }
  });

  return Array.from(aggregated.values()).sort((a, b) => b.salesAmt - a.salesAmt);
};

export const aggregateSalesWithItems = (data: SalesData[]): SalesWithItemsData[] => {
  const aggregated = new Map<string, SalesWithItemsData>();

  data.forEach((row) => {
    const key = `${row['Item Category']}|${row['Department']}`;
    const existing = aggregated.get(key);
    const salesQty = Number(row['Sales_Qty']);

    if (existing) {
      existing.salesQty += salesQty;
    } else {
      aggregated.set(key, {
        itemCategory: row['Item Category'],
        department: row['Department'],
        salesQty: salesQty,
      });
    }
  });

  return Array.from(aggregated.values())
    .sort((a, b) => b.salesQty - a.salesQty);
};

export const aggregateItemsWithCategory = (data: SalesData[]): ItemsWithCategoryData[] => {
  const aggregated = new Map<string, ItemsWithCategoryData>();

  data.forEach((row) => {
    const key = `${row['Item Name']}|${row['Pay Type']}`;
    const existing = aggregated.get(key);
    const salesQty = Number(row['Sales_Qty']);

    if (existing) {
      existing.salesQty += salesQty;
    } else {
      aggregated.set(key, {
        itemName: row['Item Name'],
        payType: row['Pay Type'],
        salesQty: salesQty,
        itemCategory: row['Item Category'],
        salesType: row['Sales Type'],
      });
    }
  });

  return Array.from(aggregated.values())
    .sort((a, b) => b.salesQty - a.salesQty);
};

export const aggregatePayTypeWithYear = (data: SalesData[]): PayTypeWithYearData[] => {
  const aggregated = new Map<string, PayTypeWithYearData>();

  data.forEach((row) => {
    const year = new Date(row['Sales Date']).getFullYear();
    const key = `${year}|${row['Sales Type']}`;
    const existing = aggregated.get(key);
    const salesQty = Number(row['Sales_Qty']);

    if (existing) {
      existing.salesQty += salesQty;
    } else {
      aggregated.set(key, {
        year,
        salesType: row['Sales Type'],
        salesQty: salesQty,
      });
    }
  });

  return Array.from(aggregated.values())
    .sort((a, b) => b.salesQty - a.salesQty);
};

export const getUniquePayTypes = (data: SalesData[]): string[] => {
  return Array.from(new Set(data.map((d) => d['Pay Type']))).sort();
};

export const getUniqueSalesTypes = (data: SalesData[]): string[] => {
  return Array.from(new Set(data.map((d) => d['Sales Type']))).sort();
};

export const getUniqueItemCategories = (data: SalesData[]): string[] => {
  return Array.from(new Set(data.map((d) => d['Item Category']))).sort();
};
