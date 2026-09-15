/**
 * Test date parsing specifically
 */

import * as fs from 'fs';
import * as path from 'path';
import * as d3 from 'd3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function testDates() {
  console.log('=== Date Parsing Test ===\n');

  const csvPath = path.resolve(__dirname, '../public/data/Data_to_Clean_Orders.csv');
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const parsedData = parseCsvWithPreamble(csvText);

  // Test different date formats
  const parseDate1 = d3.timeParse('%Y-%m-%d');
  const parseDate2 = d3.timeParse('%Y-%m-%d %H:%M:%S');
  const parseDate3 = d3.timeParse('%Y-%m-%dT%H:%M:%S');

  console.log('Testing first 5 records:');
  for (let i = 0; i < Math.min(5, parsedData.length); i++) {
    const rawDate = parsedData[i]['Order Date'];
    console.log(`\nRecord ${i + 1}:`);
    console.log(`  Raw: "${rawDate}"`);

    const d1 = parseDate1(rawDate);
    const d2 = parseDate2(rawDate);
    const d3parsed = parseDate3(rawDate);

    console.log(`  Format 1 (%Y-%m-%d): ${d1 ? d1.toISOString() : 'null'}`);
    console.log(`  Format 2 (%Y-%m-%d %H:%M:%S): ${d2 ? d2.toISOString() : 'null'}`);
    console.log(`  Format 3 (%Y-%m-%dT%H:%M:%S): ${d3parsed ? d3parsed.toISOString() : 'null'}`);
  }

  // Check which format works
  console.log('\n=== Determining correct format ===');

  let successCount1 = 0, successCount2 = 0, successCount3 = 0;
  const sampleSize = 100;

  for (let i = 0; i < Math.min(sampleSize, parsedData.length); i++) {
    const rawDate = parsedData[i]['Order Date'];
    if (parseDate1(rawDate)) successCount1++;
    if (parseDate2(rawDate)) successCount2++;
    if (parseDate3(rawDate)) successCount3++;
  }

  console.log(`Format 1 (%Y-%m-%d): ${successCount1}/${sampleSize} successful`);
  console.log(`Format 2 (%Y-%m-%d %H:%M:%S): ${successCount2}/${sampleSize} successful`);
  console.log(`Format 3 (%Y-%m-%dT%H:%M:%S): ${successCount3}/${sampleSize} successful`);

  // Recommend format
  if (successCount2 === sampleSize) {
    console.log('\n✓ Recommended format: %Y-%m-%d %H:%M:%S');
  } else if (successCount1 === sampleSize) {
    console.log('\n✓ Recommended format: %Y-%m-%d');
  }
}

testDates().catch(console.error);
