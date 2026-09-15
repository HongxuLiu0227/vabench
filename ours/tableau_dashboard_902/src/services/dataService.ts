import { csvParse } from 'd3-dsv';
import type {
  DataRecord,
  ControlGroupData,
  ChannelData,
  FunnelData,
  CampaignData,
  FilterState,
} from '../types/data';
import { validateTableauFields } from '../utils/tableauFieldValidator';

const DATA_URL = '/data/clients (techmadness).csv';

/**
 * Remove BOM (Byte Order Mark) from the beginning of a string
 */
function removeBOM(text: string): string {
  // UTF-8 BOM is \uFEFF
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

/**
 * Build a mapping from raw CSV headers to normalized field names
 */
function buildHeaderMapping(rawHeaders: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  const expectedFields = ['campaign', 'channel', 'control', 'uid', 'event', 'ts', 'dadd'];

  rawHeaders.forEach(rawHeader => {
    const normalized = normalizeHeader(rawHeader);
    // Check if this normalized field matches one of our expected fields
    if (expectedFields.includes(normalized)) {
      mapping.set(rawHeader, normalized);
    }
  });

  return mapping;
}

/**
 * Normalize raw CSV row to data record
 */
function normalizeRow(row: Record<string, unknown>, headerMapping: Map<string, string>): DataRecord {
  const record: Partial<DataRecord> = {};

  // Iterate through the mapping to extract and normalize values
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

  // Validate that we have all required fields
  if (record.campaign === undefined || record.channel === undefined ||
      record.control === undefined || record.uid === undefined ||
      record.event === undefined || record.ts === undefined || record.dadd === undefined) {
    console.warn('Row missing required fields:', row);
  }

  return record as DataRecord;
}

/**
 * Load and parse CSV data from public/data
 * Handles:
 * - BOM (Byte Order Mark) at the start of the file
 * - Triple-quoted headers like """campaign"""
 * - Header normalization for field lookup
 */
export async function loadData(): Promise<DataRecord[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    let csvText = await response.text();

    // Remove BOM if present
    csvText = removeBOM(csvText);

    // Parse CSV with d3-dsv
    const rawData = csvParse(csvText);

    if (rawData.length === 0) {
      throw new Error('CSV file is empty or could not be parsed');
    }

    // Build header mapping from the first row's column names
    const rawHeaders = rawData.columns;
    const headerMapping = buildHeaderMapping(rawHeaders);

    if (headerMapping.size === 0) {
      console.error('Raw headers:', rawHeaders);
      throw new Error('Could not map any CSV headers to expected fields. Check CSV format.');
    }

    console.log('Header mapping:', Array.from(headerMapping.entries()));

    // Normalize all rows
    const normalizedData = rawData.map(row => normalizeRow(row, headerMapping));

    console.log(`Loaded ${normalizedData.length} records from CSV`);

    // Validate data quality
    const validRecords = normalizedData.filter(r => r.campaign && r.channel && r.event);
    if (validRecords.length !== normalizedData.length) {
      console.warn(`Filtered out ${normalizedData.length - validRecords.length} invalid records out of ${normalizedData.length} total`);
    }

    // Validate Tableau field mapping on a sample record
    if (validRecords.length > 0) {
      const validation = validateTableauFields(validRecords[0]);
      if (!validation.valid) {
        console.error('Tableau field validation failed:');
        validation.errors.forEach(err => console.error(`  - ${err}`));
        throw new Error('Tableau field validation failed. Check console for details.');
      }
      if (validation.warnings.length > 0) {
        console.warn('Tableau field validation warnings:');
        validation.warnings.forEach(warn => console.warn(`  - ${warn}`));
      }
      console.log('✓ Tableau field validation passed');
    }

    return validRecords;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

/**
 * Filter data based on active filter state
 */
export function applyFilters(data: DataRecord[], filters: FilterState): DataRecord[] {
  return data.filter((row) => {
    if (filters.control !== null && row.control !== filters.control) {
      return false;
    }
    if (filters.channel !== null && row.channel !== filters.channel) {
      return false;
    }
    if (filters.campaign !== null && row.campaign !== filters.campaign) {
      return false;
    }
    return true;
  });
}

/**
 * Calculate distinct users count (COUNTD[uid])
 */
function countDistinctUsers(records: DataRecord[]): number {
  const uniqueUids = new Set(records.map((r) => r.uid));
  return uniqueUids.size;
}

/**
 * Aggregate data for Sheet 4 (Группы) - Control groups
 */
export function aggregateControlGroups(data: DataRecord[]): ControlGroupData[] {
  const groups = new Map<number, DataRecord[]>();

  // Group by control
  data.forEach((row) => {
    if (!groups.has(row.control)) {
      groups.set(row.control, []);
    }
    groups.get(row.control)!.push(row);
  });

  // Calculate aggregates
  return Array.from(groups.entries()).map(([control, records]) => ({
    key: control.toString(),
    value: countDistinctUsers(records),
    users_count: countDistinctUsers(records),
    record_count: records.length,
    control,
    controlLabel: control === 0 ? 'Целевая' : 'Контрольная',
  }));
}

/**
 * Aggregate data for Sheet 3 (Каналы) - Channels
 */
export function aggregateChannels(data: DataRecord[]): ChannelData[] {
  const groups = new Map<string, DataRecord[]>();

  // Group by channel
  data.forEach((row) => {
    if (!groups.has(row.channel)) {
      groups.set(row.channel, []);
    }
    groups.get(row.channel)!.push(row);
  });

  // Calculate aggregates
  return Array.from(groups.entries()).map(([channel, records]) => ({
    key: channel,
    value: countDistinctUsers(records),
    users_count: countDistinctUsers(records),
    record_count: records.length,
    channel,
  }));
}

/**
 * Aggregate data for Sheet 2 (Воронка) - Funnel by event and control
 */
export function aggregateFunnel(data: DataRecord[]): FunnelData[] {
  const groups = new Map<string, Map<number, DataRecord[]>>();

  // Group by event and control
  data.forEach((row) => {
    if (!groups.has(row.event)) {
      groups.set(row.event, new Map());
    }
    const eventGroups = groups.get(row.event)!;
    if (!eventGroups.has(row.control)) {
      eventGroups.set(row.control, []);
    }
    eventGroups.get(row.control)!.push(row);
  });

  // Calculate aggregates and flatten
  const result: FunnelData[] = [];
  groups.forEach((controlMap) => {
    controlMap.forEach((records, control) => {
      const event = Array.from(groups.keys()).find((k) => groups.get(k) === controlMap);
      if (event) {
        result.push({
          event,
          control,
          controlLabel: control === 0 ? 'Целевая' : 'Контрольная',
          users_count: countDistinctUsers(records),
        });
      }
    });
  });

  // Sort by users_count descending
  return result.sort((a, b) => b.users_count - a.users_count);
}

/**
 * Aggregate data for Sheet 5 (Кампании) - Campaigns
 */
export function aggregateCampaigns(data: DataRecord[]): CampaignData[] {
  const groups = new Map<string, Map<string, DataRecord[]>>();

  // Group by campaign and channel
  data.forEach((row) => {
    if (!groups.has(row.campaign)) {
      groups.set(row.campaign, new Map());
    }
    const campaignGroups = groups.get(row.campaign)!;
    if (!campaignGroups.has(row.channel)) {
      campaignGroups.set(row.channel, []);
    }
    campaignGroups.get(row.channel)!.push(row);
  });

  // Calculate aggregates and flatten
  const result: CampaignData[] = [];
  groups.forEach((channelMap, campaign) => {
    channelMap.forEach((records, channel) => {
      result.push({
        campaign,
        channel,
        users_count: countDistinctUsers(records),
      });
    });
  });

  // Sort by users_count descending
  return result.sort((a, b) => b.users_count - a.users_count);
}
