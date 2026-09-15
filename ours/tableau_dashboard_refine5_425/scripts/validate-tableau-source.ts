#!/usr/bin/env tsx
/**
 * Deterministic Tableau Source Validator
 *
 * This script validates that the Tableau data source is correctly parsed
 * and all required fields are present and valid.
 *
 * Run with: npx tsx scripts/validate-tableau-source.ts
 */

import { csvParse } from 'd3-dsv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    validDates: number;
    invalidDates: number;
    epochDates: number;
    missingRegions: number;
    totalSales: number;
    totalProfit: number;
    uniqueRegions: number;
  };
}

/**
 * Strip BOM from text
 */
function stripBOM(text: string): string {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

/**
 * Parse date safely
 */
function parseDateSafe(dateStr: string | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Validate the Tableau data source
 */
function validateTableauSource(dataPath: string): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    stats: {
      totalRows: 0,
      validDates: 0,
      invalidDates: 0,
      epochDates: 0,
      missingRegions: 0,
      totalSales: 0,
      totalProfit: 0,
      uniqueRegions: 0,
    },
  };

  // Check file exists
  if (!existsSync(dataPath)) {
    result.errors.push(`Data file not found: ${dataPath}`);
    result.passed = false;
    return result;
  }

  // Load and parse CSV
  let csvText: string;
  try {
    csvText = readFileSync(dataPath, 'utf8');
  } catch (err) {
    result.errors.push(`Failed to read file: ${err}`);
    result.passed = false;
    return result;
  }

  // Check for BOM
  if (csvText.charCodeAt(0) === 0xFEFF) {
    result.warnings.push('File contains UTF-8 BOM (will be stripped during parsing)');
    csvText = stripBOM(csvText);
  }

  let rawData: Array<{ [key: string]: string }>;
  try {
    rawData = csvParse(csvText);
  } catch (err) {
    result.errors.push(`CSV parsing failed: ${err}`);
    result.passed = false;
    return result;
  }

  result.stats.totalRows = rawData.length;

  if (rawData.length === 0) {
    result.errors.push('CSV file is empty');
    result.passed = false;
    return result;
  }

  // Check required columns
  const firstRow = rawData[0];
  const requiredColumns = [
    'Row ID',
    'Order ID',
    'Order Date',
    'Ship Date',
    'Customer Name',
    'Region',
    'Sales',
    'Profit',
    'Quantity',
    'Discount',
  ];

  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  if (missingColumns.length > 0) {
    result.errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    result.passed = false;
  }

  // Validate data quality
  const regions = new Set<string>();

  rawData.forEach((row, index) => {
    // Check Order Date
    const orderDate = parseDateSafe(row['Order Date']);
    if (orderDate === null) {
      result.stats.invalidDates++;
      if (result.stats.invalidDates <= 5) {
        result.errors.push(`Row ${index + 1}: Invalid Order Date "${row['Order Date']}"`);
      }
    } else if (orderDate.getFullYear() === 1970 && orderDate.getMonth() === 0 && orderDate.getDate() === 1) {
      result.stats.epochDates++;
    } else {
      result.stats.validDates++;
    }

    // Check Ship Date
    const shipDate = parseDateSafe(row['Ship Date']);
    if (shipDate === null) {
      result.stats.invalidDates++;
    }

    // Check Region
    const region = row['Region'];
    if (!region || region.trim() === '') {
      result.stats.missingRegions++;
    } else {
      regions.add(region.trim());
    }

    // Sum metrics
    const sales = parseFloat(row['Sales']) || 0;
    const profit = parseFloat(row['Profit']) || 0;
    result.stats.totalSales += sales;
    result.stats.totalProfit += profit;
  });

  result.stats.uniqueRegions = regions.size;

  // Check for critical issues
  if (result.stats.invalidDates > 0) {
    result.errors.push(`${result.stats.invalidDates} rows have invalid dates`);
    result.passed = false;
  }

  if (result.stats.epochDates > 0) {
    result.errors.push(`${result.stats.epochDates} rows have epoch dates (Jan 1, 1970) - indicates parsing failure`);
    result.passed = false;
  }

  if (result.stats.missingRegions > 0) {
    result.warnings.push(`${result.stats.missingRegions} rows have missing region values`);
  }

  if (result.stats.totalSales === 0) {
    result.errors.push('Total sales is zero - possible parsing failure');
    result.passed = false;
  }

  if (regions.size === 0) {
    result.errors.push('No valid regions found');
    result.passed = false;
  }

  return result;
}

/**
 * Main execution
 */
function main() {
  const dataPath = join(
    process.cwd(),
    'public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv'
  );

  console.log('='.repeat(60));
  console.log('Tableau Source Validator');
  console.log('='.repeat(60));
  console.log(`Validating: ${dataPath}`);
  console.log('');

  const result = validateTableauSource(dataPath);

  // Print statistics
  console.log('Statistics:');
  console.log(`  Total rows: ${result.stats.totalRows}`);
  console.log(`  Valid dates: ${result.stats.validDates}`);
  console.log(`  Invalid dates: ${result.stats.invalidDates}`);
  console.log(`  Epoch dates: ${result.stats.epochDates}`);
  console.log(`  Missing regions: ${result.stats.missingRegions}`);
  console.log(`  Unique regions: ${result.stats.uniqueRegions}`);
  console.log(`  Total sales: ${result.stats.totalSales.toFixed(2)}`);
  console.log(`  Total profit: ${result.stats.totalProfit.toFixed(2)}`);
  console.log('');

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('Warnings:');
    result.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
    console.log('');
  }

  // Print errors
  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach(e => console.log(`  ❌ ${e}`));
    console.log('');
  }

  // Final result
  console.log('='.repeat(60));
  if (result.passed) {
    console.log('✅ VALIDATION PASSED');
    console.log('='.repeat(60));
    process.exit(0);
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  main();
}

export { validateTableauSource, ValidationResult };
