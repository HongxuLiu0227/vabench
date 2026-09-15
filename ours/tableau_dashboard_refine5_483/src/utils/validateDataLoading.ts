/**
 * Tableau Data Validation Utility
 *
 * This utility validates that the CSV data can be loaded correctly
 * and contains all required fields for the Tableau spec.
 */

import { loadCsvData } from '../services/dataService';

export interface ValidationResult {
  success: boolean;
  message: string;
  details: {
    totalRows: number;
    rowsWithSales: number;
    rowsWithValidDates: number;
    uniqueSubCategories: number;
    uniqueYears: number;
    totalSales: number;
    sampleRows: Array<{
      orderId: string;
      orderDate: string;
      subCategory: string;
      sales: number;
    }>;
  };
}

/**
 * Validate that the data can be loaded and contains required fields
 */
export async function validateDataLoading(): Promise<ValidationResult> {
  try {
    // Load the data
    const data = await loadCsvData();

    // Basic validation
    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'No data loaded from CSV',
        details: {
          totalRows: 0,
          rowsWithSales: 0,
          rowsWithValidDates: 0,
          uniqueSubCategories: 0,
          uniqueYears: 0,
          totalSales: 0,
          sampleRows: [],
        },
      };
    }

    // Check for required fields
    const firstRow = data[0];
    const requiredFields = [
      'rowId', 'orderId', 'orderDate', 'shipDate', 'shipMode',
      'customerId', 'customerName', 'segment', 'country', 'city',
      'state', 'postalCode', 'region', 'productId', 'category',
      'subCategory', 'productName', 'sales', 'quantity', 'discount', 'profit'
    ];

    const missingFields = requiredFields.filter(field => !(field in firstRow));
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: {
          totalRows: data.length,
          rowsWithSales: 0,
          rowsWithValidDates: 0,
          uniqueSubCategories: 0,
          uniqueYears: 0,
          totalSales: 0,
          sampleRows: [],
        },
      };
    }

    // Data quality checks
    const rowsWithSales = data.filter(d => d.sales > 0).length;
    const rowsWithValidDates = data.filter(d => !isNaN(d.orderDate.getTime()) && d.orderDate.getFullYear() > 1900);
    const uniqueSubCategories = new Set(data.map(d => d.subCategory)).size;
    const uniqueYears = new Set(data.map(d => d.orderDate.getFullYear())).size;
    const totalSales = data.reduce((sum, d) => sum + d.sales, 0);

    // Get sample rows for debugging
    const sampleRows = data.slice(0, 3).map(row => ({
      orderId: row.orderId,
      orderDate: row.orderDate.toISOString().split('T')[0],
      subCategory: row.subCategory,
      sales: row.sales,
    }));

    // Check for critical data quality issues
    if (rowsWithSales === 0) {
      return {
        success: false,
        message: 'CRITICAL: All sales values are zero. Charts will be empty.',
        details: {
          totalRows: data.length,
          rowsWithSales,
          rowsWithValidDates: rowsWithValidDates.length,
          uniqueSubCategories,
          uniqueYears,
          totalSales,
          sampleRows,
        },
      };
    }

    if (rowsWithValidDates.length === 0) {
      return {
        success: false,
        message: 'CRITICAL: All dates are invalid. Time-based charts will fail.',
        details: {
          totalRows: data.length,
          rowsWithSales,
          rowsWithValidDates: 0,
          uniqueSubCategories,
          uniqueYears,
          totalSales,
          sampleRows,
        },
      };
    }

    // Success!
    return {
      success: true,
      message: `Data loaded successfully: ${data.length} rows, $${totalSales.toLocaleString()} total sales`,
      details: {
        totalRows: data.length,
        rowsWithSales,
        rowsWithValidDates: rowsWithValidDates.length,
        uniqueSubCategories,
        uniqueYears,
        totalSales,
        sampleRows,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Error loading data: ${error instanceof Error ? error.message : String(error)}`,
      details: {
        totalRows: 0,
        rowsWithSales: 0,
        rowsWithValidDates: 0,
        uniqueSubCategories: 0,
        uniqueYears: 0,
        totalSales: 0,
        sampleRows: [],
      },
    };
  }
}

/**
 * Run validation and log results to console
 */
export async function runValidationAndLog(): Promise<void> {
  console.log('=== Tableau Data Validation ===');
  const result = await validateDataLoading();

  if (result.success) {
    console.log('✓ VALIDATION PASSED');
    console.log(`  ${result.message}`);
    console.log(`  Data quality metrics:`);
    console.log(`    - Total rows: ${result.details.totalRows}`);
    console.log(`    - Rows with sales: ${result.details.rowsWithSales} (${((result.details.rowsWithSales / result.details.totalRows) * 100).toFixed(1)}%)`);
    console.log(`    - Rows with valid dates: ${result.details.rowsWithValidDates} (${((result.details.rowsWithValidDates / result.details.totalRows) * 100).toFixed(1)}%)`);
    console.log(`    - Unique sub-categories: ${result.details.uniqueSubCategories}`);
    console.log(`    - Unique years: ${result.details.uniqueYears}`);
    console.log(`    - Total sales: $${result.details.totalSales.toLocaleString()}`);
    console.log(`  Sample rows:`);
    result.details.sampleRows.forEach((row, i) => {
      console.log(`    ${i + 1}. ${row.orderId} | ${row.orderDate} | ${row.subCategory} | $${row.sales.toLocaleString()}`);
    });
  } else {
    console.error('✗ VALIDATION FAILED');
    console.error(`  ${result.message}`);
    if (result.details.sampleRows.length > 0) {
      console.error(`  Sample rows:`);
      result.details.sampleRows.forEach((row, i) => {
        console.error(`    ${i + 1}. ${JSON.stringify(row)}`);
      });
    }
  }

  console.log('===============================');
}
