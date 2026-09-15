import Papa from 'papaparse';
import type { PlayerData, PositionStats } from '../types';

const DATA_URL = '/data/data (2).csv';

// Numeric fields that should be converted to numbers
const NUMERIC_FIELDS = [
  'Age',
  'Overall',
  'Potential',
  'ID',
  'Jersey Number',
  'Acceleration',
  'Aggression',
  'Agility',
  'Balance',
  'Ball Control',
  'Composure',
  'Crossing',
  'Curve',
  'Dribbling',
  'FK Accuracy',
  'Finishing',
  'GK Diving',
  'GK Handling',
  'GK Kicking',
  'GK Positioning',
  'GK Reflexes',
  'Heading Accuracy',
  'Interceptions',
  'International Reputation',
  'Jumping',
  'Long Passing',
  'Long Shots',
  'Marking',
  'Penalties',
  'Positioning',
  'Reactions',
  'Release Clause',
  'Short Passing',
  'Shot Power',
  'Sliding Tackle',
  'Sprint Speed',
  'Stamina',
  'Standing Tackle',
  'Strength',
  'Vision',
  'Volleys',
  'Weak Foot',
  'Work Rate',
  'Skill Moves',
  'Special',
  'F1',
  'Number of Records',
  'Contract Valid Until',
  'Joined',
];

/**
 * Normalize CSV header by removing BOM, trimming whitespace, removing extra quotes, and standardizing
 */
const normalizeHeader = (header: string): string => {
  // Remove UTF-8 BOM if present at start
  let cleaned = header.replace(/^\ufeff/, '');
  // Trim whitespace
  cleaned = cleaned.trim();
  // Remove extra quotes (wrapped in repeated quotes like ""Order Date"")
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  // Remove single quotes if present
  cleaned = cleaned.replace(/^'|'$/g, '');
  return cleaned;
};

/**
 * Clean and normalize CSV text before parsing
 * Also handles preamble rows by detecting and skipping them
 */
const cleanCsvText = (csvText: string): string => {
  // Remove UTF-8 BOM if present at the very start of the file
  let cleaned = csvText.replace(/^\ufeff/, '');
  // Normalize line endings (CRLF -> LF)
  cleaned = cleaned.replace(/\r\n/g, '\n');
  // Normalize stray CR characters
  cleaned = cleaned.replace(/\r/g, '\n');

  // Detect and skip preamble rows (rows that don't look like data headers)
  const lines = cleaned.split('\n').filter(line => line.trim() !== '');

  // Look for the first line that contains expected field names
  const expectedFieldPatterns = ['Name', 'Age', 'Position', 'ID', 'Nationality', 'Club'];
  let headerLineIndex = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    const hasExpectedFields = expectedFieldPatterns.some(pattern =>
      line.toLowerCase().includes(pattern.toLowerCase())
    );
    if (hasExpectedFields) {
      headerLineIndex = i;
      break;
    }
  }

  // If we found preamble rows, skip them
  if (headerLineIndex > 0) {
    console.log(`Detected ${headerLineIndex} preamble row(s), skipping to header at line ${headerLineIndex + 1}`);
    cleaned = lines.slice(headerLineIndex).join('\n');
  } else {
    // Ensure file ends with single newline
    cleaned = cleaned.replace(/\n+$/, '\n');
  }

  return cleaned;
};

/**
 * Detect if a value should be treated as numeric
 */
const isNumericValue = (val: string): boolean => {
  if (!val || val.trim() === '') return false;

  // Skip currency values
  if (val.includes('€') || val.includes('£') || val.includes('$')) return false;
  if (val.includes('M') || val.includes('K') || val.includes('B')) return false;

  // Skip percentage values
  if (val.includes('%')) return false;

  // Skip date-like values
  if (val.includes('/') && val.split('/').length === 3) return false;

  // Skip height/weight formats like "5'7" or "170lbs"
  if (val.includes("'") || val.includes('"') || val.toLowerCase().includes('lbs')) return false;

  // Check if it's a valid number (including negative and decimal)
  const num = parseFloat(val);
  return !isNaN(num);
};

/**
 * Convert a string value to appropriate type
 */
const convertFieldValue = (val: string, fieldName: string): string | number => {
  if (!val || val.trim() === '') return val;

  // For known numeric fields, try to convert
  if (NUMERIC_FIELDS.includes(fieldName)) {
    if (isNumericValue(val)) {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    }
  }

  // For other fields, try to convert if it looks like a plain number
  if (isNumericValue(val)) {
    const num = parseFloat(val);
    return isNaN(num) ? val : num;
  }

  return val;
};

export const loadData = async (): Promise<PlayerData[]> => {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const cleanedCsvText = cleanCsvText(csvText);

    return new Promise((resolve, reject) => {
      Papa.parse<PlayerData>(cleanedCsvText, {
        header: true,
        dynamicTyping: false, // We'll handle type conversion ourselves
        skipEmptyLines: true,
        transformHeader: normalizeHeader,
        complete: (results) => {
          // Check for parsing errors
          if (results.errors && results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }

          // Validate that we have the required fields
          if (results.data.length === 0) {
            reject(new Error('CSV file appears to be empty or could not be parsed'));
            return;
          }

          // Check first row for required fields
          const firstRow = results.data[0];
          const normalizedHeaders = Object.keys(firstRow).map(normalizeHeader);

          const requiredFields = ['Name', 'Position', 'Age'];
          const missingFields = requiredFields.filter(field => !normalizedHeaders.includes(field));

          if (missingFields.length > 0) {
            console.warn(`Warning: Missing expected fields: ${missingFields.join(', ')}`);
            console.warn('Available fields:', normalizedHeaders.join(', '));
          }

          const parsedData = results.data
            .map((row: Record<string, unknown>) => {
              if (!row || typeof row !== 'object') return null;

              const obj: Record<string, string | number> = {};

              Object.keys(row).forEach((key) => {
                const cleanKey = normalizeHeader(key);
                const rawValue = row[key];

                // Skip undefined/null values
                if (rawValue === undefined || rawValue === null) {
                  return;
                }

                // Convert to string first, then to appropriate type
                const strValue = String(rawValue).trim();
                obj[cleanKey] = convertFieldValue(strValue, cleanKey);
              });

              return obj as PlayerData;
            })
            .filter((player): player is PlayerData => {
              // Filter out null entries and rows without essential fields
              if (!player) return false;

              const hasName = Boolean(player.Name && typeof player.Name === 'string' && player.Name.trim() !== '');
              const hasPosition = Boolean(player.Position && typeof player.Position === 'string' && player.Position.trim() !== '');
              const hasAge = player.Age !== undefined && player.Age !== null && !isNaN(Number(player.Age));

              return Boolean(hasName && hasPosition && hasAge);
            });

          if (parsedData.length === 0) {
            reject(new Error('No valid data rows found after parsing. CSV may be malformed or missing required fields (Name, Position, Age).'));
            return;
          }

          console.log(`Successfully loaded ${parsedData.length} player records`);
          console.log('Sample record:', parsedData[0]);
          resolve(parsedData);
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  } catch (error) {
    throw new Error(`Data loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const aggregateByPosition = (data: PlayerData[]): PositionStats[] => {
  const positionMap = new Map<string, PlayerData[]>();

  // Group by position
  data.forEach((player) => {
    const position = player.Position || 'Unknown';
    if (!positionMap.has(position)) {
      positionMap.set(position, []);
    }
    positionMap.get(position)!.push(player);
  });

  // Calculate stats for each position
  const stats: PositionStats[] = [];

  positionMap.forEach((players, position) => {
    // Extract and validate ages, filtering out NaN, null, undefined
    const ages = players
      .map((p) => Number(p.Age))
      .filter((a) => !isNaN(a) && a !== null && a !== undefined);

    // Skip positions with no valid ages
    if (ages.length === 0) {
      console.warn(`Position "${position}" has no valid age values, skipping`);
      return;
    }

    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);
    const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;

    // Find players with min/max ages, handling potential undefined
    const minPlayer = players.find((p) => Number(p.Age) === minAge);
    const maxPlayer = players.find((p) => Number(p.Age) === maxAge);

    stats.push({
      position,
      minAge,
      maxAge,
      avgAge: Math.round(avgAge * 100) / 100, // Round to 2 decimal places
      count: players.length,
      minPlayer,
      maxPlayer,
    });
  });

  // Sort by position name for consistent ordering
  return stats.sort((a, b) => a.position.localeCompare(b.position));
};

export const filterByPosition = (data: PlayerData[], position: string | null): PlayerData[] => {
  if (!position) return data;
  return data.filter((player) => player.Position === position);
};
