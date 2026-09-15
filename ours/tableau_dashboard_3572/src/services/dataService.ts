import * as d3 from 'd3';
import type { HRData, BinnedData, AggregatedData } from '../types/hrData';

/**
 * TABLEAU FIELD MAPPING DOCUMENTATION
 *
 * This document maps Tableau spec fields to actual CSV column names.
 *
 * CSV Headers (from HR Data.csv):
 * 1. Average Montly Hours (bin) - binned version for histograms
 * 2. Last Evaluation (bin) - binned version for histograms
 * 3. Number of Records - count field
 * 4. Satisfaction Level (bin) - binned version for histograms
 * 5. Time Spend Company (group) - grouped field
 * 6. Work accident - binary field
 * 7. Average Montly Hours - raw numeric field
 * 8. Last Evaluation - raw numeric field
 * 9. Left - binary field (0=stayed, 1=left)
 * 10. Number Project - numeric field
 * 11. Promotion Last 5Years - binary field
 * 12. Salary - categorical field (low/medium/high)
 * 13. Sales - department field (categorical)
 * 14. Satisfaction Level - raw numeric field
 *
 * Tableau Field Mappings:
 * - [none:Sales:nk] -> Sales (department)
 * - [none:Number Project:ok] -> Number Project
 * - [none:Left:ok] -> Left (turnover status)
 * - [none:Time Spend Company (group):ok] -> Time Spend Company (group)
 * - [sum:Number of Records:qk] -> Count of records (computed)
 * - [cnt:Average Montly Hours (bin):qk] -> Average Montly Hours (bin)
 * - [none:Average Montly Hours (bin) 1:qk] -> Average Montly Hours (bin)
 * - [cnt:Satisfaction Level:qk] -> Satisfaction Level (bin)
 * - [none:Satisfaction Level (bin) 1:qk] -> Satisfaction Level (bin)
 *
 * HRData Interface Fields:
 * - Average Montly Hours: number (raw field)
 * - Last Evaluation: number
 * - Left: number (0 or 1)
 * - Number Project: number
 * - Promotion Last 5Years: number
 * - Salary: string
 * - Sales: string (department)
 * - Satisfaction Level: number
 * - Time Spend Company: number
 * - Work accident: number
 */

let cachedData: HRData[] | null = null;

/**
 * Normalize CSV header by removing BOM, extra quotes, and trimming whitespace
 */
const normalizeHeader = (header: string): string => {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM
    .replace(/^"+|"+$/g, '') // Remove surrounding quotes
    .trim();
};

/**
 * Parse CSV with robust handling of BOM, quoted headers, and line endings
 */
export const loadData = async (): Promise<HRData[]> => {
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch('/data/HR Data.csv');
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.statusText}`);
  }

  const csvText = await response.text();

  // Remove BOM if present at the start of the file
  const cleanedText = csvText.replace(/^\uFEFF/, '');

  // Parse with D3, then normalize headers
  const parsedData = d3.csvParse(cleanedText);

  // Create a mapping of normalized headers to original keys
  const headerMapping: Record<string, string> = {};
  Object.keys(parsedData[0] || {}).forEach(key => {
    headerMapping[normalizeHeader(key)] = key;
  });

  // Helper to safely get a value by normalized header
  const getValue = (row: d3.DSVRowString, normalizedKey: string): string => {
    const actualKey = headerMapping[normalizedKey];
    return actualKey ? (row[actualKey] || '') : '';
  };

  // Helper to safely get a number value
  const getNumber = (row: d3.DSVRowString, normalizedKey: string): number => {
    const value = getValue(row, normalizedKey);
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const data = parsedData.map((d) => {
    // Get the binned field values for Tableau compatibility
    const monthlyHoursBin = getValue(d, 'Average Montly Hours (bin)');
    const satisfactionBin = getValue(d, 'Satisfaction Level (bin)');

    return {
      'Average Montly Hours': getNumber(d, 'Average Montly Hours'),
      'Last Evaluation': getNumber(d, 'Last Evaluation'),
      'Left': getNumber(d, 'Left'),
      'Number Project': getNumber(d, 'Number Project'),
      'Promotion Last 5Years': getNumber(d, 'Promotion Last 5Years'),
      'Salary': getValue(d, 'Salary'),
      'Sales': getValue(d, 'Sales'),
      'Satisfaction Level': getNumber(d, 'Satisfaction Level'),
      'Time Spend Company': getNumber(d, 'Time Spend Company'),
      'Work accident': getNumber(d, 'Work accident'),
      // Tableau binned field aliases for spec compatibility
      // RUNTIME_FIELD_GENERATION: Average Montly Hours (bin) 1, Satisfaction Level (bin) 1
      'Average Montly Hours (bin) 1': monthlyHoursBin,
      'Satisfaction Level (bin) 1': satisfactionBin,
      'Average Montly Hours (bin)': monthlyHoursBin,
      'Satisfaction Level (bin)': satisfactionBin,
      'Time Spend Company (group)': getValue(d, 'Time Spend Company (group)'),
    } as HRData & Record<string, string | number>;
  });

  // Validate that we got data
  if (data.length === 0) {
    throw new Error('No data parsed from CSV. The file may be empty or malformed.');
  }

  // Validate critical fields have non-zero values
  const sampleRow = data[0];
  const hasValidData = data.some(row =>
    !isNaN(row['Average Montly Hours']) &&
    row['Average Montly Hours'] > 0 &&
    !isNaN(row['Satisfaction Level']) &&
    row['Satisfaction Level'] >= 0
  );

  if (!hasValidData) {
    console.error('Sample row:', sampleRow);
    throw new Error('CSV parsing failed: critical fields contain invalid data. Check for preamble rows or malformed headers.');
  }

  cachedData = data;
  return data;
};

// Bin satisfaction level data
export const binSatisfactionLevel = (data: HRData[]): BinnedData[] => {
  const binStep = 0.0576;
  const values = data.map(d => d['Satisfaction Level']).filter(v => !isNaN(v));

  const bins = d3.bin()
    .domain(d3.extent(values) as [number, number])
    .thresholds(d3.range(0, 1 + binStep, binStep))(values);

  return bins.map(bin => ({
    bin: `${bin.x0?.toFixed(2)}-${bin.x1?.toFixed(2)}`,
    count: bin.length,
  })).filter(d => d.count > 0);
};

// Bin monthly hours data
export const binMonthlyHours = (data: HRData[]): BinnedData[] => {
  const binStep = 10.2;
  const values = data.map(d => d['Average Montly Hours']).filter(v => !isNaN(v));

  const bins = d3.bin()
    .domain(d3.extent(values) as [number, number])
    .thresholds(d3.range(0, 400 + binStep, binStep))(values);

  return bins.map(bin => ({
    bin: `${Math.round(bin.x0 || 0)}-${Math.round(bin.x1 || 0)}`,
    count: bin.length,
  })).filter(d => d.count > 0);
};

// Aggregate by department
export const aggregateByDepartment = (data: HRData[]): AggregatedData[] => {
  const grouped = d3.rollup(
    data,
    v => v.length,
    d => d.Sales
  );

  return Array.from(grouped, ([category, count]) => ({
    category,
    value: count,
  })).sort((a, b) => b.value - a.value);
};

// Aggregate by project count and left status (stacked)
export const aggregateByProjectAndLeft = (data: HRData[]): AggregatedData[] => {
  const grouped = d3.rollup(
    data,
    v => v.length,
    d => d['Number Project'],
    d => d['Left']
  );

  const result: AggregatedData[] = [];
  grouped.forEach((seriesMap, category) => {
    seriesMap.forEach((value, series) => {
      result.push({
        category: String(category),
        value,
        series: String(series),
      });
    });
  });

  return result.sort((a, b) => Number(a.category) - Number(b.category));
};

// Calculate turnover rate by years worked
export const calculateTurnoverByYears = (data: HRData[]): AggregatedData[] => {
  // Aggregate by the calculated value
  const valueGroups = d3.rollup(
    data,
    v => v.length,
    d => {
      const left = d['Left'];
      const timeSpend = d['Time Spend Company'];
      return left === 0 ? 0 : 1 / timeSpend;
    },
    d => d['Time Spend Company']
  );

  const result: AggregatedData[] = [];
  valueGroups.forEach((seriesMap, category) => {
    seriesMap.forEach((value, series) => {
      result.push({
        category: String(category),
        value,
        series: String(series),
      });
    });
  });

  return result.sort((a, b) => Number(a.category) - Number(b.category));
};

// Apply filters to data
export const applyFilters = (data: HRData[], filters: {
  sales?: string;
  timeSpendCompany?: number;
  numberProject?: number;
  left?: number;
}): HRData[] => {
  return data.filter(d => {
    if (filters.sales !== undefined && d.Sales !== filters.sales) return false;
    if (filters.timeSpendCompany !== undefined && d['Time Spend Company'] !== filters.timeSpendCompany) return false;
    if (filters.numberProject !== undefined && d['Number Project'] !== filters.numberProject) return false;
    if (filters.left !== undefined && d['Left'] !== filters.left) return false;
    return true;
  });
};
