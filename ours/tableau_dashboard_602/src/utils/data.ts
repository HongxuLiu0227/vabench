import { csvParse } from 'd3-dsv';

export interface InsuranceRow {
  Age: number;
  Gender: 'Male' | 'Female';
  'Set 1': string;
  '6-month premium': number;
}

export interface AgeGroupData {
  age: number;
  avgPremium: number;
}

export interface GenderAgeData {
  age: number;
  gender: 'Male' | 'Female';
  premium: number;
}

/**
 * Normalize CSV headers by removing BOM, quotes, and extra whitespace
 * This handles dirty CSV exports that may include:
 * - Byte Order Mark (BOM) characters
 * - Quoted column names (e.g., "Age" or ""Age"")
 * - Leading/trailing whitespace
 */
const normalizeHeader = (header: string): string => {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^["']+|["']+$/g, '') // Remove surrounding quotes
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Normalize all headers in a d3-dsv parsed row object
 * Returns a new object with clean header names
 */
const normalizeRowHeaders = (row: d3.DSVRowString): Record<string, string> => {
  const normalized: Record<string, string> = {};
  Object.keys(row).forEach((key) => {
    const normalizedKey = normalizeHeader(key);
    normalized[normalizedKey] = row[key];
  });
  return normalized;
};

export const loadData = async (): Promise<InsuranceRow[]> => {
  const response = await fetch('/data/1InsuranceRates.csv');
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.statusText}`);
  }
  const csvText = await response.text();

  const parsedData = csvParse(csvText);

  const data = parsedData
    .map((d) => {
      // Normalize headers to handle BOM, quotes, and whitespace
      const normalizedRow = normalizeRowHeaders(d);

      const age = Number(normalizedRow.Age);
      const gender = normalizedRow.Gender?.trim() as 'Male' | 'Female';
      const set1 = normalizedRow['Set 1']?.trim() || `${age}-${gender}`;
      const premium = Number(normalizedRow['6-month premium']);

      if (isNaN(age) || !gender || isNaN(premium)) {
        return null;
      }

      return {
        Age: age,
        Gender: gender,
        'Set 1': set1,
        '6-month premium': premium,
      } as InsuranceRow;
    })
    .filter((row): row is InsuranceRow => row !== null);

  return data;
};

export const groupByAge = (data: InsuranceRow[]): AgeGroupData[] => {
  const ageMap = new Map<number, { sum: number; count: number }>();

  data.forEach((row) => {
    const existing = ageMap.get(row.Age);
    if (existing) {
      existing.sum += row['6-month premium'];
      existing.count += 1;
    } else {
      ageMap.set(row.Age, { sum: row['6-month premium'], count: 1 });
    }
  });

  return Array.from(ageMap.entries())
    .map(([age, { sum, count }]) => ({
      age,
      avgPremium: sum / count,
    }))
    .sort((a, b) => a.age - b.age);
};

export const groupByAgeAndGender = (data: InsuranceRow[]): GenderAgeData[] => {
  return data
    .map((row) => ({
      age: row.Age,
      gender: row.Gender,
      premium: row['6-month premium'],
    }))
    .sort((a, b) => a.age - b.age);
};

export const getUniqueGenders = (data: InsuranceRow[]): ('Male' | 'Female')[] => {
  const genders = new Set(data.map((d) => d.Gender));
  return Array.from(genders).sort() as ('Male' | 'Female')[];
};

export const getUniqueAges = (data: InsuranceRow[]): number[] => {
  const ages = new Set(data.map((d) => d.Age));
  return Array.from(ages).sort((a, b) => a - b);
};
