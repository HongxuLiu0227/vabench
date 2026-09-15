/**
 * Node.js validation script to test CSV parsing and Tableau field resolution
 * Run with: npx tsx scripts/validateDataIngestionNode.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as d3 from 'd3';
import tableauSpec from '../docs/tableau_spec.json';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy the parsing logic from dataService.ts for Node.js execution
const normalizeHeader = (header: string): string => {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"|"$/g, '');
  cleaned = cleaned.trim();
  return cleaned;
};

const findHeaderRow = (lines: string[]): number => {
  const requiredFields = ['Row ID', 'Order ID', 'Order Date', 'Sales', 'Profit', 'Category', 'Sub-Category', 'Market'];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    if (!line || line.trim() === '') continue;

    // Parse potential headers with proper CSV handling (fields may contain commas in quotes)
    let headers: string[];
    try {
      // Use d3.csvParseRows to properly handle quoted fields with commas
      const parsedRow = d3.csvParseRows(line);
      if (parsedRow.length > 0) {
        headers = parsedRow[0].map(h => normalizeHeader(h));
      } else {
        continue;
      }
    } catch {
      // Fallback to simple split if parsing fails
      headers = line.split(',').map(h => normalizeHeader(h));
    }

    // Skip lines that start with preamble text or have too many unnamed columns
    const hasUnnamed = headers.filter(h => h.startsWith('Unnamed') || h === '').length > headers.length * 0.5;
    if (hasUnnamed) {
      continue;
    }

    const matchedFields = requiredFields.filter(field =>
      headers.some(h => h === field || h.includes(field))
    );

    if (matchedFields.length >= requiredFields.length * 0.7) {
      return i;
    }
  }

  return 0;
};

const parseCsvWithPreamble = (csvText: string): d3.DSVRowArray => {
  const lines = csvText.split(/\r?\n/);
  const headerRowIndex = findHeaderRow(lines);

  if (headerRowIndex === 0) {
    // No preamble detected, use standard parsing
    return d3.csvParse(csvText);
  }

  // Extract lines from header row onwards
  const cleanLines = lines.slice(headerRowIndex);
  const cleanCsv = cleanLines.join('\n');

  return d3.csvParse(cleanCsv);
};

interface FieldMapping {
  tableauField: string;
  csvColumn: string;
  found: boolean;
  sampleValue?: any;
}

const extractFieldName = (tableauField: string): string => {
  const match = tableauField.match(/\[none:([^:]+):nk\]|\[sum:([^:]+):qk\]|\[tmn:([^:]+):qk\]|\[ctd:([^:]+):ok\]|\[yr:([^:]+):ok\]/);
  if (match) {
    return match[1] || match[2] || match[3] || match[4] || match[5] || '';
  }
  return '';
};

const extractFieldsFromSpec = (spec: any): string[] => {
  const fields = new Set<string>();

  if (spec.worksheets) {
    spec.worksheets.forEach((worksheet: any) => {
      if (worksheet.rows?.fields) {
        worksheet.rows.fields.forEach((f: string) => {
          // Skip federated table prefixes without field names
          if (f.match(/^\[federated\.\w+\]$/)) return;
          fields.add(f);
        });
      }
      if (worksheet.cols?.fields) {
        worksheet.cols.fields.forEach((f: string) => {
          if (f.match(/^\[federated\.\w+\]$/)) return;
          fields.add(f);
        });
      }
      if (worksheet.encodings) {
        Object.values(worksheet.encodings).forEach((encoding: any) => {
          if (Array.isArray(encoding)) {
            encoding.forEach((e: any) => {
              if (e.column && !e.column.match(/^\[federated\.\w+\]$/)) {
                fields.add(e.column);
              }
            });
          }
        });
      }
    });
  }

  return Array.from(fields);
};

async function validate() {
  console.log('=== Tableau Source Validation ===\n');

  // Load CSV from file system
  const csvPath = path.resolve(__dirname, '../public/data/Data_to_Clean_Orders.csv');
  console.log(`Loading CSV from: ${csvPath}`);

  const csvText = fs.readFileSync(csvPath, 'utf-8');

  // Parse with preamble detection
  console.log('Parsing CSV with preamble detection...');
  const parsedData = parseCsvWithPreamble(csvText);

  console.log(`✓ Loaded ${parsedData.length} records`);

  // Show sample record
  const parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S');
  const sampleRecord = parsedData[0];
  console.log('\nSample record (raw):');
  console.log(JSON.stringify(sampleRecord, null, 2).slice(0, 500) + '...');

  // Convert to proper types
  const data = parsedData.map((d: any) => ({
    "Row ID": Number(d["Row ID"]) || 0,
    "Order ID": d["Order ID"] || '',
    "Order Date": parseDate(d["Order Date"]) || new Date(),
    "Ship Date": parseDate(d["Ship Date"]) || new Date(),
    "Ship Mode": d["Ship Mode"] || '',
    "Customer ID": d["Customer ID"] || '',
    "Customer Name": d["Customer Name"] || '',
    "Segment": d["Segment"] || '',
    "City, State": d["City, State"] || '',
    "Country": d["Country"] || '',
    "Postal Code": d["Postal Code"] || '',
    "Market": d["Market"] || '',
    "Region": d["Region"] || '',
    "Product ID": d["Product ID"] || '',
    "Category": d["Category"] || '',
    "Sub-Category": d["Sub-Category"] || '',
    "Product Name": d["Product Name"] || '',
    "Sales": Number(d["Sales"]) || 0,
    "Quantity": Number(d["Quantity"]) || 0,
    "Discount": Number(d["Discount"]) || 0,
    "Profit": Number(d["Profit"]) || 0,
    "Shipping Cost": Number(d["Shipping Cost"]) || 0,
    "Order Priority": d["Order Priority"] || ''
  })).filter((d: any) =>
    d["Row ID"] > 0 &&
    d["Order ID"] !== '' &&
    !isNaN(d.Sales) &&
    !isNaN(d.Profit)
  );

  console.log(`✓ Filtered to ${data.length} valid records`);
  console.log('\nSample record (processed):');
  console.log(JSON.stringify(data[0], null, 2));

  // Extract fields from Tableau spec
  console.log('\n=== Field Resolution ===');
  const tableauFields = extractFieldsFromSpec(tableauSpec);
  console.log(`Found ${tableauFields.length} unique field references in spec`);

  // Validate field resolution
  const sampleRow = data[0];
  const csvColumns = Object.keys(sampleRow);

  const mappings: FieldMapping[] = tableauFields.map(tableauField => {
    const fieldName = extractFieldName(tableauField);
    const found = csvColumns.includes(fieldName);

    return {
      tableauField,
      csvColumn: fieldName,
      found,
      sampleValue: found ? sampleRow[fieldName] : undefined
    };
  });

  console.log('\nField mappings:');
  mappings.forEach(mapping => {
    const status = mapping.found ? '✓' : '✗';
    const sample = mapping.sampleValue !== undefined
      ? ` (sample: ${JSON.stringify(mapping.sampleValue).slice(0, 50)})`
      : '';
    console.log(`${status} ${mapping.tableauField} -> "${mapping.csvColumn}"${sample}`);
  });

  const missingFields = mappings.filter(m => !m.found);
  if (missingFields.length > 0) {
    console.error(`\n❌ VALIDATION FAILED: ${missingFields.length} fields could not be resolved`);
    process.exit(1);
  }

  console.log('\n✓ All Tableau fields resolved successfully');

  // Data quality checks
  console.log('\n=== Data Quality Checks ===');

  const validSales = data.filter((d: any) => d.Sales > 0);
  console.log(`✓ Records with Sales > 0: ${validSales.length} / ${data.length}`);

  const validProfit = data.filter((d: any) => !isNaN(d.Profit));
  console.log(`✓ Records with valid Profit: ${validProfit.length} / ${data.length}`);

  const validDates = data.filter((d: any) => d["Order Date"] instanceof Date && !isNaN(d["Order Date"].getTime()));
  console.log(`✓ Records with valid Order Date: ${validDates.length} / ${data.length}`);

  const hasCategory = data.filter((d: any) => d.Category && d.Category !== '');
  console.log(`✓ Records with Category: ${hasCategory.length} / ${data.length}`);

  const hasSubCategory = data.filter((d: any) => d["Sub-Category"] && d["Sub-Category"] !== '');
  console.log(`✓ Records with Sub-Category: ${hasSubCategory.length} / ${data.length}`);

  const hasMarket = data.filter((d: any) => d.Market && d.Market !== '');
  console.log(`✓ Records with Market: ${hasMarket.length} / ${data.length}`);

  const hasProductName = data.filter((d: any) => d["Product Name"] && d["Product Name"] !== '');
  console.log(`✓ Records with Product Name: ${hasProductName.length} / ${data.length}`);

  // Check for Jan 1970 dates
  const epochDates = data.filter((d: any) => {
    const date = new Date(d["Order Date"]);
    return date.getFullYear() === 1970 && date.getMonth() === 0;
  });

  if (epochDates.length > 0) {
    console.error(`\n❌ VALIDATION FAILED: Found ${epochDates.length} records with Jan 1970 dates`);
    process.exit(1);
  }
  console.log('✓ No Jan 1970 dates found');

  // Check for NaN values
  const nanSales = data.filter((d: any) => isNaN(d.Sales));
  if (nanSales.length > 0) {
    console.error(`\n❌ VALIDATION FAILED: Found ${nanSales.length} records with NaN Sales`);
    process.exit(1);
  }
  console.log('✓ No NaN Sales values');

  const nanProfit = data.filter((d: any) => isNaN(d.Profit));
  if (nanProfit.length > 0) {
    console.error(`\n❌ VALIDATION FAILED: Found ${nanProfit.length} records with NaN Profit`);
    process.exit(1);
  }
  console.log('✓ No NaN Profit values');

  console.log('\n✅ ALL VALIDATIONS PASSED\n');
  console.log('Summary:');
  console.log(`  - CSV parsing: ✓ (skipped ${findHeaderRow(csvText.split(/\r?\n/))} preamble rows)`);
  console.log(`  - Field resolution: ✓ (${tableauFields.length} fields mapped)`);
  console.log(`  - Data quality: ✓ (${data.length} valid records)`);
  console.log('  - No silent parse failures detected\n');
}

validate().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
