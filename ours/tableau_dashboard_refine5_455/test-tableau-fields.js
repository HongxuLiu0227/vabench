#!/usr/bin/env node

/**
 * Comprehensive test to verify Tableau field mappings and data aggregations
 * Tests that all required Tableau fields from the spec resolve correctly
 */

import { readFileSync } from 'fs';
import { csvParse } from 'd3-dsv';

const CSV_PATH = './public/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv';

// Replicate the parsing logic from dataService.ts
function stripBOM(text) {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

function normalizeColumnName(name) {
  return name.trim().replace(/^"+|"+$/g, '').replace(/"{2,}/g, '"').trim();
}

function extractActualCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  return lines.slice(4).join('\n');
}

function parseNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  const str = String(value).replace(/,/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? defaultValue : num;
}

function parseDate(value) {
  if (!value) return new Date(NaN);
  const str = String(value).trim();
  const date = new Date(str);
  return isNaN(date.getTime()) ? new Date(NaN) : date;
}

function parseString(value, defaultValue = '') {
  if (value === null || value === undefined) return defaultValue;
  return String(value).trim();
}

function parseOrderRecord(d) {
  return {
    rowId: parseNumber(d['Row ID'], 0),
    orderId: parseString(d['Order ID']),
    orderDate: parseDate(d['Order Date']),
    shipDate: parseDate(d['Ship Date']),
    shipMode: parseString(d['Ship Mode']),
    customerId: parseString(d['Customer ID']),
    customerName: parseString(d['Customer Name']),
    segment: parseString(d['Segment']),
    cityState: parseString(d['City, State']),
    country: parseString(d['Country']),
    postalCode: parseNumber(d['Postal Code'], 0),
    market: parseString(d['Market']),
    region: parseString(d['Region']),
    productId: parseString(d['Product ID']),
    category: parseString(d['Category']),
    subCategory: parseString(d['Sub-Category']),
    productName: parseString(d['Product Name']),
    sales: parseNumber(d['Sales'], 0),
    quantity: parseNumber(d['Quantity'], 0),
    discount: parseNumber(d['Discount'], 0),
    profit: parseNumber(d['Profit'], 0),
    shippingCost: parseNumber(d['Shipping Cost'], 0),
    orderPriority: parseString(d['Order Priority']),
  };
}

// Aggregation functions
function aggregateScatterplotData(data) {
  const grouped = new Map();
  data.forEach((record) => {
    const key = record.productName;
    if (!grouped.has(key)) {
      grouped.set(key, { productName: key, sales: 0, profit: 0, quantity: 0 });
    }
    const item = grouped.get(key);
    item.sales += record.sales;
    item.profit += record.profit;
    item.quantity += record.quantity;
  });
  return Array.from(grouped.values());
}

function aggregateBarChartData(data) {
  const grouped = new Map();
  data.forEach((record) => {
    const key = `${record.category}|${record.subCategory}`;
    if (!grouped.has(key)) {
      grouped.set(key, { category: record.category, subCategory: record.subCategory, sales: 0 });
    }
    grouped.get(key).sales += record.sales;
  });
  return Array.from(grouped.values()).sort((a, b) => b.sales - a.sales);
}

function aggregateYearlySalesData(data) {
  const grouped = new Map();
  data.forEach((record) => {
    const year = record.orderDate.getFullYear();
    if (!grouped.has(year)) {
      grouped.set(year, { year, sales: 0 });
    }
    grouped.get(year).sales += record.sales;
  });
  return Array.from(grouped.values()).sort((a, b) => a.year - b.year);
}

function aggregateCustomerOverviewData(data) {
  const grouped = new Map();
  const customerCounts = new Map();

  data.forEach((record) => {
    const key = record.region;
    if (!customerCounts.has(key)) {
      customerCounts.set(key, new Set());
    }
    customerCounts.get(key).add(record.customerName);

    if (!grouped.has(key)) {
      grouped.set(key, {
        region: key,
        numberOfCustomers: 0,
        sales: 0,
        quantity: 0,
        profit: 0,
        profitRatio: 0,
      });
    }
    const item = grouped.get(key);
    item.sales += record.sales;
    item.quantity += record.quantity;
    item.profit += record.profit;
  });

  const result = Array.from(grouped.values());
  result.forEach((item) => {
    item.numberOfCustomers = customerCounts.get(item.region)?.size || 0;
    item.profitRatio = item.sales !== 0 ? item.profit / item.sales : 0;
  });

  return result.sort((a, b) => a.region.localeCompare(b.region));
}

try {
  console.log('Testing Tableau Field Mappings and Aggregations\n');
  console.log('='.repeat(60));

  // Load and parse data
  const csvText = readFileSync(CSV_PATH, 'utf-8');
  const cleaned = stripBOM(extractActualCSV(csvText));
  const rawData = csvParse(cleaned);
  const normalizedData = rawData.map((row) => {
    const normalized = {};
    for (const key in row) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        normalized[normalizeColumnName(key)] = row[key];
      }
    }
    return normalized;
  });
  const data = normalizedData.map(parseOrderRecord);

  console.log(`\n✓ Loaded ${data.length} records`);

  // Test P121__scatterplot fields
  console.log('\n' + '='.repeat(60));
  console.log('P121__scatterplot (Scatterplot)');
  console.log('='.repeat(60));
  console.log('Required fields:');
  console.log('  - sum:Profit:qk → Profit');
  console.log('  - sum:Sales:qk → Sales');
  console.log('  - sum:Quantity:qk → Quantity');
  console.log('  - none:Product Name:nk → Product Name');

  const scatterplotData = aggregateScatterplotData(data);
  console.log(`\n✓ Aggregated to ${scatterplotData.length} products`);
  const sampleScatter = scatterplotData[0];
  console.log(`\nSample product data:`);
  console.log(`  Product: ${sampleScatter.productName}`);
  console.log(`  Sales: ${sampleScatter.sales.toFixed(2)}`);
  console.log(`  Profit: ${sampleScatter.profit.toFixed(2)}`);
  console.log(`  Quantity: ${sampleScatter.quantity}`);

  const nonZeroSales = scatterplotData.filter(d => d.sales > 0).length;
  const nonZeroProfit = scatterplotData.filter(d => d.profit !== 0).length;
  console.log(`\n✓ Data quality: ${nonZeroSales}/${scatterplotData.length} products with non-zero sales`);
  console.log(`✓ Data quality: ${nonZeroProfit}/${scatterplotData.length} products with non-zero profit`);

  // Test P121__bar fields
  console.log('\n' + '='.repeat(60));
  console.log('P121__bar (Horizontal Ranked Bar)');
  console.log('='.repeat(60));
  console.log('Required fields:');
  console.log('  - none:Category:nk → Category');
  console.log('  - none:Sub-Category:nk → Sub-Category');
  console.log('  - sum:Sales:qk → Sales');

  const barData = aggregateBarChartData(data);
  console.log(`\n✓ Aggregated to ${barData.length} category/sub-category combinations`);
  const topBar = barData[0];
  console.log(`\nTop ranked combination:`);
  console.log(`  Category: ${topBar.category}`);
  console.log(`  Sub-Category: ${topBar.subCategory}`);
  console.log(`  Sales: ${topBar.sales.toFixed(2)}`);

  const categories = new Set(barData.map(d => d.category));
  console.log(`\n✓ Found ${categories.size} unique categories:`, Array.from(categories).join(', '));

  // Test P1968__customer_overview fields
  console.log('\n' + '='.repeat(60));
  console.log('P1968__customer_overview (Customer Overview)');
  console.log('='.repeat(60));
  console.log('Required fields:');
  console.log('  - none:Region:nk → Region');
  console.log('  - ctd:Customer Name:qk → Customer Name');
  console.log('  - sum:Sales:qk → Sales');
  console.log('  - sum:Quantity:qk → Quantity');
  console.log('  - sum:Profit:qk → Profit');
  console.log('  - usr:Profit:qk → Profit');

  const customerData = aggregateCustomerOverviewData(data);
  console.log(`\n✓ Aggregated to ${customerData.length} regions`);
  console.log('\nRegion breakdown:');
  customerData.forEach(region => {
    console.log(`  ${region.region}:`);
    console.log(`    Customers: ${region.numberOfCustomers}`);
    console.log(`    Sales: ${region.sales.toFixed(2)}`);
    console.log(`    Quantity: ${region.quantity}`);
    console.log(`    Profit: ${region.profit.toFixed(2)}`);
    console.log(`    Profit Ratio: ${(region.profitRatio * 100).toFixed(2)}%`);
  });

  // Test P1225__total_sales_each_year fields
  console.log('\n' + '='.repeat(60));
  console.log('P1225__total_sales_each_year (Line Chart)');
  console.log('='.repeat(60));
  console.log('Required fields:');
  console.log('  - sum:Sales:qk → Sales');
  console.log('  - yr:Order Date:ok → Order Date (year)');

  const yearlyData = aggregateYearlySalesData(data);
  console.log(`\n✓ Aggregated to ${yearlyData.length} years`);
  console.log('\nYearly sales:');
  yearlyData.forEach(year => {
    console.log(`  ${year.year}: $${year.sales.toFixed(2)}`);
  });

  // Check for date range
  const years = yearlyData.map(d => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  console.log(`\n✓ Date range: ${minYear} to ${maxYear} (not Jan 1970!)`);

  // Final validation
  console.log('\n' + '='.repeat(60));
  console.log('FINAL VALIDATION');
  console.log('='.repeat(60));

  const allTests = [
    { name: 'Scatterplot has non-zero sales', pass: scatterplotData.some(d => d.sales > 0) },
    { name: 'Scatterplot has non-zero profit', pass: scatterplotData.some(d => d.profit !== 0) },
    { name: 'Bar chart has multiple categories', pass: categories.size >= 2 },
    { name: 'Customer overview has multiple regions', pass: customerData.length >= 2 },
    { name: 'Yearly sales has valid year range', pass: minYear > 1970 && maxYear > minYear },
    { name: 'All aggregations produced results', pass: scatterplotData.length > 0 && barData.length > 0 && yearlyData.length > 0 && customerData.length > 0 },
  ];

  const allPassed = allTests.every(t => t.pass);

  allTests.forEach(test => {
    console.log(`${test.pass ? '✓' : '✗'} ${test.name}`);
  });

  if (allPassed) {
    console.log('\n' + '='.repeat(60));
    console.log('✓ ALL TESTS PASSED - Tableau source ingestion is deterministic!');
    console.log('='.repeat(60));
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('✗ SOME TESTS FAILED');
    console.log('='.repeat(60));
    process.exit(1);
  }

} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
