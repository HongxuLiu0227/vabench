/**
 * Tableau Field Mapping Utility
 *
 * This module provides deterministic mapping between Tableau spec fields
 * and actual CSV column names, with robust fuzzy matching and validation.
 */

import { OfficeSupplyData } from '../types';

/**
 * Normalized field mappings from Tableau spec to actual data columns
 */
export const FIELD_MAPPINGS = {
  // Date fields
  'Order_Date': 'Order_Date',
  'Order Date': 'Order_Date',

  // Dimension fields
  'Sales Region': 'Sales Region',
  'Sales_Region': 'Sales Region',
  'Sales representative': 'Sales representative',
  'Sales Representative': 'Sales representative',
  'Sales_Representative': 'Sales representative',
  'Item': 'Item',

  // Measure fields
  'Units Sold': 'Units Sold',
  'Units_Sold': 'Units Sold',
  'Unit Price': 'Unit Price',
  'Unit_Price': 'Unit Price',
  'Revenue': 'Revenue',
  'Calculation_1414411819444039680': 'Revenue', // Tableau calculated field

  // Derived fields
  'Year': 'Year',
  'Month': 'Month',
  'YearMonth': 'YearMonth',
} as const;

/**
 * Validate that a row has all required fields
 */
export function validateRowData(row: OfficeSupplyData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!row.Order_Date || isNaN(row.Order_Date.getTime())) {
    errors.push('Invalid or missing Order_Date');
  }

  if (!row['Sales Region']) {
    errors.push('Missing Sales Region');
  }

  if (!row['Sales representative']) {
    errors.push('Missing Sales representative');
  }

  if (!row.Item) {
    errors.push('Missing Item');
  }

  if (isNaN(row['Units Sold'])) {
    errors.push('Invalid Units Sold');
  }

  if (isNaN(row['Unit Price'])) {
    errors.push('Invalid Unit Price');
  }

  if (isNaN(row.Revenue)) {
    errors.push('Invalid Revenue');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get the actual column name for a Tableau field
 */
export function getColumnNameForTableauField(tableauField: string): string {
  // Try exact match first
  if (tableauField in FIELD_MAPPINGS) {
    return FIELD_MAPPINGS[tableauField as keyof typeof FIELD_MAPPINGS];
  }

  // Try fuzzy match
  const normalizedField = tableauField
    .replace(/\s+/g, '_')
    .replace(/['"]/g, '');

  for (const [tableauKey, dataKey] of Object.entries(FIELD_MAPPINGS)) {
    const normalizedKey = tableauKey.replace(/\s+/g, '_');
    if (normalizedField === normalizedKey) {
      return dataKey;
    }
  }

  // Return original if no match found
  console.warn(`No mapping found for Tableau field: ${tableauField}`);
  return tableauField;
}

/**
 * Validate that all required fields from the Tableau spec
 * can be resolved to actual data columns
 */
export function validateTableauFieldMappings(
  sampleRow: OfficeSupplyData
): { valid: boolean; missingFields: string[] } {
  const requiredFields = [
    'Order_Date',
    'Sales Region',
    'Sales representative',
    'Item',
    'Units Sold',
    'Unit Price',
    'Revenue',
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const columnName = getColumnNameForTableauField(field);
    if (!(columnName in sampleRow)) {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Check data quality metrics
 */
export function getDataQualityMetrics(data: OfficeSupplyData[]): {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  dateRange: { min: Date; max: Date } | null;
  uniqueItems: string[];
  uniqueSalesReps: string[];
  uniqueRegions: string[];
  zeroRevenueCount: number;
  nanCount: number;
} {
  let validRows = 0;
  let invalidRows = 0;
  let zeroRevenueCount = 0;
  let nanCount = 0;

  const dates: Date[] = [];
  const uniqueItems = new Set<string>();
  const uniqueSalesReps = new Set<string>();
  const uniqueRegions = new Set<string>();

  for (const row of data) {
    const validation = validateRowData(row);
    if (validation.valid) {
      validRows++;
      dates.push(row.Order_Date);
      uniqueItems.add(row.Item);
      uniqueSalesReps.add(row['Sales representative']);
      uniqueRegions.add(row['Sales Region']);

      if (row.Revenue === 0) {
        zeroRevenueCount++;
      }
    } else {
      invalidRows++;
    }

    // Check for NaN in numeric fields
    if (isNaN(row['Units Sold']) || isNaN(row['Unit Price']) || isNaN(row.Revenue)) {
      nanCount++;
    }
  }

  let dateRange: { min: Date; max: Date } | null = null;
  if (dates.length > 0) {
    dates.sort((a, b) => a.getTime() - b.getTime());
    dateRange = {
      min: dates[0],
      max: dates[dates.length - 1],
    };
  }

  return {
    totalRows: data.length,
    validRows,
    invalidRows,
    dateRange,
    uniqueItems: Array.from(uniqueItems).sort(),
    uniqueSalesReps: Array.from(uniqueSalesReps).sort(),
    uniqueRegions: Array.from(uniqueRegions).sort(),
    zeroRevenueCount,
    nanCount,
  };
}
