/**
 * Standalone validation script to test CSV parsing and Tableau field resolution
 * Run with: npx tsx scripts/validateDataIngestion.ts
 */

import { loadOrdersData } from '../src/services/dataService';
import { extractFieldsFromSpec, validateTableauFields, logValidationResults, extractFieldName } from '../src/utils/validateTableauFields';
import tableauSpec from '../docs/tableau_spec.json';

async function validate() {
  console.log('Loading Orders data...');
  const data = await loadOrdersData();

  console.log(`Loaded ${data.length} records`);
  console.log('Sample record:', JSON.stringify(data[0], null, 2));

  // Extract fields from Tableau spec
  console.log('\nExtracting fields from Tableau spec...');
  const tableauFields = extractFieldsFromSpec(tableauSpec);

  console.log(`Found ${tableauFields.length} unique field references`);

  // Validate field resolution
  const mappings = validateTableauFields(data, tableauFields);
  logValidationResults(mappings);

  // Check for missing fields
  const missingFields = mappings.filter(m => !m.found);
  if (missingFields.length > 0) {
    console.error('\n❌ VALIDATION FAILED: Some fields could not be resolved:');
    missingFields.forEach(m => {
      console.error(`  - ${m.tableauField} -> "${m.csvColumn}"`);
    });
    process.exit(1);
  }

  // Verify data quality
  console.log('\n=== Data Quality Checks ===');

  // Check for valid Sales values
  const validSales = data.filter(d => d.Sales > 0);
  console.log(`✓ Records with Sales > 0: ${validSales.length} / ${data.length}`);

  // Check for valid Profit values
  const validProfit = data.filter(d => !isNaN(d.Profit));
  console.log(`✓ Records with valid Profit: ${validProfit.length} / ${data.length}`);

  // Check for valid dates
  const validDates = data.filter(d => d["Order Date"] instanceof Date && !isNaN(d["Order Date"].getTime()));
  console.log(`✓ Records with valid Order Date: ${validDates.length} / ${data.length}`);

  // Check for required categorical fields
  const hasCategory = data.filter(d => d.Category && d.Category !== '');
  console.log(`✓ Records with Category: ${hasCategory.length} / ${data.length}`);

  const hasSubCategory = data.filter(d => d["Sub-Category"] && d["Sub-Category"] !== '');
  console.log(`✓ Records with Sub-Category: ${hasSubCategory.length} / ${data.length}`);

  const hasMarket = data.filter(d => d.Market && d.Market !== '');
  console.log(`✓ Records with Market: ${hasMarket.length} / ${data.length}`);

  // Check for Product Name (for scatterplot)
  const hasProductName = data.filter(d => d["Product Name"] && d["Product Name"] !== '');
  console.log(`✓ Records with Product Name: ${hasProductName.length} / ${data.length}`);

  // Verify no Jan 1970 dates (Unix epoch default)
  const epochDates = data.filter(d => {
    const date = new Date(d["Order Date"]);
    return date.getFullYear() === 1970 && date.getMonth() === 0;
  });

  if (epochDates.length > 0) {
    console.error(`\n❌ VALIDATION FAILED: Found ${epochDates.length} records with Jan 1970 dates (Unix epoch default)`);
    process.exit(1);
  } else {
    console.log('✓ No Jan 1970 dates found');
  }

  // Check for NaN values in numeric fields
  const nanSales = data.filter(d => isNaN(d.Sales));
  if (nanSales.length > 0) {
    console.error(`\n❌ VALIDATION FAILED: Found ${nanSales.length} records with NaN Sales`);
    process.exit(1);
  } else {
    console.log('✓ No NaN Sales values');
  }

  const nanProfit = data.filter(d => isNaN(d.Profit));
  if (nanProfit.length > 0) {
    console.error(`\n❌ VALIDATION FAILED: Found ${nanProfit.length} records with NaN Profit`);
    process.exit(1);
  } else {
    console.log('✓ No NaN Profit values');
  }

  console.log('\n✅ ALL VALIDATIONS PASSED\n');
}

validate().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
