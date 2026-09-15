/**
 * Manual validation test for Tableau data ingestion
 *
 * This file provides utilities to manually test the data parser
 * without running the full application.
 */

import { loadSuperstoreData } from '../services/dataService';
import { validateSuperstoreData } from './tableauValidator';

/**
 * Tests the data loader and prints validation results
 */
export async function testDataLoader(): Promise<void> {
  console.log('='.repeat(60));
  console.log('TABLEAU DATA LOADER TEST');
  console.log('='.repeat(60));

  try {
    const startTime = Date.now();
    const data = await loadSuperstoreData();
    const loadTime = Date.now() - startTime;

    console.log(`\n⏱️  Data loaded in ${loadTime}ms`);

    const result = validateSuperstoreData(data);

    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION RESULTS');
    console.log('='.repeat(60));

    if (result.valid) {
      console.log('✅ PASSED: All validation checks passed');
    } else {
      console.log('❌ FAILED: Validation errors detected');
      console.log('\nErrors:');
      result.errors.forEach(err => console.log(`  ❌ ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
    }

    console.log('\n' + '-'.repeat(60));
    console.log('DATA STATISTICS');
    console.log('-'.repeat(60));
    console.log(`Total rows: ${result.stats.totalRows}`);
    console.log(`Unique categories: ${result.stats.uniqueCategories}`);
    console.log(`Unique sub-categories: ${result.stats.uniqueSubCategories}`);
    console.log(`Unique products: ${result.stats.uniqueProducts}`);
    console.log(`Date range: ${result.stats.dateRange.min} to ${result.stats.dateRange.max}`);
    console.log(`Sales range: $${result.stats.salesRange.min.toFixed(2)} to $${result.stats.salesRange.max.toFixed(2)}`);
    console.log(`Total sales: $${result.stats.salesRange.total.toLocaleString()}`);

    // Display first few data rows for verification
    console.log('\n' + '-'.repeat(60));
    console.log('VERIFICATION DATA (first 3 rows)');
    console.log('-'.repeat(60));
    data.slice(0, 3).forEach((row, i) => {
      console.log(`\nRow ${i + 1}:`);
      console.log(`  Order ID: ${row['Order ID']}`);
      console.log(`  Order Date: ${row['Order Date']}`);
      console.log(`  Customer: ${row['Customer Name']}`);
      console.log(`  Category: ${row.Category}`);
      console.log(`  Sub-Category: ${row['Sub-Category']}`);
      console.log(`  Sales: $${row.Sales.toFixed(2)}`);
      console.log(`  Profit: $${row.Profit.toFixed(2)}`);
    });

    console.log('\n' + '='.repeat(60));

    if (!result.valid) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testDataLoader()
    .then(() => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}
