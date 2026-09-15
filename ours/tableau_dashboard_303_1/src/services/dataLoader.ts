import Papa from 'papaparse';
import type { AccidentRecord } from '../types/data';

const DATA_URL = '/data/DfTRoadSafety_Accidents_2014.csv';

let cachedData: AccidentRecord[] | null = null;

export async function loadAccidentData(): Promise<AccidentRecord[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    let csvText = await response.text();

    // Normalize line endings: convert Windows CRLF (\r\n) to Unix LF (\n)
    // This prevents carriage return characters from corrupting header names and field values
    csvText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: false, // Disable dynamic typing to keep all fields as strings
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Sanitize header: trim whitespace and remove any remaining control characters
          const sanitizedHeader = header.trim().replace(/[\r\n\t]/g, '');

          // Normalize header names to match TypeScript interface
          const headerMap: Record<string, string> = {
            'Local_Authority_(District)': 'Local_Authority_District',
            'Local_Authority_(Highway)': 'Local_Authority_Highway',
            '1st_Road_Class': 'First_Road_Class',
            '1st_Road_Number': 'First_Road_Number',
            '2nd_Road_Class': 'Second_Road_Class',
            '2nd_Road_Number': 'Second_Road_Number',
            'Pedestrian_Crossing-Human_Control': 'Pedestrian_Crossing_Human_Control',
            'Pedestrian_Crossing-Physical_Facilities': 'Pedestrian_Crossing_Physical_Facilities',
            'Sex Of Casualty': 'Sex_of_Casualty',
          };
          return headerMap[sanitizedHeader] || sanitizedHeader;
        },
        complete: (results) => {
          const rawData = results.data as any[];

          // Validate that we parsed some data
          if (!rawData || rawData.length === 0) {
            reject(new Error('CSV parsing produced no data'));
            return;
          }

          // Process and validate each record
          const processedData: AccidentRecord[] = [];
          let validDateCount = 0;
          let invalidDateCount = 0;

          // Fields that should be converted to numbers
          const numericFields = [
            'Location_Easting_OSGR', 'Location_Northing_OSGR', 'Longitude', 'Latitude',
            'Police_Force', 'Accident_Severity', 'Number_of_Vehicles', 'Number_of_Casualties',
            'Day_of_Week', 'Local_Authority_District', 'First_Road_Class', 'First_Road_Number',
            'Road_Type', 'Speed_limit', 'Junction_Detail', 'Junction_Control',
            'Second_Road_Class', 'Second_Road_Number', 'Pedestrian_Crossing_Human_Control',
            'Pedestrian_Crossing_Physical_Facilities', 'Light_Conditions', 'Weather_Conditions',
            'Road_Surface_Conditions', 'Special_Conditions_at_Site', 'Carriageway_Hazards',
            'Urban_or_Rural_Area', 'Did_Police_Officer_Attend_Scene_of_Accident', 'Sex_of_Casualty'
          ];

          for (let i = 0; i < rawData.length; i++) {
            const record = rawData[i];

            // Convert numeric fields from strings to numbers
            for (const field of numericFields) {
              if (record[field] !== undefined && record[field] !== '') {
                const numValue = Number(record[field]);
                if (!isNaN(numValue)) {
                  record[field] = numValue;
                }
              }
            }

            // Parse Date field from DD-MM-YYYY format
            // With dynamicTyping disabled, Date should always be a string
            if (record.Date) {
              const dateStr = String(record.Date).trim();
              // Date format in CSV: DD-MM-YYYY (e.g., "09-01-2014")
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                const [day, month, year] = parts;
                // Validate that we have numeric components
                const dayNum = parseInt(day, 10);
                const monthNum = parseInt(month, 10);
                const yearNum = parseInt(year, 10);

                if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum) &&
                    dayNum >= 1 && dayNum <= 31 &&
                    monthNum >= 1 && monthNum <= 12 &&
                    yearNum >= 1900 && yearNum <= 2100) {
                  // Reconstruct as ISO format YYYY-MM-DD for consistency
                  // Pad with leading zeros if needed
                  const paddedMonth = monthNum.toString().padStart(2, '0');
                  const paddedDay = dayNum.toString().padStart(2, '0');
                  record.Date = `${yearNum}-${paddedMonth}-${paddedDay}`;
                  validDateCount++;
                } else {
                  invalidDateCount++;
                  // Set to a default date to avoid breaking the app
                  record.Date = '2014-01-01';
                }
              } else {
                invalidDateCount++;
                // Set to a default date to avoid breaking the app
                record.Date = '2014-01-01';
              }
            } else {
              invalidDateCount++;
              // Set to a default date to avoid breaking the app
              record.Date = '2014-01-01';
            }

            processedData.push(record as AccidentRecord);
          }

          // Validate that we successfully parsed most dates
          // Allow up to 5% invalid dates, but alert if ratio is too low
          const totalRecords = processedData.length;
          const parseRatio = validDateCount / totalRecords;
          if (parseRatio < 0.95) {
            console.warn(
              `Warning: Date field 'Date' has parse ratio ${parseRatio.toFixed(2)} ` +
              `(${validDateCount}/${totalRecords} valid dates). ` +
              `Expected format: DD-MM-YYYY (e.g., "09-01-2014"). ` +
              `${invalidDateCount} dates were set to default value.`
            );
          }

          // But still reject if ALL dates failed to parse
          if (validDateCount === 0) {
            reject(new Error(
              `CSV parsing error: Date field 'Date' has low parse ratio 0.00. ` +
              `Expected format: DD-MM-YYYY (e.g., "09-01-2014")`
            ));
            return;
          }

          // Validate that critical fields are present
          const firstRecord = processedData[0];
          const criticalFields = [
            'Accident_Index',
            'Date',
            'Time',
            'Day_of_Week',
            'Accident_Severity',
            'Number_of_Casualties',
            'Light_Conditions'
          ];

          const missingFields = criticalFields.filter(field => !(field in firstRecord));
          if (missingFields.length > 0) {
            reject(new Error(
              `CSV parsing error: Missing critical fields: ${missingFields.join(', ')}. ` +
              `This may indicate corrupted headers or incorrect field mapping.`
            ));
            return;
          }

          // Validate data types for critical numeric fields
          if (typeof firstRecord.Day_of_Week !== 'number' || isNaN(firstRecord.Day_of_Week)) {
            reject(new Error(`CSV parsing error: Day_of_Week should be a valid number, got ${firstRecord.Day_of_Week} (${typeof firstRecord.Day_of_Week})`));
            return;
          }
          if (typeof firstRecord.Accident_Severity !== 'number' || isNaN(firstRecord.Accident_Severity)) {
            reject(new Error(`CSV parsing error: Accident_Severity should be a valid number, got ${firstRecord.Accident_Severity} (${typeof firstRecord.Accident_Severity})`));
            return;
          }
          if (typeof firstRecord.Number_of_Casualties !== 'number' || isNaN(firstRecord.Number_of_Casualties)) {
            reject(new Error(`CSV parsing error: Number_of_Casualties should be a valid number, got ${firstRecord.Number_of_Casualties} (${typeof firstRecord.Number_of_Casualties})`));
            return;
          }

          cachedData = processedData;
          resolve(cachedData);
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  } catch (error) {
    throw new Error(`Data loading failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function clearDataCache(): void {
  cachedData = null;
}
