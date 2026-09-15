/**
 * Data validation utilities for Tableau dashboard
 * This file contains utilities to validate that data loading works correctly
 */

import { loadData, resolveTableauField } from '../services/dataLoader';

export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    dateRange: { min: Date; max: Date } | null;
    salesRange: { min: number; max: number } | null;
    uniqueCategories: number;
    uniqueSubCategories: number;
  };
}

/**
 * Validates that the data can be loaded and parsed correctly
 */
export async function validateDataSource(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats: ValidationResult['stats'] = {
    totalRows: 0,
    dateRange: null,
    salesRange: null,
    uniqueCategories: 0,
    uniqueSubCategories: 0,
  };

  try {
    // Test data loading
    const data = await loadData();

    if (!data || data.length === 0) {
      errors.push('No data loaded from CSV');
      return { success: false, errors, warnings, stats };
    }

    stats.totalRows = data.length;

    // Validate data integrity
    let invalidDateCount = 0;
    let invalidSalesCount = 0;
    const dates: Date[] = [];
    const sales: number[] = [];
    const categories = new Set<string>();
    const subCategories = new Set<string>();

    data.forEach((row, index) => {
      // Check dates
      const orderDate = row['Order Date'];
      if (!(orderDate instanceof Date) || isNaN(orderDate.getTime())) {
        invalidDateCount++;
        if (invalidDateCount <= 5) {
          errors.push(`Row ${index}: Invalid Order Date: ${orderDate}`);
        }
      } else {
        dates.push(orderDate);
      }

      // Check sales
      if (isNaN(row.Sales) || row.Sales < 0) {
        invalidSalesCount++;
        if (invalidSalesCount <= 5) {
          warnings.push(`Row ${index}: Suspicious Sales value: ${row.Sales}`);
        }
      } else {
        sales.push(row.Sales);
      }

      // Track categorical values
      if (row.Category) categories.add(row.Category);
      if (row['Sub-Category']) subCategories.add(row['Sub-Category']);
    });

    if (invalidDateCount > 5) {
      errors.push(`... and ${invalidDateCount - 5} more rows with invalid dates`);
    }

    // Calculate stats
    if (dates.length > 0) {
      stats.dateRange = {
        min: new Date(Math.min(...dates.map(d => d.getTime()))),
        max: new Date(Math.max(...dates.map(d => d.getTime()))),
      };
    }

    if (sales.length > 0) {
      stats.salesRange = {
        min: Math.min(...sales),
        max: Math.max(...sales),
      };
    }

    stats.uniqueCategories = categories.size;
    stats.uniqueSubCategories = subCategories.size;

    // Test Tableau field resolution
    try {
      const testFields = [
        '[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]',
        '[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[tmn:Order Date:qk]',
        '[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Profit:qk]',
      ];

      testFields.forEach(field => {
        const resolved = resolveTableauField(field);
        if (!resolved) {
          errors.push(`Failed to resolve Tableau field: ${field}`);
        }
      });
    } catch (error) {
      errors.push(`Tableau field resolution error: ${error}`);
    }

    // Check for all-zero sales (indicates parsing issue)
    const totalSales = sales.reduce((sum, s) => sum + s, 0);
    if (totalSales === 0 && sales.length > 0) {
      errors.push('Total sales is zero - this may indicate a parsing issue');
    }

    // Check for Jan 1970 dates (indicates Unix timestamp 0 parsing issue)
    const jan1970Count = dates.filter(d =>
      d.getFullYear() === 1970 && d.getMonth() === 0
    ).length;
    if (jan1970Count > 0) {
      warnings.push(`Found ${jan1970Count} dates in January 1970 - may indicate date parsing issue`);
    }

    const success = errors.length === 0;
    return { success, errors, warnings, stats };

  } catch (error) {
    errors.push(`Data loading failed: ${error}`);
    return { success: false, errors, warnings, stats };
  }
}

/**
 * Runs validation and logs results to console
 */
export async function runValidationAndLog(): Promise<void> {
  console.log('=== Tableau Data Source Validation ===\n');

  const result = await validateDataSource();

  if (result.success) {
    console.log('✅ Validation PASSED\n');
  } else {
    console.log('❌ Validation FAILED\n');
  }

  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach(err => console.log(`  - ${err}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('Warnings:');
    result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
    console.log('');
  }

  console.log('Statistics:');
  console.log(`  Total rows: ${result.stats.totalRows}`);
  console.log(`  Unique categories: ${result.stats.uniqueCategories}`);
  console.log(`  Unique sub-categories: ${result.stats.uniqueSubCategories}`);

  if (result.stats.dateRange) {
    console.log(`  Date range: ${result.stats.dateRange.min.toISOString().split('T')[0]} to ${result.stats.dateRange.max.toISOString().split('T')[0]}`);
  }

  if (result.stats.salesRange) {
    console.log(`  Sales range: $${result.stats.salesRange.min.toFixed(2)} to $${result.stats.salesRange.max.toFixed(2)}`);
  }

  console.log('\n=====================================\n');
}
