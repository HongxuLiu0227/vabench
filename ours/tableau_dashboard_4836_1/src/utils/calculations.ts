/**
 * Tableau calculated field implementations
 * Replicates business logic from the Tableau workbook
 */

import type { DataRow, UploadStatusCategory, RecencyCategory, FacilityData } from '../types';

/**
 * Calculate upload status category for a facility
 * This replicates the Tableau calculation for "Calculation_1593429869478662153"
 *
 * Logic:
 * - CT & PKVs Uploaded: Both UploadDate and UploadDate_MPI have values in the current month
 * - Only CT Uploaded; No PKVs: Only UploadDate has a value in the current month
 * - Not Uploaded this month: Neither UploadDate nor UploadDate_MPI are in the current month
 * - Never Uploaded to DWH: No upload dates at all
 */
export function calculateUploadStatus(
  row: DataRow,
  targetMonthYear: string
): UploadStatusCategory {
  const hasCTUpload = row.Upload_monthYear === targetMonthYear && row.UploadDate;
  const hasMPIUpload = row.Upload_monthYear_MPI === targetMonthYear && row.UploadDate_MPI;

  const hasAnyUpload = row.UploadDate || row.UploadDate_MPI;

  if (hasCTUpload && hasMPIUpload) {
    return 'CT & PKVs Uploaded';
  } else if (hasCTUpload && !hasMPIUpload) {
    return 'Only CT Uploaded; No PKVs';
  } else if (!hasAnyUpload) {
    return 'Never Uploaded to DWH';
  } else {
    return 'Not Uploaded this month';
  }
}

/**
 * Calculate recency category
 * Based on the difference between today (or selected date) and the latest upload date
 *
 * Logic:
 * - Good: diff is 0 or 1 month
 * - Average: diff is 2 months
 * - Bad: diff is 3+ months
 */
export function calculateRecency(row: DataRow, referenceDate: Date): RecencyCategory {
  // Get the latest upload date (CT or MPI)
  const uploadDate = row.UploadDate ? new Date(row.UploadDate) : null;
  const mpiUploadDate = row.UploadDate_MPI ? new Date(row.UploadDate_MPI) : null;

  let latestUpload: Date | null = null;
  if (uploadDate && mpiUploadDate) {
    latestUpload = uploadDate > mpiUploadDate ? uploadDate : mpiUploadDate;
  } else if (uploadDate) {
    latestUpload = uploadDate;
  } else if (mpiUploadDate) {
    latestUpload = mpiUploadDate;
  }

  if (!latestUpload) {
    return 'Bad';
  }

  // Calculate month difference
  const diffInMonths =
    (referenceDate.getFullYear() - latestUpload.getFullYear()) * 12 +
    (referenceDate.getMonth() - latestUpload.getMonth());

  if (diffInMonths <= 1) {
    return 'Good';
  } else if (diffInMonths === 2) {
    return 'Average';
  } else {
    return 'Bad';
  }
}

/**
 * Parse month-year string like "January 2021" and return a Date object
 * Defaults to the first day of the month
 */
export function parseMonthYear(monthYear: string): Date {
  const [month, year] = monthYear.split(' ');
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();
  return new Date(Number(year), monthIndex, 1);
}

/**
 * Format date as month-year string like "January 2021"
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/**
 * Apply calculated fields to raw data rows
 */
export function enrichDataWithCalculations(
  rows: DataRow[],
  selectedDate: Date
): FacilityData[] {
  const targetMonthYear = formatMonthYear(selectedDate);

  return rows.map((row) => ({
    ...row,
    calculatedStatus: calculateUploadStatus(row, targetMonthYear),
    recency: calculateRecency(row, selectedDate),
    uploadMonthYear: row.Upload_monthYear,
    uploadMonthYear_MPI: row.Upload_monthYear_MPI,
  }));
}

/**
 * Aggregate data for Summary Stats chart
 * Groups by upload status category and counts
 */
export function aggregateSummaryStats(facilities: FacilityData[]): Map<UploadStatusCategory, number> {
  const counts = new Map<UploadStatusCategory, number>();

  // Initialize all categories with 0
  const categories: UploadStatusCategory[] = [
    'CT & PKVs Uploaded',
    'Only CT Uploaded; No PKVs',
    'Not Uploaded this month',
    'Never Uploaded to DWH',
  ];
  categories.forEach((cat) => counts.set(cat, 0));

  // Count facilities in each category
  facilities.forEach((facility) => {
    const current = counts.get(facility.calculatedStatus) || 0;
    counts.set(facility.calculatedStatus, current + 1);
  });

  return counts;
}

/**
 * Get unique list of counties
 */
export function getUniqueCounties(facilities: FacilityData[]): string[] {
  const counties = new Set(facilities.map((f) => f.DisplayCounty));
  return Array.from(counties).sort();
}

/**
 * Get unique list of partners (mechanisms)
 */
export function getUniquePartners(facilities: FacilityData[]): string[] {
  const partners = new Set(facilities.map((f) => f.DisplayMechanism));
  return Array.from(partners).sort();
}

/**
 * Get facilities by county
 */
export function getFacilitiesByCounty(
  facilities: FacilityData[],
  county: string
): FacilityData[] {
  return facilities.filter((f) => f.DisplayCounty === county);
}

/**
 * Get facilities by partner
 */
export function getFacilitiesByPartner(
  facilities: FacilityData[],
  partner: string
): FacilityData[] {
  return facilities.filter((f) => f.DisplayMechanism === partner);
}

/**
 * Filter facilities by upload status categories
 */
export function filterByCategories(
  facilities: FacilityData[],
  categories: UploadStatusCategory[]
): FacilityData[] {
  if (categories.length === 0) return facilities;
  return facilities.filter((f) => categories.includes(f.calculatedStatus));
}

/**
 * Group facilities by county and partner for hierarchical view
 */
export interface FacilityGroup {
  county: string;
  partner: string;
  facilities: FacilityData[];
}

export function groupFacilitiesByCountyAndPartner(facilities: FacilityData[]): FacilityGroup[] {
  const groups = new Map<string, FacilityGroup>();

  facilities.forEach((facility) => {
    const key = `${facility.DisplayCounty}|${facility.DisplayMechanism}`;
    if (!groups.has(key)) {
      groups.set(key, {
        county: facility.DisplayCounty,
        partner: facility.DisplayMechanism,
        facilities: [],
      });
    }
    groups.get(key)!.facilities.push(facility);
  });

  return Array.from(groups.values()).sort((a, b) => {
    const countyCompare = a.county.localeCompare(b.county);
    if (countyCompare !== 0) return countyCompare;
    return a.partner.localeCompare(b.partner);
  });
}
