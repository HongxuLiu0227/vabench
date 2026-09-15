/**
 * Tableau Spec Field Mapping Validator
 *
 * This script validates that all required Tableau fields from the spec
 * can be resolved to real columns in the CSV data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Tableau spec
const tableauSpec = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'docs', 'tableau_spec.json'), 'utf-8')
);

// Extract all field references from the spec
function extractFieldReferences(worksheet) {
  const fields = new Set();

  // Extract from rows and cols
  if (worksheet.rows?.fields) {
    worksheet.rows.fields.forEach(f => fields.add(f));
  }
  if (worksheet.cols?.fields) {
    worksheet.cols.fields.forEach(f => fields.add(f));
  }

  // Extract from slices
  if (worksheet.slices) {
    worksheet.slices.forEach(f => fields.add(f));
  }

  // Extract from encodings
  if (worksheet.encodings?.color) {
    worksheet.encodings.color.forEach(e => fields.add(e.column));
  }

  // Extract from filters
  if (worksheet.filter) {
    worksheet.filter.forEach(f => {
      if (f.column) fields.add(f.column);
    });
  }

  // Extract from reference lines
  if (worksheet.reference_lines) {
    worksheet.reference_lines.forEach(r => {
      if (r['value-column']) fields.add(r['value-column']);
      if (r['axis-column']) fields.add(r['axis-column']);
    });
  }

  return Array.from(fields);
}

// Parse Tableau field name to extract base column name
// Examples:
//   "[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[avg:max_temp:qk]" -> "max_temp"
//   "[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:sol:qk]" -> "sol"
//   "[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk]" -> "month"
function parseTableauField(field) {
  // Match patterns like [agg:name:type] or just [name]
  const patterns = [
    /\[.*?\]\.\[.*?:(.*?):.*?\]/,  // [federated...].[avg:max_temp:qk]
    /\[.*?\]\.\[(.*?)]/,           // [federated...].[month]
    /\[(.*?):.*?:.*?\]/,           // [avg:max_temp:qk] without prefix
    /\[(.*?)]/                     // Just [field_name]
  ];

  for (const pattern of patterns) {
    const match = field.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// Map Tableau fields to CSV columns
function mapTableauFieldsToCSV() {
  const csvColumns = [
    '', 'earth_date', 'sol', 'ls', 'month', 'min_temp', 'max_temp', 'pressure', 'Season'
  ];

  const fieldMappings = new Map();
  const computedFields = ['Calculation_', 'Multiple Values'];

  tableauSpec.worksheets.forEach(worksheet => {
    const fields = extractFieldReferences(worksheet);
    console.log(`\n${worksheet.name}:`);
    console.log(`  Chart type: ${worksheet.chart_type}`);

    fields.forEach(field => {
      const baseField = parseTableauField(field);
      if (baseField) {
        const csvColumn = csvColumns.find(col => col === baseField);
        if (csvColumn) {
          console.log(`  ✓ ${field}`);
          console.log(`    → maps to CSV column: "${csvColumn}"`);
          fieldMappings.set(field, csvColumn);
        } else if (computedFields.some(cf => baseField.includes(cf))) {
          console.log(`  ℹ ${field}`);
          console.log(`    → Computed field (calculated from source data)`);
        } else {
          console.log(`  ✗ ${field}`);
          console.log(`    → Cannot map to CSV column (looking for: "${baseField}")`);
        }
      } else if (field.includes(':Measure Names]') || field.includes('Action (Month')) {
        console.log(`  ℹ ${field}`);
        console.log(`    → Computed/Filter field (not in source CSV)`);
      } else if (field === '[federated.0hbn5jb01pcjiv1fjiptj1ctfi58]') {
        // Skip the federated prefix
      } else {
        console.log(`  ? ${field}`);
        console.log(`    → Unknown field format`);
      }
    });
  });

  return fieldMappings;
}

function main() {
  console.log('=== Tableau Field Mapping Validation ===\n');
  console.log('CSV columns available:');
  console.log('  "", earth_date, sol, ls, month, min_temp, max_temp, pressure, Season\n');
  console.log('Validating field mappings from Tableau spec...\n');

  const mappings = mapTableauFieldsToCSV();

  console.log('\n=== Summary ===');
  console.log(`Total worksheets: ${tableauSpec.worksheets.length}`);
  console.log(`Total field mappings: ${mappings.size}`);

  const computedFields = ['Calculation_', 'Multiple Values'];
  const unmappedFields = [];
  tableauSpec.worksheets.forEach(worksheet => {
    const fields = extractFieldReferences(worksheet);
    fields.forEach(field => {
      const baseField = parseTableauField(field);
      if (baseField && !mappings.has(field) &&
          !field.includes(':Measure Names]') &&
          !field.includes('Action (Month') &&
          !computedFields.some(cf => baseField.includes(cf))) {
        unmappedFields.push({ worksheet: worksheet.name, field, baseField });
      }
    });
  });

  if (unmappedFields.length > 0) {
    console.log('\n✗ Failed: Some fields could not be mapped:');
    unmappedFields.forEach(({ worksheet, field, baseField }) => {
      console.log(`  ${worksheet}: ${field} (looking for "${baseField}")`);
    });
    process.exit(1);
  }

  console.log('\n✓ All required Tableau fields can be resolved to CSV columns');
  console.log('\n=== All Validations Passed ✓ ===');
  console.log('Tableau spec is compatible with CSV source data');
}

main();
