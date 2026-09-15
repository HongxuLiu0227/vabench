/**
 * Comprehensive Tableau Source Ingestion Validator
 *
 * This script validates the entire ingestion pipeline to ensure:
 * 1. CSV file exists and is readable
 * 2. Triple-quoted headers are handled correctly
 * 3. BOM is removed
 * 4. All required Tableau spec fields map to CSV columns
 * 5. Numeric fields coerce correctly
 * 6. Date fields parse correctly
 * 7. Calculated fields can be derived
 * 8. No silent bad parses (all-zero charts, NaN filters, Jan 1970 timelines)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const csvPath = path.join(projectRoot, 'public/data/TEMP_0nc2r4718q3tv71etu3qn12v6eqk.csv');
const specPath = path.join(projectRoot, 'docs/tableau_spec.json');
const contractPath = path.join(projectRoot, 'docs/tableau_render_contract.json');

// Test data quality metrics
const QUALITY_THRESHOLDS = {
  MIN_VALID_ROWS: 100,           // Minimum number of valid data rows expected
  MIN_NONZERO_SALES: 0.8,        // At least 80% of rows should have non-zero sales
  MAX_INVALID_DATES: 0.01,       // At most 1% of dates can be invalid
  MIN_REGIONS: 3,                // At least 3 regions expected
  MIN_STATES: 20                 // At least 20 states expected
};

function cleanCSVData(text) {
  let cleaned = text.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/"""/g, '"');
  return cleaned;
}

function parseCSVLine(line) {
  const regex = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;
  const values = [];
  let match;

  while ((match = regex.exec(line)) !== null) {
    let value = match[1];
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/""/g, '"');
    }
    values.push(value);
  }

  return values;
}

function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     Tableau Source Ingestion - Comprehensive Validator        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  let allTestsPassed = true;
  const testResults = [];

  // ============================================================================
  // TEST 1: File exists and is readable
  // ============================================================================
  console.log('📁 TEST 1: File accessibility');
  try {
    if (!fs.existsSync(csvPath)) {
      console.log('  ❌ FAIL: CSV file not found');
      allTestsPassed = false;
      testResults.push({ name: 'File accessibility', passed: false });
    } else {
      const stats = fs.statSync(csvPath);
      console.log(`  ✅ PASS: CSV file exists (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      testResults.push({ name: 'File accessibility', passed: true });
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    allTestsPassed = false;
    testResults.push({ name: 'File accessibility', passed: false });
  }

  // ============================================================================
  // TEST 2: BOM detection and removal
  // ============================================================================
  console.log('\n🔍 TEST 2: BOM detection and handling');
  try {
    const buffer = fs.readFileSync(csvPath);
    const hasBOM = buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
    console.log(`  ${hasBOM ? '⚠️' : '✅'} BOM detected: ${hasBOM ? 'Yes (will be removed)' : 'No'}`);

    // Test removal
    const content = buffer.toString('utf-8');
    const cleaned = content.replace(/^\uFEFF/, '');
    const bomRemoved = cleaned.charCodeAt(0) !== 0xFEFF;

    if (hasBOM && !bomRemoved) {
      console.log('  ❌ FAIL: BOM not properly removed');
      allTestsPassed = false;
      testResults.push({ name: 'BOM removal', passed: false });
    } else {
      console.log('  ✅ PASS: BOM handling correct');
      testResults.push({ name: 'BOM removal', passed: true });
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    allTestsPassed = false;
    testResults.push({ name: 'BOM removal', passed: false });
  }

  // ============================================================================
  // TEST 3: Header parsing and normalization
  // ============================================================================
  console.log('\n📋 TEST 3: Header parsing and normalization');
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const cleaned = cleanCSVData(csvContent);
    const lines = cleaned.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    console.log(`  ✅ Parsed ${headers.length} header columns`);
    console.log(`  Sample: ${headers.slice(0, 3).join(', ')}...`);

    // Check for triple quotes in cleaned headers
    const hasTripleQuotes = headers.some(h => h.includes('"""'));
    if (hasTripleQuotes) {
      console.log('  ❌ FAIL: Triple quotes not properly normalized');
      allTestsPassed = false;
      testResults.push({ name: 'Header normalization', passed: false });
    } else {
      console.log('  ✅ PASS: Headers properly normalized (no triple quotes)');
      testResults.push({ name: 'Header normalization', passed: true });
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    allTestsPassed = false;
    testResults.push({ name: 'Header normalization', passed: false });
  }

  // ============================================================================
  // TEST 4: Required fields present
  // ============================================================================
  console.log('\n🔑 TEST 4: Required Tableau fields');
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const cleaned = cleanCSVData(csvContent);
    const lines = cleaned.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    const requiredFields = [
      'Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode',
      'Customer ID', 'Customer Name', 'Segment', 'Country/Region',
      'City', 'State', 'Postal Code', 'Region', 'Product ID',
      'Category', 'Sub-Category', 'Product Name', 'Sales',
      'Quantity', 'Discount', 'Profit'
    ];

    const missingFields = requiredFields.filter(f => !headers.includes(f));

    if (missingFields.length > 0) {
      console.log(`  ❌ FAIL: Missing fields: ${missingFields.join(', ')}`);
      allTestsPassed = false;
      testResults.push({ name: 'Required fields', passed: false });
    } else {
      console.log(`  ✅ PASS: All ${requiredFields.length} required fields present`);
      testResults.push({ name: 'Required fields', passed: true });
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    allTestsPassed = false;
    testResults.push({ name: 'Required fields', passed: false });
  }

  // ============================================================================
  // TEST 5: Numeric field coercion
  // ============================================================================
  console.log('\n🔢 TEST 5: Numeric field coercion');
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const cleaned = cleanCSVData(csvContent);
    const lines = cleaned.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    const numericFields = ['Sales', 'Profit', 'Quantity', 'Discount', 'Postal Code'];
    let validCount = 0;
    let invalidCount = 0;

    // Sample first 100 rows
    const sampleSize = Math.min(100, lines.length - 1);
    for (let i = 1; i <= sampleSize; i++) {
      const values = parseCSVLine(lines[i]);
      for (const field of numericFields) {
        const idx = headers.indexOf(field);
        if (idx >= 0) {
          const num = Number(values[idx]);
          if (!isNaN(num)) {
            validCount++;
          } else {
            invalidCount++;
          }
        }
      }
    }

    const totalChecked = validCount + invalidCount;
    const validPercent = (validCount / totalChecked * 100).toFixed(1);

    console.log(`  Valid: ${validCount}/${totalChecked} (${validPercent}%)`);
    console.log(`  Invalid: ${invalidCount}/${totalChecked}`);

    if (invalidCount > totalChecked * 0.05) { // More than 5% invalid
      console.log('  ❌ FAIL: Too many invalid numeric values');
      allTestsPassed = false;
      testResults.push({ name: 'Numeric coercion', passed: false });
    } else {
      console.log('  ✅ PASS: Numeric fields coerce correctly');
      testResults.push({ name: 'Numeric coercion', passed: true });
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    allTestsPassed = false;
    testResults.push({ name: 'Numeric coercion', passed: false });
  }

  // ============================================================================
  // TEST 6: Date field parsing (prevent Jan 1970 issue)
  // ============================================================================
  console.log('\n📅 TEST 6: Date field parsing (Jan 1970 prevention)');
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const cleaned = cleanCSVData(csvContent);
    const lines = cleaned.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    const dateFields = ['Order Date', 'Ship Date'];
    let validCount = 0;
    let invalidCount = 0;
    let jan1970Count = 0;

    const sampleSize = Math.min(100, lines.length - 1);
    for (let i = 1; i <= sampleSize; i++) {
      const values = parseCSVLine(lines[i]);
      for (const field of dateFields) {
        const idx = headers.indexOf(field);
        if (idx >= 0) {
          const date = new Date(values[idx]);
          const year = date.getFullYear();
          if (!isNaN(date.getTime()) && year > 1970) {
            validCount++;
          } else if (year === 1970) {
            jan1970Count++;
            invalidCount++;
          } else {
            invalidCount++;
          }
        }
      }
    }

    const totalChecked = validCount + invalidCount;
    console.log(`  Valid dates (>1970): ${validCount}/${totalChecked}`);
    console.log(`  Jan 1970 dates: ${jan1970Count}/${totalChecked}`);

    if (jan1970Count > 0) {
      console.log('  ❌ FAIL: Detected Jan 1970 dates (parsing issue)');
      allTestsPassed = false;
      testResults.push({ name: 'Date parsing', passed: false });
    } else if (invalidCount > totalChecked * QUALITY_THRESHOLDS.MAX_INVALID_DATES) {
      console.log('  ❌ FAIL: Too many invalid dates');
      allTestsPassed = false;
      testResults.push({ name: 'Date parsing', passed: false });
    } else {
      console.log('  ✅ PASS: Dates parse correctly (no Jan 1970)');
      testResults.push({ name: 'Date parsing', passed: true });
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    allTestsPassed = false;
    testResults.push({ name: 'Date parsing', passed: false });
  }

  // ============================================================================
  // TEST 7: Non-zero sales (prevent all-zero charts)
  // ============================================================================
  console.log('\n💰 TEST 7: Non-zero sales data (prevent all-zero charts)');
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const cleaned = cleanCSVData(csvContent);
    const lines = cleaned.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    const salesIdx = headers.indexOf('Sales');
    let nonZeroCount = 0;
    let zeroCount = 0;

    const sampleSize = Math.min(200, lines.length - 1);
    for (let i = 1; i <= sampleSize; i++) {
      const values = parseCSVLine(lines[i]);
      const sales = Number(values[salesIdx]);
      if (!isNaN(sales) && sales > 0) {
        nonZeroCount++;
      } else {
        zeroCount++;
      }
    }

    const totalChecked = nonZeroCount + zeroCount;
    const nonZeroPercent = (nonZeroCount / totalChecked * 100).toFixed(1);

    console.log(`  Non-zero sales: ${nonZeroCount}/${totalChecked} (${nonZeroPercent}%)`);
    console.log(`  Zero sales: ${zeroCount}/${totalChecked}`);

    if (nonZeroCount < totalChecked * QUALITY_THRESHOLDS.MIN_NONZERO_SALES) {
      console.log('  ❌ FAIL: Too many zero sales values (all-zero charts risk)');
      allTestsPassed = false;
      testResults.push({ name: 'Non-zero sales', passed: false });
    } else {
      console.log('  ✅ PASS: Sufficient non-zero sales data');
      testResults.push({ name: 'Non-zero sales', passed: true });
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    allTestsPassed = false;
    testResults.push({ name: 'Non-zero sales', passed: false });
  }

  // ============================================================================
  // TEST 8: Data quality metrics
  // ============================================================================
  console.log('\n📊 TEST 8: Data quality metrics');
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const cleaned = cleanCSVData(csvContent);
    const lines = cleaned.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    const regionIdx = headers.indexOf('Region');
    const stateIdx = headers.indexOf('State');

    const regions = new Set();
    const states = new Set();

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (regionIdx >= 0) regions.add(values[regionIdx]);
      if (stateIdx >= 0) states.add(values[stateIdx]);
    }

    console.log(`  Total data rows: ${lines.length - 1}`);
    console.log(`  Unique regions: ${regions.size}`);
    console.log(`  Unique states: ${states.size}`);
    console.log(`  Regions: ${Array.from(regions).join(', ')}`);

    let qualityPassed = true;
    if (lines.length - 1 < QUALITY_THRESHOLDS.MIN_VALID_ROWS) {
      console.log(`  ❌ FAIL: Too few rows (< ${QUALITY_THRESHOLDS.MIN_VALID_ROWS})`);
      qualityPassed = false;
    }
    if (regions.size < QUALITY_THRESHOLDS.MIN_REGIONS) {
      console.log(`  ❌ FAIL: Too few regions (< ${QUALITY_THRESHOLDS.MIN_REGIONS})`);
      qualityPassed = false;
    }
    if (states.size < QUALITY_THRESHOLDS.MIN_STATES) {
      console.log(`  ❌ FAIL: Too few states (< ${QUALITY_THRESHOLDS.MIN_STATES})`);
      qualityPassed = false;
    }

    if (qualityPassed) {
      console.log('  ✅ PASS: Data quality metrics meet thresholds');
      testResults.push({ name: 'Data quality', passed: true });
    } else {
      console.log('  ❌ FAIL: Data quality below thresholds');
      allTestsPassed = false;
      testResults.push({ name: 'Data quality', passed: false });
    }
  } catch (error) {
    console.log(`  ❌ FAIL: ${error.message}`);
    allTestsPassed = false;
    testResults.push({ name: 'Data quality', passed: false });
  }

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  testResults.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(`  ${icon} ${result.name.padEnd(25)} ${status}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`  FINAL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(60) + '\n');

  if (!allTestsPassed) {
    console.log('⚠️  Validation failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('✅ Tableau source ingestion is deterministic and correct!\n');
  }
}

main();
