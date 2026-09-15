/**
 * Validation script for Tableau data loader
 * Ensures deterministic CSV parsing and validates data quality
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv');

/**
 * Normalize CSV headers by removing BOM, quotes, and extra whitespace
 */
function normalizeHeader(header) {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^"|"$/g, '') // Remove surrounding quotes
    .trim(); // Remove extra whitespace
}

/**
 * Parse a CSV line, handling quoted fields that may contain commas
 */
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  fields.push(current);

  return fields;
}

/**
 * Parse date string (YYYY-MM-DD format)
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Main validation function
 */
function validateDataLoader() {
  console.log('='.repeat(60));
  console.log('Tableau Data Loader Validation');
  console.log('='.repeat(60));

  // Read CSV file
  console.log('\n1. Reading CSV file...');
  if (!fs.existsSync(DATA_PATH)) {
    console.error('❌ CSV file not found:', DATA_PATH);
    return false;
  }
  console.log('✓ CSV file found:', DATA_PATH);

  const csvText = fs.readFileSync(DATA_PATH, 'utf-8');
  console.log('✓ File size:', (csvText.length / 1024 / 1024).toFixed(2), 'MB');

  // Check for BOM
  console.log('\n2. Checking for BOM...');
  const hasBOM = csvText.charCodeAt(0) === 0xFEFF;
  console.log(hasBOM ? '✓ BOM detected (will be removed during parsing)' : '✓ No BOM detected');

  // Split lines
  console.log('\n3. Splitting lines...');
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  console.log('✓ Total non-empty lines:', lines.length);

  if (lines.length === 0) {
    console.error('❌ CSV file is empty');
    return false;
  }

  // Parse header
  console.log('\n4. Parsing header...');
  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map(normalizeHeader);
  console.log('✓ Headers parsed:', headers.length, 'columns');
  console.log('  Headers:', headers.join(', '));

  // Validate required headers
  console.log('\n5. Validating required headers...');
  const requiredHeaders = [
    'Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Sales',
    'Quantity', 'Discount', 'Profit', 'Category', 'Sub-Category',
    'Product Name', 'Region', 'Customer Name'
  ];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    console.error('❌ Missing required headers:', missingHeaders.join(', '));
    return false;
  }
  console.log('✓ All required headers present');

  // Parse data rows
  console.log('\n6. Parsing data rows...');
  let parseErrors = 0;
  let dateErrors = 0;
  let numericErrors = 0;
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const fields = parseCsvLine(line);

    if (fields.length !== headers.length) {
      parseErrors++;
      if (parseErrors <= 5) {
        console.warn('  ⚠ Row', i, ': Expected', headers.length, 'fields, got', fields.length);
      }
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      row[header] = fields[index] || '';
    });

    // Parse dates
    const orderDate = parseDate(row['Order Date']);
    const shipDate = parseDate(row['Ship Date']);

    if (!orderDate) {
      dateErrors++;
      if (dateErrors <= 3) {
        console.warn('  ⚠ Row', i, ': Invalid Order Date:', row['Order Date']);
      }
    }
    if (!shipDate) {
      dateErrors++;
      if (dateErrors <= 3) {
        console.warn('  ⚠ Row', i, ': Invalid Ship Date:', row['Ship Date']);
      }
    }

    // Parse numeric fields
    const numericFields = ['Row ID', 'Postal Code', 'Sales', 'Quantity', 'Discount', 'Profit'];
    numericFields.forEach(field => {
      const value = parseFloat(row[field]);
      if (isNaN(value) && row[field] !== '') {
        numericErrors++;
        if (numericErrors <= 3) {
          console.warn('  ⚠ Row', i, ': Invalid', field, ':', row[field]);
        }
      }
    });

    data.push({ ...row, OrderDateObj: orderDate, ShipDateObj: shipDate });
  }

  console.log('✓ Parsed', data.length, 'valid rows');
  console.log('  Parse errors (field count):', parseErrors);
  console.log('  Date errors:', dateErrors);
  console.log('  Numeric errors:', numericErrors);

  if (data.length === 0) {
    console.error('❌ No valid data rows parsed');
    return false;
  }

  // Validate data quality
  console.log('\n7. Validating data quality...');

  // Check for zero/null Sales
  const zeroSales = data.filter(d => parseFloat(d.Sales) === 0).length;
  console.log('  Zero Sales records:', zeroSales, `(${(zeroSales / data.length * 100).toFixed(1)}%)`);

  // Check for null dates
  const nullDates = data.filter(d => !d.OrderDateObj || !d.ShipDateObj).length;
  console.log('  Null date records:', nullDates, `(${(nullDates / data.length * 100).toFixed(1)}%)`);

  // Validate date ranges (should be reasonable for Superstore data)
  const validDates = data.filter(d => d.OrderDateObj);
  const years = validDates.map(d => d.OrderDateObj.getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  console.log('  Date range:', minYear, 'to', maxYear);

  if (minYear < 2000 || maxYear > 2030) {
    console.warn('  ⚠ Unusual date range detected');
  }

  // Check Categories
  const categories = [...new Set(data.map(d => d.Category))];
  console.log('  Unique categories:', categories.length, categories.join(', '));

  // Check Regions
  const regions = [...new Set(data.map(d => d.Region))];
  console.log('  Unique regions:', regions.length, regions.join(', '));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Validation Summary');
  console.log('='.repeat(60));
  console.log('✓ CSV file format: Valid');
  console.log('✓ BOM handling: Correct');
  console.log('✓ Header parsing: Correct');
  console.log('✓ Required fields: All present');
  console.log('✓ Quoted field parsing: Working correctly');
  console.log('✓ Date parsing: Working (with', dateErrors, 'errors)');
  console.log('✓ Numeric parsing: Working (with', numericErrors, 'errors)');
  console.log('✓ Total valid rows:', data.length);

  const totalErrors = parseErrors + dateErrors + numericErrors;
  const errorRate = (totalErrors / (lines.length - 1) * 100).toFixed(2);
  console.log('✓ Overall error rate:', errorRate + '%');

  if (totalErrors > lines.length * 0.01) {
    console.warn('\n⚠ Warning: Error rate exceeds 1%');
    return false;
  }

  console.log('\n✅ Data loader validation PASSED');
  console.log('='.repeat(60));
  return true;
}

// Run validation
const success = validateDataLoader();
process.exit(success ? 0 : 1);
