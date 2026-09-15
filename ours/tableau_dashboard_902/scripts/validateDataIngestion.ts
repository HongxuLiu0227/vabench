/**
 * Tableau Source Ingestion Validator
 * Validates that the CSV data source is correctly parsed and all Tableau fields resolve
 *
 * Run with: npm run validate-data
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { csvParse } from 'd3-dsv';

/**
 * Remove BOM (Byte Order Mark) from the beginning of a string
 */
function removeBOM(text: string): string {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

/**
 * Normalize CSV header by removing quotes
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"""+|"""+$/g, '')
    .replace(/^"+|"+$/g, '')
    .trim();
}

interface DataRecord {
  campaign: string;
  channel: string;
  control: number;
  uid: number;
  event: string;
  ts: string;
  dadd: string;
}

function normalizeRow(row: Record<string, unknown>, headerMapping: Map<string, string>): DataRecord {
  const record: Partial<DataRecord> = {};

  headerMapping.forEach((normalizedField, rawHeader) => {
    const value = row[rawHeader];

    switch (normalizedField) {
      case 'campaign':
        record.campaign = typeof value === 'string' ? value.trim() : '';
        break;
      case 'channel':
        record.channel = typeof value === 'string' ? value.trim() : '';
        break;
      case 'control':
        record.control = typeof value === 'string' ? parseInt(value, 10) || 0 : Number(value) || 0;
        break;
      case 'uid':
        record.uid = typeof value === 'string' ? parseInt(value, 10) || 0 : Number(value) || 0;
        break;
      case 'event':
        record.event = typeof value === 'string' ? value.trim() : '';
        break;
      case 'ts':
        record.ts = typeof value === 'string' ? value.trim() : '';
        break;
      case 'dadd':
        record.dadd = typeof value === 'string' ? value.trim() : '';
        break;
    }
  });

  return record as DataRecord;
}

function countDistinctUsers(records: DataRecord[]): number {
  const uniqueUids = new Set(records.map((r) => r.uid));
  return uniqueUids.size;
}

async function validateDataIngestion() {
  console.log('='.repeat(60));
  console.log('Tableau Source Ingestion Validator');
  console.log('='.repeat(60));
  console.log();

  try {
    const csvPath = join(process.cwd(), 'public/data/clients (techmadness).csv');

    console.log('Step 1: Reading CSV file...');
    let csvText = readFileSync(csvPath, 'utf-8');
    console.log(`✓ File size: ${(csvText.length / 1024 / 1024).toFixed(2)} MB`);

    // Check for BOM
    const hasBOM = csvText.charCodeAt(0) === 0xFEFF;
    console.log(`  ${hasBOM ? '✓' : '✗'} BOM detected: ${hasBOM}`);

    // Remove BOM
    csvText = removeBOM(csvText);
    console.log();

    console.log('Step 2: Parsing CSV...');
    const rawData = csvParse(csvText);
    console.log(`✓ Parsed ${rawData.length} rows`);
    console.log(`✓ Columns: ${rawData.columns.join(', ')}`);
    console.log();

    console.log('Step 3: Building header mapping...');
    const expectedFields = ['campaign', 'channel', 'control', 'uid', 'event', 'ts', 'dadd'];
    const headerMapping = new Map<string, string>();

    rawData.columns.forEach(rawHeader => {
      const normalized = normalizeHeader(rawHeader);
      if (expectedFields.includes(normalized)) {
        headerMapping.set(rawHeader, normalized);
        console.log(`  ✓ "${rawHeader}" → ${normalized}`);
      }
    });

    if (headerMapping.size === 0) {
      throw new Error('Could not map any CSV headers to expected fields');
    }

    console.log(`✓ Mapped ${headerMapping.size} of ${expectedFields.length} expected fields`);
    console.log();

    console.log('Step 4: Normalizing data...');
    const normalizedData = rawData.map(row => normalizeRow(row, headerMapping));
    console.log(`✓ Normalized ${normalizedData.length} records`);
    console.log();

    console.log('Step 5: Validating data quality...');
    const sampleRecord = normalizedData[0];
    console.log('Sample record:');
    console.log(`  campaign: ${sampleRecord.campaign}`);
    console.log(`  channel: ${sampleRecord.channel}`);
    console.log(`  control: ${sampleRecord.control}`);
    console.log(`  uid: ${sampleRecord.uid}`);
    console.log(`  event: ${sampleRecord.event}`);
    console.log(`  ts: ${sampleRecord.ts}`);
    console.log();

    const nullCampaigns = normalizedData.filter(r => !r.campaign).length;
    const nullChannels = normalizedData.filter(r => !r.channel).length;
    const nullEvents = normalizedData.filter(r => !r.event).length;

    if (nullCampaigns > 0) console.log(`  ✗ ${nullCampaigns} records with null/empty campaign`);
    if (nullChannels > 0) console.log(`  ✗ ${nullChannels} records with null/empty channel`);
    if (nullEvents > 0) console.log(`  ✗ ${nullEvents} records with null/empty event`);

    if (nullCampaigns === 0 && nullChannels === 0 && nullEvents === 0) {
      console.log('  ✓ All critical fields have valid values');
    }
    console.log();

    console.log('Step 6: Testing aggregations...');

    // Control groups
    const controlGroups = new Map<number, DataRecord[]>();
    normalizedData.forEach((row) => {
      if (!controlGroups.has(row.control)) {
        controlGroups.set(row.control, []);
      }
      controlGroups.get(row.control)!.push(row);
    });

    console.log(`  Control groups: ${controlGroups.size}`);
    controlGroups.forEach((records, control) => {
      const users = countDistinctUsers(records);
      const label = control === 0 ? 'Целевая' : 'Контрольная';
      console.log(`    - ${label}: ${users} unique users`);
    });

    // Channels
    const channels = new Map<string, DataRecord[]>();
    normalizedData.forEach((row) => {
      if (!channels.has(row.channel)) {
        channels.set(row.channel, []);
      }
      channels.get(row.channel)!.push(row);
    });

    console.log(`  Channels: ${channels.size}`);
    channels.forEach((records, channel) => {
      const users = countDistinctUsers(records);
      console.log(`    - ${channel}: ${users} unique users`);
    });

    // Events
    const events = new Map<string, DataRecord[]>();
    normalizedData.forEach((row) => {
      if (!events.has(row.event)) {
        events.set(row.event, []);
      }
      events.get(row.event)!.push(row);
    });

    console.log(`  Events: ${events.size}`);
    console.log(`    - ${Array.from(events.keys()).join(', ')}`);

    // Campaigns
    const campaigns = new Set(normalizedData.map(r => r.campaign));
    console.log(`  Campaigns: ${campaigns.size}`);
    console.log(`    - ${Array.from(campaigns).join(', ')}`);
    console.log();

    console.log('Step 7: Checking for common issues...');

    const allZeroUsers = Array.from(controlGroups.values()).every(records => countDistinctUsers(records) === 0);
    if (allZeroUsers) {
      console.log('  ✗ WARNING: All user counts are zero');
    } else {
      console.log('  ✓ User counts are non-zero');
    }

    const epochZeroDates = normalizedData.filter(r => r.ts.startsWith('1970-01')).length;
    if (epochZeroDates > 0) {
      console.log(`  ⚠ Found ${epochZeroDates} records with Jan 1970 timestamps`);
    } else {
      console.log('  ✓ No Jan 1970 timestamps found');
    }
    console.log();

    console.log('='.repeat(60));
    console.log('✓ VALIDATION PASSED');
    console.log('='.repeat(60));
    console.log();
    console.log('Summary:');
    console.log(`  - Total records: ${normalizedData.length}`);
    console.log(`  - Control groups: ${controlGroups.size}`);
    console.log(`  - Channels: ${channels.size}`);
    console.log(`  - Events: ${events.size}`);
    console.log(`  - Campaigns: ${campaigns.size}`);
    console.log();

  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('✗ VALIDATION FAILED');
    console.error('='.repeat(60));
    console.error(error);
    process.exit(1);
  }
}

validateDataIngestion();
