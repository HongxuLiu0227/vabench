/**
 * Simple validator to check CSV parsing
 * Run with: node validate-data.js
 */

import * as d3Dsv from 'd3-dsv';
import { readFileSync } from 'fs';

const DATA_PATH = './public/data/TEMP_17c8nuo10pkc6t16hq2ut064xifx.csv';

function normalizeHeader(header) {
  // Remove triple quotes: """F1""" -> F1
  let normalized = header.replace(/^"""+|"""+$/g, '');
  // Remove double quotes: "justice" -> justice
  normalized = normalized.replace(/^"+|"+$/g, '');
  return normalized;
}

try {
  const csvText = readFileSync(DATA_PATH, 'utf-8');

  // Pre-process: normalize headers in the CSV text before parsing
  const lines = csvText.split('\n');
  if (lines.length === 0) {
    console.error('❌ CSV file is empty');
    process.exit(1);
  }

  console.log('📄 Total lines in CSV:', lines.length);

  // Normalize the header row
  const headerLine = lines[0];
  const headers = headerLine.split(',');
  const normalizedHeaders = headers.map(h => {
    const normalized = normalizeHeader(h);
    if (h.startsWith('"')) {
      return `"${normalized}"`;
    }
    return normalized;
  });
  lines[0] = normalizedHeaders.join(',');

  const normalizedCsv = lines.join('\n');
  const parsed = d3Dsv.csvParse(normalizedCsv);

  console.log('✅ Parsed', parsed.length, 'rows');

  // Check first row
  if (parsed.length > 0) {
    const firstRow = parsed[0];
    console.log('\n📊 First row sample:');
    console.log('  F1:', firstRow.F1);
    console.log('  justice:', firstRow.justice);
    console.log('  justiceName:', firstRow.justiceName);
    console.log('  vote_direction:', firstRow.vote_direction);
    console.log('  issueArea:', firstRow.issueArea);
    console.log('  term:', firstRow.term);
    console.log('  precedentAlteration:', firstRow.precedentAlteration);
  }

  // Validate required fields exist
  const requiredFields = ['F1', 'justice', 'justiceName', 'vote_direction', 'issueArea', 'term', 'precedentAlteration'];
  const missingFields = requiredFields.filter(field => !(field in parsed[0]));

  if (missingFields.length > 0) {
    console.error('\n❌ Missing required fields:', missingFields);
    process.exit(1);
  }

  console.log('\n✅ All required fields present');

  // Check for data quality issues
  const emptyJusticeNames = parsed.filter(row => !row.justiceName || row.justiceName.trim() === '').length;
  const zeroTerms = parsed.filter(row => !row.term || row.term === '0').length;
  const invalidVoteDirections = parsed.filter(row => !['0', '1', '2', '3'].includes(String(row.vote_direction))).length;

  console.log('\n📈 Data quality checks:');
  console.log('  Empty justiceName:', emptyJusticeNames);
  console.log('  Zero/missing term:', zeroTerms);
  console.log('  Invalid vote_direction:', invalidVoteDirections);

  if (emptyJusticeNames > 0 || zeroTerms > parsed.length * 0.5 || invalidVoteDirections > 0) {
    console.error('\n⚠️  Warning: Data quality issues detected');
  } else {
    console.log('\n✅ Data quality looks good');
  }

  console.log('\n✅ Validation complete!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
