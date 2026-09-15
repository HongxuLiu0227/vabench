/**
 * Data types for the EMR Sites dashboard
 */

export interface DataRow {
  DisplayMFL: string;
  DisplayFacilityName: string;
  DisplaySubcounty: string;
  DisplayCounty: string;
  DisplayMechanism: string;
  DisplayAgency: string;
  UploadStatus: string;
  UploadDate: string;
  Upload_monthYear: string;
  SiteCode: string;
  MPI_SiteCode: string;
  UploadDate_MPI: string;
  Upload_monthYear_MPI: string;
  Siteabstractiondate: string;
  // Tableau calculated field aliases
  'SiteabstractionDate (copy)'?: string;
  'Fixed Site (copy)'?: string;
}

/**
 * Upload status categories for the Summary Stats chart
 * These are the calculated values based on CT and PKV upload status
 */
export type UploadStatusCategory =
  | 'CT & PKVs Uploaded'
  | 'Only CT Uploaded; No PKVs'
  | 'Not Uploaded this month'
  | 'Never Uploaded to DWH';

/**
 * Recency category for facilities
 */
export type RecencyCategory = 'Good' | 'Average' | 'Bad';

/**
 * Facility data with calculated fields
 */
export interface FacilityData extends DataRow {
  calculatedStatus: UploadStatusCategory;
  recency: RecencyCategory;
  uploadMonthYear?: string;
  uploadMonthYear_MPI?: string;
}

/**
 * Data aggregated for Summary Stats chart
 */
export interface SummaryStatsData {
  category: UploadStatusCategory;
  count: number;
  percentage: number;
}

/**
 * Filter state for dashboard interactions
 */
export interface DashboardFilter {
  selectedCategories: UploadStatusCategory[];
}

/**
 * Parameter control for date selection
 */
export interface DashboardParameters {
  selectedDate: string; // ISO date string
}
