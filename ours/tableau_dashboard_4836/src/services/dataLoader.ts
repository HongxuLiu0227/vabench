import Papa from 'papaparse';
import type { DataRow } from '../types';

const DATA_URL = '/data/federated_0se4v9q15j8hfi17f25m50.csv';

/**
 * Calculate performance color based on percentage
 */
function calculatePerformanceColor(percentage: number): string {
  if (percentage >= 0.67) {
    return 'Above 67%';
  } else if (percentage >= 0.34) {
    return '34 - 66%';
  } else {
    return 'Below 34%';
  }
}

/**
 * Clean and parse CSV field names
 * The CSV has quoted field names with escaped quotes and triple quotes
 * Also handles BOM (Byte Order Mark) at the start of the file
 */
function cleanFieldName(field: string): string {
  if (!field) return '';

  return field
    .replace(/^\uFEFF/, '') // Remove BOM if present
    .replace(/^"""+|"""+$/g, '') // Remove leading/trailing triple quotes
    .replace(/^"+|"+$/g, '') // Remove leading/trailing double quotes (any number)
    .replace(/^'+|'+$/g, '') // Remove leading/trailing single quotes (any number)
    .replace(/\\'/g, "'") // Remove escaped quotes
    .replace(/"/g, '') // Remove any remaining double quotes
    .trim(); // Remove any remaining whitespace
}

/**
 * Clean field value
 */
function cleanFieldValue(value: string): string {
  return value ? value.trim() : '';
}

/**
 * Load and parse CSV data
 */
export async function loadData(): Promise<DataRow[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: cleanFieldName,
        transform: cleanFieldValue,
        complete: (results) => {
          try {
            const data = results.data as Record<string, string>[];

            // Map CSV data to DataRow type
            const mappedData: DataRow[] = data.map((row, index) => {
              // Handle various quote formats in the data
              const getFieldValue = (fieldName: string): string => {
                const possibleKeys = [
                  fieldName,
                  `"${fieldName}"`,
                  `'${fieldName}'`,
                  `"""${fieldName}"""`,
                ];

                for (const key of possibleKeys) {
                  if (row[key] !== undefined) {
                    return row[key];
                  }
                }

                // Check if any key matches (case-insensitive, ignoring quotes)
                const cleanFieldNameTarget = fieldName.replace(/['"`]/g, '').toLowerCase();
                const matchingKey = Object.keys(row).find(k =>
                  k.replace(/['"`]/g, '').toLowerCase() === cleanFieldNameTarget
                );

                return matchingKey ? row[matchingKey] : '';
              };

              // Extract raw values
              const uploadDate = getFieldValue('UploadDate');
              const uploadDateMPI = getFieldValue('UploadDate_MPI');
              const siteAbstractionDate = getFieldValue('Siteabstractiondate');
              const displayCounty = getFieldValue('DisplayCounty');
              const displayMechanism = getFieldValue('DisplayMechanism');
              const displayMFL = getFieldValue('DisplayMFL') || `${index}`;
              const uploadMonthYear = getFieldValue('Upload_monthYear') || '';

              // Calculate default performance metrics (will be recalculated based on time window)
              // For now, use a simple heuristic based on whether upload dates exist
              const hasCTUpload = uploadDate && uploadDate !== '';
              const hasMPIUpload = uploadDateMPI && uploadDateMPI && uploadDateMPI !== '';
              const hasAnyUpload = hasCTUpload || hasMPIUpload;

              // Default percentage (will be recalculated in aggregation)
              const defaultUploadRate = hasAnyUpload ? 1.0 : 0.0;
              const performanceColor = calculatePerformanceColor(defaultUploadRate);

              return {
                // Original CSV fields
                DisplayMFL: displayMFL,
                DisplayFacilityName: getFieldValue('DisplayFacilityName') || '',
                DisplaySubcounty: getFieldValue('DisplaySubcounty') || '',
                DisplayCounty: displayCounty,
                DisplayMechanism: displayMechanism,
                DisplayAgency: getFieldValue('DisplayAgency') || '',
                UploadStatus: getFieldValue('UploadStatus') || '',
                UploadDate: uploadDate,
                Upload_monthYear: uploadMonthYear,
                SiteCode: getFieldValue('SiteCode') || '',
                MPI_SiteCode: getFieldValue('MPI_SiteCode') || '',
                UploadDate_MPI: uploadDateMPI,
                Upload_monthYear_MPI: getFieldValue('Upload_monthYear_MPI') || '',
                Siteabstractiondate: siteAbstractionDate,

                // Calculated Tableau fields
                Calculation_714102023265128449: 1, // Count of facilities (1 per row)
                Calculation_714102023265861635: defaultUploadRate, // Upload rate (0-1)
                Calculation_557601975853465601: performanceColor, // Performance color category
                Calculation_989947529004945410: defaultUploadRate, // Percentage
                Calculation_1593429869216702466: uploadDate || '', // Date calculation
                Calculation_1593429869476466693: uploadDate || '', // Date calculation
                Calculation_1593429869478662153: uploadDate || '', // Date calculation
                Calculation_1593429869483032587: siteAbstractionDate || '', // Abstraction date
                Calculation_1593429869496254476: uploadDate || '', // Date calculation
                'County Color (copy)': performanceColor, // Performance color
                'County Color (copy 2)': performanceColor, // Performance color (alternative)
                'PArtner Color  (copy)': performanceColor, // Performance color for partner (note: double space)
                CountyPercentUploadsProportions: defaultUploadRate, // Upload proportion
                CountyPercentUploadsProportions_copy: defaultUploadRate, // Alternative
                CountyPercentUploadsProportions_copy2: defaultUploadRate, // Another alternative
                CountyPercentUploadsProportions_copy3: defaultUploadRate, // Yet another
                ' Parameter Period Label - Month 1': 'Month 1', // Default period label
                ' Parameter Period Label (copy)': 'Parameter Period', // Period label (copy)
                ' Parameter Period Label - Month 1 (copy)': 'Month 1', // Period label - Month 1 (copy)
                'DisplayMFL (copy)': displayMFL, // Copy of DisplayMFL
                'SiteabstractionDate (copy)': siteAbstractionDate || '', // Copy of Siteabstractiondate
                'UploadDate (copy)': uploadDate, // Copy of UploadDate
                UploadMonthYear: uploadMonthYear, // Upload Month / Year
                'Date Label (copy)': uploadMonthYear, // Date Label (copy)
              };
            });

            console.log(`Loaded ${mappedData.length} records`);
            resolve(mappedData);
          } catch (error: unknown) {
            console.error('Error parsing CSV data:', error);
            reject(error);
          }
        },
        error: (error: unknown) => {
          console.error('PapaParse error:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

/**
 * Get available months from the data
 */
export function getAvailableMonths(data: DataRow[]): string[] {
  const months = new Set<string>();

  data.forEach(row => {
    if (row.Upload_monthYear) {
      months.add(row.Upload_monthYear);
    }
  });

  return Array.from(months).sort((a, b) => {
    // Parse and sort by date
    const dateA = parseMonthYear(a);
    const dateB = parseMonthYear(b);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Parse month-year string to Date
 */
export function parseMonthYear(monthYear: string): Date {
  // Format: "January 2021" or "Jan 2021"
  const parts = monthYear.trim().split(' ');
  if (parts.length !== 2) {
    return new Date();
  }

  const month = parts[0];
  const year = parseInt(parts[1], 10);

  const monthMap: Record<string, number> = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  return new Date(year, monthMap[month] || 0, 1);
}

/**
 * Format date to month-year string
 */
export function formatDateToMonthYear(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === '') return null;

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;

  return parsed;
}
