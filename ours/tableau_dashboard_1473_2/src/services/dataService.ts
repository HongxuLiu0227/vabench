import * as d3 from 'd3-dsv';

export interface BikeTripData {
  [key: string]: string | number | null;
}

export interface StationData {
  name: string;
  count: number;
}

/**
 * Normalize CSV headers by removing quote wrapping
 * Handles: "field", ""field"", """field""", and any combination
 */
const normalizeHeader = (header: string): string => {
  if (!header) return '';

  // Remove leading and trailing quotes (handles single, double, and triple quotes)
  let normalized = header.trim();

  // Keep stripping quotes from both ends while they exist
  while (normalized.length >= 2 && normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  return normalized;
};

/**
 * Parse CSV with robust header normalization
 * Handles triple-quoted headers, double-quoted headers, BOM, and dirty CSV data
 */
const parseCSVWithNormalization = (csvText: string): d3.DSVRowString[] => {
  // Remove BOM (Byte Order Mark) if present at the start
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  // Split into lines (handle both Unix \n and Windows \r\n line endings)
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return [];
  }

  // Get and normalize header line
  const headerLine = lines[0];

  // Parse headers manually to handle triple quotes correctly
  // The CSV has format: """Field1""","""Field2""",...
  // We need to split by comma but respect quoted fields
  let rawHeaders: string[];
  try {
    // Use d3 to parse the header row
    const parsed = d3.csvParseRows(headerLine);
    if (parsed && parsed.length > 0 && parsed[0]) {
      rawHeaders = parsed[0];
    } else {
      // Fallback: simple split if d3 parsing fails
      rawHeaders = headerLine.split(',');
    }
  } catch {
    // Fallback: simple split if d3 parsing throws
    rawHeaders = headerLine.split(',');
  }

  // Normalize each header by removing quote wrapping
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  // Parse data rows using d3-dsv
  const dataLines = lines.slice(1);
  const parsedData: d3.DSVRowString[] = [];

  for (const line of dataLines) {
    if (!line.trim()) continue;

    // Use d3 to parse each data row
    const parsedRows = d3.csvParseRows(line);
    if (!parsedRows || parsedRows.length === 0) continue;

    const parsedRow = parsedRows[0];
    if (!parsedRow || parsedRow.length === 0) continue;

    const row: d3.DSVRowString = {};
    normalizedHeaders.forEach((header, index) => {
      if (index < parsedRow.length) {
        row[header] = parsedRow[index];
      }
    });

    parsedData.push(row);
  }

  return parsedData;
};

/**
 * Validate that required fields exist in the dataset
 */
const validateRequiredFields = (data: BikeTripData[]): void => {
  if (data.length === 0) {
    throw new Error('Dataset is empty after parsing');
  }

  const firstRow = data[0];
  const requiredFields = [
    'start station name',
    'end station name',
    'start station id',
    'end station id'
  ];

  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    console.error('Available fields:', Object.keys(firstRow).sort());
    throw new Error(
      `Missing required Tableau fields: ${missingFields.join(', ')}\n` +
      `Available fields: ${Object.keys(firstRow).sort().join(', ')}`
    );
  }

  console.log('✓ All required Tableau fields validated successfully');
  console.log('  Available fields:', Object.keys(firstRow).sort().join(', '));
  console.log('  Total records:', data.length);
};

/**
 * Load CSV data from public/data directory
 */
export const loadBikeTripData = async (): Promise<BikeTripData[]> => {
  try {
    const response = await fetch('/data/TEMP_18ux8nb0tmgmpj17oq32z1vbqe0m.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    // Use robust parser with header normalization
    const parsedData = parseCSVWithNormalization(csvText);

    // Convert all numeric values to numbers
    const processedData = parsedData.map((row: d3.DSVRowString) => {
      const processedRow: BikeTripData = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        // Headers are already normalized by our parser

        if (value === '' || value === null || value === undefined) {
          processedRow[key] = null;
        } else if (!isNaN(Number(value))) {
          processedRow[key] = Number(value);
        } else {
          processedRow[key] = value;
        }
      });
      return processedRow;
    });

    // Validate required Tableau fields
    validateRequiredFields(processedData);

    return processedData;
  } catch (error) {
    console.error('Error loading bike trip data:', error);
    throw error;
  }
};

/**
 * Process station data for top/bottom charts
 */
export const processStationData = (
  data: BikeTripData[],
  isStart: boolean,
  isTop: boolean
): StationData[] => {
  // Get the correct station name column based on data format
  const stationNameCol = isStart ? 'start station name' : 'end station name';

  // Filter out rows with missing station names
  const filteredData = data.filter(row => {
    const stationName = row[stationNameCol];
    return stationName !== null && stationName !== undefined && stationName !== '';
  });

  // Count trips per station
  const stationCounts = new Map<string, number>();

  filteredData.forEach(row => {
    const stationName = String(row[stationNameCol]);
    stationCounts.set(stationName, (stationCounts.get(stationName) || 0) + 1);
  });

  // Convert to array and sort
  const sortedStations = Array.from(stationCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => isTop ? b.count - a.count : a.count - b.count);

  // Return top or bottom 10
  return sortedStations.slice(0, 10);
};

/**
 * Get Tableau color palette
 */
export const getTableauColors = (): string[] => {
  return [
    '#499894', '#4e79a7', '#59a14f', '#76b7b2', '#79706e',
    '#86bcb6', '#8cd17d', '#9c755f', '#9d7660', '#a0cbe8'
  ];
};
