/**
 * Type definitions for the Tableau Dashboard data structures
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

export interface PartnerData {
  partner: string;
  agency: string;
  count: number;
}

export interface PartnerUploadData {
  partner: string;
  percentUploaded: number;
  category: 'Above 67%' | '34 - 66%' | 'Below 33%';
}

export interface DashboardData {
  partners: PartnerData[];
  overallUploads: PartnerUploadData[];
  recencyUploads: PartnerUploadData[];
  availableDates: string[];
  selectedDate: string;
}

export type PerformanceCategory = 'Above 67%' | '34 - 66%' | 'Below 33%';

export interface HorizontalBarData {
  category: string;
  value: number;
  series?: string;
}

export interface HorizontalBarChartProps {
  data: HorizontalBarData[];
  title: string;
  axisTitle: string;
  seriesField?: string;
  showLegend?: boolean;
  legendData?: Array<{ category: string; color: string }>;
  width?: number;
  height?: number;
}
