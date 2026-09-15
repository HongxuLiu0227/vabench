/**
 * Tableau Source Validator
 *
 * Validates that the runtime data ingestion is deterministic and correct.
 * This ensures that:
 * - CSV parsing is robust and handles edge cases
 * - Required fields are present and properly typed
 * - Date parsing works correctly
 * - Numeric fields are coerced properly
 * - No silent failures that lead to all-zero charts or NaN filters
 */

import type { SuperstoreOrder } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    uniqueCategories: number;
    uniqueSubCategories: number;
    uniqueProducts: number;
    dateRange: {
      min: string;
      max: string;
    };
    salesRange: {
      min: number;
      max: number;
      total: number;
    };
  };
}

/**
 * Validates the Superstore data for Tableau compliance
 */
export function validateSuperstoreData(data: SuperstoreOrder[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!data || data.length === 0) {
    return {
      valid: false,
      errors: ['Data is empty or null'],
      warnings: [],
      stats: {
        totalRows: 0,
        uniqueCategories: 0,
        uniqueSubCategories: 0,
        uniqueProducts: 0,
        dateRange: { min: 'N/A', max: 'N/A' },
        salesRange: { min: 0, max: 0, total: 0 },
      },
    };
  }

  // Check for required fields
  const firstRow = data[0];
  const requiredFields: (keyof SuperstoreOrder)[] = [
    'Row ID',
    'Order ID',
    'Order Date',
    'Ship Date',
    'Sales',
    'Quantity',
    'Discount',
    'Profit',
    'Category',
    'Sub-Category',
    'Product Name',
  ];

  for (const field of requiredFields) {
    if (!(field in firstRow)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate data types and values
  let zeroSalesCount = 0;
  let invalidDateCount = 0;
  let nanValuesCount = 0;

  const categories = new Set<string>();
  const subCategories = new Set<string>();
  const products = new Set<string>();

  let minDate = new Date(8640000000000000); // Max date
  let maxDate = new Date(-8640000000000000); // Min date
  let totalSales = 0;
  let minSales = Infinity;
  let maxSales = -Infinity;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Check for NaN values
    if (typeof row.Sales !== 'number' || isNaN(row.Sales)) {
      nanValuesCount++;
      errors.push(`Row ${i + 1}: Sales is NaN`);
    }
    if (typeof row.Profit !== 'number' || isNaN(row.Profit)) {
      nanValuesCount++;
      errors.push(`Row ${i + 1}: Profit is NaN`);
    }

    // Check for zero values (might indicate parsing issues)
    if (row.Sales === 0) zeroSalesCount++;

    // Validate dates
    const orderDate = new Date(row['Order Date']);
    if (isNaN(orderDate.getTime())) {
      invalidDateCount++;
      warnings.push(`Row ${i + 1}: Invalid Order Date "${row['Order Date']}"`);
    } else {
      if (orderDate < minDate) minDate = orderDate;
      if (orderDate > maxDate) maxDate = orderDate;
    }

    // Track unique values
    if (row.Category) categories.add(row.Category);
    if (row['Sub-Category']) subCategories.add(row['Sub-Category']);
    if (row['Product Name']) products.add(row['Product Name']);

    // Calculate sales stats with explicit numeric coercion
    const salesValue = typeof row.Sales === 'number' ? row.Sales : parseFloat(String(row.Sales || '0'));
    if (!isNaN(salesValue)) {
      totalSales += salesValue;
      if (salesValue < minSales) minSales = salesValue;
      if (salesValue > maxSales) maxSales = salesValue;
    }
  }

  // Check for suspicious patterns
  if (zeroSalesCount > data.length * 0.5) {
    warnings.push(
      `More than 50% of rows have zero Sales (${zeroSalesCount}/${data.length}). ` +
      'This might indicate a parsing issue.'
    );
  }

  if (invalidDateCount > data.length * 0.1) {
    errors.push(
      `More than 10% of rows have invalid dates (${invalidDateCount}/${data.length}). ` +
      'This will cause Jan 1970 timeline issues.'
    );
  }

  if (nanValuesCount > 0) {
    errors.push(`Found ${nanValuesCount} NaN values in numeric fields. This will cause chart rendering issues.`);
  }

  // Check for epoch dates (indicates parsing failure)
  const epochCount = data.filter(
    row => new Date(row['Order Date']).getTime() === 0
  ).length;

  if (epochCount > 0) {
    errors.push(
      `${epochCount} rows have Order Date parsed as epoch (Jan 1, 1970). ` +
      'This indicates date parsing failure.'
    );
  }

  // Generate stats
  const stats: ValidationResult['stats'] = {
    totalRows: data.length,
    uniqueCategories: categories.size,
    uniqueSubCategories: subCategories.size,
    uniqueProducts: products.size,
    dateRange: {
      min: minDate.getTime() !== 8640000000000000 ? minDate.toISOString().split('T')[0] : 'N/A',
      max: maxDate.getTime() !== -8640000000000000 ? maxDate.toISOString().split('T')[0] : 'N/A',
    },
    salesRange: {
      min: minSales !== Infinity ? minSales : 0,
      max: maxSales !== -Infinity ? maxSales : 0,
      total: totalSales,
    },
  };

  // Determine overall validity
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    stats,
  };
}

/**
 * Runs validation and logs results to console
 */
export function runAndLogValidation(data: SuperstoreOrder[]): void {
  console.group('📊 Tableau Data Validation');

  const result = validateSuperstoreData(data);

  if (result.valid) {
    console.log('✅ Validation PASSED');
  } else {
    console.error('❌ Validation FAILED');
  }

  if (result.errors.length > 0) {
    console.error('Errors:');
    result.errors.forEach(err => console.error(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    console.warn('Warnings:');
    result.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  console.log('Statistics:');
  console.log(`  Total rows: ${result.stats.totalRows}`);
  console.log(`  Unique categories: ${result.stats.uniqueCategories}`);
  console.log(`  Unique sub-categories: ${result.stats.uniqueSubCategories}`);
  console.log(`  Unique products: ${result.stats.uniqueProducts}`);
  console.log(`  Date range: ${result.stats.dateRange.min} to ${result.stats.dateRange.max}`);
  console.log(`  Sales range: $${result.stats.salesRange.min.toFixed(2)} to $${result.stats.salesRange.max.toFixed(2)}`);
  console.log(`  Total sales: $${result.stats.salesRange.total.toFixed(2)}`);

  console.groupEnd();

  // Throw if validation failed (for runtime checks)
  if (!result.valid) {
    throw new Error(`Tableau data validation failed:\n${result.errors.join('\n')}`);
  }
}
