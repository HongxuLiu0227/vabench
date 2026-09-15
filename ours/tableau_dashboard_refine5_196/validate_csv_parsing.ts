/**
 * Standalone script to validate CSV parsing with preamble detection
 * Run with: npx tsx validate_csv_parsing.ts
 */

import Papa from 'papaparse';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, 'public/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');

interface OrderData {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Sales': number;
  'Profit': number;
  'Quantity': number;
  [key: string]: string | number;
}

function normalizeHeader(header: string): string {
  return header
    .replace(/^[\uFEFF]+/, '')
    .replace(/^["']+|["']+$/g, '')
    .trim();
}

function findHeaderRowIndex(lines: string[]): number {
  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map(col => normalizeHeader(col));

    const hasRowId = columns.some(col =>
      col.toLowerCase().includes('row id') || col === 'Row ID'
    );
    const hasOrderId = columns.some(col =>
      col.toLowerCase().includes('order id') || col === 'Order ID'
    );
    const hasOrderDate = columns.some(col =>
      col.toLowerCase().includes('order date') || col === 'Order Date'
    );
    const hasSales = columns.some(col =>
      col.toLowerCase().includes('sales') || col === 'Sales'
    );

    if (hasRowId && hasOrderId && hasOrderDate && hasSales) {
      return i;
    }
  }

  console.warn('Could not detect header row, assuming line 0');
  return 0;
}

async function validateParsing(): Promise<void> {
  console.log('🔍 Validating CSV parsing...\n');

  const csvText = readFileSync(DATA_PATH, 'utf-8');
  const lines = csvText.split(/\r?\n/);

  console.log(`📊 Total lines in file: ${lines.length}`);
  console.log('\nFirst 10 lines:');
  lines.slice(0, 10).forEach((line, i) => {
    console.log(`  Line ${i}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
  });

  const headerRowIndex = findHeaderRowIndex(lines);
  console.log(`\n✅ Detected header at line ${headerRowIndex}`);

  if (headerRowIndex > 0) {
    console.log(`   Skipping ${headerRowIndex} preamble rows`);
  }

  const dataLines = lines.slice(headerRowIndex);
  const cleanCsvText = dataLines.join('\n');

  Papa.parse<OrderData>(cleanCsvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
    complete: (results) => {
      console.log(`\n📈 Parsing results:`);
      console.log(`   Total rows parsed: ${results.data.length}`);

      if (results.data.length > 0) {
        const firstRow = results.data[0];
        console.log(`\n🔑 First row keys:`, Object.keys(firstRow));
        console.log(`\n📋 First row sample data:`);
        console.log(`   Row ID: ${firstRow['Row ID']}`);
        console.log(`   Order ID: ${firstRow['Order ID']}`);
        console.log(`   Order Date: ${firstRow['Order Date']}`);
        console.log(`   Sales: ${firstRow['Sales']}`);
        console.log(`   Profit: ${firstRow['Profit']}`);
        console.log(`   Quantity: ${firstRow['Quantity']}`);

        // Check for data quality issues
        let invalidSales = 0;
        let invalidDates = 0;
        let zeroValues = 0;

        results.data.forEach((row) => {
          const sales = row['Sales'];
          const date = row['Order Date'];

          if (typeof sales !== 'number' || isNaN(sales)) invalidSales++;
          if (!date) invalidDates++;
          if (sales === 0) zeroValues++;
        });

        console.log(`\n⚠️  Data quality checks:`);
        console.log(`   Invalid Sales values: ${invalidSales}`);
        console.log(`   Missing Order Dates: ${invalidDates}`);
        console.log(`   Zero Sales values: ${zeroValues}`);
        console.log(`   Valid data rows: ${results.data.length - Math.max(invalidSales, invalidDates)}`);

        // Final validation
        const allValid = invalidSales === 0 && invalidDates === 0 && results.data.length > 1000;
        if (allValid) {
          console.log('\n✅ CSV PARSING VALIDATION PASSED!');
          console.log('   - Preamble detection: ✓');
          console.log('   - Header parsing: ✓');
          console.log('   - Data extraction: ✓');
          console.log('   - Field typing: ✓');
        } else {
          console.log('\n❌ CSV PARSING VALIDATION FAILED!');
          process.exit(1);
        }
      } else {
        console.log('\n❌ No data rows found!');
        process.exit(1);
      }
    },
    error: (error: Error) => {
      console.error('\n❌ Parse error:', error.message);
      process.exit(1);
    },
  });
}

// Run validation
validateParsing().catch((error) => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
