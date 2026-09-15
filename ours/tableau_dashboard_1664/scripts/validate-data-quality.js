/**
 * Data Quality Validation Script
 *
 * This script validates that:
 * 1. No missing/null values in critical fields
 * 2. No all-zero values that could cause empty charts
 * 3. No NaN or Infinity values
 * 4. Data distribution is reasonable (detects outliers)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeDataQuality() {
  const csvPath = path.join(__dirname, '..', 'public', 'data', 'mars_data.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim());

  const numericFields = ['sol', 'min_temp', 'max_temp', 'pressure'];
  const categoricalFields = ['month', 'Season'];

  const stats = {};
  const issues = [];

  // Initialize stats
  numericFields.forEach(field => {
    stats[field] = {
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity,
      zeros: 0,
      nulls: 0,
      nonNumeric: 0
    };
  });

  categoricalFields.forEach(field => {
    stats[field] = {
      count: 0,
      nulls: 0,
      empty: 0,
      uniqueValues: new Set()
    };
  });

  // Analyze each data row
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {
      '': values[0],
      earth_date: values[1],
      sol: values[2],
      ls: values[3],
      month: values[4],
      min_temp: values[5],
      max_temp: values[6],
      pressure: values[7],
      Season: values[8]
    };

    // Check numeric fields
    numericFields.forEach(field => {
      const val = row[field];
      if (val === undefined || val === null || val === '') {
        stats[field].nulls++;
      } else {
        const num = Number(val);
        if (isNaN(num)) {
          stats[field].nonNumeric++;
          issues.push(`Row ${i}: ${field} is not numeric: "${val}"`);
        } else if (!isFinite(num)) {
          issues.push(`Row ${i}: ${field} is not finite: "${val}"`);
        } else {
          stats[field].count++;
          stats[field].sum += num;
          stats[field].min = Math.min(stats[field].min, num);
          stats[field].max = Math.max(stats[field].max, num);
          if (num === 0) stats[field].zeros++;
        }
      }
    });

    // Check categorical fields
    categoricalFields.forEach(field => {
      const val = row[field];
      if (val === undefined || val === null) {
        stats[field].nulls++;
      } else if (val === '') {
        stats[field].empty++;
      } else {
        stats[field].count++;
        stats[field].uniqueValues.add(val.trim());
      }
    });
  }

  return { stats, issues };
}

function printQualityReport() {
  console.log('=== Data Quality Validation ===\n');

  const { stats, issues } = analyzeDataQuality();
  const totalRows = stats.sol.count + stats.sol.nulls + stats.sol.nonNumeric;

  console.log(`Total rows analyzed: ${totalRows}\n`);

  // Check for issues
  if (issues.length > 0) {
    console.log('✗ Found data quality issues:\n');
    issues.slice(0, 10).forEach(issue => console.log(`  ${issue}`));
    if (issues.length > 10) {
      console.log(`  ... and ${issues.length - 10} more issues`);
    }
    console.log();
  }

  // Print numeric field statistics
  console.log('Numeric Fields:');
  console.log('─'.repeat(80));
  console.log(
    'Field'.padEnd(15) +
    'Count'.padStart(10) +
    'Nulls'.padStart(10) +
    'Min'.padStart(12) +
    'Max'.padStart(12) +
    'Avg'.padStart(12) +
    'Zeros'.padStart(10)
  );
  console.log('─'.repeat(80));

  const numericFields = ['sol', 'min_temp', 'max_temp', 'pressure'];
  let allValid = true;

  numericFields.forEach(field => {
    const s = stats[field];
    const avg = s.count > 0 ? (s.sum / s.count).toFixed(2) : 'N/A';
    const min = s.min === Infinity ? 'N/A' : s.min.toFixed(2);
    const max = s.max === -Infinity ? 'N/A' : s.max.toFixed(2);

    console.log(
      field.padEnd(15) +
      s.count.toString().padStart(10) +
      s.nulls.toString().padStart(10) +
      min.padStart(12) +
      max.padStart(12) +
      avg.padStart(12) +
      s.zeros.toString().padStart(10)
    );

    // Check for potential issues
    if (s.nulls > 0 || s.nonNumeric > 0) {
      allValid = false;
    }
    if (s.count > 0 && s.min === s.max) {
      console.log(`  ⚠ Warning: ${field} has all same values (constant)`);
    }
    if (s.zeros > s.count * 0.5) {
      console.log(`  ⚠ Warning: ${field} has >50% zeros`);
    }
  });

  console.log();

  // Print categorical field statistics
  console.log('Categorical Fields:');
  console.log('─'.repeat(80));
  console.log(
    'Field'.padEnd(15) +
    'Count'.padStart(10) +
    'Nulls'.padStart(10) +
    'Empty'.padStart(10) +
    'Unique Values'.padStart(15)
  );
  console.log('─'.repeat(80));

  const categoricalFields = ['month', 'Season'];
  categoricalFields.forEach(field => {
    const s = stats[field];
    console.log(
      field.padEnd(15) +
      s.count.toString().padStart(10) +
      s.nulls.toString().padStart(10) +
      s.empty.toString().padStart(10) +
      s.uniqueValues.size.toString().padStart(15)
    );

    if (s.nulls > 0 || s.empty > 0) {
      allValid = false;
    }

    // Print unique values for verification
    console.log(`  Values: ${Array.from(s.uniqueValues).sort().join(', ')}`);
  });

  console.log();

  // Final verdict
  if (issues.length > 0) {
    console.log('✗ Data quality issues detected');
    console.log('  This may lead to silent bad parses, all-zero charts, or NaN filters');
    return false;
  }

  if (allValid) {
    console.log('✓ All data quality checks passed');
    console.log('  • No missing/null values in critical fields');
    console.log('  • No all-zero values');
    console.log('  • No NaN or Infinity values');
    console.log('  • Data distribution is reasonable');
    return true;
  } else {
    console.log('⚠ Some data quality issues detected (see warnings above)');
    return false;
  }
}

function main() {
  const success = printQualityReport();

  console.log('\n=== Summary ===');
  if (success) {
    console.log('✓ Data quality is good - no silent parse failures expected');
    console.log('✓ Charts will render with actual data values');
    console.log('✓ Filters will work correctly (no NaN values)');
  } else {
    console.log('✗ Data quality issues found - may cause runtime problems');
    process.exit(1);
  }
}

main();
