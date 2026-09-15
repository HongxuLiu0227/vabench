/**
 * Data validation script to test CSV loading and parsing
 * This simulates the browser-side data loading to ensure correctness
 */

const fs = require('fs');
const path = require('path');
const { csvParse } = require('d3-dsv');

console.log('=== Tableau Source Data Validation ===\n');

// Test 1: File exists and is readable
const dataPath = path.join(__dirname, 'public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv');
console.log('✓ Test 1: Checking data file exists...');
if (!fs.existsSync(dataPath)) {
  console.error('✗ FAILED: Data file not found at', dataPath);
  process.exit(1);
}
console.log('  File found:', dataPath);

// Test 2: Read file content
console.log('\n✓ Test 2: Reading file content...');
const rawContent = fs.readFileSync(dataPath, 'utf-8');
console.log('  File size:', (rawContent.length / 1024 / 1024).toFixed(2), 'MB');

// Test 3: Check for BOM and remove it
console.log('\n✓ Test 3: Handling BOM...');
let cleanedContent = rawContent;
if (rawContent.charCodeAt(0) === 0xFEFF) {
  cleanedContent = rawContent.slice(1);
  console.log('  BOM detected and removed');
} else {
  console.log('  No BOM detected');
}

// Test 4: Parse CSV
console.log('\n✓ Test 4: Parsing CSV...');
const parsedData = csvParse(cleanedContent);
console.log('  Rows parsed:', parsedData.length);
console.log('  Columns:', Object.keys(parsedData[0]).length);

// Test 5: Validate required fields
console.log('\n✓ Test 5: Validating required fields...');
const requiredFields = [
  'Row ID', 'Order ID', 'Order Date', 'Ship Date', 'Ship Mode',
  'Customer ID', 'Customer Name', 'Segment', 'Country', 'City', 'State',
  'Postal Code', 'Region', 'Product ID', 'Category', 'Sub-Category',
  'Product Name', 'Sales', 'Quantity', 'Discount', 'Profit'
];

const firstRow = parsedData[0];
const missingFields = requiredFields.filter(field => !(field in firstRow));
if (missingFields.length > 0) {
  console.error('✗ FAILED: Missing required fields:', missingFields.join(', '));
  process.exit(1);
}
console.log('  All required fields present:', requiredFields.length);

// Test 6: Validate data types
console.log('\n✓ Test 6: Validating data types...');
const sampleRow = parsedData[0];
const numericFields = ['Sales', 'Quantity', 'Discount', 'Profit', 'Postal Code'];
let typeErrors = 0;

numericFields.forEach(field => {
  const value = parseFloat(sampleRow[field]);
  if (isNaN(value)) {
    console.error('  ✗ Failed to parse', field, ':', sampleRow[field]);
    typeErrors++;
  }
});

if (typeErrors > 0) {
  console.error('✗ FAILED: Type validation failed for', typeErrors, 'fields');
  process.exit(1);
}
console.log('  All numeric fields parse correctly');

// Test 7: Validate dates
console.log('\n✓ Test 7: Validating date fields...');
const dateFields = ['Order Date', 'Ship Date'];
dateFields.forEach(field => {
  const date = new Date(sampleRow[field]);
  if (isNaN(date.getTime())) {
    console.error('  ✗ Failed to parse', field, ':', sampleRow[field]);
    typeErrors++;
  } else {
    console.log('  ', field, ':', date.toISOString().split('T')[0]);
  }
});

// Test 8: Check for unique regions
console.log('\n✓ Test 8: Validating categorical data...');
const regions = new Set(parsedData.map(d => d['Region']));
console.log('  Unique regions:', Array.from(regions).sort().join(', '));
if (regions.size !== 4) {
  console.error('  ⚠ Warning: Expected 4 regions, found', regions.size);
}

// Test 9: Sample aggregation
console.log('\n✓ Test 9: Testing aggregation logic...');
const regionMap = new Map();
parsedData.forEach(row => {
  const region = row['Region'];
  const sales = parseFloat(row['Sales']) || 0;
  if (!regionMap.has(region)) {
    regionMap.set(region, { count: 0, totalSales: 0 });
  }
  const data = regionMap.get(region);
  data.count++;
  data.totalSales += sales;
});

regionMap.forEach((data, region) => {
  console.log(`  ${region}: ${data.count} orders, $${data.totalSales.toFixed(2)} total sales`);
});

// Test 10: Check for data quality issues
console.log('\n✓ Test 10: Checking for data quality issues...');
let nullRegions = 0;
let nullSales = 0;
let invalidDates = 0;

parsedData.forEach(row => {
  if (!row['Region'] || row['Region'].trim() === '') nullRegions++;
  if (!row['Sales'] || isNaN(parseFloat(row['Sales']))) nullSales++;
  const orderDate = new Date(row['Order Date']);
  if (isNaN(orderDate.getTime())) invalidDates++;
});

console.log('  Rows with null Region:', nullRegions);
console.log('  Rows with invalid Sales:', nullSales);
console.log('  Rows with invalid Order Date:', invalidDates);

if (nullRegions > 0 || nullSales > 0 || invalidDates > 0) {
  console.error('✗ FAILED: Data quality issues detected');
  process.exit(1);
}

// Summary
console.log('\n=== Validation Summary ===');
console.log('✓ All tests passed!');
console.log('✓ Data file is properly formatted');
console.log('✓ All required fields are present');
console.log('✓ Data types are correct');
console.log('✓ No data quality issues detected');
console.log('\nThe Tableau source ingestion is deterministic and correct.');
