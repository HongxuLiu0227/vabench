import { loadSalesData, type SalesData } from '../services/dataService';
import { aggregateByYear, aggregateByMonth, aggregateBySubCategory } from '../lib/dataTransform';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    yearsFound: number;
    monthsFound: number;
    subCategoriesFound: number;
    totalSales: number;
    totalProfit: number;
  };
}

/**
 * Validates that the Tableau data source can be loaded and parsed correctly.
 * Checks for:
 * - CSV file accessibility
 * - Correct field mapping
 * - Valid data types
 * - Non-zero metrics
 * - Proper date parsing (preventing Jan 1970 issues)
 */
export async function validateTableauSource(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const summary = {
    totalRows: 0,
    yearsFound: 0,
    monthsFound: 0,
    subCategoriesFound: 0,
    totalSales: 0,
    totalProfit: 0,
  };

  try {
    // Test 1: Load CSV data
    console.log('Loading CSV data...');
    const data = await loadSalesData();
    summary.totalRows = data.length;

    if (data.length === 0) {
      errors.push('CSV file is empty or could not be parsed');
      return { isValid: false, errors, warnings, summary };
    }

    console.log(`✓ Loaded ${data.length} rows`);

    // Test 2: Validate required fields exist
    console.log('Validating required fields...');
    const firstRow = data[0];
    const requiredFields: (keyof SalesData)[] = [
      'Order Date', 'Sales', 'Profit', 'Quantity',
      'Category', 'Sub-Category', 'Product Name'
    ];

    for (const field of requiredFields) {
      if (!(field in firstRow)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings, summary };
    }

    console.log('✓ All required fields present');

    // Test 3: Validate date parsing (check for Jan 1970 issues)
    console.log('Validating date parsing...');
    let invalidDateCount = 0;
    let jan1970Count = 0;

    for (const row of data.slice(0, 100)) { // Sample first 100 rows
      const orderDate = row['Order Date'];
      const date = new Date(orderDate);

      if (isNaN(date.getTime())) {
        invalidDateCount++;
      } else if (date.getFullYear() === 1970 && date.getMonth() === 0 && date.getDate() <= 3) {
        jan1970Count++;
      }
    }

    if (invalidDateCount > 0) {
      errors.push(`Found ${invalidDateCount} rows with invalid dates`);
    }

    if (jan1970Count > 0) {
      warnings.push(`Found ${jan1970Count} rows with dates parsing to Jan 1970 (likely invalid dates)`);
    }

    if (invalidDateCount > 0) {
      return { isValid: false, errors, warnings, summary };
    }

    console.log('✓ Date parsing working correctly');

    // Test 4: Validate numeric fields
    console.log('Validating numeric fields...');
    let zeroSalesCount = 0;
    let nanSalesCount = 0;

    for (const row of data) {
      const sales = typeof row.Sales === 'number' ? row.Sales : parseFloat(String(row.Sales));
      const profit = typeof row.Profit === 'number' ? row.Profit : parseFloat(String(row.Profit));

      if (isNaN(sales)) {
        nanSalesCount++;
      } else if (sales === 0) {
        zeroSalesCount++;
      }

      summary.totalSales += sales || 0;
      summary.totalProfit += profit || 0;
    }

    if (nanSalesCount > 0) {
      errors.push(`Found ${nanSalesCount} rows with NaN Sales values`);
    }

    if (zeroSalesCount > data.length * 0.5) {
      warnings.push(`More than 50% of rows have zero Sales (${zeroSalesCount}/${data.length})`);
    }

    if (nanSalesCount > 0) {
      return { isValid: false, errors, warnings, summary };
    }

    console.log(`✓ Numeric fields valid. Total Sales: $${summary.totalSales.toFixed(2)}, Total Profit: $${summary.totalProfit.toFixed(2)}`);

    // Test 5: Validate aggregations
    console.log('Validating aggregations...');

    const byYear = aggregateByYear(data);
    summary.yearsFound = byYear.length;

    if (byYear.length === 0) {
      errors.push('Yearly aggregation returned no results');
    } else {
      console.log(`✓ Found ${byYear.length} years of data`);

      // Check for zero sales in aggregated data
      const yearsWithZeroSales = byYear.filter(y => y.Sales === 0).length;
      if (yearsWithZeroSales === byYear.length) {
        errors.push('All years have zero Sales after aggregation');
        return { isValid: false, errors, warnings, summary };
      }
    }

    const byMonth = aggregateByMonth(data);
    summary.monthsFound = byMonth.length;

    if (byMonth.length === 0) {
      errors.push('Monthly aggregation returned no results');
    } else {
      console.log(`✓ Found ${byMonth.length} months of data`);

      // Check for zero sales in aggregated data
      const monthsWithZeroSales = byMonth.filter(m => m.Sales === 0).length;
      if (monthsWithZeroSales === byMonth.length) {
        errors.push('All months have zero Sales after aggregation');
        return { isValid: false, errors, warnings, summary };
      }
    }

    const bySubCategory = aggregateBySubCategory(data);
    summary.subCategoriesFound = bySubCategory.length;

    if (bySubCategory.length === 0) {
      errors.push('Sub-category aggregation returned no results');
    } else {
      console.log(`✓ Found ${bySubCategory.length} sub-categories`);

      // Check for zero sales in aggregated data
      const subsWithZeroSales = bySubCategory.filter(s => s.Sales === 0).length;
      if (subsWithZeroSales === bySubCategory.length) {
        errors.push('All sub-categories have zero Sales after aggregation');
        return { isValid: false, errors, warnings, summary };
      }
    }

    console.log('\n✓ All validation checks passed!');

    return {
      isValid: true,
      errors,
      warnings,
      summary
    };

  } catch (error) {
    errors.push(`Validation failed with error: ${error instanceof Error ? error.message : String(error)}`);
    return { isValid: false, errors, warnings, summary };
  }
}

/**
 * Runs validation and logs results to console
 */
export async function runValidationAndLog(): Promise<void> {
  console.log('='.repeat(60));
  console.log('TABLEAU SOURCE VALIDATION');
  console.log('='.repeat(60));
  console.log('');

  const result = await validateTableauSource();

  console.log('');
  console.log('='.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(60));
  console.log('');

  console.log(`Valid: ${result.isValid ? '✓ YES' : '✗ NO'}`);
  console.log('');

  if (result.errors.length > 0) {
    console.log('ERRORS:');
    result.errors.forEach(err => console.log(`  ✗ ${err}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('WARNINGS:');
    result.warnings.forEach(warn => console.log(`  ⚠ ${warn}`));
    console.log('');
  }

  console.log('SUMMARY:');
  console.log(`  Total Rows: ${result.summary.totalRows}`);
  console.log(`  Years Found: ${result.summary.yearsFound}`);
  console.log(`  Months Found: ${result.summary.monthsFound}`);
  console.log(`  Sub-Categories Found: ${result.summary.subCategoriesFound}`);
  console.log(`  Total Sales: $${result.summary.totalSales.toFixed(2)}`);
  console.log(`  Total Profit: $${result.summary.totalProfit.toFixed(2)}`);
  console.log('');

  console.log('='.repeat(60));
  console.log('');
}
