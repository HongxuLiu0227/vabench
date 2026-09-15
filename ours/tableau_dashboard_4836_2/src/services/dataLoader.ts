import Papa from 'papaparse';
import type { CleanDataRow, BaseCleanDataRow } from '../types';

/**
 * Normalize header names by removing BOM and extra quotes
 * Handles various quote formats:
 * - """DisplayMFL""" -> DisplayMFL
 * - ""DisplayMFL"" -> DisplayMFL
 * - "DisplayMFL" -> DisplayMFL
 * - Also handles leading/trailing whitespace
 */
function normalizeHeaderName(header: string): string {
  let cleaned = header;

  // Remove BOM if present at the start
  cleaned = cleaned.replace(/^\uFEFF/, '');

  // Trim whitespace first
  cleaned = cleaned.trim();

  // Repeatedly strip quotes from both ends until no more quote pairs exist
  // This handles: """FieldName""" -> "FieldName" -> FieldName
  // And: ""FieldName"" -> "FieldName" -> FieldName
  // And: "FieldName" -> FieldName
  let prevCleaned: string;
  do {
    prevCleaned = cleaned;
    // Remove matching double quotes from both ends
    cleaned = cleaned.replace(/^"(.*)"$/, '$1');
    // Also remove any remaining triple quotes pattern
    cleaned = cleaned.replace(/^"""(.+)"""$/, '$1');
  } while (cleaned !== prevCleaned && (cleaned.startsWith('"') || cleaned.startsWith('"""')));

  // Final trim to handle any leftover whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Validate that required Tableau fields are present in the data
 */
function validateRequiredFields(row: Record<string, unknown>): boolean {
  const requiredFields = [
    'DisplayCounty',
    'DisplayAgency',
    'DisplayMFL'
  ];

  for (const field of requiredFields) {
    if (row[field] === undefined || row[field] === null || row[field] === '') {
      console.warn(`Missing required field: ${field}`, row);
      return false;
    }
  }

  return true;
}

/**
 * County-level aggregated data for computed Tableau fields
 */
interface CountyAggregates {
  totalFacilities: number; // Calculation_714102023265128449
  mpiUploadedFacilities: number; // Number of Sites Uploaded CT (copy)
  percentPKVUploads: number; // County Percent Uploads Proportions (copy 3)
  pkvColorCategory: string; // County Color (copy 2) - based on PKV uploads
  ctUploadedFacilities: number; // Number of facilities with C&T uploads
  percentCTUploads: number; // Calculation_714102023265861635 - C&T percentage
  ctColorCategory: string; // Calculation_557601975853465601 - C&T color category
}

/**
 * Load and parse CSV data from the public/data directory
 */
export async function loadCsvData(url: string = '/data/federated_0se4v9q15j8hfi17f25m50.csv'): Promise<CleanDataRow[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    let csvText = await response.text();

    // Remove BOM if present at the start of the file
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: normalizeHeaderName,
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }

            if (!results.data || results.data.length === 0) {
              reject(new Error('No data found in CSV file'));
              return;
            }

            const cleanedData = (results.data as Record<string, unknown>[])
              .filter((row) => validateRequiredFields(row))
              .map((row, index: number) => {
                try {
                  return cleanDataRow(row);
                } catch (err) {
                  console.warn(`Failed to clean row ${index}:`, err);
                  return null;
                }
              })
              .filter((row): row is CleanDataRow => row !== null);

            if (cleanedData.length === 0) {
              reject(new Error('No valid data rows after cleaning'));
              return;
            }

            // Compute county-level aggregates and add to each row
            const dataWithComputedFields = addComputedFields(cleanedData);

            console.log(`Successfully loaded ${dataWithComputedFields.length} rows from CSV`);
            resolve(dataWithComputedFields);
          } catch (err) {
            reject(err);
          }
        },
        error: (err: Error) => {
          reject(new Error(`CSV parsing error: ${err.message}`));
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}

/**
 * Add computed/calculated Tableau fields to each data row
 * These are county-level aggregations computed from the raw data
 */
function addComputedFields(data: BaseCleanDataRow[]): CleanDataRow[] {
  // Compute county-level aggregates
  const countyMap = new Map<string, CountyAggregates>();

  for (const row of data) {
    const county = row.DisplayCounty;
    if (!county) continue;

    if (!countyMap.has(county)) {
      countyMap.set(county, {
        totalFacilities: 0,
        mpiUploadedFacilities: 0,
        percentPKVUploads: 0,
        pkvColorCategory: 'Below 34%',
        ctUploadedFacilities: 0,
        percentCTUploads: 0,
        ctColorCategory: 'Below 34%'
      });
    }

    const agg = countyMap.get(county)!;
    agg.totalFacilities += 1;

    // Count facilities that have uploaded MPI data (non-null MPI_SiteCode)
    if (row.MPI_SiteCode !== null && row.MPI_SiteCode !== undefined) {
      agg.mpiUploadedFacilities += 1;
    }

    // Count facilities that have uploaded C&T data (non-null UploadDate)
    if (row.UploadDate !== null && row.UploadDate !== undefined && row.UploadDate !== '') {
      agg.ctUploadedFacilities += 1;
    }
  }

  // Calculate percentages and color categories for each county
  for (const [, agg] of countyMap) {
    if (agg.totalFacilities > 0) {
      // PKV calculations
      agg.percentPKVUploads = agg.mpiUploadedFacilities / agg.totalFacilities;

      // Determine PKV color category based on percentage
      if (agg.percentPKVUploads >= 0.67) {
        agg.pkvColorCategory = 'Above 67%';
      } else if (agg.percentPKVUploads >= 0.34) {
        agg.pkvColorCategory = '34 - 66%';
      } else {
        agg.pkvColorCategory = 'Below 34%';
      }

      // C&T calculations
      agg.percentCTUploads = agg.ctUploadedFacilities / agg.totalFacilities;

      // Determine C&T color category based on percentage
      if (agg.percentCTUploads >= 0.67) {
        agg.ctColorCategory = 'Above 67%';
      } else if (agg.percentCTUploads >= 0.34) {
        agg.ctColorCategory = '34 - 66%';
      } else {
        agg.ctColorCategory = 'Below 34%';
      }
    }
  }

  // Add computed fields to each row
  return data.map(row => {
    const county = row.DisplayCounty;
    const agg = countyMap.get(county);

    return {
      ...row,
      // Calculation_714102023265128449: County Denominator Expected Reports
      'Calculation_714102023265128449': agg?.totalFacilities ?? 0,
      // Number of Sites Uploaded CT (copy): Count of facilities with MPI data
      'Number_of_Sites_Uploaded_CT_copy': agg?.mpiUploadedFacilities ?? 0,
      // County Percent Uploads Proportions (copy 3): PKV percentage (decimal)
      'County Percent Uploads Proportions (copy 3)': agg?.percentPKVUploads ?? 0,
      // County Color (copy 2): PKV color category
      'County Color (copy 2)': agg?.pkvColorCategory ?? 'Below 34%',
      // Calculation_714102023265861635: C&T percentage (decimal)
      'Calculation_714102023265861635': agg?.percentCTUploads ?? 0,
      // Calculation_557601975853465601: C&T color category
      'Calculation_557601975853465601': agg?.ctColorCategory ?? 'Below 34%'
    };
  });
}

/**
 * Clean a raw data row, handling CSV quote escaping and type conversions
 */
function cleanDataRow(raw: Record<string, unknown>): BaseCleanDataRow {
  // Get field value safely, handling missing fields
  const getFieldValue = (fieldName: string): string => {
    const value = raw[fieldName];
    if (value === undefined || value === null) return '';
    // Convert to string if needed and trim
    const strValue = String(value).trim();
    // Remove quotes if the entire value is wrapped in quotes
    return strValue.replace(/^"""(.+)"""$/, '$1').replace(/^"(.+)"$/, '$1');
  };

  // Parse numeric fields
  const parseNumber = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  const mflValue = getFieldValue('DisplayMFL');
  const siteCodeValue = getFieldValue('SiteCode');
  const mpiSiteCodeValue = getFieldValue('MPI_SiteCode');

  return {
    DisplayMFL: parseNumber(mflValue) ?? 0,
    DisplayFacilityName: getFieldValue('DisplayFacilityName'),
    DisplaySubcounty: getFieldValue('DisplaySubcounty'),
    DisplayCounty: getFieldValue('DisplayCounty'),
    DisplayMechanism: getFieldValue('DisplayMechanism'),
    DisplayAgency: getFieldValue('DisplayAgency'),
    UploadStatus: getFieldValue('UploadStatus'),
    UploadDate: getFieldValue('UploadDate') || null,
    Upload_monthYear: getFieldValue('Upload_monthYear') || null,
    SiteCode: parseNumber(siteCodeValue),
    MPI_SiteCode: parseNumber(mpiSiteCodeValue),
    UploadDate_MPI: getFieldValue('UploadDate_MPI') || null,
    Upload_monthYear_MPI: getFieldValue('Upload_monthYear_MPI') || null,
    Siteabstractiondate: getFieldValue('Siteabstractiondate') || null
  };
}

/**
 * Parse a date string to a Date object
 */
export function parseDate(dateStr: string | null): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate the difference in months between two dates
 */
export function monthsDifference(date1: Date, date2: Date): number {
  const yearDiff = date2.getFullYear() - date1.getFullYear();
  const monthDiff = date2.getMonth() - date1.getMonth();
  return yearDiff * 12 + monthDiff;
}
