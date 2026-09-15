/**
 * Test calculation determinism
 * Verifies that aggregation functions produce consistent results
 */

const fs = require('fs');
const path = require('path');

function normalizeHeaderName(header) {
  let cleaned = header.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^"""(.+)"""$/, '$1');
  cleaned = cleaned.replace(/^"(.+)"$/, '$1');
  return cleaned;
}

function parseCSV(csvText) {
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => normalizeHeaderName(h.trim()));

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Only include rows with required fields
    if (row.DisplayCounty && row.DisplayMFL) {
      data.push({
        DisplayCounty: row.DisplayCounty,
        DisplayMFL: parseInt(row.DisplayMFL) || 0,
        DisplayAgency: row.DisplayAgency || '',
        UploadDate: row.UploadDate || null,
        UploadDate_MPI: row.UploadDate_MPI || null,
        Siteabstractiondate: row.Siteabstractiondate || null
      });
    }
  }

  return data;
}

function aggregateCountyDistribution(data) {
  const countyMap = new Map();

  data.forEach(row => {
    const county = row.DisplayCounty;
    const mflCode = row.DisplayMFL;

    if (!countyMap.has(county)) {
      countyMap.set(county, new Set());
    }

    countyMap.get(county).add(mflCode);
  });

  const result = Array.from(countyMap.entries()).map(([county, facilitySet]) => {
    const agency = data.find(row => row.DisplayCounty === county && row.DisplayAgency)?.DisplayAgency || 'Unknown';

    return {
      county,
      facilityCount: facilitySet.size,
      agency
    };
  });

  return result.sort((a, b) => b.facilityCount - a.facilityCount);
}

function testDeterminism() {
  const csvPath = path.join(__dirname, 'public/data/federated_0se4v9q15j8hfi17f25m50.csv');
  const csvText = fs.readFileSync(csvPath, 'utf8');

  console.log('=== Testing Calculation Determinism ===\n');

  // Run aggregation twice to check for consistency
  console.log('Running aggregation 1...');
  const data1 = parseCSV(csvText);
  const result1 = aggregateCountyDistribution(data1);

  console.log('Running aggregation 2...');
  const data2 = parseCSV(csvText);
  const result2 = aggregateCountyDistribution(data2);

  // Compare results
  console.log('\nComparing results...');
  if (result1.length !== result2.length) {
    console.error('❌ FAILED: Result lengths differ');
    return false;
  }

  for (let i = 0; i < result1.length; i++) {
    const r1 = result1[i];
    const r2 = result2[i];

    if (r1.county !== r2.county ||
        r1.facilityCount !== r2.facilityCount ||
        r1.agency !== r2.agency) {
      console.error(`❌ FAILED: Row ${i} differs`);
      console.error('  Result 1:', r1);
      console.error('  Result 2:', r2);
      return false;
    }
  }

  console.log('✅ Results are identical across runs\n');

  // Display sample results
  console.log('Sample aggregation results (top 5 counties):');
  console.log('County'.padEnd(20) + 'Facility Count'.padEnd(20) + 'Agency');
  console.log('-'.repeat(60));

  for (let i = 0; i < Math.min(5, result1.length); i++) {
    const r = result1[i];
    console.log(
      r.county.padEnd(20) +
      r.facilityCount.toString().padEnd(20) +
      r.agency
    );
  }

  console.log('\nStatistics:');
  console.log(`  Total counties: ${result1.length}`);
  console.log(`  Total facilities: ${data1.length}`);
  console.log(`  Unique facilities: ${new Set(data1.map(d => d.DisplayMFL)).size}`);

  return true;
}

// Run test
try {
  const success = testDeterminism();
  if (success) {
    console.log('\n✅ All determinism tests passed');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Test error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
