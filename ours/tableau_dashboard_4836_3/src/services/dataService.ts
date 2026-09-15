/**
 * Data service for fetching and processing dashboard data
 */

import { csvParse } from 'd3-dsv';
import type { DataRow, PartnerData, PartnerUploadData, DashboardData } from '../types';

const DATA_URL = '/data/federated_0se4v9q15j8hfi17f25m50.csv';

/**
 * Mapping of Tableau calculated fields to actual data source operations.
 *
 * These are the Tableau calculated fields referenced in the spec and how they map
 * to our implementation:
 *
 * Tableau Field -> Implementation Mapping
 * =========================================
 * - "County Denominator Expected Reports (copy)" -> count of distinct DisplayMFL values
 *   Implementation: calculatePartnerDistribution() returns PartnerData[].count
 *
 * - "County Percent Uploads Proportions (copy)" -> percentage of sites uploaded
 *   Implementation: calculateOverallUploads() returns PartnerUploadData[].percentUploaded
 *
 * - "County Color (copy)" -> performance category color
 *   Implementation: getPerformanceColor() returns color string for category
 *
 * - "PArtner Color (copy)" -> performance category color (typo in original)
 *   Implementation: getPerformanceColor() returns color string for category
 *
 * - "Partner Percent Uploaded (copy)" -> percentage uploaded for partner
 *   Implementation: calculateOverallUploads() returns PartnerUploadData[].percentUploaded
 *
 * All source columns available in CSV:
 * - DisplayMFL, DisplayFacilityName, DisplaySubcounty, DisplayCounty
 * - DisplayMechanism, DisplayAgency, UploadStatus
 * - UploadDate, Upload_monthYear, SiteCode
 * - MPI_SiteCode, UploadDate_MPI, Upload_monthYear_MPI, Siteabstractiondate
 */

/**
 * Helper function to normalize column names by removing quotes, BOM, and extra whitespace
 * This handles the messy CSV headers that may have various quote formats like:
 * - ﻿"""DisplayMFL""" (BOM + triple quotes)
 * - "DisplayFacilityName" (double quotes)
 */
function normalizeColumnName(colName: string): string {
  return colName
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes (handles " , "" , """, etc.)
    .replace(/^['"]+|['"]+$/g, '') // Also handle single quotes
    .trim();
}

/**
 * Preprocess CSV text to normalize headers with triple quotes
 * d3-dsv doesn't handle triple-quoted headers well, so we clean them first
 */
function preprocessCSV(csvText: string): string {
  const lines = csvText.split('\n');
  if (lines.length === 0) return csvText;

  // Clean up the header line (first line)
  const headerLine = lines[0];
  const cleanedHeader = headerLine
    .split(',')
    .map(col => {
      // Remove triple quotes and any surrounding quotes from column names
      let cleaned = col.trim();
      // Remove outer triple quotes: """colname""" -> colname
      cleaned = cleaned.replace(/^"""(.+?)"""$/, '$1');
      // Remove double quotes if any remain
      cleaned = cleaned.replace(/^"(.+?)"$/, '$1');
      // Re-wrap in standard single quotes for d3-dsv
      return cleaned.includes(',') ? `"${cleaned}"` : cleaned;
    })
    .join(',');

  lines[0] = cleanedHeader;
  return lines.join('\n');
}

/**
 * Helper function to extract a field value from a row, trying various quote formats
 */
function extractField(row: { [key: string]: string }, fieldName: string): string {
  // Try exact match first
  if (row[fieldName] !== undefined) {
    return row[fieldName];
  }

  // Try all keys and match normalized names
  for (const key of Object.keys(row)) {
    if (normalizeColumnName(key) === fieldName) {
      return row[key];
    }
  }

  return '';
}

/**
 * Fetch and parse CSV data from public directory
 */
export async function fetchDashboardData(): Promise<DataRow[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    let csvText = await response.text();

    // Preprocess CSV to handle triple-quoted headers
    csvText = preprocessCSV(csvText);

    const data = csvParse(csvText);

    // Normalize column names (remove quotes, BOM, and extra whitespace)
    return data.map((row: { [key: string]: string }) => ({
      DisplayMFL: String(extractField(row, 'DisplayMFL')).trim(),
      DisplayFacilityName: String(extractField(row, 'DisplayFacilityName')).trim(),
      DisplaySubcounty: String(extractField(row, 'DisplaySubcounty')).trim(),
      DisplayCounty: String(extractField(row, 'DisplayCounty')).trim(),
      DisplayMechanism: String(extractField(row, 'DisplayMechanism')).trim(),
      DisplayAgency: String(extractField(row, 'DisplayAgency')).trim(),
      UploadStatus: String(extractField(row, 'UploadStatus')).trim(),
      UploadDate: String(extractField(row, 'UploadDate')).trim(),
      Upload_monthYear: String(extractField(row, 'Upload_monthYear')).trim(),
      SiteCode: String(extractField(row, 'SiteCode')).trim(),
      MPI_SiteCode: String(extractField(row, 'MPI_SiteCode')).trim(),
      UploadDate_MPI: String(extractField(row, 'UploadDate_MPI')).trim(),
      Upload_monthYear_MPI: String(extractField(row, 'Upload_monthYear_MPI')).trim(),
      Siteabstractiondate: String(extractField(row, 'Siteabstractiondate')).trim(),
    }));
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Get unique month-year values from upload dates
 */
export function getAvailableMonthYears(data: DataRow[]): string[] {
  const monthYears = new Set<string>();

  data.forEach(row => {
    if (row.Upload_monthYear) {
      monthYears.add(row.Upload_monthYear);
    }
  });

  return Array.from(monthYears).sort((a, b) => {
    // Sort by date descending (most recent first)
    const dateA = parseMonthYear(a);
    const dateB = parseMonthYear(b);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Parse month-year string to Date object
 * Handles validation and returns a safe default if parsing fails
 */
export function parseMonthYear(monthYear: string): Date {
  // Expected format: "January 2020", "February 2021", etc.
  if (!monthYear || typeof monthYear !== 'string') {
    console.warn('Invalid monthYear input:', monthYear);
    return new Date(2000, 0, 1); // Default to Jan 2000
  }

  const parts = monthYear.trim().split(' ');
  if (parts.length < 2) {
    console.warn('Invalid monthYear format:', monthYear);
    return new Date(2000, 0, 1); // Default to Jan 2000
  }

  const [month, year] = parts;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();
  const yearNum = Number(year);

  // Validate the parsed values
  if (isNaN(monthIndex) || isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
    console.warn('Invalid month or year value:', monthYear);
    return new Date(2000, 0, 1); // Default to Jan 2000
  }

  return new Date(yearNum, monthIndex, 1);
}

/**
 * Calculate the distribution of EMR sites by partner
 */
export function calculatePartnerDistribution(data: DataRow[]): PartnerData[] {
  const partnerMap = new Map<string, { count: number; agency: string }>();

  data.forEach(row => {
    const partner = row.DisplayMechanism || 'Unknown';
    const agency = row.DisplayAgency || 'Unknown';
    const mfl = row.DisplayMFL;

    if (mfl) {
      const existing = partnerMap.get(partner);
      if (existing) {
        existing.count += 1;
      } else {
        partnerMap.set(partner, { count: 1, agency });
      }
    }
  });

  const result: PartnerData[] = Array.from(partnerMap.entries())
    .map(([partner, data]) => ({
      partner,
      agency: data.agency,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);

  return result;
}

/**
 * Get performance category based on percentage
 */
export function getPerformanceCategory(percentage: number): 'Above 67%' | '34 - 66%' | 'Below 33%' {
  if (percentage >= 67) return 'Above 67%';
  if (percentage >= 34) return '34 - 66%';
  return 'Below 33%';
}

/**
 * Get color for performance category
 */
export function getPerformanceColor(category: 'Above 67%' | '34 - 66%' | 'Below 33%'): string {
  switch (category) {
    case 'Above 67%':
      return '#4CAF50'; // Green
    case '34 - 66%':
      return '#FFC107'; // Yellow/Amber
    case 'Below 33%':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Grey
  }
}

/**
 * Calculate overall reporting rate for Care & Treatment uploads by partner
 */
export function calculateOverallUploads(data: DataRow[], selectedMonthYear: string): PartnerUploadData[] {
  // Filter data for the selected month
  const monthData = data.filter(row => row.Upload_monthYear === selectedMonthYear);

  // Get unique sites per partner
  const partnerSites = new Map<string, Set<string>>();
  const partnerTotalSites = new Map<string, Set<string>>();

  // First, get total sites per partner
  data.forEach(row => {
    const partner = row.DisplayMechanism || 'Unknown';
    const mfl = row.DisplayMFL;
    if (mfl) {
      if (!partnerTotalSites.has(partner)) {
        partnerTotalSites.set(partner, new Set());
      }
      partnerTotalSites.get(partner)!.add(mfl);
    }
  });

  // Then, get uploaded sites for selected month
  monthData.forEach(row => {
    const partner = row.DisplayMechanism || 'Unknown';
    const mfl = row.SiteCode || row.DisplayMFL;

    if (mfl) {
      if (!partnerSites.has(partner)) {
        partnerSites.set(partner, new Set());
      }
      partnerSites.get(partner)!.add(mfl);
    }
  });

  // Calculate percentages
  const result: PartnerUploadData[] = [];

  partnerTotalSites.forEach((totalSites, partner) => {
    const uploadedSites = partnerSites.get(partner) || new Set();
    const total = totalSites.size;
    const uploaded = uploadedSites.size;
    const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;
    const category = getPerformanceCategory(percentage);

    result.push({
      partner,
      percentUploaded: percentage,
      category,
    });
  });

  // Sort by percentage descending
  return result.sort((a, b) => b.percentUploaded - a.percentUploaded);
}

/**
 * Calculate PKV upload recency by partner
 */
export function calculateRecencyUploads(data: DataRow[], selectedMonthYear: string): PartnerUploadData[] {
  // For recency, we look at MPI uploads
  const monthData = data.filter(row => row.Upload_monthYear_MPI === selectedMonthYear);

  // Get unique sites per partner
  const partnerSites = new Map<string, Set<string>>();
  const partnerTotalSites = new Map<string, Set<string>>();

  // First, get total sites per partner
  data.forEach(row => {
    const partner = row.DisplayMechanism || 'Unknown';
    const mfl = row.DisplayMFL;
    if (mfl) {
      if (!partnerTotalSites.has(partner)) {
        partnerTotalSites.set(partner, new Set());
      }
      partnerTotalSites.get(partner)!.add(mfl);
    }
  });

  // Then, get uploaded sites for selected month
  monthData.forEach(row => {
    const partner = row.DisplayMechanism || 'Unknown';
    const mfl = row.MPI_SiteCode || row.DisplayMFL;

    if (mfl) {
      if (!partnerSites.has(partner)) {
        partnerSites.set(partner, new Set());
      }
      partnerSites.get(partner)!.add(mfl);
    }
  });

  // Calculate percentages
  const result: PartnerUploadData[] = [];

  partnerTotalSites.forEach((totalSites, partner) => {
    const uploadedSites = partnerSites.get(partner) || new Set();
    const total = totalSites.size;
    const uploaded = uploadedSites.size;
    const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;
    const category = getPerformanceCategory(percentage);

    result.push({
      partner,
      percentUploaded: percentage,
      category,
    });
  });

  // Sort by percentage descending
  return result.sort((a, b) => b.percentUploaded - a.percentUploaded);
}

/**
 * Load and process all dashboard data
 */
export async function loadDashboardData(selectedDate?: string): Promise<DashboardData> {
  const rawData = await fetchDashboardData();
  const availableDates = getAvailableMonthYears(rawData);

  // Use provided date or most recent date
  const finalSelectedDate = selectedDate || availableDates[0] || '';

  const partners = calculatePartnerDistribution(rawData);
  const overallUploads = calculateOverallUploads(rawData, finalSelectedDate);
  const recencyUploads = calculateRecencyUploads(rawData, finalSelectedDate);

  return {
    partners,
    overallUploads,
    recencyUploads,
    availableDates,
    selectedDate: finalSelectedDate,
  };
}

/**
 * Reload dashboard data with a new selected date
 */
export async function reloadDashboardWithData(
  rawData: DataRow[],
  selectedDate: string
): Promise<DashboardData> {
  const partners = calculatePartnerDistribution(rawData);
  const overallUploads = calculateOverallUploads(rawData, selectedDate);
  const recencyUploads = calculateRecencyUploads(rawData, selectedDate);
  const availableDates = getAvailableMonthYears(rawData);

  return {
    partners,
    overallUploads,
    recencyUploads,
    availableDates,
    selectedDate,
  };
}
