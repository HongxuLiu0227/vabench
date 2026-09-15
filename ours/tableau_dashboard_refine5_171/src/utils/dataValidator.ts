/**
 * Tableau Source Validator
 *
 * Runtime validator to ensure deterministic and correct data ingestion.
 * This can be used during QA/build stages to verify data loading.
 */

import type { OrderRow } from '../types/data';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    rowsWithSales: number;
    rowsWithProfit: number;
    rowsWithValidDates: number;
    dateRange: { min: string; max: string } | null;
    salesRange: { min: number; max: number } | null;
    profitRange: { min: number; max: number } | null;
  };
}

/**
 * Validate that loaded data meets Tableau requirements
 */
export function validateTableauData(data: OrderRow[]): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    stats: {
      totalRows: data.length,
      rowsWithSales: 0,
      rowsWithProfit: 0,
      rowsWithValidDates: 0,
      dateRange: null,
      salesRange: null,
      profitRange: null,
    },
  };

  // Check if we have any data
  if (data.length === 0) {
    result.valid = false;
    result.errors.push('No data rows found - CSV parsing may have failed');
    return result;
  }

  // Check for critical fields
  const sampleRow = data[0];
  const criticalFields = ['Order ID', 'Order Date', 'Sales', 'Profit'];
  const missingFields = criticalFields.filter(field => !(field in sampleRow));

  if (missingFields.length > 0) {
    result.valid = false;
    result.errors.push(`Missing critical fields: ${missingFields.join(', ')}`);
  }

  // Analyze data quality
  let minSales = Infinity;
  let maxSales = -Infinity;
  let minProfit = Infinity;
  let maxProfit = -Infinity;
  let minDate: string | null = null;
  let maxDate: string | null = null;

  for (const row of data) {
    // Check sales
    if (row.Sales > 0) {
      result.stats.rowsWithSales++;
      minSales = Math.min(minSales, row.Sales);
      maxSales = Math.max(maxSales, row.Sales);
    }

    // Check profit
    if (row.Profit !== 0 && row.Profit !== null && row.Profit !== undefined) {
      result.stats.rowsWithProfit++;
      minProfit = Math.min(minProfit, row.Profit);
      maxProfit = Math.max(maxProfit, row.Profit);
    }

    // Check dates
    if (row['Order Date']) {
      const date = new Date(row['Order Date']);
      if (!isNaN(date.getTime())) {
        result.stats.rowsWithValidDates++;
        if (!minDate || row['Order Date'] < minDate) {
          minDate = row['Order Date'];
        }
        if (!maxDate || row['Order Date'] > maxDate) {
          maxDate = row['Order Date'];
        }
      }
    }
  }

  // Set ranges
  if (minSales !== Infinity) {
    result.stats.salesRange = { min: minSales, max: maxSales };
  }
  if (minProfit !== Infinity) {
    result.stats.profitRange = { min: minProfit, max: maxProfit };
  }
  if (minDate && maxDate) {
    result.stats.dateRange = { min: minDate, max: maxDate };
  }

  // Check for data quality issues
  if (result.stats.rowsWithSales === 0) {
    result.valid = false;
    result.errors.push('No rows with positive Sales values found - possible parsing error');
  }

  if (result.stats.rowsWithValidDates === 0) {
    result.valid = false;
    result.errors.push('No rows with valid Order Date found - possible date parsing error');
  }

  if (result.stats.rowsWithSales < data.length * 0.5) {
    result.warnings.push(
      `More than 50% of rows have zero Sales (${result.stats.rowsWithSales}/${data.length})`
    );
  }

  if (result.stats.rowsWithValidDates < data.length * 0.9) {
    result.warnings.push(
      `More than 10% of rows have invalid Order Date (${result.stats.rowsWithValidDates}/${data.length})`
    );
  }

  // Check for all-zero data (indicates parsing failure)
  const allZeroSales = data.every(row => row.Sales === 0);
  if (allZeroSales) {
    result.valid = false;
    result.errors.push('All Sales values are zero - CSV parsing likely failed');
  }

  const allZeroProfit = data.every(row => row.Profit === 0);
  if (allZeroProfit) {
    result.warnings.push('All Profit values are zero - may indicate parsing issue');
  }

  return result;
}

/**
 * Log validation result in a readable format
 */
export function logValidationResult(result: ValidationResult): void {
  console.log('=== Tableau Data Validation ===');

  if (result.valid) {
    console.log('✅ Validation PASSED');
  } else {
    console.log('❌ Validation FAILED');
  }

  console.log('\n--- Statistics ---');
  console.log(`Total rows: ${result.stats.totalRows}`);
  console.log(`Rows with sales: ${result.stats.rowsWithSales}`);
  console.log(`Rows with profit: ${result.stats.rowsWithProfit}`);
  console.log(`Rows with valid dates: ${result.stats.rowsWithValidDates}`);

  if (result.stats.salesRange) {
    console.log(`Sales range: ${result.stats.salesRange.min.toFixed(2)} - ${result.stats.salesRange.max.toFixed(2)}`);
  }

  if (result.stats.profitRange) {
    console.log(`Profit range: ${result.stats.profitRange.min.toFixed(2)} - ${result.stats.profitRange.max.toFixed(2)}`);
  }

  if (result.stats.dateRange) {
    console.log(`Date range: ${result.stats.dateRange.min} - ${result.stats.dateRange.max}`);
  }

  if (result.errors.length > 0) {
    console.log('\n--- Errors ---');
    result.errors.forEach(error => console.log(`❌ ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n--- Warnings ---');
    result.warnings.forEach(warning => console.log(`⚠️  ${warning}`));
  }

  console.log('=============================\n');
}

/**
 * Export validation result for automated testing
 */
export function exportValidationResult(result: ValidationResult): string {
  return JSON.stringify(result, null, 2);
}
