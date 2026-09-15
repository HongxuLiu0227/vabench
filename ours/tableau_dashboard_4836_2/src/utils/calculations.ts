import type { CleanDataRow, PerformanceCategory } from '../types';
import { parseDate, monthsDifference } from '../services/dataLoader';

/**
 * Calculate the color category based on percentage
 * >= 67%: Green (Above 67%)
 * 34% - 66%: Orange/Yellow (34 - 66%)
 * < 34%: Red (Below 34%)
 */
export function getPerformanceCategory(percentage: number): PerformanceCategory {
  if (percentage >= 67) return 'Above 67%';
  if (percentage >= 34) return '34 - 66%';
  return 'Below 34%';
}

/**
 * Get the color for a performance category
 */
export function getPerformanceColor(category: PerformanceCategory): string {
  switch (category) {
    case 'Above 67%':
      return '#4caf50'; // Green
    case '34 - 66%':
      return '#ff9800'; // Orange/Yellow
    case 'Below 34%':
      return '#f44336'; // Red
    default:
      return '#cccccc';
  }
}

/**
 * Calculate upload status for a given date parameter
 */
export function calculateUploadStatus(
  row: CleanDataRow,
  parameterDate: Date
): string {
  const ctUploadDate = parseDate(row.UploadDate);
  const pkvUploadDate = parseDate(row.UploadDate_MPI);

  const hasCTUpload = ctUploadDate !== null && ctUploadDate <= parameterDate;
  const hasPKVUpload = pkvUploadDate !== null && pkvUploadDate <= parameterDate;

  if (hasCTUpload && hasPKVUpload) {
    return 'CT & PKVs Uploaded';
  } else if (hasCTUpload) {
    return 'Latest CT Only';
  } else if (hasPKVUpload) {
    return 'Only PKVs';
  } else {
    return 'Never Uploaded';
  }
}

/**
 * Calculate recency of uploads in months
 */
export function calculateRecencyMonths(row: CleanDataRow): number | null {
  const abstractionDate = parseDate(row.Siteabstractiondate);
  if (!abstractionDate) return null;

  // Get the most recent upload date (either CT or PKV)
  const ctDate = parseDate(row.UploadDate);
  const pkvDate = parseDate(row.UploadDate_MPI);

  if (!ctDate && !pkvDate) return null;

  const mostRecentUpload = ctDate && pkvDate
    ? (ctDate > pkvDate ? ctDate : pkvDate)
    : (ctDate || pkvDate);

  if (!mostRecentUpload) return null;

  return monthsDifference(abstractionDate, mostRecentUpload);
}

/**
 * Calculate recency color category
 * Good: uploaded within 2 months
 * Average: uploaded 3-4 months ago
 * Bad: uploaded 5+ months ago or never uploaded
 */
export function calculateRecencyColor(months: number | null): string {
  if (months === null) return 'Bad';
  if (months <= 2) return 'Good';
  if (months <= 4) return 'Average';
  return 'Bad';
}

/**
 * Aggregate data for county distribution worksheet
 * Shows count of facilities by county
 */
export function aggregateCountyDistribution(data: CleanDataRow[]): Array<{
  county: string;
  facilityCount: number;
  agency: string;
}> {
  const countyMap = new Map<string, Set<number>>();

  // Group unique facilities by county
  data.forEach(row => {
    const county = row.DisplayCounty;
    const mflCode = row.DisplayMFL;

    if (!countyMap.has(county)) {
      countyMap.set(county, new Set());
    }

    countyMap.get(county)!.add(mflCode);
  });

  // Convert to array and sort by facility count descending
  const result = Array.from(countyMap.entries()).map(([county, facilitySet]) => {
    // Get the primary agency for this county (first non-empty agency)
    const agency = data.find(row => row.DisplayCounty === county && row.DisplayAgency)?.DisplayAgency || 'Unknown';

    return {
      county,
      facilityCount: facilitySet.size,
      agency
    };
  });

  return result.sort((a, b) => b.facilityCount - a.facilityCount);
}

/**
 * Aggregate data for PKV recency worksheet
 * Shows percentage of facilities with PKV uploads by county
 */
export function aggregateCountyPKVRecency(
  data: CleanDataRow[],
  parameterDate: Date
): Array<{
  county: string;
  percentPKVUploads: number;
  colorCategory: PerformanceCategory;
}> {
  const countyData = new Map<string, {
    totalFacilities: Set<number>;
    pkvUploaded: Set<number>;
  }>();

  data.forEach(row => {
    const county = row.DisplayCounty;
    const mflCode = row.DisplayMFL;
    const pkvDate = parseDate(row.UploadDate_MPI);

    if (!countyData.has(county)) {
      countyData.set(county, {
        totalFacilities: new Set(),
        pkvUploaded: new Set()
      });
    }

    const countyInfo = countyData.get(county)!;
    countyInfo.totalFacilities.add(mflCode);

    // Check if PKV was uploaded before or on parameter date
    if (pkvDate && pkvDate <= parameterDate) {
      countyInfo.pkvUploaded.add(mflCode);
    }
  });

  const result = Array.from(countyData.entries()).map(([county, info]) => {
    const total = info.totalFacilities.size;
    const uploaded = info.pkvUploaded.size;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;

    return {
      county,
      percentPKVUploads: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      colorCategory: getPerformanceCategory(percentage)
    };
  });

  return result.sort((a, b) => b.percentPKVUploads - a.percentPKVUploads);
}

/**
 * Aggregate data for overall C&T rate worksheet
 * Shows percentage of facilities with C&T uploads by county
 */
export function aggregateCountyOverallRate(
  data: CleanDataRow[],
  parameterDate: Date
): Array<{
  county: string;
  percentCTUploads: number;
  colorCategory: PerformanceCategory;
}> {
  const countyData = new Map<string, {
    totalFacilities: Set<number>;
    ctUploaded: Set<number>;
  }>();

  data.forEach(row => {
    const county = row.DisplayCounty;
    const mflCode = row.DisplayMFL;
    const ctDate = parseDate(row.UploadDate);

    if (!countyData.has(county)) {
      countyData.set(county, {
        totalFacilities: new Set(),
        ctUploaded: new Set()
      });
    }

    const countyInfo = countyData.get(county)!;
    countyInfo.totalFacilities.add(mflCode);

    // Check if C&T was uploaded before or on parameter date
    if (ctDate && ctDate <= parameterDate) {
      countyInfo.ctUploaded.add(mflCode);
    }
  });

  const result = Array.from(countyData.entries()).map(([county, info]) => {
    const total = info.totalFacilities.size;
    const uploaded = info.ctUploaded.size;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;

    return {
      county,
      percentCTUploads: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      colorCategory: getPerformanceCategory(percentage)
    };
  });

  return result.sort((a, b) => b.percentCTUploads - a.percentCTUploads);
}

/**
 * Get the default parameter date (Jan 2021 as per spec)
 */
export function getDefaultParameterDate(): Date {
  return new Date('2021-01-06');
}
