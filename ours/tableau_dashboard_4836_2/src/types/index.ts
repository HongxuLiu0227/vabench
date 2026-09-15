/**
 * Raw data row from the CSV file (after normalization)
 * Headers are normalized to remove BOM and extra quotes
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
}

/**
 * Cleaned data row with proper type conversions (before computed fields are added)
 */
export interface BaseCleanDataRow {
  DisplayMFL: number;
  DisplayFacilityName: string;
  DisplaySubcounty: string;
  DisplayCounty: string;
  DisplayMechanism: string;
  DisplayAgency: string;
  UploadStatus: string;
  UploadDate: string | null;
  Upload_monthYear: string | null;
  SiteCode: number | null;
  MPI_SiteCode: number | null;
  UploadDate_MPI: string | null;
  Upload_monthYear_MPI: string | null;
  Siteabstractiondate: string | null;
}

/**
 * Cleaned data row with proper type conversions
 * Includes computed/calculated Tableau fields for county-level aggregations
 */
export interface CleanDataRow extends BaseCleanDataRow {
  // Computed/calculated Tableau fields (county-level aggregations)
  // Calculation_714102023265128449: County Denominator Expected Reports (COUNTD of DisplayMFL per county)
  'Calculation_714102023265128449': number;
  // Number of Sites Uploaded CT (copy): Count of facilities with MPI data uploaded (COUNTD of MPI_SiteCode)
  'Number_of_Sites_Uploaded_CT_copy': number;
  // County Percent Uploads Proportions (copy 3): Percentage of facilities with MPI uploads
  'County Percent Uploads Proportions (copy 3)': number;
  // County Color (copy 2): Performance category based on PKV percentage
  'County Color (copy 2)': string;
  // Calculation_714102023265861635: C&T Upload percentage for overall rate worksheet
  'Calculation_714102023265861635': number;
  // Calculation_557601975853465601: C&T Performance category for overall rate worksheet
  'Calculation_557601975853465601': string;
}

/**
 * Upload status categories
 */
export type UploadStatusType =
  | 'CT & PKVs Uploaded'
  | 'Latest CT Only'
  | 'Only PKVs'
  | 'Never Uploaded';

/**
 * Recency categories
 */
export type RecencyColorType = 'Good' | 'Average' | 'Bad';

/**
 * Performance categories for coloring
 */
export type PerformanceCategory = 'Above 67%' | '34 - 66%' | 'Below 34%';

/**
 * Aggregated data for county distribution
 */
export interface CountyDistribution {
  county: string;
  facilityCount: number;
  agency: string;
}

/**
 * Aggregated data for PKV recency
 */
export interface CountyPKVRecency {
  county: string;
  percentPKVUploads: number;
  colorCategory: PerformanceCategory;
}

/**
 * Aggregated data for overall C&T rate
 */
export interface CountyOverallRate {
  county: string;
  percentCTUploads: number;
  colorCategory: PerformanceCategory;
}

/**
 * Chart data for horizontal bar charts
 */
export interface BarChartData {
  category: string;
  value: number;
  color: string;
  series?: string;
}

/**
 * Props for horizontal ranked bar chart
 */
export interface HorizontalBarChartProps {
  data: BarChartData[];
  title: string;
  xAxisTitle: string;
  width: number;
  height: number;
  showLegend?: boolean;
  legendItems?: { label: string; color: string }[];
}

/**
 * Dashboard zone specification
 */
export interface DashboardZone {
  x: number;
  y: number;
  width: number;
  height: number;
}
