// Data Types
export interface DataRow {
  // Original CSV fields
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

  // Calculated Tableau fields (computed from raw data)
  Calculation_714102023265128449: number; // Count of facilities (1 per row)
  Calculation_714102023265861635: number; // Percentage of C&T Uploads (0-1)
  Calculation_557601975853465601: string; // Performance color category: "Above 67%", "34 - 66%", "Below 34%", "Below 33%"
  Calculation_989947529004945410: number; // Some percentage calculation
  Calculation_1593429869216702466: string; // Date-related calculation
  Calculation_1593429869476466693: string; // Date-related calculation
  Calculation_1593429869478662153: string; // Date-related calculation
  Calculation_1593429869483032587: string; // Date-related calculation
  Calculation_1593429869496254476: string; // Date-related calculation
  'County Color (copy)': string; // Performance color for county
  'County Color (copy 2)': string; // Performance color for county (alternative)
  'PArtner Color  (copy)': string; // Performance color for partner (note: double space)
  CountyPercentUploadsProportions: number; // Percentage uploads
  CountyPercentUploadsProportions_copy: number; // Percentage uploads (alternative)
  CountyPercentUploadsProportions_copy2: number; // Percentage uploads (another alternative)
  CountyPercentUploadsProportions_copy3: number; // Percentage uploads (yet another alternative)
  ' Parameter Period Label - Month 1': string; // Period label parameter
  ' Parameter Period Label (copy)': string; // Period label parameter (copy)
  ' Parameter Period Label - Month 1 (copy)': string; // Period label parameter - Month 1 (copy)
  'DisplayMFL (copy)': string; // Copy of DisplayMFL
  'SiteabstractionDate (copy)': string; // Copy of Siteabstractiondate
  'UploadDate (copy)': string; // Copy of UploadDate
  UploadMonthYear: string; // Upload Month / Year
  'Date Label (copy)': string; // Date Label (copy)
}

// Upload Status Types
export type UploadStatus =
  | 'CT & PKVs Uploaded'
  | 'Only CT Uploaded; No PKVs'
  | 'Not Uploaded this month'
  | 'Never Uploaded to DWH';

// Recency Types
export type RecencyCategory = 'Good' | 'Average' | 'Bad';

// Performance Color
export type PerformanceColor = 'Above 67%' | '34 - 66%' | 'Below 34%' | 'Below 33%';

// Aggregated Data
export interface CountyAggregation {
  county: string;
  totalFacilities: number;
  uploadedCT: number;
  uploadedMPI: number;
  uploadRateCT: number;
  uploadRateMPI: number;
  performanceColor: PerformanceColor;
}

export interface PartnerAggregation {
  partner: string;
  agency: string;
  totalFacilities: number;
  uploadedCT: number;
  uploadedMPI: number;
  uploadRateCT: number;
  uploadRateMPI: number;
  performanceColor: PerformanceColor;
}

export interface FacilityDetail {
  mflCode: string;
  facilityName: string;
  county: string;
  partner: string;
  agency: string;
  uploadStatus: UploadStatus;
  recency: RecencyCategory;
  recencyMonths: number;
  lastUploadDate: string;
  lastUploadDateMPI: string;
  abstractionDate: string;
}

// Chart Data Types
export interface BarChartData {
  label: string;
  value: number;
  category: string;
  color: string;
}

export interface TimeSeriesData {
  period: string;
  ctRate: number;
  mpiRate: number;
  agency?: string;
}

// Dashboard State
export interface DashboardState {
  selectedDate: string;
  selectedCounty: string | null;
  selectedPartner: string | null;
  data: DataRow[];
  countyAggregations: CountyAggregation[];
  partnerAggregations: PartnerAggregation[];
  facilityDetails: FacilityDetail[];
  timeSeriesData: TimeSeriesData[];
  isLoading: boolean;
  error: string | null;
}

// Filter State
export interface FilterState {
  county: string | null;
  partner: string | null;
  agency: string | null;
  uploadStatus: UploadStatus | null;
}

// Worksheet Props
export interface WorksheetProps {
  data: unknown[];
  width: number;
  height: number;
  title?: string;
  filterState?: FilterState;
  onFilterChange?: (filter: Partial<FilterState>) => void;
}

// Legend Props
export interface LegendProps {
  categories: string[];
  colors: string[];
  title?: string;
  orientation?: 'horizontal' | 'vertical';
}
