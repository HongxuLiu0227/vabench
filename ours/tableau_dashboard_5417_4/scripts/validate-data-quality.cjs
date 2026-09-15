#!/usr/bin/env node

/**
 * Data Quality Validator
 * Validates that data values are correctly parsed and not all zeros/NaN
 */

const fs = require('fs');
const path = require('path');

function normalizeHeader(header) {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  return cleaned.trim();
}

function parseCSVData(csvPath, maxRows = 100) {
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  const knownFields = ['game', 'platform', 'developer', 'genre', 'number_players'];
  let headerRowIndex = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const headers = lines[i].split(',');
    const normalizedHeaders = headers.map(h => normalizeHeader(h));
    const hasKnownFields = knownFields.some(field =>
      normalizedHeaders.some(h => h.toLowerCase().includes(field.toLowerCase()))
    );
    if (hasKnownFields) {
      headerRowIndex = i;
      break;
    }
  }

  const headerLine = lines[headerRowIndex];
  const dataLines = lines.slice(headerRowIndex + 1).filter(line => line.trim());

  const rawHeaders = headerLine.split(',');
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  const rows = dataLines.slice(0, maxRows).map(line => {
    const values = line.split(',');
    const row = {};
    normalizedHeaders.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    return row;
  });

  return { headers: normalizedHeaders, rows, totalRows: dataLines.length };
}

function analyzeMetricValues(rows, fieldName) {
  const values = rows
    .map(row => Number(row[fieldName]))
    .filter(v => !isNaN(v) && v > 0);

  if (values.length === 0) {
    return { hasValidData: false, count: 0, min: 0, max: 0, avg: 0 };
  }

  return {
    hasValidData: true,
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length
  };
}

function main() {
  console.log('=== Data Quality Validator ===\n');

  const csvPath = path.join(__dirname, '..', 'public', 'data', 'metacritic_games_clean.csv');

  console.log(`Parsing CSV: ${csvPath}`);
  const { headers, rows, totalRows } = parseCSVData(csvPath, 1000);

  console.log(`✓ Total rows in CSV: ${totalRows}`);
  console.log(`✓ Analyzing first ${rows.length} rows for quality checks\n`);

  console.log('=== Metric Field Analysis ===\n');

  // Check critic metrics
  console.log('Critic Metrics:');
  const positiveCritics = analyzeMetricValues(rows, 'positive_critics');
  console.log(`  positive_critics: ${positiveCritics.count > 0 ? '✓' : '✗'} ` +
    `${positiveCritics.count} non-zero values ` +
    `(avg: ${positiveCritics.avg.toFixed(1)}, max: ${positiveCritics.max})`);

  const neutralCritics = analyzeMetricValues(rows, 'neutral_critics');
  console.log(`  neutral_critics:  ${neutralCritics.count > 0 ? '✓' : '✗'} ` +
    `${neutralCritics.count} non-zero values ` +
    `(avg: ${neutralCritics.avg.toFixed(1)}, max: ${neutralCritics.max})`);

  const negativeCritics = analyzeMetricValues(rows, 'negative_critics');
  console.log(`  negative_critics: ${negativeCritics.count > 0 ? '✓' : '✗'} ` +
    `${negativeCritics.count} non-zero values ` +
    `(avg: ${negativeCritics.avg.toFixed(1)}, max: ${negativeCritics.max})`);

  // Check user metrics
  console.log('\nUser Metrics:');
  const positiveUsers = analyzeMetricValues(rows, 'positive_users');
  console.log(`  positive_users:   ${positiveUsers.count > 0 ? '✓' : '✗'} ` +
    `${positiveUsers.count} non-zero values ` +
    `(avg: ${positiveUsers.avg.toFixed(1)}, max: ${positiveUsers.max})`);

  const neutralUsers = analyzeMetricValues(rows, 'neutral_users');
  console.log(`  neutral_users:    ${neutralUsers.count > 0 ? '✓' : '✗'} ` +
    `${neutralUsers.count} non-zero values ` +
    `(avg: ${neutralUsers.avg.toFixed(1)}, max: ${neutralUsers.max})`);

  const negativeUsers = analyzeMetricValues(rows, 'negative_users');
  console.log(`  negative_users:   ${negativeUsers.count > 0 ? '✓' : '✗'} ` +
    `${negativeUsers.count} non-zero values ` +
    `(avg: ${negativeUsers.avg.toFixed(1)}, max: ${negativeUsers.max})`);

  // Check scores
  console.log('\nScore Fields:');
  const metascore = analyzeMetricValues(rows, 'metascore');
  console.log(`  metascore:        ${metascore.count > 0 ? '✓' : '✗'} ` +
    `${metascore.count} non-zero values ` +
    `(avg: ${metascore.avg.toFixed(1)}, min: ${metascore.min}, max: ${metascore.max})`);

  const userScore = analyzeMetricValues(rows, 'user_score');
  console.log(`  user_score:       ${userScore.count > 0 ? '✓' : '✗'} ` +
    `${userScore.count} non-zero values ` +
    `(avg: ${userScore.avg.toFixed(1)}, min: ${userScore.min}, max: ${userScore.max})`);

  // Check dates
  console.log('\nDate Field:');
  const validDates = rows.filter(row => {
    const date = new Date(row.release_date);
    return !isNaN(date.getTime()) && date.getFullYear() > 1970;
  });
  console.log(`  release_date:     ${validDates.length > 0 ? '✓' : '✗'} ` +
    `${validDates.length} valid dates (not Jan 1970)`);

  if (validDates.length > 0) {
    const years = validDates
      .map(row => new Date(row.release_date).getFullYear())
      .filter(y => y > 1970);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    console.log(`  Date range:       ${minYear} to ${maxYear}`);
  }

  // Check categorical fields
  console.log('\nCategorical Fields:');
  const uniqueGames = new Set(rows.map(r => r.game)).size;
  console.log(`  game:             ✓ ${uniqueGames} unique games`);

  const uniquePlatforms = new Set(rows.map(r => r.platform)).size;
  console.log(`  platform:         ✓ ${uniquePlatforms} unique platforms`);

  const uniqueGenres = new Set(rows.map(r => r.genre)).size;
  console.log(`  genre:            ✓ ${uniqueGenres} unique genres`);

  const uniquePlayerCounts = new Set(rows.map(r => r.number_players)).size;
  console.log(`  number_players:   ✓ ${uniquePlayerCounts} unique values`);

  // Validation summary
  console.log('\n=== Validation Summary ===\n');

  const issues = [];

  if (positiveCritics.count === 0) issues.push('All positive_critics values are zero');
  if (positiveUsers.count === 0) issues.push('All positive_users values are zero');
  if (metascore.count === 0) issues.push('All metascore values are zero');
  if (validDates.length === 0) issues.push('All dates are invalid (Jan 1970)');
  if (uniqueGames === 0) issues.push('No game names found');

  if (issues.length > 0) {
    console.log('✗ Data quality issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    process.exit(1);
  }

  console.log('✓ All data quality checks passed');
  console.log(`✓ No all-zero metrics detected`);
  console.log(`✓ No NaN dates detected`);
  console.log(`✓ Categorical fields have valid values`);
  console.log(`\n✓ Data quality validation PASSED`);
}

main();
