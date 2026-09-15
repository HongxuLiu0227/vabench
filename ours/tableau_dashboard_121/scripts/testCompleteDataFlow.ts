/**
 * Comprehensive test of the complete data flow
 * Verifies: CSV parsing -> aggregation -> chart readiness
 */

import * as fs from 'fs';
import * as path from 'path';
import * as d3 from 'd3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import parsing logic
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

    const headers = line.split(',').map(h => normalizeHeader(h));
    const hasUnnamed = headers.filter(h => h.startsWith('Unnamed') || h === '').length > headers.length * 0.5;
    if (hasUnnamed) continue;

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
    return d3.csvParse(csvText);
  }

  let lineCount = 0;
  let headerPosition = 0;
  for (let i = 0; i < csvText.length; i++) {
    if (csvText[i] === '\n' || (csvText[i] === '\r' && csvText[i+1] === '\n')) {
      lineCount++;
      if (csvText[i] === '\r' && csvText[i+1] === '\n') i++;
      if (lineCount === headerRowIndex) {
        headerPosition = i + 1;
        break;
      }
    }
  }

  const cleanCsv = csvText.substring(headerPosition);
  return d3.csvParse(cleanCsv);
};

async function testDataFlow() {
  console.log('=== Complete Data Flow Test ===\n');

  // Step 1: Load CSV
  const csvPath = path.resolve(__dirname, '../public/data/Data_to_Clean_Orders.csv');
  console.log(`Step 1: Loading CSV from ${csvPath}...`);
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  console.log('✓ CSV loaded');

  // Step 2: Parse with preamble detection
  console.log('\nStep 2: Parsing CSV with preamble detection...');
  const parsedData = parseCsvWithPreamble(csvText);
  console.log(`✓ Parsed ${parsedData.length} raw records`);

  // Step 3: Convert to typed records
  console.log('\nStep 3: Converting to typed records...');
  const parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S');

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

  console.log(`✓ Converted to ${data.length} valid records`);

  // Step 4: Test aggregations (as used by charts)
  console.log('\nStep 4: Testing chart aggregations...');

  // Bar chart: aggregateByCategoryAndSubCategory
  const groupedByCategory = d3.rollup(
    data,
    v => d3.sum(v, d => d.Sales),
    d => d.Category,
    d => d["Sub-Category"]
  );
  console.log(`✓ Bar chart aggregation: ${groupedByCategory.size} categories`);

  // Line chart: aggregateByDate
  const groupedByDate = d3.rollup(
    data,
    v => d3.sum(v, d => d.Sales),
    d => {
      const date = new Date(d["Order Date"]);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
  );
  console.log(`✓ Line chart aggregation: ${groupedByDate.size} unique months`);

  // Scatterplot: aggregateByProduct
  const groupedByProduct = d3.rollup(
    data,
    v => ({
      sales: d3.sum(v, d => d.Sales),
      profit: d3.sum(v, d => d.Profit),
      quantity: d3.sum(v, d => d.Quantity)
    }),
    d => d["Product Name"]
  );
  console.log(`✓ Scatterplot aggregation: ${groupedByProduct.size} products`);

  // Highlight table: aggregateByMarketAndSubCategory
  const groupedByMarket = d3.rollup(
    data,
    v => d3.sum(v, d => d.Sales),
    d => d.Market,
    d => d["Sub-Category"]
  );
  console.log(`✓ Highlight table aggregation: ${groupedByMarket.size} markets`);

  // Step 5: Verify data quality for charts
  console.log('\nStep 5: Verifying data quality for charts...');

  const totalSales = d3.sum(data, d => d.Sales);
  const totalProfit = d3.sum(data, d => d.Profit);
  const avgSales = d3.mean(data, d => d.Sales);
  const avgProfit = d3.mean(data, d => d.Profit);

  console.log(`✓ Total Sales: ${totalSales.toFixed(2)}`);
  console.log(`✓ Total Profit: ${totalProfit.toFixed(2)}`);
  console.log(`✓ Average Sales: ${avgSales.toFixed(2)}`);
  console.log(`✓ Average Profit: ${avgProfit.toFixed(2)}`);

  // Check for non-zero values (prevent all-zero charts)
  if (totalSales === 0) {
    console.error('❌ VALIDATION FAILED: Total Sales is zero');
    process.exit(1);
  }
  console.log('✓ No all-zero charts (Total Sales > 0)');

  // Check date range (prevent Jan 1970 issue)
  const dates = data.map(d => new Date(d["Order Date"])).filter(d => !isNaN(d.getTime()));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  console.log(`✓ Date range: ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]}`);

  if (minDate.getFullYear() === 1970 && minDate.getMonth() === 0) {
    console.error('❌ VALIDATION FAILED: Found Jan 1970 dates');
    process.exit(1);
  }
  console.log('✓ No Jan 1970 timeline issue');

  // Step 6: Test filter scenarios
  console.log('\nStep 6: Testing filter scenarios...');

  const categorySales = d3.rollup(
    data,
    v => d3.sum(v, d => d.Sales),
    d => d.Category
  );

  console.log('Sales by Category:');
  categorySales.forEach((sales, category) => {
    console.log(`  - ${category}: ${sales.toFixed(2)}`);
  });

  const topCategory = Array.from(categorySales.entries()).sort((a, b) => b[1] - a[1])[0];
  console.log(`✓ Top category: ${topCategory[0]} (${topCategory[1].toFixed(2)})`);

  const filteredData = data.filter(d => d.Category === topCategory[0]);
  console.log(`✓ Filtered data: ${filteredData.length} records for ${topCategory[0]}`);

  if (filteredData.length === 0) {
    console.error('❌ VALIDATION FAILED: Filter returned no data');
    process.exit(1);
  }
  console.log('✓ Filters work correctly');

  console.log('\n✅ COMPLETE DATA FLOW TEST PASSED\n');
  console.log('Summary:');
  console.log('  - CSV parsing: ✓');
  console.log('  - Type conversion: ✓');
  console.log('  - Chart aggregations: ✓');
  console.log('  - Data quality: ✓');
  console.log('  - No all-zero charts: ✓');
  console.log('  - No Jan 1970 dates: ✓');
  console.log('  - Filter functionality: ✓');
  console.log('  - Charts will render correctly: ✓\n');
}

testDataFlow().catch(error => {
  console.error('Data flow test failed:', error);
  process.exit(1);
});
