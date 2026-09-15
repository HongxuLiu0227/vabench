#!/usr/bin/env node
/**
 * Standalone validation script for Tableau data source
 * Run with: npx tsx scripts/validateData.ts
 */

import { loadData } from '../src/services/dataLoader';
import { validateTableauSource, logValidationResults } from '../src/utils/tableauValidator';

async function main() {
  console.log('Loading and validating Tableau data source...\n');

  try {
    // Load the data
    const data = await loadData();
    console.log(`✓ Successfully loaded ${data.length} records\n`);

    // Validate the data
    const result = validateTableauSource(data);

    // Log results
    logValidationResults(result);

    // Exit with appropriate code
    if (result.isValid) {
      console.log('✓ Data source validation PASSED\n');
      process.exit(0);
    } else {
      console.log('✗ Data source validation FAILED\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Error during validation:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
