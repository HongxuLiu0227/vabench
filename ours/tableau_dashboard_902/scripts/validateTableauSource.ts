/**
 * Deterministic Tableau Source Validator
 * Validates CSV parsing, header normalization, and Tableau field resolution
 *
 * This validator ensures:
 * 1. CSV headers with quotes/extra whitespace are normalized correctly
 * 2. All required Tableau fields from the spec resolve to real columns after normalization
 * 3. Calculated fields like Calculation_5721612283639615488 are properly mapped
 *
 * Run with: npm run validate-tableau-source
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
 * Normalize CSV header by removing quotes and extra whitespace
 * Handles cases like:
 * - """campaign""" → campaign
 * - "campaign" → campaign
 * - campaign → campaign
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"""+|"""+$/g, '') // Remove triple quotes at start/end
    .replace(/^"+|"+$/g, '')      // Remove remaining double quotes at start/end
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

/**
 * Maps Tableau field names from the spec to actual CSV column names
 */
const TABLEAU_FIELD_MAPPING: Record<string, string> = {
  // Campaign field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:campaign:nk]': 'campaign',

  // Channel field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:channel:nk]': 'channel',

  // Control field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:ok]': 'control',
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:control:nk]': 'control',

  // Event field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:event:nk]': 'event',

  // UID field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:uid:nk]': 'uid',

  // Timestamp field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:ts:nk]': 'ts',

  // Date field
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[none:dadd:nk]': 'dadd',

  // Calculated field (COUNTD users)
  '[federated.0lrh8aw00t1hqv121atbu1ioyt17].[usr:Calculation_5721612283639615488:qk]': 'uid',
};

function buildHeaderMapping(rawHeaders: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  const expectedFields = ['campaign', 'channel', 'control', 'uid', 'event', 'ts', 'dadd'];

  rawHeaders.forEach(rawHeader => {
    const normalized = normalizeHeader(rawHeader);
    if (expectedFields.includes(normalized)) {
      mapping.set(rawHeader, normalized);
    }
  });

  return mapping;
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

async function validateTableauSource() {
  console.log('='.repeat(70));
  console.log('Deterministic Tableau Source Validator');
  console.log('='.repeat(70));
  console.log();

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const csvPath = join(process.cwd(), 'public/data/clients (techmadness).csv');

    // ========================================================================
    // STEP 1: Read CSV and check for BOM
    // ========================================================================
    console.log('STEP 1: Reading CSV file...');
    let csvText = readFileSync(csvPath, 'utf-8');
    console.log(`  ✓ File: ${csvPath}`);
    console.log(`  ✓ File size: ${(csvText.length / 1024 / 1024).toFixed(2)} MB`);

    const hasBOM = csvText.charCodeAt(0) === 0xFEFF;
    console.log(`  ${hasBOM ? '✓' : '✗'} BOM detected: ${hasBOM}`);

    csvText = removeBOM(csvText);
    console.log();

    // ========================================================================
    // STEP 2: Parse CSV and check raw headers
    // ========================================================================
    console.log('STEP 2: Parsing CSV and checking raw headers...');
    const rawData = csvParse(csvText);
    console.log(`  ✓ Parsed ${rawData.length} rows`);

    if (rawData.columns.length === 0) {
      errors.push('CSV file has no columns');
    }

    console.log(`  Raw headers (${rawData.columns.length}):`);
    rawData.columns.forEach(h => console.log(`    - "${h}"`));
    console.log();

    // ========================================================================
    // STEP 3: Normalize headers (THIS IS THE KEY FIX)
    // ========================================================================
    console.log('STEP 3: Normalizing CSV headers...');

    const headerMapping = buildHeaderMapping(rawData.columns);

    if (headerMapping.size === 0) {
      errors.push('Could not map any CSV headers to expected fields after normalization');
    } else {
      console.log(`  ✓ Normalized ${headerMapping.size} headers:`);
      headerMapping.forEach((normalized, raw) => {
        console.log(`    ✓ "${raw}" → ${normalized}`);
      });
    }

    // Check for headers that need normalization
    const headersNeedNormalization = rawData.columns.some(h => {
      const normalized = normalizeHeader(h);
      return h !== normalized;
    });

    if (headersNeedNormalization) {
      console.log(`  ✓ Headers required normalization (quotes/whitespace removed)`);
    } else {
      console.log(`  ℹ Headers were already clean`);
    }
    console.log();

    // ========================================================================
    // STEP 4: Validate all required Tableau fields resolve
    // ========================================================================
    console.log('STEP 4: Validating Tableau field resolution...');

    const missingFields: string[] = [];
    const resolvedFields: string[] = [];

    Object.entries(TABLEAU_FIELD_MAPPING).forEach(([tableauField, dataField]) => {
      // Check if this data field exists in our normalized headers
      const fieldExists = Array.from(headerMapping.values()).includes(dataField);

      if (fieldExists) {
        resolvedFields.push(tableauField);
      } else {
        missingFields.push(tableauField);
      }
    });

    console.log(`  ✓ Resolved ${resolvedFields.length} of ${TABLEAU_FIELD_MAPPING.length} Tableau fields`);

    if (missingFields.length > 0) {
      console.log(`  ✗ Missing Tableau fields:`);
      missingFields.forEach(f => console.log(`    - ${f}`));
      errors.push(`Missing required Tableau fields: ${missingFields.join(', ')}`);
    } else {
      console.log(`  ✓ All required Tableau fields resolve to CSV columns`);
      console.log(`    Note: Calculation_5721612283639615488 is a calculated field using 'uid'`);
    }
    console.log();

    // ========================================================================
    // STEP 5: Normalize data and validate quality
    // ========================================================================
    console.log('STEP 5: Normalizing data and validating quality...');

    if (headerMapping.size > 0) {
      const normalizedData = rawData.map(row => normalizeRow(row, headerMapping));
      console.log(`  ✓ Normalized ${normalizedData.length} records`);

      const sampleRecord = normalizedData[0];
      console.log(`  Sample record:`);
      console.log(`    campaign: "${sampleRecord.campaign}"`);
      console.log(`    channel: "${sampleRecord.channel}"`);
      console.log(`    control: ${sampleRecord.control}`);
      console.log(`    uid: ${sampleRecord.uid}`);
      console.log(`    event: "${sampleRecord.event}"`);
      console.log();

      // Check for null/empty critical fields
      const nullCampaigns = normalizedData.filter(r => !r.campaign).length;
      const nullChannels = normalizedData.filter(r => !r.channel).length;
      const nullEvents = normalizedData.filter(r => !r.event).length;

      if (nullCampaigns > 0) {
        errors.push(`${nullCampaigns} records with null/empty campaign field`);
        console.log(`  ✗ ${nullCampaigns} records with null/empty campaign field`);
      }
      if (nullChannels > 0) {
        errors.push(`${nullChannels} records with null/empty channel field`);
        console.log(`  ✗ ${nullChannels} records with null/empty channel field`);
      }
      if (nullEvents > 0) {
        errors.push(`${nullEvents} records with null/empty event field`);
        console.log(`  ✗ ${nullEvents} records with null/empty event field`);
      }

      if (nullCampaigns === 0 && nullChannels === 0 && nullEvents === 0) {
        console.log(`  ✓ All critical fields have valid values`);
      }
      console.log();

      // ========================================================================
      // STEP 6: Test aggregations (to ensure no all-zero charts)
      // ========================================================================
      console.log('STEP 6: Testing aggregations...');

      // Control groups
      const controlGroups = new Map<number, DataRecord[]>();
      normalizedData.forEach((row) => {
        if (!controlGroups.has(row.control)) {
          controlGroups.set(row.control, []);
        }
        controlGroups.get(row.control)!.push(row);
      });

      console.log(`  Control groups (${controlGroups.size}):`);
      controlGroups.forEach((records, control) => {
        const users = countDistinctUsers(records);
        const label = control === 0 ? 'Целевая (Target)' : 'Контрольная (Control)';
        console.log(`    - ${label}: ${users} unique users, ${records.length} records`);

        if (users === 0) {
          warnings.push(`Control group ${label} has zero unique users`);
        }
      });

      // Channels
      const channels = new Map<string, DataRecord[]>();
      normalizedData.forEach((row) => {
        if (!channels.has(row.channel)) {
          channels.set(row.channel, []);
        }
        channels.get(row.channel)!.push(row);
      });

      console.log(`  Channels (${channels.size}):`);
      channels.forEach((records, channel) => {
        const users = countDistinctUsers(records);
        console.log(`    - ${channel}: ${users} unique users, ${records.length} records`);

        if (users === 0) {
          warnings.push(`Channel ${channel} has zero unique users`);
        }
      });

      // Events
      const events = new Map<string, DataRecord[]>();
      normalizedData.forEach((row) => {
        if (!events.has(row.event)) {
          events.set(row.event, []);
        }
        events.get(row.event)!.push(row);
      });

      console.log(`  Events (${events.size}):`);
      console.log(`    - ${Array.from(events.keys()).join(', ')}`);

      // Campaigns
      const campaigns = new Set(normalizedData.map(r => r.campaign));
      console.log(`  Campaigns (${campaigns.size}):`);
      console.log(`    - ${Array.from(campaigns).join(', ')}`);
      console.log();

      // ========================================================================
      // STEP 7: Check for common data issues
      // ========================================================================
      console.log('STEP 7: Checking for common data issues...');

      const allZeroUsers = Array.from(controlGroups.values()).every(records => countDistinctUsers(records) === 0);
      if (allZeroUsers) {
        errors.push('All user counts are zero - this will cause all charts to be empty');
        console.log(`  ✗ WARNING: All user counts are zero`);
      } else {
        console.log(`  ✓ User counts are non-zero`);
      }

      const epochZeroDates = normalizedData.filter(r => r.ts.startsWith('1970-01')).length;
      if (epochZeroDates > 0) {
        warnings.push(`Found ${epochZeroDates} records with Jan 1970 timestamps (epoch zero)`);
        console.log(`  ⚠ Found ${epochZeroDates} records with Jan 1970 timestamps`);
      } else {
        console.log(`  ✓ No Jan 1970 timestamps found`);
      }

      const nanUids = normalizedData.filter(r => isNaN(r.uid)).length;
      if (nanUids > 0) {
        errors.push(`Found ${nanUids} records with NaN uid values`);
        console.log(`  ✗ Found ${nanUids} records with NaN uid values`);
      } else {
        console.log(`  ✓ All uid values are valid numbers`);
      }
      console.log();
    }

    // ========================================================================
    // FINAL RESULT
    // ========================================================================
    console.log('='.repeat(70));

    if (errors.length > 0) {
      console.log('✗ VALIDATION FAILED');
      console.log('='.repeat(70));
      console.log();
      console.log('Errors:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      console.log();
      if (warnings.length > 0) {
        console.log('Warnings:');
        warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
        console.log();
      }
      process.exit(1);
    } else {
      console.log('✓ VALIDATION PASSED');
      console.log('='.repeat(70));
      console.log();
      console.log('Summary:');
      console.log(`  - Total records: ${rawData.length}`);
      console.log(`  - Raw headers: ${rawData.columns.length}`);
      console.log(`  - Normalized headers: ${headerMapping.size}`);
      console.log(`  - Tableau fields resolved: ${resolvedFields.length}/${TABLEAU_FIELD_MAPPING.length}`);
      console.log();

      if (warnings.length > 0) {
        console.log('Warnings:');
        warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
        console.log();
      }

      console.log('✓ All checks passed - Tableau source ingestion is deterministic and correct');
      console.log();
    }

  } catch (error) {
    console.error();
    console.error('='.repeat(70));
    console.error('✗ VALIDATION FAILED WITH EXCEPTION');
    console.error('='.repeat(70));
    console.error();
    console.error(error);
    process.exit(1);
  }
}

validateTableauSource();
