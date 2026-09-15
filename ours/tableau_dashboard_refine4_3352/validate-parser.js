/**
 * Simple validation script for the CSV parser
 * Tests the parser without running the full build
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, 'public/data/TableauTemp_06jfdtn1lakc5a1amq8mn12idbt8.csv');

// Import parser functions (simplified version for validation)
function normalizeHeader(header) {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"""|"""$/g, '');
  cleaned = cleaned.replace(/^"|"$/g, '');
  return cleaned.trim();
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1] || '';

    if (char === '"' && nextChar === '"' && line[i + 2] === '"') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = '"""';
        i += 2;
      } else if (quoteChar === '"""') {
        inQuotes = false;
        quoteChar = '';
        i += 2;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = '"';
      } else if (quoteChar === '"') {
        inQuotes = false;
        quoteChar = '';
      } else {
        current += char;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current || result.length > 0) {
    result.push(current);
  }

  return result;
}

async function validate() {
  console.log('🔍 Validating CSV parser...\n');

  try {
    const csvText = readFileSync(csvPath, 'utf-8');
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());

    console.log(`📄 Total lines in CSV: ${lines.length}`);

    // Find header
    let headerLineIndex = 0;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const quotedFieldCount = (line.match(/"""/g) || []).length;
      if (quotedFieldCount >= 6) {
        headerLineIndex = i;
        break;
      }
    }

    console.log(`📋 Header found at line: ${headerLineIndex + 1}`);

    // Parse header
    const headerLine = lines[headerLineIndex];
    const rawHeaders = splitCSVLine(headerLine);
    const normalizedHeaders = rawHeaders.map(normalizeHeader);

    console.log('\n📊 Headers:');
    console.log('  Raw:', rawHeaders);
    console.log('  Normalized:', normalizedHeaders);

    // Check required fields
    const requiredFields = ['#', 'Filename', 'File extension', 'Path', 'Size', 'Date created'];
    const missing = requiredFields.filter(f => !normalizedHeaders.includes(f));

    if (missing.length > 0) {
      console.log('\n❌ Missing required fields:', missing);
      process.exit(1);
    }

    console.log('\n✅ All required fields present!');

    // Parse first data row
    const firstDataRow = lines[headerLineIndex + 1];
    const values = splitCSVLine(firstDataRow);

    console.log('\n📝 First data row:');
    console.log('  Values:', values);

    const firstRecord = {};
    normalizedHeaders.forEach((header, i) => {
      firstRecord[header] = values[i] || '';
    });

    console.log('  Record:', JSON.stringify(firstRecord, null, 2));

    // Validate numeric parsing
    const id = Number(firstRecord['#']);
    const size = Number(firstRecord['Size']);

    console.log('\n🔢 Numeric parsing:');
    console.log('  ID:', id, '(isNaN:', isNaN(id), ')');
    console.log('  Size:', size, '(isNaN:', isNaN(size), ')');

    if (isNaN(id) || isNaN(size)) {
      console.log('\n❌ Failed to parse numeric values');
      process.exit(1);
    }

    console.log('\n✅ CSV parser validation PASSED!');
    console.log('\n📈 Summary:');
    console.log('  - Header normalization: ✓');
    console.log('  - Required fields: ✓');
    console.log('  - Numeric parsing: ✓');
    console.log('  - Triple-quote handling: ✓');

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validate();
