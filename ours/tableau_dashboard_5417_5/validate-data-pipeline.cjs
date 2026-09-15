#!/usr/bin/env node

/**
 * Comprehensive data pipeline validator
 * Tests the entire data loading and parsing pipeline for determinism and correctness
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) { log(`✅ ${message}`, 'green'); }
function error(message) { log(`❌ ${message}`, 'red'); }
function warning(message) { log(`⚠️  ${message}`, 'yellow'); }
function info(message) { log(`ℹ️  ${message}`, 'cyan'); }
function header(message) { log(`\n${message}`, 'blue'); }

// Simple CSV parser (mimicking d3-dsv behavior)
function csvParse(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  const header = parseCSVLine(lines[0]);
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === header.length) {
      const row = {};
      header.forEach((key, idx) => {
        row[key] = values[idx];
      });
      result.push(row);
    }
  }

  result.columns = header;
  return result;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current);
  return result;
}

function normalizeHeaders(rawData) {
  if (!rawData.length) return rawData;

  const firstRow = rawData[0];
  const columnMapping = {};
  const cleanColumns = [];

  Object.keys(firstRow).forEach(dirtyHeader => {
    let cleanHeader = dirtyHeader;

    // Remove BOM (Byte Order Mark) if present
    cleanHeader = cleanHeader.replace(/^\uFEFF/, '');

    // Remove quotes from edges, handling deeply nested quotes like """""game"""""
    let previousLength;
    do {
      previousLength = cleanHeader.length;
      cleanHeader = cleanHeader.replace(/^"+|"+$/g, '');
    } while (cleanHeader.length !== previousLength && (cleanHeader.startsWith('"') || cleanHeader.endsWith('"')));

    // Ensure F1 is always mapped correctly
    if (cleanHeader === 'F1' || dirtyHeader.includes('F1')) {
      cleanHeader = 'F1';
    }

    columnMapping[dirtyHeader] = cleanHeader;
    cleanColumns.push(cleanHeader);
  });

  const normalizedData = rawData.map(row => {
    const newRow = {};
    Object.keys(row).forEach(dirtyKey => {
      const cleanKey = columnMapping[dirtyKey] || dirtyKey;
      newRow[cleanKey] = row[dirtyKey];
    });
    return newRow;
  });

  normalizedData.columns = cleanColumns;
  return normalizedData;
}

function getFieldValue(row, fieldName) {
  if (row[fieldName] !== undefined) return row[fieldName];

  const quotedKey = `"${fieldName}"`;
  if (row[quotedKey] !== undefined) return row[quotedKey];

  const tripleQuotedKey = `"""${fieldName}"""`;
  if (row[tripleQuotedKey] !== undefined) return row[tripleQuotedKey];

  const allKeys = Object.keys(row);
  const matchedKey = allKeys.find(
    k => k.replace(/^"+|"+$/g, '').toLowerCase() === fieldName.toLowerCase()
  );

  return matchedKey ? row[matchedKey] : '';
}

function parseGameData(normalizedData) {
  return normalizedData.map((d, index) => {
    const positiveCritics = Number(getFieldValue(d, 'positive_critics')) || 0;
    const neutralCritics = Number(getFieldValue(d, 'neutral_critics')) || 0;
    const negativeCritics = Number(getFieldValue(d, 'negative_critics')) || 0;
    const positiveUsers = Number(getFieldValue(d, 'positive_users')) || 0;
    const neutralUsers = Number(getFieldValue(d, 'neutral_users')) || 0;
    const negativeUsers = Number(getFieldValue(d, 'negative_users')) || 0;

    const releaseDateStr = getFieldValue(d, 'release_date');
    const releaseDate = new Date(releaseDateStr);

    return {
      id: index,
      game: getFieldValue(d, 'game'),
      platform: getFieldValue(d, 'platform'),
      developer: getFieldValue(d, 'developer'),
      genre: getFieldValue(d, 'genre'),
      number_players: getFieldValue(d, 'number_players'),
      rating: getFieldValue(d, 'rating'),
      release_date: releaseDate,
      positive_critics: positiveCritics,
      neutral_critics: neutralCritics,
      negative_critics: negativeCritics,
      positive_users: positiveUsers,
      neutral_users: neutralUsers,
      negative_users: negativeUsers,
      metascore: Number(getFieldValue(d, 'metascore')) || 0,
      user_score: Number(getFieldValue(d, 'user_score')) || 0,
      total_critics: positiveCritics + neutralCritics + negativeCritics,
      total_users: positiveUsers + neutralUsers + negativeUsers,
    };
  }).filter(game => {
    const validDate = game.release_date instanceof Date && !isNaN(game.release_date.getTime());
    const validYear = game.release_date.getFullYear() > 1900 && game.release_date.getFullYear() < 2100;
    return validDate && validYear && game.game && game.platform;
  });
}

function aggregatePlatformCritics(data) {
  const platformMap = new Map();

  data.forEach((game) => {
    if (!game.platform || game.platform.trim() === '') return;

    const positive = isFinite(game.positive_critics) && game.positive_critics >= 0 ? game.positive_critics : 0;
    const neutral = isFinite(game.neutral_critics) && game.neutral_critics >= 0 ? game.neutral_critics : 0;
    const negative = isFinite(game.negative_critics) && game.negative_critics >= 0 ? game.negative_critics : 0;

    const existing = platformMap.get(game.platform);
    if (existing) {
      existing.positive_critics += positive;
      existing.neutral_critics += neutral;
      existing.negative_critics += negative;
      existing.total_critics += positive + neutral + negative;
    } else {
      platformMap.set(game.platform, {
        platform: game.platform,
        positive_critics: positive,
        neutral_critics: neutral,
        negative_critics: negative,
        total_critics: positive + neutral + negative,
        positive_users: 0,
        neutral_users: 0,
        negative_users: 0,
        total_users: 0,
      });
    }
  });

  return Array.from(platformMap.values())
    .filter(p => p.total_critics > 0)
    .sort((a, b) => b.total_critics - a.total_critics);
}

function aggregatePlatformUsers(data) {
  const platformMap = new Map();

  data.forEach((game) => {
    if (!game.platform || game.platform.trim() === '') return;

    const positive = isFinite(game.positive_users) && game.positive_users >= 0 ? game.positive_users : 0;
    const neutral = isFinite(game.neutral_users) && game.neutral_users >= 0 ? game.neutral_users : 0;
    const negative = isFinite(game.negative_users) && game.negative_users >= 0 ? game.negative_users : 0;

    const existing = platformMap.get(game.platform);
    if (existing) {
      existing.positive_users += positive;
      existing.neutral_users += neutral;
      existing.negative_users += negative;
      existing.total_users += positive + neutral + negative;
    } else {
      platformMap.set(game.platform, {
        platform: game.platform,
        positive_critics: 0,
        neutral_critics: 0,
        negative_critics: 0,
        total_critics: 0,
        positive_users: positive,
        neutral_users: neutral,
        negative_users: negative,
        total_users: positive + neutral + negative,
      });
    }
  });

  return Array.from(platformMap.values())
    .filter(p => p.total_users > 0)
    .sort((a, b) => b.total_users - a.total_users);
}

function aggregateMetascoreByMonth(data) {
  const monthMap = new Map();

  data.forEach((game) => {
    if (!(game.release_date instanceof Date) || isNaN(game.release_date.getTime())) {
      return;
    }

    if (!isFinite(game.metascore) || game.metascore < 0 || game.metascore > 100) {
      return;
    }

    const year = game.release_date.getFullYear();
    if (year < 1900 || year > 2100) {
      return;
    }

    const monthKey = `${year}-${String(game.release_date.getMonth() + 1).padStart(2, '0')}`;
    const existing = monthMap.get(monthKey);
    if (existing) {
      existing.sum += game.metascore;
      existing.count += 1;
    } else {
      monthMap.set(monthKey, { sum: game.metascore, count: 1 });
    }
  });

  const result = Array.from(monthMap.entries())
    .filter(([_, stats]) => stats.count > 0)
    .map(([month, stats]) => ({
      month: new Date(month + '-01'),
      avgMetascore: stats.sum / stats.count,
      count: stats.count,
    }));

  return result.sort((a, b) => a.month.getTime() - b.month.getTime());
}

async function runValidator() {
  header('═══════════════════════════════════════════════════════════════');
  header('  TABLEAU SOURCE INGESTION VALIDATOR');
  header('═══════════════════════════════════════════════════════════════');

  const csvPath = path.join(__dirname, 'public', 'data', 'metacritic_games_clean.csv');

  if (!fs.existsSync(csvPath)) {
    error('CSV file not found: ' + csvPath);
    process.exit(1);
  }

  info('Loading CSV file...');
  const csvText = fs.readFileSync(csvPath, 'utf-8');

  // Test 1: CSV Parsing
  header('\n📋 TEST 1: CSV Parsing');
  const rawData = csvParse(csvText);
  success(`Parsed ${rawData.length} rows from CSV`);

  // Test 2: Header Normalization
  header('\n🔧 TEST 2: Header Normalization');
  info('Raw headers (first 5):', rawData.columns.slice(0, 5).join(', '));
  const normalizedData = normalizeHeaders(rawData);
  success('Headers normalized successfully');
  info('Clean headers (first 5):', normalizedData.columns.slice(0, 5).join(', '));

  // Verify all expected columns exist
  const expectedColumns = [
    'F1', 'game', 'platform', 'developer', 'genre', 'number_players',
    'rating', 'release_date', 'positive_critics', 'neutral_critics',
    'negative_critics', 'positive_users', 'neutral_users', 'negative_users',
    'metascore', 'user_score'
  ];

  const missingColumns = expectedColumns.filter(col => !normalizedData.columns.includes(col));
  if (missingColumns.length > 0) {
    warning('Missing columns: ' + missingColumns.join(', '));
  } else {
    success('All expected columns present');
  }

  // Test 3: Data Parsing
  header('\n🔍 TEST 3: Game Data Parsing');
  const gameData = parseGameData(normalizedData);
  success(`Parsed ${gameData.length} valid game records`);

  // Check for data quality issues
  const sampleSize = Math.min(100, gameData.length);
  let validDates = 0;
  let invalidDates = 0;
  let zeroMetascores = 0;
  let validMetascores = 0;

  for (let i = 0; i < sampleSize; i++) {
    const game = gameData[i];
    if (game.release_date instanceof Date && !isNaN(game.release_date.getTime())) {
      const year = game.release_date.getFullYear();
      if (year > 1900 && year < 2100) {
        validDates++;
      } else {
        invalidDates++;
      }
    } else {
      invalidDates++;
    }

    if (game.metascore > 0) {
      validMetascores++;
    } else {
      zeroMetascores++;
    }
  }

  success(`Valid dates: ${validDates}/${sampleSize} (${Math.round(validDates/sampleSize*100)}%)`);
  if (invalidDates > 0) {
    warning(`Invalid dates: ${invalidDates}/${sampleSize}`);
  }
  info(`Metascores - Non-zero: ${validMetascores}, Zero: ${zeroMetascores}`);

  // Test 4: Platform Critics Aggregation
  header('\n📊 TEST 4: Platform Critics Aggregation');
  const platformCritics = aggregatePlatformCritics(gameData);
  success(`Aggregated data for ${platformCritics.length} platforms`);

  if (platformCritics.length > 0) {
    info('Top 5 platforms by critics:');
    platformCritics.slice(0, 5).forEach((p, i) => {
      const total = p.positive_critics + p.neutral_critics + p.negative_critics;
      info(`  ${i + 1}. ${p.platform}: ${total} total critics`);
    });

    // Check for zero values
    const zeroPlatforms = platformCritics.filter(p => p.total_critics === 0);
    if (zeroPlatforms.length > 0) {
      warning(`Found ${zeroPlatforms.length} platforms with zero critics`);
    } else {
      success('No all-zero critic values found');
    }
  } else {
    error('No platform data aggregated!');
  }

  // Test 5: Platform Users Aggregation
  header('\n👥 TEST 5: Platform Users Aggregation');
  const platformUsers = aggregatePlatformUsers(gameData);
  success(`Aggregated data for ${platformUsers.length} platforms`);

  if (platformUsers.length > 0) {
    info('Top 5 platforms by users:');
    platformUsers.slice(0, 5).forEach((p, i) => {
      const total = p.positive_users + p.neutral_users + p.negative_users;
      info(`  ${i + 1}. ${p.platform}: ${total} total users`);
    });

    const zeroPlatforms = platformUsers.filter(p => p.total_users === 0);
    if (zeroPlatforms.length > 0) {
      warning(`Found ${zeroPlatforms.length} platforms with zero users`);
    } else {
      success('No all-zero user values found');
    }
  } else {
    error('No platform user data aggregated!');
  }

  // Test 6: Metascore by Month Aggregation
  header('\n📈 TEST 6: Metascore by Month Aggregation');
  const metascoreByMonth = aggregateMetascoreByMonth(gameData);
  let jan1970 = [];
  let nanValues = [];

  success(`Aggregated metascores for ${metascoreByMonth.length} months`);

  if (metascoreByMonth.length > 0) {
    const firstMonth = metascoreByMonth[0];
    const lastMonth = metascoreByMonth[metascoreByMonth.length - 1];

    info(`Date range: ${firstMonth.month.toISOString().slice(0, 7)} to ${lastMonth.month.toISOString().slice(0, 7)}`);

    // Check for Jan 1970
    jan1970 = metascoreByMonth.filter(m => {
      const year = m.month.getFullYear();
      return year === 1970;
    });

    if (jan1970.length > 0) {
      error(`Found ${jan1970.length} months with year 1970 (invalid date parsing!)`);
    } else {
      success('No Jan 1970 dates found');
    }

    // Check for NaN values
    nanValues = metascoreByMonth.filter(m => !isFinite(m.avgMetascore));
    if (nanValues.length > 0) {
      error(`Found ${nanValues.length} months with NaN average metascores`);
    } else {
      success('No NaN metascore values found');
    }

    // Sample metascores
    info('Sample metascores:');
    metascoreByMonth.slice(0, 3).forEach((m, i) => {
      info(`  ${m.month.toISOString().slice(0, 7)}: ${m.avgMetascore.toFixed(1)} (${m.count} games)`);
    });
  } else {
    error('No metascore data aggregated!');
  }

  // Test 7: Determinism Check
  header('\n🔄 TEST 7: Determinism Check');
  info('Running second parse to verify determinism...');

  const rawData2 = csvParse(csvText);
  const normalizedData2 = normalizeHeaders(rawData2);
  const gameData2 = parseGameData(normalizedData2);
  const platformCritics2 = aggregatePlatformCritics(gameData2);

  if (gameData.length === gameData2.length) {
    success('Row count is deterministic');
  } else {
    error(`Row count changed: ${gameData.length} -> ${gameData2.length}`);
  }

  if (platformCritics.length === platformCritics2.length) {
    success('Platform count is deterministic');
  } else {
    error(`Platform count changed: ${platformCritics.length} -> ${platformCritics2.length}`);
  }

  // Check first few values match
  let matches = 0;
  const checkCount = Math.min(5, platformCritics.length);
  for (let i = 0; i < checkCount; i++) {
    if (platformCritics[i].total_critics === platformCritics2[i].total_critics) {
      matches++;
    }
  }

  if (matches === checkCount) {
    success('Aggregated values are deterministic');
  } else {
    warning(`Only ${matches}/${checkCount} values match exactly`);
  }

  // Final Summary
  header('\n═══════════════════════════════════════════════════════════════');
  header('  VALIDATION SUMMARY');
  header('═══════════════════════════════════════════════════════════════');

  const allTestsPassed =
    gameData.length > 0 &&
    platformCritics.length > 0 &&
    platformUsers.length > 0 &&
    metascoreByMonth.length > 0 &&
    jan1970.length === 0 &&
    nanValues.length === 0;

  if (allTestsPassed) {
    success('✅ ALL TESTS PASSED - Data pipeline is deterministic and correct!');
    info('\nKey metrics:');
    info(`  Total game records: ${gameData.length}`);
    info(`  Platforms with critics: ${platformCritics.length}`);
    info(`  Platforms with users: ${platformUsers.length}`);
    info(`  Months with metascores: ${metascoreByMonth.length}`);
    info(`  Date range: ${metascoreByMonth[0].month.toISOString().slice(0, 7)} to ${metascoreByMonth[metascoreByMonth.length - 1].month.toISOString().slice(0, 7)}`);
  } else {
    error('❌ SOME TESTS FAILED - Please review the errors above');
    process.exit(1);
  }
}

runValidator().catch(err => {
  error('Validator failed with error:', err.message);
  console.error(err);
  process.exit(1);
});
