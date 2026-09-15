/**
 * Validation script to test CSV parsing with actual data
 * This ensures the parsing logic handles:
 * - BOM removal
 * - Quoted headers
 * - Date parsing
 * - Number parsing
 */

const fs = require('fs');
const Papa = require('papaparse');

function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    console.warn('Invalid date string, using current date:', dateStr);
    return new Date();
  }

  // Clean the string - remove quotes, trim whitespace
  const cleaned = dateStr.replace(/^"|"$/g, '').trim();

  if (!cleaned) {
    console.warn('Empty date string after cleaning, using current date');
    return new Date();
  }

  // Handle formats like "2019/11/28" (YYYY/MM/DD)
  const parts = cleaned.split('/');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month, day);
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
  }

  const date = new Date(cleaned);
  if (isNaN(date.getTime())) {
    console.warn('Failed to parse date, using current date:', cleaned);
    return new Date();
  }

  return date;
}

function parseNumber(value) {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }

  if (!value) return 0;

  const strValue = String(value).replace(/^"|"$/g, '').trim();

  if (!strValue) return 0;

  const parsed = parseFloat(strValue);
  return isNaN(parsed) ? 0 : parsed;
}

async function validateParsing() {
  console.log('=== Starting CSV Parsing Validation ===\n');

  const csvPath = './public/data/πé¡πââπâêπé½πââπâê.csv';
  let csvText = fs.readFileSync(csvPath, 'utf8');

  console.log('1. Checking for BOM...');
  const hasBOM = csvText.charCodeAt(0) === 0xFEFF;
  console.log('   BOM detected:', hasBOM);

  if (hasBOM) {
    console.log('   Removing BOM...');
    csvText = csvText.slice(1);
    console.log('   BOM removed successfully');
  }

  console.log('\n2. Parsing CSV with PapaParse...');

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      return header.replace(/^"|"$/g, '').trim();
    },
  });

  console.log('   Total rows parsed:', results.data.length);

  if (results.errors.length > 0) {
    console.log('   Parse errors:', results.errors.length);
    results.errors.forEach((err, i) => {
      console.log(`   [${i + 1}]`, err.message, 'at row', err.row);
    });
  } else {
    console.log('   No parse errors detected ✓');
  }

  console.log('\n3. Validating parsed headers...');
  const sampleRow = results.data[0];
  const expectedHeaders = [
    '投稿日時',
    '媒体',
    'ユーザプロフィールURL',
    '投稿URL/キャプチャー',
    '投稿内容',
    'コメント数',
    'リツイート数',
    'いいね数',
    '検索ワード'
  ];

  const actualHeaders = Object.keys(sampleRow);
  console.log('   Expected headers:', expectedHeaders.length);
  console.log('   Actual headers:', actualHeaders.length);

  const missingHeaders = expectedHeaders.filter(h => !actualHeaders.includes(h));
  if (missingHeaders.length > 0) {
    console.log('   Missing headers:', missingHeaders);
  } else {
    console.log('   All expected headers found ✓');
  }

  console.log('\n4. Validating field parsing...');
  const validationResults = {
    dates: { valid: 0, invalid: 0, samples: [] },
    numbers: { valid: 0, invalid: 0, samples: [] },
    strings: { valid: 0, empty: 0, samples: [] }
  };

  results.data.slice(0, 100).forEach((row, i) => {
    // Validate date
    const dateStr = row['投稿日時'];
    const date = parseDate(dateStr);
    if (date && !isNaN(date.getTime()) && date.getFullYear() > 2000) {
      validationResults.dates.valid++;
      if (validationResults.dates.samples.length < 3) {
        validationResults.dates.samples.push({ input: dateStr, parsed: date.toISOString() });
      }
    } else {
      validationResults.dates.invalid++;
    }

    // Validate numbers
    ['コメント数', 'リツイート数', 'いいね数'].forEach(field => {
      const num = parseNumber(row[field]);
      if (!isNaN(num) && num >= 0) {
        validationResults.numbers.valid++;
      } else {
        validationResults.numbers.invalid++;
        if (validationResults.numbers.samples.length < 3) {
          validationResults.numbers.samples.push({ field, input: row[field], parsed: num });
        }
      }
    });

    // Validate strings
    ['媒体', 'ユーザプロフィールURL', '投稿内容', '検索ワード'].forEach(field => {
      const val = row[field];
      if (val && val.trim()) {
        validationResults.strings.valid++;
      } else {
        validationResults.strings.empty++;
      }
    });
  });

  console.log('   Dates parsed:');
  console.log('     Valid:', validationResults.dates.valid);
  console.log('     Invalid:', validationResults.dates.invalid);
  if (validationResults.dates.samples.length > 0) {
    console.log('     Sample parses:', validationResults.dates.samples);
  }

  console.log('   Numbers parsed:');
  console.log('     Valid:', validationResults.numbers.valid);
  console.log('     Invalid:', validationResults.numbers.invalid);
  if (validationResults.numbers.samples.length > 0) {
    console.log('     Sample errors:', validationResults.numbers.samples);
  }

  console.log('   Strings parsed:');
  console.log('     Non-empty:', validationResults.strings.valid);
  console.log('     Empty:', validationResults.strings.empty);

  console.log('\n5. Checking for common issues...');

  // Check for all-zero measures
  const allZeroLikes = results.data.every(row => parseNumber(row['いいね数']) === 0);
  const allZeroRetweets = results.data.every(row => parseNumber(row['リツイート数']) === 0);
  const allZeroComments = results.data.every(row => parseNumber(row['コメント数']) === 0);

  if (allZeroLikes) console.log('   ⚠ WARNING: All いいね数 values are zero');
  else console.log('   ✓ いいね数 has non-zero values');

  if (allZeroRetweets) console.log('   ⚠ WARNING: All リツイート数 values are zero');
  else console.log('   ✓ リツイート数 has non-zero values');

  if (allZeroComments) console.log('   ⚠ WARNING: All コメント数 values are zero');
  else console.log('   ✓ コメント数 has non-zero values');

  // Check for Jan 1970 dates (epoch)
  const epochDates = results.data.filter(row => {
    const date = parseDate(row['投稿日時']);
    return date.getFullYear() === 1970 && date.getMonth() === 0 && date.getDate() === 1;
  }).length;

  if (epochDates > 0) {
    console.log(`   ⚠ WARNING: ${epochDates} rows have epoch dates (Jan 1, 1970)`);
  } else {
    console.log('   ✓ No epoch dates detected');
  }

  console.log('\n=== Validation Complete ===');

  // Return exit code
  const hasErrors = validationResults.dates.invalid > 0 || validationResults.numbers.invalid > 0;
  return hasErrors ? 1 : 0;
}

validateParsing()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(err => {
    console.error('Validation failed with error:', err);
    process.exit(1);
  });
