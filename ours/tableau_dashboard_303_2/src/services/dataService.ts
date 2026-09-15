/**
 * Data loading and processing service
 */
import type { AccidentRecord, ParsedAccidentRecord, WeatherCondition, RoadSurfaceCondition, LightCondition, LightConditionsGroup, AccidentSeverity } from '../types/data';

// Mapping functions
const weatherConditionMap: Record<number, WeatherCondition> = {
  1: 'Fine no high winds',
  2: 'Raining no high winds',
  3: 'Snowing no high winds',
  4: 'Fine + high winds',
  5: 'Raining + high winds',
  6: 'Snowing + high winds',
  7: 'Fog or mist',
  8: 'Other',
  9: 'Unknown',
  '-1': 'Unknown'
};

const roadSurfaceConditionMap: Record<number, RoadSurfaceCondition> = {
  1: 'Dry',
  2: 'Wet or damp',
  3: 'Snow',
  4: 'Frost or ice',
  5: 'Flood over 3cm deep',
  6: 'Oil or diesel',
  7: 'Mud',
  '-1': 'Unknown'
};

const lightConditionMap: Record<number, LightCondition> = {
  1: 'Daylight',
  4: 'Darkness - lights lit',
  5: 'Darkness - lights unlit',
  6: 'Darkness - no lighting',
  7: 'Darkness - lighting unknown'
};

const lightConditionsGroupMap: Record<number, LightConditionsGroup> = {
  1: 'Daylight',
  4: 'Darkness',
  5: 'Darkness',
  6: 'Darkness',
  7: 'Darkness'
};

const accidentSeverityMap: Record<number, AccidentSeverity> = {
  1: 'Fatal',
  2: 'Serious',
  3: 'Slight'
};

/**
 * Robust CSV parser that handles quoted fields and various edge cases
 */
function parseCSV(text: string): AccidentRecord[] {
  // Split lines and normalize line endings
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('CSV file is empty or contains only whitespace');
  }

  // Find the actual header row (skip preamble if exists)
  let headerRowIndex = 0;
  const expectedHeaders = [
    'Accident_Index', 'Location_Easting_OSGR', 'Location_Northing_OSGR',
    'Longitude', 'Latitude', 'Police_Force', 'Accident_Severity',
    'Number_of_Vehicles', 'Number_of_Casualties', 'Date', 'Day_of_Week',
    'Time', 'Local_Authority_(District)', 'Local_Authority_(Highway)',
    '1st_Road_Class', '1st_Road_Number', 'Road_Type', 'Speed_limit',
    'Junction_Detail', 'Junction_Control', '2nd_Road_Class', '2nd_Road_Number',
    'Pedestrian_Crossing-Human_Control', 'Pedestrian_Crossing-Physical_Facilities',
    'Light_Conditions', 'Weather_Conditions', 'Road_Surface_Conditions',
    'Special_Conditions_at_Site', 'Carriageway_Hazards', 'Urban_or_Rural_Area',
    'Did_Police_Officer_Attend_Scene_of_Accident', 'LSOA_of_Accident_Location',
    'Sex Of Casualty'
  ];

  // Detect preamble by looking for the expected header
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const potentialHeader = parseCSVLine(lines[i]);
    const normalizedHeaders = potentialHeader.map(h => h.trim().replace(/^"|"$/g, ''));
    const matchCount = normalizedHeaders.filter(h =>
      expectedHeaders.some(eh => eh.toLowerCase() === h.toLowerCase())
    ).length;

    // If we found a row that matches at least 20 of the expected headers, it's likely the header
    if (matchCount >= 20) {
      headerRowIndex = i;
      break;
    }
  }

  // Parse header row
  const headerLine = lines[headerRowIndex];
  const rawHeaders = parseCSVLine(headerLine);
  const headers = rawHeaders.map(h => h.trim().replace(/^"|"$/g, ''));

  // Validate we have the expected columns
  if (headers.length < 30) {
    throw new Error(`CSV header has only ${headers.length} columns, expected at least 30. Found: ${headers.join(', ')}`);
  }

  const data: AccidentRecord[] = [];
  let parseErrors = 0;

  // Parse data rows
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    try {
      const values = parseCSVLine(line);

      // Skip malformed rows
      if (values.length !== headers.length) {
        if (parseErrors < 10) {
          console.warn(`Row ${i + 1}: Expected ${headers.length} fields, got ${values.length}`);
        }
        parseErrors++;
        continue;
      }

      const record: Record<string, string | number> = {};

      headers.forEach((header, index) => {
        let value: string | number = values[index]?.trim().replace(/^"|"$/g, '') || '';

        // Try to convert to number for numeric fields
        const numericFields = [
          'Location_Easting_OSGR',
          'Location_Northing_OSGR',
          'Longitude',
          'Latitude',
          'Police_Force',
          'Accident_Severity',
          'Number_of_Vehicles',
          'Number_of_Casualties',
          'Day_of_Week',
          'Local_Authority_(District)',
          '1st_Road_Class',
          '1st_Road_Number',
          'Road_Type',
          'Speed_limit',
          'Junction_Detail',
          'Junction_Control',
          '2nd_Road_Class',
          '2nd_Road_Number',
          'Pedestrian_Crossing-Human_Control',
          'Pedestrian_Crossing-Physical_Facilities',
          'Light_Conditions',
          'Weather_Conditions',
          'Road_Surface_Conditions',
          'Special_Conditions_at_Site',
          'Carriageway_Hazards',
          'Urban_or_Rural_Area',
          'Did_Police_Officer_Attend_Scene_of_Accident'
        ];

        if (numericFields.includes(header)) {
          if (value === '' || value === '-1') {
            value = -1;
          } else {
            const num = Number(value);
            value = isNaN(num) ? -1 : num;
          }
        }

        record[header] = value;
      });

      data.push(record as unknown as AccidentRecord);
    } catch (error) {
      if (parseErrors < 10) {
        console.error(`Error parsing row ${i + 1}:`, error);
      }
      parseErrors++;
      continue;
    }
  }

  if (parseErrors > 0) {
    console.warn(`CSV parsing completed with ${parseErrors} error(s). Loaded ${data.length} valid records.`);
  }

  if (data.length === 0) {
    throw new Error('No valid data records found in CSV');
  }

  return data;
}

/**
 * Parse a single CSV line, handling quoted fields with commas
 * Example: 'value1,"quoted, value",value3' -> ['value1', 'quoted, value', 'value3']
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

/**
 * Map raw accident record to parsed record with readable values
 */
function mapAccidentRecord(record: AccidentRecord): ParsedAccidentRecord {
  const weatherCode = Number(record.Weather_Conditions);
  const surfaceCode = Number(record.Road_Surface_Conditions);
  const lightCode = Number(record.Light_Conditions);
  const severityCode = Number(record.Accident_Severity);

  return {
    ...record,
    Weather_Conditions: weatherConditionMap[weatherCode as keyof typeof weatherConditionMap] || 'Unknown',
    Road_Surface_Conditions: roadSurfaceConditionMap[surfaceCode as keyof typeof roadSurfaceConditionMap] || 'Unknown',
    Light_Conditions: lightConditionMap[lightCode as keyof typeof lightConditionMap] || 'Darkness - lighting unknown',
    Accident_Severity: accidentSeverityMap[severityCode as keyof typeof accidentSeverityMap] || 'Slight',
    Light_Conditions_Group: lightConditionsGroupMap[lightCode as keyof typeof lightConditionsGroupMap] || 'Darkness'
  };
}

/**
 * Load and validate accident data from CSV
 */
export async function loadAccidentData(): Promise<ParsedAccidentRecord[]> {
  try {
    console.log('Loading accident data from /data/DfTRoadSafety_Accidents_2014.csv');
    const response = await fetch('/data/DfTRoadSafety_Accidents_2014.csv');

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log(`CSV loaded: ${csvText.length} bytes`);

    const rawData = parseCSV(csvText);
    console.log(`Parsed ${rawData.length} raw records from CSV`);

    // Validate critical fields exist
    const sampleRecord = rawData[0];
    const criticalFields = [
      'Accident_Index',
      'Weather_Conditions',
      'Road_Surface_Conditions',
      'Light_Conditions',
      'Accident_Severity',
      'Speed_limit'
    ];

    const missingFields = criticalFields.filter(field => !(field in sampleRecord));
    if (missingFields.length > 0) {
      throw new Error(`Missing critical fields in CSV: ${missingFields.join(', ')}`);
    }

    const parsedData = rawData.map(mapAccidentRecord);

    // Validate mapping worked
    const weatherCounts = new Set(parsedData.map(d => d.Weather_Conditions));
    const surfaceCounts = new Set(parsedData.map(d => d.Road_Surface_Conditions));
    const lightCounts = new Set(parsedData.map(d => d.Light_Conditions));

    console.log('Data validation successful:');
    console.log(`  - Total records: ${parsedData.length}`);
    console.log(`  - Weather conditions: ${weatherCounts.size} unique values`);
    console.log(`  - Road surface conditions: ${surfaceCounts.size} unique values`);
    console.log(`  - Light conditions: ${lightCounts.size} unique values`);

    // Check for data quality issues
    const unknownWeather = parsedData.filter(d => d.Weather_Conditions === 'Unknown').length;
    const unknownSurface = parsedData.filter(d => d.Road_Surface_Conditions === 'Unknown').length;

    if (unknownWeather > parsedData.length * 0.5) {
      console.warn(`Warning: ${unknownWeather} records (${((unknownWeather / parsedData.length) * 100).toFixed(1)}%) have Unknown weather conditions`);
    }

    if (unknownSurface > parsedData.length * 0.5) {
      console.warn(`Warning: ${unknownSurface} records (${((unknownSurface / parsedData.length) * 100).toFixed(1)}%) have Unknown road surface conditions`);
    }

    return parsedData;
  } catch (error) {
    console.error('Error loading accident data:', error);
    throw error;
  }
}

/**
 * Filter data by weather condition
 */
export function filterByWeather(data: ParsedAccidentRecord[], weather: WeatherCondition | null): ParsedAccidentRecord[] {
  if (!weather) return data;
  return data.filter(record => record.Weather_Conditions === weather);
}

/**
 * Aggregate data for Q2_Weather chart (accidents by weather condition)
 */
export function aggregateByWeather(data: ParsedAccidentRecord[]) {
  const counts = new Map<WeatherCondition, number>();

  data.forEach(record => {
    const weather = record.Weather_Conditions;
    counts.set(weather, (counts.get(weather) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([weather, count]) => ({ weather, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Aggregate data for Sheet 28 chart (speed limits by weather and light conditions)
 */
export function aggregateBySpeedWeatherLight(data: ParsedAccidentRecord[]) {
  const counts = new Map<string, number>();

  data.forEach(record => {
    const key = `${record.Speed_limit}|${record.Weather_Conditions}|${record.Light_Conditions_Group}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const result: Array<{ speed_limit: number; weather: WeatherCondition; light_condition: LightConditionsGroup; count: number }> = [];

  counts.forEach((count, key) => {
    const [speed_limit, weather, light_condition] = key.split('|');
    result.push({
      speed_limit: Number(speed_limit),
      weather: weather as WeatherCondition,
      light_condition: light_condition as LightConditionsGroup,
      count
    });
  });

  return result.sort((a, b) => b.count - a.count);
}

/**
 * Aggregate data for sheet13 chart (weather and road surface conditions)
 */
export function aggregateByWeatherSurface(data: ParsedAccidentRecord[]) {
  const counts = new Map<string, number>();

  data.forEach(record => {
    const key = `${record.Weather_Conditions}|${record.Road_Surface_Conditions}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const result: Array<{ weather: WeatherCondition; road_surface: RoadSurfaceCondition; count: number }> = [];

  counts.forEach((count, key) => {
    const [weather, road_surface] = key.split('|');
    result.push({
      weather: weather as WeatherCondition,
      road_surface: road_surface as RoadSurfaceCondition,
      count
    });
  });

  return result.sort((a, b) => b.count - a.count);
}

/**
 * Get all unique weather conditions
 */
export function getUniqueWeatherConditions(data: ParsedAccidentRecord[]): WeatherCondition[] {
  const unique = new Set(data.map(d => d.Weather_Conditions));
  return Array.from(unique);
}

/**
 * Get all unique speed limits
 */
export function getUniqueSpeedLimits(data: ParsedAccidentRecord[]): number[] {
  const unique = new Set(data.map(d => d.Speed_limit));
  return Array.from(unique).sort((a, b) => a - b);
}

/**
 * Get all unique road surface conditions
 */
export function getUniqueRoadSurfaceConditions(data: ParsedAccidentRecord[]): RoadSurfaceCondition[] {
  const unique = new Set(data.map(d => d.Road_Surface_Conditions));
  return Array.from(unique);
}
