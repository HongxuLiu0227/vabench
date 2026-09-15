/**
 * Tableau Spec Validator
 * Validates that Tableau spec fields map to actual CSV columns
 */

import * as d3 from 'd3-dsv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TableauWorksheet {
  name?: string;
  chart_type?: string;
  rows?: { raw?: string };
  cols?: { raw?: string };
  encodings?: Record<string, { field?: string }>;
  slices?: string[];
  filter_members?: string[];
  manual_sort?: Array<{ column?: string; buckets?: string[] }>;
}

interface TableauSpec {
  worksheets?: TableauWorksheet[];
}

// Load and parse the Tableau spec
function loadTableauSpec(): TableauSpec {
  const specPath = path.join(__dirname, '../docs/tableau_spec.json');
  const specContent = fs.readFileSync(specPath, 'utf-8');
  return JSON.parse(specContent);
}

// Normalize Tableau field names to match CSV columns
function normalizeFieldName(field: string): string {
  let normalized = field;

  // Remove Tableau's federated prefix (with or without brackets)
  // Format: federated.<alphanumeric_id> or [federated.<alphanumeric_id>].
  normalized = normalized.replace(/^\[?federated\.[a-zA-Z0-9]+\]?\.?/g, '');

  // Remove remaining brackets
  normalized = normalized.replace(/\[/g, '').replace(/\]/g, '');

  // Remove aggregation prefixes like "avg:", "sum:", "none:"
  normalized = normalized.replace(/^(avg|sum|none|count|min|max):/g, '');

  // Remove type suffixes like ":qk", ":nk"
  normalized = normalized.replace(/:[a-z]+$/g, '');

  // Clean up any remaining colons or dots
  normalized = normalized.replace(/^[:.]*/g, '').replace(/[:.]*$/g, '');

  return normalized;
}

// Get all field names from Tableau spec
function extractTableauFields(spec: TableauSpec): string[] {
  const fields = new Set<string>();

  // Extract from worksheets
  spec.worksheets?.forEach((worksheet: TableauWorksheet) => {
    // Rows and cols
    if (worksheet.rows?.raw) fields.add(worksheet.rows.raw);
    if (worksheet.cols?.raw) fields.add(worksheet.cols.raw);

    // Encodings
    if (worksheet.encodings) {
      Object.values(worksheet.encodings).forEach((encoding: { field?: string }) => {
        if (encoding?.field) fields.add(encoding.field);
      });
    }

    // Slices
    worksheet.slices?.forEach((slice: string) => fields.add(slice));

    // Filter members
    worksheet.filter_members?.forEach((member: string) => fields.add(member));

    // Manual sort columns
    worksheet.manual_sort?.forEach((sort: { column?: string; buckets?: string[] }) => {
      if (sort.column) fields.add(sort.column);
      sort.buckets?.forEach((bucket: string) => fields.add(bucket));
    });
  });

  // Return both raw and normalized fields for debugging
  return Array.from(fields);
}

// Validate spec fields against CSV columns
function validateTableauSpec(csvPath: string): boolean {
  console.log('\n=== Validating Tableau Spec Field Mapping ===\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Load CSV
    console.log('1. Loading CSV...');
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const csvData = d3.csvParse(csvText);
    const csvColumns = csvData.columns;
    console.log(`   ✓ Loaded CSV with ${csvColumns.length} columns`);

    // Load Tableau spec
    console.log('\n2. Loading Tableau spec...');
    const spec = loadTableauSpec();
    console.log(`   ✓ Loaded spec with ${spec.worksheets?.length || 0} worksheets`);

    // Extract all fields from spec
    console.log('\n3. Extracting fields from Tableau spec...');
    const tableauFields = extractTableauFields(spec);
    console.log(`   ✓ Extracted ${tableauFields.length} unique fields`);

    // Show sample fields
    console.log('\n   Sample Tableau fields (raw -> normalized):');
    tableauFields.slice(0, 10).forEach(field => {
      const normalized = normalizeFieldName(field);
      console.log(`     - ${field.substring(0, 60)}... -> ${normalized}`);
    });

    // Check for special Tableau fields
    const specialFields = tableauFields.filter(f => {
      const normalized = normalizeFieldName(f);
      return normalized.includes('Measure Names') ||
             normalized.includes('Multiple Values') ||
             normalized.includes('Calculation') ||
             normalized.includes('Action');
    });
    if (specialFields.length > 0) {
      console.log(`\n   Special/Computed fields (${specialFields.length}):`);
      specialFields.slice(0, 5).forEach(f => {
        console.log(`     - ${normalizeFieldName(f)}`);
      });
    }

    // Map fields to CSV columns
    console.log('\n4. Mapping Tableau fields to CSV columns...');
    const unmappedFields: string[] = [];
    const mappedFields: Record<string, string> = {};

    console.log('\n   CSV columns:');
    csvColumns.forEach(col => console.log(`     - ${col}`));

    console.log('\n   Mapping fields...');
    tableauFields.forEach(rawField => {
      const normalized = normalizeFieldName(rawField);

      // Skip special Tableau fields
      if (normalized.includes('Measure Names') ||
          normalized.includes('Multiple Values') ||
          normalized.includes('Calculation') ||
          normalized.includes('Action')) {
        return; // These are computed or special fields
      }

      // Direct match
      if (csvColumns.includes(normalized)) {
        mappedFields[rawField] = normalized;
        console.log(`     ✓ '${normalized}' -> direct match`);
        return;
      }

      // Try case-insensitive match
      const caseMatch = csvColumns.find(col => col.toLowerCase() === normalized.toLowerCase());
      if (caseMatch) {
        mappedFields[rawField] = caseMatch;
        if (caseMatch !== normalized) {
          warnings.push(`Field '${normalized}' mapped to '${caseMatch}' (case mismatch)`);
        }
        console.log(`     ✓ '${normalized}' -> '${caseMatch}' (case-insensitive)`);
        return;
      }

      // Not found
      console.log(`     ✗ '${normalized}' -> NOT FOUND`);
      unmappedFields.push(normalized);
    });

    console.log(`   ✓ Mapped ${Object.keys(mappedFields).length} fields to CSV columns`);

    if (unmappedFields.length > 0) {
      console.log(`\n   ⚠ ${unmappedFields.length} fields could not be mapped:`);
      unmappedFields.forEach(field => console.log(`     - ${field}`));
    }

    // Critical check: core measure fields
    console.log('\n5. Validating critical measure fields...');
    const criticalFields = [
      'artist',
      'Year Born',
      'Recognition by Millennials',
      'Recognition by Gen-Zs',
      'No. of Songs'
    ];

    // Check age columns
    for (let i = 1; i <= 13; i++) {
      criticalFields.push(`${i} Years Old`);
    }

    let missingCritical = 0;
    criticalFields.forEach(field => {
      if (!csvColumns.includes(field)) {
        errors.push(`Missing critical field: ${field}`);
        missingCritical++;
      }
    });

    if (missingCritical === 0) {
      console.log(`   ✓ All ${criticalFields.length} critical fields present in CSV`);
    }

    // Validate worksheets
    console.log('\n6. Validating worksheet requirements...');
    spec.worksheets?.forEach((worksheet: TableauWorksheet, idx: number) => {
      const wsNum = idx + 1;
      console.log(`\n   Worksheet ${wsNum}: ${worksheet.name}`);

      // Check required fields based on chart type
      const chartType = worksheet.chart_type;
      console.log(`     Type: ${chartType}`);

      // For each worksheet, extract critical fields
      const wsFields: string[] = [];

      if (worksheet.rows?.raw) {
        const normalized = normalizeFieldName(worksheet.rows.raw);
        wsFields.push(`rows: ${normalized}`);
      }

      if (worksheet.cols?.raw) {
        const normalized = normalizeFieldName(worksheet.cols.raw);
        wsFields.push(`cols: ${normalized}`);
      }

      worksheet.slices?.forEach((slice: string) => {
        const normalized = normalizeFieldName(slice);
        wsFields.push(`slice: ${normalized}`);
      });

      if (wsFields.length > 0) {
        console.log(`     Fields: ${wsFields.slice(0, 3).join(', ')}${wsFields.length > 3 ? '...' : ''}`);
      }
    });

    // Summary
    console.log('\n=== Validation Summary ===');
    console.log(`CSV columns: ${csvColumns.length}`);
    console.log(`Tableau fields: ${tableauFields.length}`);
    console.log(`Mapped fields: ${Object.keys(mappedFields).length}`);
    console.log(`Unmapped fields: ${unmappedFields.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);

    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(err => console.log(`  ✗ ${err}`));
    }

    if (warnings.length > 0) {
      console.log('\nWarnings:');
      warnings.forEach(warn => console.log(`  ⚠ ${warn}`));
    }

    // Determine success
    const nonSpecialUnmapped = unmappedFields.filter(f =>
      !f.includes('Measure Names') &&
      !f.includes('Multiple Values') &&
      !f.includes('Calculation') &&
      !f.includes('Action')
    );
    const success = errors.length === 0 && nonSpecialUnmapped.length === 0;

    if (success) {
      console.log('\n✓ All Tableau spec fields can be mapped to CSV columns!');
    } else {
      console.log('\n✗ Some Tableau spec fields could not be mapped');
    }

    return success;

  } catch (error) {
    console.error(`\n✗ Fatal error: ${error}`);
    return false;
  }
}

// Main execution
const csvPath = path.join(__dirname, '../public/data/final_df.csv');
const success = validateTableauSpec(csvPath);
process.exit(success ? 0 : 1);
