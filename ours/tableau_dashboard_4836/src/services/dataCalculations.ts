import type {
  DataRow,
  UploadStatus,
  RecencyCategory,
  PerformanceColor,
  CountyAggregation,
  PartnerAggregation,
  FacilityDetail,
} from '../types';
import { parseMonthYear, parseDate, formatDateToMonthYear } from './dataLoader';

/**
 * Get the 3-month window for a given selected date
 */
export function getThreeMonthWindow(selectedMonthYear: string): string[] {
  const selectedDate = parseMonthYear(selectedMonthYear);

  const months = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() - i);
    months.push(formatDateToMonthYear(date));
  }

  return months;
}

/**
 * Check if a date is within the 3-month window
 */
export function isDateInWindow(dateStr: string, window: string[]): boolean {
  if (!dateStr || dateStr === '') return false;

  const date = parseDate(dateStr);
  if (!date) return false;

  const monthYear = formatDateToMonthYear(date);
  return window.includes(monthYear);
}

/**
 * Calculate upload status for a facility
 */
export function calculateUploadStatus(row: DataRow, window: string[]): UploadStatus {
  const ctUploaded = isDateInWindow(row.UploadDate, window);
  const mpiUploaded = isDateInWindow(row.UploadDate_MPI, window);
  const hasCT = row.UploadDate && row.UploadDate !== '';
  const hasMPI = row.UploadDate_MPI && row.UploadDate_MPI !== '';

  if (ctUploaded && mpiUploaded) {
    return 'CT & PKVs Uploaded';
  } else if (ctUploaded && !hasMPI) {
    return 'Only CT Uploaded; No PKVs';
  } else if (!ctUploaded && mpiUploaded) {
    return 'Only CT Uploaded; No PKVs'; // This case shouldn't happen based on requirements
  } else if (!ctUploaded && !mpiUploaded) {
    // Check if never uploaded
    if (!hasCT && !hasMPI) {
      return 'Never Uploaded to DWH';
    }
    return 'Not Uploaded this month';
  }

  return 'Never Uploaded to DWH';
}

/**
 * Calculate recency category
 */
export function calculateRecency(abstractionDate: string, currentDate: Date = new Date()): { category: RecencyCategory; months: number } {
  if (!abstractionDate || abstractionDate === '') {
    return { category: 'Bad', months: -1 };
  }

  const abstractDate = parseDate(abstractionDate);
  if (!abstractDate) {
    return { category: 'Bad', months: -1 };
  }

  // Calculate months difference
  const monthsDiff = (currentDate.getFullYear() - abstractDate.getFullYear()) * 12 +
                     (currentDate.getMonth() - abstractDate.getMonth());

  if (monthsDiff <= 2) {
    return { category: 'Good', months: monthsDiff };
  } else if (monthsDiff >= 3) {
    return { category: 'Average', months: monthsDiff };
  }

  return { category: 'Bad', months: monthsDiff };
}

/**
 * Calculate performance color based on percentage
 */
export function calculatePerformanceColor(percentage: number): PerformanceColor {
  if (percentage >= 0.67) {
    return 'Above 67%';
  } else if (percentage >= 0.34) {
    return '34 - 66%';
  } else {
    return 'Below 34%';
  }
}

/**
 * Get color for performance category
 */
export function getPerformanceColor(category: PerformanceColor): string {
  switch (category) {
    case 'Above 67%':
      return '#4CAF50'; // Green
    case '34 - 66%':
      return '#FFC107'; // Yellow
    case 'Below 34%':
    case 'Below 33%':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Grey
  }
}

/**
 * Aggregate data by county
 */
export function aggregateByCounty(data: DataRow[], window: string[]): CountyAggregation[] {
  const countyMap = new Map<string, CountyAggregation>();

  data.forEach(row => {
    const county = row.DisplayCounty || 'Unknown';

    if (!countyMap.has(county)) {
      countyMap.set(county, {
        county,
        totalFacilities: 0,
        uploadedCT: 0,
        uploadedMPI: 0,
        uploadRateCT: 0,
        uploadRateMPI: 0,
        performanceColor: 'Below 34%',
      });
    }

    const agg = countyMap.get(county)!;
    agg.totalFacilities++;

    // Check CT upload
    if (isDateInWindow(row.UploadDate, window)) {
      agg.uploadedCT++;
    }

    // Check MPI upload
    if (isDateInWindow(row.UploadDate_MPI, window)) {
      agg.uploadedMPI++;
    }
  });

  // Calculate rates
  countyMap.forEach(agg => {
    agg.uploadRateCT = agg.totalFacilities > 0 ? agg.uploadedCT / agg.totalFacilities : 0;
    agg.uploadRateMPI = agg.totalFacilities > 0 ? agg.uploadedMPI / agg.totalFacilities : 0;
    agg.performanceColor = calculatePerformanceColor(agg.uploadRateCT);
  });

  // Convert to array and sort by upload rate CT descending
  return Array.from(countyMap.values())
    .sort((a, b) => b.uploadRateCT - a.uploadRateCT);
}

/**
 * Aggregate data by partner
 */
export function aggregateByPartner(data: DataRow[], window: string[]): PartnerAggregation[] {
  const partnerMap = new Map<string, PartnerAggregation>();

  data.forEach(row => {
    const partner = row.DisplayMechanism || 'Unknown';
    const agency = row.DisplayAgency || 'Unknown';

    if (!partnerMap.has(partner)) {
      partnerMap.set(partner, {
        partner,
        agency,
        totalFacilities: 0,
        uploadedCT: 0,
        uploadedMPI: 0,
        uploadRateCT: 0,
        uploadRateMPI: 0,
        performanceColor: 'Below 34%',
      });
    }

    const agg = partnerMap.get(partner)!;
    agg.totalFacilities++;

    // Check CT upload
    if (isDateInWindow(row.UploadDate, window)) {
      agg.uploadedCT++;
    }

    // Check MPI upload
    if (isDateInWindow(row.UploadDate_MPI, window)) {
      agg.uploadedMPI++;
    }
  });

  // Calculate rates
  partnerMap.forEach(agg => {
    agg.uploadRateCT = agg.totalFacilities > 0 ? agg.uploadedCT / agg.totalFacilities : 0;
    agg.uploadRateMPI = agg.totalFacilities > 0 ? agg.uploadedMPI / agg.totalFacilities : 0;
    agg.performanceColor = calculatePerformanceColor(agg.uploadRateCT);
  });

  // Convert to array and sort by upload rate CT descending
  return Array.from(partnerMap.values())
    .sort((a, b) => b.uploadRateCT - a.uploadRateCT);
}

/**
 * Create facility details list
 */
export function createFacilityDetails(data: DataRow[], window: string[]): FacilityDetail[] {
  return data.map(row => {
    const uploadStatus = calculateUploadStatus(row, window);
    const recency = calculateRecency(row.Siteabstractiondate);

    return {
      mflCode: row.DisplayMFL,
      facilityName: row.DisplayFacilityName,
      county: row.DisplayCounty,
      partner: row.DisplayMechanism,
      agency: row.DisplayAgency,
      uploadStatus,
      recency: recency.category,
      recencyMonths: recency.months,
      lastUploadDate: row.UploadDate,
      lastUploadDateMPI: row.UploadDate_MPI,
      abstractionDate: row.Siteabstractiondate,
    };
  });
}

/**
 * Calculate overall statistics
 */
export function calculateOverallStats(data: DataRow[], window: string[]) {
  const totalExpected = new Set<string>();
  const uploadedCT = new Set<string>();
  const uploadedMPI = new Set<string>();

  data.forEach(row => {
    const mflCode = row.DisplayMFL;
    totalExpected.add(mflCode);

    if (isDateInWindow(row.UploadDate, window)) {
      uploadedCT.add(mflCode);
    }

    if (isDateInWindow(row.UploadDate_MPI, window)) {
      uploadedMPI.add(mflCode);
    }
  });

  const reportingRateCT = totalExpected.size > 0 ? uploadedCT.size / totalExpected.size : 0;
  const reportingRateMPI = totalExpected.size > 0 ? uploadedMPI.size / totalExpected.size : 0;

  return {
    totalExpected: totalExpected.size,
    uploadedCT: uploadedCT.size,
    uploadedMPI: uploadedMPI.size,
    reportingRateCT,
    reportingRateMPI,
  };
}

/**
 * Filter data by county
 */
export function filterByCounty(data: DataRow[], county: string | null): DataRow[] {
  if (!county) return data;
  return data.filter(row => row.DisplayCounty === county);
}

/**
 * Filter data by partner
 */
export function filterByPartner(data: DataRow[], partner: string | null): DataRow[] {
  if (!partner) return data;
  return data.filter(row => row.DisplayMechanism === partner);
}

/**
 * Filter data by agency
 */
export function filterByAgency(data: DataRow[], agency: string | null): DataRow[] {
  if (!agency) return data;
  return data.filter(row => row.DisplayAgency === agency);
}
