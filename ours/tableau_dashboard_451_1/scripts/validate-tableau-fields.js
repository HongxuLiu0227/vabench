/**
 * Validation script to ensure Tableau spec fields resolve to real columns.
 * This validates the field mappings between the Tableau spec and the actual CSV data.
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

function extractFieldName(tableauField) {
  // Extract field name from Tableau field reference like:
  // [federated.1xne2po0ilkfwt1feprz80g0671q].[sum:Sales:qk]
  // [federated.1xne2po0ilkfwt1feprz80g0671q].[none:Region:nk]
  const match = tableauField.match(/\.\[([^\]]+)\]$/);
  if (match) {
    let field = match[1];

    // Parse field type
    // sum:Sales:qk -> Sales
    // none:Region:nk -> Region
    // yr:Order Date:ok -> Order Date (year)
    const parts = field.split(':');
    if (parts.length >= 2) {
      return parts[1]; // Return the actual field name
    }
    return field;
  }
  return null;
}

function mapTableauFieldToCSV(tableauField, csvHeaders) {
  const fieldName = extractFieldName(tableauField);
  if (!fieldName) return null;

  // Direct match
  if (csvHeaders.includes(fieldName)) {
    return fieldName;
  }

  // Handle special calculated fields
  if (fieldName.includes('Calculation_')) {
    // This is a calculated field (e.g., ProfitRatio)
    // Check if we have the source fields
    if (fieldName === 'Calculation_536209883642138625') {
      return 'ProfitRatio'; // This is calculated from Profit / Sales
    }
  }

  // Handle generated fields
  if (fieldName.includes('generated')) {
    if (fieldName.includes('Latitude')) return 'Latitude (generated)';
    if (fieldName.includes('Longitude')) return 'Longitude (generated)';
    if (fieldName.includes('Geometry')) return 'Geometry (generated)';
  }

  return null;
}

function main() {
  console.log('🔍 Validating Tableau field mappings...\n');

  // Load CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const cleaned = cleanCSVData(csvContent);
  const lines = cleaned.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);

  console.log(`✅ CSV headers loaded: ${headers.length} fields\n`);

  // Load Tableau specs
  const tableauSpec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  const tableauContract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));

  console.log('📋 Checking worksheet field mappings...\n');

  let allFieldsMapped = true;
  const mappingReport = [];

  for (const worksheet of tableauSpec.worksheets) {
    console.log(`Worksheet: ${worksheet.name}`);
    console.log(`  Chart Type: ${worksheet.chart_type}`);

    const fieldChecks = [];

    // Check rows field
    if (worksheet.rows?.raw) {
      const mapped = mapTableauFieldToCSV(worksheet.rows.raw, headers);
      const status = mapped ? '✅' : '❌';
      fieldChecks.push({ field: worksheet.rows.raw, mapped, status });
      console.log(`  ${status} Rows: ${worksheet.rows.raw} -> ${mapped || 'NOT FOUND'}`);
      if (!mapped) allFieldsMapped = false;
    }

    // Check cols field
    if (worksheet.cols?.raw) {
      const mapped = mapTableauFieldToCSV(worksheet.cols.raw, headers);
      const isSpecialField = worksheet.cols.raw.includes('Measure Names');
      const status = mapped || isSpecialField ? '✅' : '❌';
      const note = isSpecialField ? '(Tableau pivot field)' : '';
      fieldChecks.push({ field: worksheet.cols.raw, mapped, status });
      console.log(`  ${status} Cols: ${worksheet.cols.raw} -> ${mapped || 'NOT FOUND'} ${note}`);
      if (!mapped && !isSpecialField) allFieldsMapped = false;
    }

    // Check encoding fields
    if (worksheet.encodings) {
      for (const [encodingType, encodingList] of Object.entries(worksheet.encodings)) {
        if (Array.isArray(encodingList)) {
          for (const encoding of encodingList) {
            if (encoding.column) {
              const mapped = mapTableauFieldToCSV(encoding.column, headers);
              // Special Tableau fields that are expected to not exist in CSV
              const isSpecialField =
                encoding.column.includes('Measure Names') ||
                encoding.column.includes('Multiple Values') ||
                encoding.column.includes('generated');

              const status = mapped || isSpecialField ? '✅' : '❌';
              const note = isSpecialField ? '(Tableau metadata/calculated)' : '';
              // Only log if not already checked
              const alreadyChecked = fieldChecks.some(f => f.field === encoding.column);
              if (!alreadyChecked) {
                fieldChecks.push({ field: encoding.column, mapped, status });
                console.log(`  ${status} ${encodingType}: ${encoding.column} -> ${mapped || 'NOT FOUND'} ${note}`);
                if (!mapped && !isSpecialField) allFieldsMapped = false;
              }
            }
          }
        }
      }
    }

    // Check filter fields
    if (worksheet.filter) {
      for (const filter of worksheet.filter) {
        if (filter.column) {
          const mapped = mapTableauFieldToCSV(filter.column, headers);
          // Special Tableau fields that are expected to not exist in CSV
          const isSpecialField =
            filter.column.includes('Measure Names') ||
            filter.column.includes('Action (') ||
            filter.column.includes('Multiple Values');

          const status = mapped || isSpecialField ? '✅' : '❌';
          const note = isSpecialField ? '(Tableau metadata field)' : '';
          console.log(`  ${status} Filter: ${filter.column} -> ${mapped || 'NOT FOUND'} ${note}`);
          if (!mapped && !isSpecialField) allFieldsMapped = false;
        }
      }
    }

    mappingReport.push({
      worksheet: worksheet.name,
      fieldChecks
    });

    console.log('');
  }

  // Verify numeric fields can be coerced
  console.log('🔍 Verifying numeric field coercion...\n');

  const numericFields = ['Sales', 'Profit', 'Quantity', 'Discount', 'Postal Code'];
  const firstDataRow = parseCSVLine(lines[1]);

  for (const field of numericFields) {
    const idx = headers.indexOf(field);
    if (idx >= 0) {
      const value = firstDataRow[idx];
      const num = Number(value);
      const status = !isNaN(num) ? '✅' : '❌';
      console.log(`  ${status} ${field}: "${value}" -> ${num} (${!isNaN(num) ? 'valid' : 'INVALID'})`);
      if (isNaN(num)) allFieldsMapped = false;
    }
  }

  // Verify date fields
  console.log('\n🔍 Verifying date field parsing...\n');

  const dateFields = ['Order Date', 'Ship Date'];
  for (const field of dateFields) {
    const idx = headers.indexOf(field);
    if (idx >= 0) {
      const value = firstDataRow[idx];
      const date = new Date(value);
      const status = !isNaN(date.getTime()) ? '✅' : '❌';
      const year = date.getFullYear();
      console.log(`  ${status} ${field}: "${value}" -> ${date.toISOString()} (year: ${year})`);
      if (isNaN(date.getTime()) || year === 1970) allFieldsMapped = false;
    }
  }

  // Verify calculated fields
  console.log('\n🔍 Verifying calculated fields...\n');

  const salesIdx = headers.indexOf('Sales');
  const profitIdx = headers.indexOf('Profit');

  if (salesIdx >= 0 && profitIdx >= 0) {
    const sales = Number(firstDataRow[salesIdx]);
    const profit = Number(firstDataRow[profitIdx]);
    const profitRatio = sales !== 0 ? profit / sales : 0;

    console.log(`  ✅ ProfitRatio can be calculated: ${profit} / ${sales} = ${profitRatio.toFixed(4)}`);
    console.log(`  ✅ Year can be extracted from Order Date`);
  }

  // Final verdict
  console.log(`\n${allFieldsMapped ? '✅' : '❌'} Tableau field validation ${allFieldsMapped ? 'PASSED' : 'FAILED'}`);

  if (!allFieldsMapped) {
    console.log('\n⚠️  Some fields could not be mapped. Generated fields (Latitude, Longitude, Geometry) are expected to be missing from CSV.');
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`  - CSV fields: ${headers.length}`);
  console.log(`  - Worksheets: ${tableauSpec.worksheets.length}`);
  console.log(`  - All required fields mapped: ${allFieldsMapped ? 'Yes ✅' : 'No ❌'}`);

  if (!allFieldsMapped) {
    process.exit(1);
  }
}

main();
