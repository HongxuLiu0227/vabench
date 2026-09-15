import type { CricketDataRow, AggregatedDataPoint } from '../types/cricket';

const DATA_URL = '/data/TEMP_1a0b54d0ncxp7o13uhh9c0ssmfny.csv';

export const loadCricketData = async (): Promise<CricketDataRow[]> => {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const csvText = await response.text();
  const parsedData = parseCSV(csvText);

  // Validate that we got data
  if (parsedData.length === 0) {
    throw new Error('No data rows parsed from CSV');
  }

  // Validate required fields exist in first row
  const firstRow = parsedData[0];
  const requiredFields = ['match_id', 'batsman', 'winner'];
  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in parsed data: ${missingFields.join(', ')}`);
  }

  return parsedData;
};

const normalizeHeader = (header: string): string => {
  // Remove BOM character if present
  let cleaned = header.replace(/^\uFEFF/, '');
  // Remove all quotes and trim whitespace
  cleaned = cleaned.replace(/"+/g, '').trim();
  return cleaned;
};

const parseCSV = (csvText: string): CricketDataRow[] => {
  // Remove BOM character if present at the start of the file
  const cleanedText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanedText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header - normalize field names by removing repeated quotes
  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map(normalizeHeader);

  const data: CricketDataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== rawHeaders.length) continue;

    const row: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      const value = values[index];

      // Parse numeric fields
      if ([
        'match_id', 'inning', 'over', 'ball', 'is_super_over',
        'wide_runs', 'bye_runs', 'legbye_runs', 'noball_runs', 'penalty_runs',
        'batsman_runs', 'extra_runs', 'total_runs', 'id', 'season',
        'dl_applied', 'win_by_runs', 'win_by_wickets'
      ].includes(header)) {
        row[header] = value === '' ? 0 : parseFloat(value) || 0;
      } else {
        row[header] = value.replace(/"+/g, '').trim();
      }
    });

    // Add computed field for Tableau internal object counting
    row['Cricket_DEEF6E2BDA6C44AC874DAF1C301A5129'] = 1;

    data.push(row as unknown as CricketDataRow);
  }

  return data;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

// Aggregation functions for each worksheet
export const aggregateBatsmanRuns = (
  data: CricketDataRow[],
  winnerFilter: string | null,
  topN: number = 15
): AggregatedDataPoint[] => {
  let filtered = data;
  if (winnerFilter) {
    filtered = data.filter(d => d.winner === winnerFilter);
  }

  const aggregated = new Map<string, number>();

  filtered.forEach(row => {
    const batsman = row.batsman || 'Unknown';
    const runs = row.batsman_runs || 0;
    aggregated.set(batsman, (aggregated.get(batsman) || 0) + runs);
  });

  return Array.from(aggregated.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
};

export const aggregateTeamRuns = (data: CricketDataRow[]): AggregatedDataPoint[] => {
  const aggregated = new Map<string, number>();

  data.forEach(row => {
    const team = row.team1 || 'Unknown';
    const runs = row.total_runs || 0;
    aggregated.set(team, (aggregated.get(team) || 0) + runs);
  });

  return Array.from(aggregated.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
};

export const aggregateVenue = (
  data: CricketDataRow[],
  winnerFilter: string | null,
  topN: number = 10
): AggregatedDataPoint[] => {
  let filtered = data;
  if (winnerFilter) {
    filtered = data.filter(d => d.winner === winnerFilter);
  }

  const aggregated = new Map<string, number>();

  filtered.forEach(row => {
    const venue = row.venue || 'Unknown';
    aggregated.set(venue, (aggregated.get(venue) || 0) + 1);
  });

  return Array.from(aggregated.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
};

export const aggregateWinByRuns = (
  data: CricketDataRow[],
  winnerFilter: string | null,
  topN: number = 20
): AggregatedDataPoint[] => {
  let filtered = data;
  if (winnerFilter) {
    filtered = data.filter(d => d.winner === winnerFilter);
  }

  // Group by batsman
  const aggregated = new Map<string, number>();

  filtered.forEach(row => {
    const batsman = row.batsman || 'Unknown';
    const winRuns = row.win_by_runs || 0;
    if (winRuns > 0) {
      aggregated.set(batsman, (aggregated.get(batsman) || 0) + winRuns);
    }
  });

  return Array.from(aggregated.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
};

export const aggregateWinByWickets = (
  data: CricketDataRow[],
  winnerFilter: string | null,
  topN: number = 20
): AggregatedDataPoint[] => {
  let filtered = data;
  if (winnerFilter) {
    filtered = data.filter(d => d.winner === winnerFilter);
  }

  // Group by batsman
  const aggregated = new Map<string, number>();

  filtered.forEach(row => {
    const batsman = row.batsman || 'Unknown';
    const winWickets = row.win_by_wickets || 0;
    if (winWickets > 0) {
      aggregated.set(batsman, (aggregated.get(batsman) || 0) + winWickets);
    }
  });

  return Array.from(aggregated.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
};

export const aggregateWinnerCount = (data: CricketDataRow[]): AggregatedDataPoint[] => {
  // Count wins per winner
  const uniqueMatches = new Set<number>();
  const winnerCounts = new Map<string, Set<number>>();

  data.forEach(row => {
    const matchId = row.match_id;
    const winner = row.winner || 'Unknown';

    if (!uniqueMatches.has(matchId)) {
      uniqueMatches.add(matchId);
      if (!winnerCounts.has(winner)) {
        winnerCounts.set(winner, new Set());
      }
      winnerCounts.get(winner)!.add(matchId);
    }
  });

  return Array.from(winnerCounts.entries())
    .map(([category, matchSet]) => ({ category, value: matchSet.size }))
    .sort((a, b) => b.value - a.value);
};

export const aggregateWinnerWinByRuns = (data: CricketDataRow[]): AggregatedDataPoint[] => {
  const aggregated = new Map<string, number>();

  data.forEach(row => {
    const winner = row.winner || 'Unknown';
    const winRuns = row.win_by_runs || 0;
    if (winRuns > 0) {
      aggregated.set(winner, (aggregated.get(winner) || 0) + winRuns);
    }
  });

  return Array.from(aggregated.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
};
