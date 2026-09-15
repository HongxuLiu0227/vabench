import Papa from 'papaparse';
import type { SwimmerData, AggregatedByRank, AggregatedByCountry, AggregatedByAge } from '../types/swimming';

/**
 * Load and parse CSV data from public/data directory
 */
export async function loadSwimmingData(): Promise<SwimmerData[]> {
  try {
    const response = await fetch('/data/vSwimmingCompetitions (SWIMMING_Comp).csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsedData = (results.data as Record<string, unknown>[]).map((row) => parseRow(row));
            const filteredData = parsedData.filter((row): row is SwimmerData => row !== null);

            // Validate that we successfully parsed data
            if (filteredData.length === 0) {
              console.error('No valid data rows parsed from CSV');
              console.error('First raw row:', results.data[0]);
              reject(new Error('Failed to parse any valid data rows from CSV'));
              return;
            }

            // Log sample of parsed data for debugging
            console.log(`Successfully parsed ${filteredData.length} rows from CSV`);
            console.log('Sample parsed row:', filteredData[0]);

            // Verify required fields are present
            const sampleRow = filteredData[0];
            const requiredFields = ['SwimmerId', 'RankSwimmers', 'CountrySwimmers', 'GenderSwimmer'];
            const missingFields = requiredFields.filter(field => !(field in sampleRow));
            if (missingFields.length > 0) {
              console.error('Missing required fields:', missingFields);
              console.error('Available fields:', Object.keys(sampleRow));
              reject(new Error(`Missing required fields: ${missingFields.join(', ')}`));
              return;
            }

            resolve(filteredData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: unknown) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading swimming data:', error);
    throw error;
  }
}

/**
 * Normalize CSV header names by removing all surrounding quotes
 * Handles cases like """CompID""" -> "CompID"
 */
function normalizeHeaderKey(key: string): string {
  // Remove ALL surrounding quotes (handles single, double, or triple quotes)
  let cleaned = key.trim();
  // Remove quotes from both ends repeatedly until no more quotes at boundaries
  while (cleaned.startsWith('"') || cleaned.startsWith("'")) {
    cleaned = cleaned.slice(1);
  }
  while (cleaned.endsWith('"') || cleaned.endsWith("'")) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

/**
 * Parse a single CSV row with type coercion
 */
function parseRow(row: Record<string, unknown>): SwimmerData | null {
  try {
    // Clean up field names (remove quotes and extra spaces)
    const cleanRow: Record<string, unknown> = {};
    for (const key in row) {
      const cleanKey = normalizeHeaderKey(key);
      cleanRow[cleanKey] = row[key];
    }

    // Helper function to parse numeric fields
    const parseNumber = (value: unknown): number => {
      if (value === null || value === undefined || value === '') return 0;
      const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
      return isNaN(num) ? 0 : num;
    };

    // Helper function to parse date fields
    const parseDate = (value: unknown): Date | null => {
      if (value === null || value === undefined || value === '') return null;
      const date = new Date(value as string | number);
      return isNaN(date.getTime()) ? null : date;
    };

    // Helper function to parse boolean
    const parseBoolean = (value: unknown): boolean => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'boolean') return value;
      const str = String(value).toLowerCase();
      return str === 'true' || str === '1' || str === 'yes';
    };

    const CompID = parseNumber(cleanRow['CompID']);
    const CompDate = parseDate(cleanRow['CompDate']);
    const Сountry = (cleanRow['Сountry'] || '').toString().trim();
    const City = (cleanRow['City'] || '').toString().trim();
    const StyleID = parseNumber(cleanRow['StyleID']);
    const Style = (cleanRow['Style'] || '').toString().trim();
    const Distance = parseNumber(cleanRow['Distance']);
    const ResTime = (cleanRow['ResTime'] || '').toString().trim();
    const DisqID = (cleanRow['DisqID'] || '').toString().trim();
    const Reason = (cleanRow['Reason'] || '').toString().trim();
    const Term = (cleanRow['Term'] || '').toString().trim();
    const SwimmerId = parseNumber(cleanRow['SwimmerId']);
    const NameSwimmer = (cleanRow['NameSwimmer'] || '').toString().trim();
    const GenderSwimmer = (cleanRow['GenderSwimmer'] || '').toString().trim().toUpperCase() as 'M' | 'F' | '';
    const BirthDateSwimmers = parseDate(cleanRow['BirthDateSwimmers']);
    const BirthDateSwimmers_copy_818529261980127232 = BirthDateSwimmers; // Tableau calculated field copy
    const CareerStartSwimmers = parseDate(cleanRow['CareerStartSwimmers']);
    const RankSwimmers = (cleanRow['RankSwimmers'] || '').toString().trim();
    const CountrySwimmers = (cleanRow['CountrySwimmers'] || '').toString().trim();
    const DopingRec = parseBoolean(cleanRow['DopingRec']);
    const TrainerID = parseNumber(cleanRow['TrainerID']);
    const NameTrainer = (cleanRow['NameTrainer'] || '').toString().trim();
    const GenderTrainer = (cleanRow['GenderTrainer'] || '').toString().trim().toUpperCase() as 'M' | 'F' | '';
    const RankTrainer = (cleanRow['RankTrainer'] || '').toString().trim();
    const CareerStartTrainer = parseDate(cleanRow['CareerStartTrainer']);
    const SponsID = (cleanRow['SponsID'] || '').toString().trim();
    const NameSponsors = (cleanRow['NameSponsors'] || '').toString().trim();
    const Sum = (cleanRow['Sum'] || '').toString().trim();
    const PayDate = (cleanRow['PayDate'] || '').toString().trim();

    // Calculate Age
    let Age: number | undefined;
    if (BirthDateSwimmers) {
      const currentYear = new Date().getFullYear();
      const birthYear = BirthDateSwimmers.getFullYear();
      Age = currentYear - birthYear;
    }

    return {
      CompID,
      CompDate,
      Сountry,
      City,
      StyleID,
      Style,
      Distance,
      ResTime,
      DisqID,
      Reason,
      Term,
      SwimmerId,
      NameSwimmer,
      GenderSwimmer,
      BirthDateSwimmers,
      'BirthDateSwimmers (copy)_818529261980127232': BirthDateSwimmers_copy_818529261980127232,
      CareerStartSwimmers,
      RankSwimmers,
      CountrySwimmers,
      DopingRec,
      TrainerID,
      NameTrainer,
      GenderTrainer,
      RankTrainer,
      CareerStartTrainer,
      SponsID,
      NameSponsors,
      Sum,
      PayDate,
      Age
    };
  } catch (error) {
    console.error('Error parsing row:', error, row);
    return null;
  }
}

/**
 * Aggregate data by RankSwimmers and RankTrainer for the heatmap/ranked bar chart
 */
export function aggregateByRank(data: SwimmerData[]): AggregatedByRank[] {
  const aggregation = new Map<string, AggregatedByRank>();

  data.forEach(row => {
    const key = `${row.RankSwimmers}|${row.RankTrainer}`;
    const existing = aggregation.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      aggregation.set(key, {
        RankSwimmers: row.RankSwimmers || 'Unknown',
        RankTrainer: row.RankTrainer || 'Unknown',
        count: 1
      });
    }
  });

  return Array.from(aggregation.values());
}

/**
 * Aggregate data by Country for the packed bubble chart
 */
export function aggregateByCountry(data: SwimmerData[]): AggregatedByCountry[] {
  const aggregation = new Map<string, number>();

  data.forEach(row => {
    const country = row.Сountry || 'Unknown';
    aggregation.set(country, (aggregation.get(country) || 0) + 1);
  });

  return Array.from(aggregation.entries()).map(([Сountry, count]) => ({
    Сountry,
    count
  }));
}

/**
 * Aggregate data by Age and Gender for the stacked bar chart
 */
export function aggregateByAge(data: SwimmerData[]): AggregatedByAge[] {
  const aggregation = new Map<string, AggregatedByAge>();

  data.forEach(row => {
    if (row.Age === undefined) return;

    const gender = row.GenderSwimmer || 'Unknown';
    const key = `${row.Age}|${gender}`;
    const existing = aggregation.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      aggregation.set(key, {
        Age: row.Age,
        GenderSwimmer: gender,
        count: 1
      });
    }
  });

  return Array.from(aggregation.values());
}

/**
 * Filter data based on current filter state
 */
export function filterData(
  data: SwimmerData[],
  filters: {
    selectedRankSwimmer?: string | null;
    selectedRankTrainer?: string | null;
    selectedCountrySwimmers?: string[];
    selectedCompCountry?: string[];
  }
): SwimmerData[] {
  return data.filter(row => {
    // Filter by RankSwimmer
    if (filters.selectedRankSwimmer && row.RankSwimmers !== filters.selectedRankSwimmer) {
      return false;
    }

    // Filter by RankTrainer
    if (filters.selectedRankTrainer && row.RankTrainer !== filters.selectedRankTrainer) {
      return false;
    }

    // Filter by CountrySwimmers
    if (filters.selectedCountrySwimmers && filters.selectedCountrySwimmers.length > 0) {
      if (!filters.selectedCountrySwimmers.includes(row.CountrySwimmers)) {
        return false;
      }
    }

    // Filter by Competition Country
    if (filters.selectedCompCountry && filters.selectedCompCountry.length > 0) {
      if (!filters.selectedCompCountry.includes(row.Сountry)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get unique values for a field
 */
export function getUniqueValues(data: SwimmerData[], field: keyof SwimmerData): string[] {
  const values = new Set<string>();
  data.forEach(row => {
    const value = row[field];
    if (value !== null && value !== undefined && value !== '') {
      values.add(String(value));
    }
  });
  return Array.from(values).sort();
}
