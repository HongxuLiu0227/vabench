/**
 * Standalone validator runner - can be executed with:
 * npx tsx src/utils/runValidator.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateTableauSource } from './validateTableauSource';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Running Tableau source validation...\n');

  // Read CSV file directly
  const csvPath = path.join(__dirname, '../../public/data/processed_data_All.csv');
  console.log(`Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Monkey-patch fetch to return the CSV content
  globalThis.fetch = async () => {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => csvContent,
    } as Response;
  };

  const result = await validateTableauSource('/data/processed_data_All.csv');

  console.log('\n📊 SUMMARY:');
  console.log(`  Total Rows: ${result.summary.totalRows}`);
  console.log(`  Columns Found: ${result.summary.columns.length}`);
  if (result.summary.columns.length > 0) {
    console.log(`  ${result.summary.columns.map(c => `    - ${c}`).join('\n')}`);
  }

  console.log('\n📈 NUMERIC FIELD STATISTICS:');
  Object.entries(result.summary.numericFieldStats).forEach(([field, stats]) => {
    console.log(`  ${field}:`);
    console.log(`    Min: ${stats.min.toFixed(2)}`);
    console.log(`    Max: ${stats.max.toFixed(2)}`);
    console.log(`    Avg: ${stats.avg.toFixed(2)}`);
    console.log(`    Null Count: ${stats.nullCount}`);
  });

  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(e => console.log(`  - ${e}`));
    console.log('\n❌ VALIDATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ VALIDATION PASSED');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
