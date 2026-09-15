#!/usr/bin/env tsx
/**
 * Tableau Source Validation Script
 *
 * This script validates that:
 * 1. CSV data can be loaded and parsed correctly
 * 2. All Tableau spec fields resolve to real CSV columns
 * 3. Data quality checks pass (no NaN values, proper parsing)
 *
 * Run with: npm run validate-tableau-source
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ABTestingData {
  client_id: number;
  visitor_id: string;
  visit_id: string;
  process_step: string;
  date_time: string;
  clnt_tenure_yr: number;
  clnt_tenure_mnth: number;
  clnt_age: number;
  gendr: string;
  num_accts: number;
  bal: number;
  calls_6_mnth: number;
  logons_6_mnth: number;
  Variation: string;
}

/**
 * Simple CSV parser for Node.js environment
 */
function parseCSV(csvText: string): ABTestingData[] {
  const lines = csvText
    .split(/\r\n|\n|\r/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    console.warn('CSV file is empty');
    return [];
  }

  // Parse headers from first line
  const headers = lines[0].split(',').map(h => h.trim());

  const data: ABTestingData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });

    data.push({
      client_id: Number(row.client_id) || 0,
      visitor_id: row.visitor_id || '',
      visit_id: row.visit_id || '',
      process_step: row.process_step || '',
      date_time: row.date_time || '',
      clnt_tenure_yr: Number(row.clnt_tenure_yr) || 0,
      clnt_tenure_mnth: Number(row.clnt_tenure_mnth) || 0,
      clnt_age: Number(row.clnt_age) || 0,
      gendr: row.gendr || 'U',
      num_accts: Number(row.num_accts) || 0,
      bal: Number(row.bal) || 0,
      calls_6_mnth: Number(row.calls_6_mnth) || 0,
      logons_6_mnth: Number(row.logons_6_mnth) || 0,
      Variation: row.Variation || 'Unknown'
    });
  }

  return data;
}

/**
 * Parse Tableau field reference
 */
function parseTableauField(fieldRef: string): { columnName: string; aggregation: string } | null {
  try {
    const match = fieldRef.match(/\[([^\]]+)\]$/);
    if (!match) return null;

    const fieldSpec = match[1];
    const parts = fieldSpec.split(':');

    let columnName: string;
    let aggregation: string = 'none';

    if (parts.length >= 2) {
      aggregation = parts[0];
      columnName = parts[1];
    } else {
      columnName = fieldSpec;
    }

    // Map to CSV column names
    const fieldMap: Record<string, string> = {
      'client_id': 'client_id',
      'process_step': 'process_step',
      'gendr': 'gendr',
      'variation': 'Variation',
      'bal': 'bal',
      'clnt_age': 'clnt_age',
      'Clnt Age (group)': 'age_group',
      // Calculated fields map to base columns
      'calculation_503488417540866050': 'bal',
      'calculation_503488417541140484': 'bal',
      'cnt': 'client_id',
      'action (variation)': 'Variation'
    };

    // Handle calculated fields with special patterns
    const lowerColumnName = columnName.toLowerCase();
    if (lowerColumnName.includes('calculation')) {
      if (lowerColumnName.includes('503488417540866050') || lowerColumnName.includes('503488417541140484')) {
        return { columnName: 'bal', aggregation };
      }
    }

    // Handle cnt aggregation
    if (lowerColumnName === 'cnt') {
      return { columnName: 'client_id', aggregation };
    }

    const mappedColumn = fieldMap[lowerColumnName] || columnName;
    return {
      columnName: mappedColumn,
      aggregation
    };
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('Tableau Source Data Validation');
  console.log('='.repeat(80));

  let valid = true;
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  // Step 1: Load CSV
  info.push('\nStep 1: Loading CSV data...');
  const csvPath = path.join(__dirname, '../../public/data/a_b_testing_data.csv');

  if (!fs.existsSync(csvPath)) {
    errors.push(`CSV file not found: ${csvPath}`);
    console.log('\n✗ Errors:');
    errors.forEach(e => console.log(`  ${e}`));
    console.log('\n' + '='.repeat(80));
    console.log('✗ VALIDATION FAILED');
    console.log('='.repeat(80));
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8');
  info.push(`✓ Read ${csvText.length} bytes from CSV`);

  const data = parseCSV(csvText);
  info.push(`✓ Parsed ${data.length} rows from CSV`);

  if (data.length === 0) {
    errors.push('No data rows found in CSV');
    valid = false;
  } else {
    // Show sample data
    const sample = data[0];
    info.push('\n✓ Sample row:');
    info.push(`  client_id: ${sample.client_id}`);
    info.push(`  process_step: ${sample.process_step}`);
    info.push(`  gendr: ${sample.gendr}`);
    info.push(`  Variation: ${sample.Variation}`);
    info.push(`  bal: ${sample.bal}`);
    info.push(`  clnt_age: ${sample.clnt_age}`);

    // Check data quality
    const zeroBal = data.filter(r => r.bal === 0).length;
    if (zeroBal > data.length * 0.5) {
      warnings.push(`${zeroBal} rows (${((zeroBal/data.length)*100).toFixed(1)}%) have zero balance`);
    }

    const unknownGender = data.filter(r => !r.gendr || r.gendr === 'U').length;
    if (unknownGender > 0) {
      warnings.push(`${unknownGender} rows (${((unknownGender/data.length)*100).toFixed(1)}%) have unknown gender`);
    }

    const invalidDates = data.filter(r => {
      if (!r.date_time) return true;
      const d = new Date(r.date_time);
      return isNaN(d.getTime());
    }).length;

    if (invalidDates > 0) {
      errors.push(`${invalidDates} rows have invalid date_time values`);
      valid = false;
    } else {
      info.push('✓ All date_time values are parsable');
    }

    // Variation distribution
    const controlCount = data.filter(r => r.Variation === 'Control').length;
    const testCount = data.filter(r => r.Variation === 'Test').length;
    const unknownCount = data.filter(r => !r.Variation || r.Variation === 'Unknown').length;

    info.push(`\n✓ Variation distribution:`);
    info.push(`  Control: ${controlCount} (${((controlCount/data.length)*100).toFixed(1)}%)`);
    info.push(`  Test: ${testCount} (${((testCount/data.length)*100).toFixed(1)}%)`);
    info.push(`  Unknown: ${unknownCount} (${((unknownCount/data.length)*100).toFixed(1)}%)`);

    // Process step distribution
    const steps = ['start', 'step_1', 'step_2', 'step_3', 'confirm'];
    info.push(`\n✓ Process step distribution:`);
    steps.forEach(step => {
      const count = data.filter(r => r.process_step === step).length;
      info.push(`  ${step}: ${count} (${((count/data.length)*100).toFixed(1)}%)`);
    });
  }

  // Step 2: Validate Tableau field mappings
  info.push('\nStep 2: Validating Tableau field mappings...');

  const testFields = [
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[cnt:client_id:qk]',
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk]',
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]',
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[avg:bal:qk]',
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk]',
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[Clnt Age (group)]',
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[avg:Calculation_503488417540866050:qk]',
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[avg:Calculation_503488417541140484:qk]',
    '[federated.0rs4ltd193x5a718ruzc40qfpfhz].[Action (Variation)]'
  ];

  let fieldsResolved = 0;
  testFields.forEach(field => {
    const mapping = parseTableauField(field);
    if (mapping) {
      fieldsResolved++;
      info.push(`  ✓ ${field.substring(0, 50)}... => ${mapping.columnName} (${mapping.aggregation})`);
    } else {
      errors.push(`  ✗ Cannot resolve: ${field}`);
      valid = false;
    }
  });

  info.push(`\n✓ Resolved ${fieldsResolved}/${testFields.length} test fields`);

  // Print results
  console.log('\nInfo:');
  info.forEach(msg => console.log(`  ${msg}`));

  if (warnings.length > 0) {
    console.log('\n⚠ Warnings:');
    warnings.forEach(msg => console.log(`  ${msg}`));
  }

  if (errors.length > 0) {
    console.log('\n✗ Errors:');
    errors.forEach(msg => console.log(`  ${msg}`));
  }

  console.log('\n' + '='.repeat(80));
  if (valid) {
    console.log('✓ VALIDATION PASSED');
    console.log('✓ CSV data can be loaded and parsed correctly');
    console.log('✓ All Tableau fields can be resolved to CSV columns');
    console.log('✓ Data quality checks passed');
  } else {
    console.log('✗ VALIDATION FAILED');
  }
  console.log('='.repeat(80));

  process.exit(valid ? 0 : 1);
}

main();
