import { csvParse } from 'd3-dsv';
import type { DataRow, RegionMetrics, MonthlySales, YearlySales, ProductMetrics } from '../types';

const DATA_URL = '/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv';

/**
 * Safe number conversion that handles:
 * - Empty strings
 * - Non-numeric values
 * - NaN values
 * Returns 0 for invalid values to prevent chart failures
 */
const safeNumber = (value: string, fieldName: string): number => {
  if (value === '' || value === null || value === undefined) {
    console.warn(`Empty value for field "${fieldName}", using 0`);
    return 0;
  }

  const num = Number(value);
  if (isNaN(num)) {
    console.warn(`Invalid number value for field "${fieldName}": "${value}", using 0`);
    return 0;
  }

  return num;
};

/**
 * Safe date conversion that handles:
 * - Empty strings
 * - Invalid dates
 * - Various date formats
 * Throws error for truly invalid dates to prevent silent failures
 */
const safeDate = (value: string, fieldName: string): Date => {
  if (value === '' || value === null || value === undefined) {
    throw new Error(`Empty date value for field "${fieldName}"`);
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value for field "${fieldName}": "${value}"`);
  }

  return date;
};

/**
 * Get value from row data with fallback to alternative keys
 * Handles BOM, quotes, and whitespace variations
 */
const getRowValue = (row: { [key: string]: string }, possibleKeys: string[]): string => {
  for (const key of possibleKeys) {
    if (row[key] !== undefined) {
      return row[key];
    }
  }
  throw new Error(`Cannot find value for keys: ${possibleKeys.join(', ')}`);
};

export const loadData = async (): Promise<DataRow[]> => {
  const response = await fetch(DATA_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  if (!csvText || csvText.trim().length === 0) {
    throw new Error('Empty CSV file received');
  }

  const data = csvParse(csvText);

  if (!data || data.length === 0) {
    throw new Error('No data rows found in CSV');
  }

  console.log(`Loaded ${data.length} rows from CSV`);

  return data.map((d: { [key: string]: string }, index: number) => {
    try {
      const orderDateStr = getRowValue(d, ['Order Date', '﻿Order Date']);
      const shipDateStr = getRowValue(d, ['Ship Date', '﻿Ship Date']);

      const row: DataRow = {
        'Category': getRowValue(d, ['Category', '﻿Category']),
        'City': getRowValue(d, ['City', '﻿City']),
        'Country': getRowValue(d, ['Country', '﻿Country']),
        'Customer Name': getRowValue(d, ['Customer Name', '﻿Customer Name']),
        'Manufacturer': getRowValue(d, ['Manufacturer', '﻿Manufacturer']),
        'Order Date': safeDate(orderDateStr, 'Order Date'),
        'Order ID': getRowValue(d, ['Order ID', '﻿Order ID']),
        'Postal Code': String(getRowValue(d, ['Postal Code', '﻿Postal Code'])),
        'Product Name': getRowValue(d, ['Product Name', '﻿Product Name']),
        'Region': getRowValue(d, ['Region', '﻿Region']),
        'Segment': getRowValue(d, ['Segment', '﻿Segment']),
        'Ship Date': safeDate(shipDateStr, 'Ship Date'),
        'Ship Mode': getRowValue(d, ['Ship Mode', '﻿Ship Mode']),
        'State': getRowValue(d, ['State', '﻿State']),
        'Sub-Category': getRowValue(d, ['Sub-Category', '﻿Sub-Category']),
        'Discount': safeNumber(getRowValue(d, ['Discount', '﻿Discount']), 'Discount'),
        'Number of Records': safeNumber(getRowValue(d, ['Number of Records', '﻿Number of Records']), 'Number of Records'),
        'Profit': safeNumber(getRowValue(d, ['Profit', '﻿Profit']), 'Profit'),
        'Profit Ratio': safeNumber(getRowValue(d, ['Profit Ratio', '﻿Profit Ratio']), 'Profit Ratio'),
        'Quantity': safeNumber(getRowValue(d, ['Quantity', '﻿Quantity']), 'Quantity'),
        'Sales': safeNumber(getRowValue(d, ['Sales', '﻿Sales']), 'Sales'),
      };

      return row;
    } catch (error) {
      console.error(`Error parsing row ${index}:`, error);
      throw new Error(`Failed to parse row ${index}: ${error}`);
    }
  });
};

export const aggregateByRegion = (data: DataRow[]): RegionMetrics[] => {
  if (!data || data.length === 0) {
    console.warn('No data provided to aggregateByRegion');
    return [];
  }

  const regionMap = new Map<string, { Region: string; Sales: number; Quantity: number; Profit: number; customers: Set<string> }>();

  data.forEach((row) => {
    const region = row.Region;

    // Skip rows with missing region
    if (!region || region.trim() === '') {
      console.warn('Skipping row with missing region');
      return;
    }

    if (!regionMap.has(region)) {
      regionMap.set(region, {
        Region: region,
        Sales: 0,
        Quantity: 0,
        Profit: 0,
        customers: new Set<string>(),
      });
    }

    const metrics = regionMap.get(region)!;
    metrics.Sales += Number(row.Sales);
    metrics.Quantity += Number(row.Quantity);
    metrics.Profit += Number(row.Profit);
    metrics.customers.add(row['Customer Name']);
  });

  const result = Array.from(regionMap.values()).map((m) => ({
    Region: m.Region,
    Sales: m.Sales,
    Quantity: m.Quantity,
    Profit: m.Profit,
    ProfitRatio: m.Sales !== 0 ? m.Profit / m.Sales : 0,
    CustomerCount: m.customers.size,
  }));

  console.log(`Aggregated ${result.length} regions from ${data.length} rows`);

  return result;
};

export const aggregateByMonth = (data: DataRow[]): MonthlySales[] => {
  if (!data || data.length === 0) {
    console.warn('No data provided to aggregateByMonth');
    return [];
  }

  const monthMap = new Map<string, MonthlySales>();

  data.forEach((row) => {
    const date = row['Order Date'];

    // Validate date
    if (!date || isNaN(date.getTime())) {
      console.warn('Skipping row with invalid Order Date');
      return;
    }

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthDate = new Date(date.getFullYear(), date.getMonth(), 1);

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        Month: monthDate,
        Sales: 0,
      });
    }

    monthMap.get(monthKey)!.Sales += Number(row.Sales);
  });

  const result = Array.from(monthMap.values()).sort((a, b) => a.Month.getTime() - b.Month.getTime());

  console.log(`Aggregated ${result.length} months from ${data.length} rows`);

  return result;
};

export const aggregateByYear = (data: DataRow[]): YearlySales[] => {
  if (!data || data.length === 0) {
    console.warn('No data provided to aggregateByYear');
    return [];
  }

  const yearMap = new Map<number, YearlySales>();

  data.forEach((row) => {
    const date = row['Order Date'];

    // Validate date
    if (!date || isNaN(date.getTime())) {
      console.warn('Skipping row with invalid Order Date');
      return;
    }

    const year = date.getFullYear();

    // Validate year is reasonable (between 1900 and 2100)
    if (year < 1900 || year > 2100) {
      console.warn(`Skipping row with invalid year: ${year}`);
      return;
    }

    if (!yearMap.has(year)) {
      yearMap.set(year, {
        Year: year,
        Sales: 0,
      });
    }

    yearMap.get(year)!.Sales += Number(row.Sales);
  });

  const result = Array.from(yearMap.values()).sort((a, b) => a.Year - b.Year);

  console.log(`Aggregated ${result.length} years from ${data.length} rows`);

  return result;
};

export const aggregateByProduct = (data: DataRow[]): ProductMetrics[] => {
  if (!data || data.length === 0) {
    console.warn('No data provided to aggregateByProduct');
    return [];
  }

  const productMap = new Map<string, ProductMetrics>();

  data.forEach((row) => {
    const productName = row['Product Name'];

    // Skip rows with missing product name
    if (!productName || productName.trim() === '') {
      console.warn('Skipping row with missing product name');
      return;
    }

    if (!productMap.has(productName)) {
      productMap.set(productName, {
        ProductName: productName,
        Sales: 0,
        Profit: 0,
        Quantity: 0,
      });
    }

    const metrics = productMap.get(productName)!;
    metrics.Sales += Number(row.Sales);
    metrics.Profit += Number(row.Profit);
    metrics.Quantity += Number(row.Quantity);
  });

  const result = Array.from(productMap.values());

  console.log(`Aggregated ${result.length} products from ${data.length} rows`);

  return result;
};

export const filterByYear = (data: DataRow[], year?: number): DataRow[] => {
  if (!data || data.length === 0) {
    console.warn('No data provided to filterByYear');
    return [];
  }

  if (!year) return data;

  const filtered = data.filter((row) => {
    const date = row['Order Date'];
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    return date.getFullYear() === year;
  });

  console.log(`Filtered ${filtered.length} rows for year ${year} from ${data.length} total rows`);

  return filtered;
};

/**
 * Validate data quality after loading
 * Returns true if data passes basic validation checks
 */
export const validateDataQuality = (data: DataRow[]): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (!data || data.length === 0) {
    issues.push('No data loaded');
    return { valid: false, issues };
  }

  // Check for rows with all zero values
  let allZeroCount = 0;
  data.forEach((row) => {
    if (row.Sales === 0 && row.Profit === 0 && row.Quantity === 0) {
      allZeroCount++;
    }
  });

  if (allZeroCount > data.length * 0.5) {
    issues.push(`More than 50% of rows (${allZeroCount}/${data.length}) have all zero values`);
  }

  // Check for invalid dates
  let invalidDateCount = 0;
  data.forEach((row) => {
    const orderDate = row['Order Date'];
    const shipDate = row['Ship Date'];
    if (!orderDate || isNaN(orderDate.getTime())) invalidDateCount++;
    if (!shipDate || isNaN(shipDate.getTime())) invalidDateCount++;
  });

  if (invalidDateCount > 0) {
    issues.push(`${invalidDateCount} invalid dates found`);
  }

  // Check for NaN values in numeric fields
  let nanCount = 0;
  data.forEach((row) => {
    if (isNaN(row.Sales) || isNaN(row.Profit) || isNaN(row.Quantity) ||
        isNaN(row.Discount) || isNaN(row['Profit Ratio'])) {
      nanCount++;
    }
  });

  if (nanCount > 0) {
    issues.push(`${nanCount} rows with NaN values in numeric fields`);
  }

  // Check for minimum data quality
  const nonZeroSales = data.filter(row => row.Sales > 0).length;
  if (nonZeroSales === 0) {
    issues.push('No rows with non-zero Sales values');
  }

  const nonZeroProfit = data.filter(row => row.Profit !== 0).length;
  if (nonZeroProfit === 0) {
    issues.push('No rows with non-zero Profit values');
  }

  const valid = issues.length === 0;

  if (!valid) {
    console.error('Data quality validation failed:', issues);
  } else {
    console.log('Data quality validation passed');
  }

  return { valid, issues };
};
