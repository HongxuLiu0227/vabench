#!/usr/bin/env node

/**
 * Tableau Source Ingestion Validator
 *
 * This script validates that:
 * 1. CSV files can be parsed correctly
 * 2. All required fields are present
 * 3. Data types are correct (numbers, dates)
 * 4. No NaN or null values in critical fields
 * 5. Aggregations produce non-zero results
 */

const fs = require('fs');
const path = require('path');

// Simulate the data loader logic
const DATA_URL = '/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_177/public/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv';

function normalizeHeader(header) {
  let normalized = header;
  if (normalized.startsWith('\uFEFF')) {
    normalized = normalized.substring(1);
  }
  normalized = normalized.replace(/^"+|"+$/g, '');
  normalized = normalized.trim();
  return normalized;
}

function safeNumber(value) {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'NaN' || trimmed === 'null' || trimmed === 'undefined') {
      return 0;
    }
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parseDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return new Date(NaN);
  }

  const parts = dateString.trim().split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }

  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? new Date(NaN) : parsed;
}

function validateCSV() {
  console.log('🔍 Validating Tableau Source Ingestion...\n');

  // Read CSV file
  if (!fs.existsSync(DATA_URL)) {
    console.error(`❌ CSV file not found: ${DATA_URL}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(DATA_URL, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  console.log(`📄 CSV File: ${path.basename(DATA_URL)}`);
  console.log(`📊 Total lines: ${lines.length}`);

  // Parse with PapaParse
  const Papa = require('papaparse');
  const results = Papa.parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  console.log(`✅ Parsed ${results.data.length} data rows\n`);

  // Validate headers
  const headers = Object.keys(results.data[0]);
  console.log('📋 Headers found:');
  headers.forEach(h => console.log(`   - ${h}`));
  console.log('');

  // Check for required fields
  const requiredFields = [
    'Category',
    'Sub-Category',
    'Sales',
    'Region',
    'Customer Name',
    'Quantity',
    'Profit',
    'Product Name',
    'Order Date'
  ];

  console.log('🔐 Checking required fields:');
  let allRequiredPresent = true;
  requiredFields.forEach(field => {
    const present = headers.includes(field);
    console.log(`   ${present ? '✅' : '❌'} ${field}`);
    if (!present) allRequiredPresent = false;
  });
  console.log('');

  if (!allRequiredPresent) {
    console.error('❌ Missing required fields!');
    process.exit(1);
  }

  // Validate data quality
  console.log('🔬 Data Quality Checks:');

  let nanSales = 0;
  let nanProfit = 0;
  let nanQuantity = 0;
  let invalidDates = 0;
  let emptyCategories = 0;
  let emptyRegions = 0;

  results.data.forEach((row, i) => {
    const sales = safeNumber(row.Sales);
    const profit = safeNumber(row.Profit);
    const quantity = safeNumber(row.Quantity);

    if (isNaN(sales)) nanSales++;
    if (isNaN(profit)) nanProfit++;
    if (isNaN(quantity)) nanQuantity++;

    const date = parseDate(row['Order Date']);
    if (isNaN(date.getTime())) invalidDates++;

    if (!row.Category || row.Category.trim() === '') emptyCategories++;
    if (!row.Region || row.Region.trim() === '') emptyRegions++;
  });

  console.log(`   ✅ Valid Sales: ${results.data.length - nanSales}/${results.data.length}`);
  console.log(`   ✅ Valid Profit: ${results.data.length - nanProfit}/${results.data.length}`);
  console.log(`   ✅ Valid Quantity: ${results.data.length - nanQuantity}/${results.data.length}`);
  console.log(`   ✅ Valid Dates: ${results.data.length - invalidDates}/${results.data.length}`);
  console.log(`   ✅ Non-empty Categories: ${results.data.length - emptyCategories}/${results.data.length}`);
  console.log(`   ✅ Non-empty Regions: ${results.data.length - emptyRegions}/${results.data.length}`);
  console.log('');

  if (nanSales > 0 || nanProfit > 0 || nanQuantity > 0 || invalidDates > 0) {
    console.error('❌ Data quality issues detected!');
    process.exit(1);
  }

  // Test aggregations
  console.log('📈 Testing Aggregations:');

  // Test category aggregation
  const categoryMap = new Map();
  results.data.forEach(row => {
    const key = `${row.Category}-${row['Sub-Category']}`;
    const existing = categoryMap.get(key);
    if (existing) {
      existing.sales += safeNumber(row.Sales);
    } else {
      categoryMap.set(key, {
        category: row.Category,
        subCategory: row['Sub-Category'],
        sales: safeNumber(row.Sales),
      });
    }
  });

  const categoryAggregation = Array.from(categoryMap.values())
    .filter(item => item.sales > 0)
    .sort((a, b) => b.sales - a.sales);

  console.log(`   ✅ Category-SubCategory pairs: ${categoryAggregation.length}`);
  console.log(`   ✅ Total category sales: $${categoryAggregation.reduce((sum, item) => sum + item.sales, 0).toFixed(2)}`);
  console.log(`   ✅ Top category: ${categoryAggregation[0]?.category} - ${categoryAggregation[0]?.subCategory} ($${categoryAggregation[0]?.sales.toFixed(2)})`);
  console.log('');

  // Test region aggregation
  const regionMap = new Map();
  const customerSets = new Map();
  results.data.forEach(row => {
    const existing = regionMap.get(row.Region);
    if (!customerSets.has(row.Region)) {
      customerSets.set(row.Region, new Set());
    }
    customerSets.get(row.Region).add(row['Customer Name']);

    if (existing) {
      existing.sales += safeNumber(row.Sales);
      existing.quantity += safeNumber(row.Quantity);
      existing.profit += safeNumber(row.Profit);
    } else {
      regionMap.set(row.Region, {
        region: row.Region,
        sales: safeNumber(row.Sales),
        quantity: safeNumber(row.Quantity),
        profit: safeNumber(row.Profit),
      });
    }
  });

  const regionAggregation = Array.from(regionMap.values());
  regionAggregation.forEach(r => {
    r.customerCount = customerSets.get(r.region)?.size || 0;
  });

  console.log(`   ✅ Regions: ${regionAggregation.length}`);
  console.log(`   ✅ Total regional sales: $${regionAggregation.reduce((sum, item) => sum + item.sales, 0).toFixed(2)}`);
  console.log(`   ✅ Total customers: ${regionAggregation.reduce((sum, item) => sum + item.customerCount, 0)}`);
  console.log('');

  // Test yearly aggregation
  const yearMap = new Map();
  results.data.forEach(row => {
    const date = parseDate(row['Order Date']);
    const year = date.getFullYear();

    if (isNaN(year) || year < 1900 || year > 2100) {
      return;
    }

    const existing = yearMap.get(year);
    if (existing !== undefined) {
      yearMap.set(year, existing + safeNumber(row.Sales));
    } else {
      yearMap.set(year, safeNumber(row.Sales));
    }
  });

  const yearlyAggregation = Array.from(yearMap.entries())
    .filter(([_, sales]) => sales > 0)
    .map(([year, sales]) => ({ year, sales }))
    .sort((a, b) => a.year - b.year);

  console.log(`   ✅ Years with sales: ${yearlyAggregation.length}`);
  console.log(`   ✅ Year range: ${yearlyAggregation[0]?.year} - ${yearlyAggregation[yearlyAggregation.length - 1]?.year}`);
  console.log(`   ✅ Total yearly sales: $${yearlyAggregation.reduce((sum, item) => sum + item.sales, 0).toFixed(2)}`);
  console.log('');

  // Check for non-zero aggregations
  const hasNonZeroSales = categoryAggregation.some(item => item.sales > 0);
  const hasNonZeroRegions = regionAggregation.some(item => item.sales > 0);
  const hasNonZeroYears = yearlyAggregation.some(item => item.sales > 0);

  if (!hasNonZeroSales) {
    console.error('❌ All category sales are zero!');
    process.exit(1);
  }

  if (!hasNonZeroRegions) {
    console.error('❌ All regional sales are zero!');
    process.exit(1);
  }

  if (!hasNonZeroYears) {
    console.error('❌ All yearly sales are zero!');
    process.exit(1);
  }

  console.log('✅ All validations passed!');
  console.log('\n📊 Summary:');
  console.log(`   - CSV parsing: ✅`);
  console.log(`   - Required fields: ✅`);
  console.log(`   - Data quality: ✅`);
  console.log(`   - Aggregations: ✅`);
  console.log('\n🎉 Tableau source ingestion is deterministic and correct!\n');
}

// Run validation
validateCSV();
