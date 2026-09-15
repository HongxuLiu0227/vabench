import { csvParse } from 'd3-dsv';
import type { LibraryData, RegionSummary, CountryDetail } from '../types/libraryData';

const normalizeHeaderName = (value: string): string => {
  let text = (value || '').replace('\ufeff', '').trim();
  // Remove surrounding quotes if present
  const quoteChars = new Set(['"', "'"]);
  while (text.length >= 2 && text[0] === text[text.length - 1] && quoteChars.has(text[0])) {
    text = text.slice(1, -1).trim();
  }
  // Normalize whitespace (including newlines) to single spaces
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

const parseNumber = (value: string): number | null => {
  if (value === '' || value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

export const fetchData = async (): Promise<LibraryData[]> => {
  const response = await fetch('/data/Global Library Data_ST_Blanks_Country_Data.csv');
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  const csvText = await response.text();
  const rawData = csvParse(csvText);

  // Build a map of normalized header names to raw keys
  const headerMap = new Map<string, string>();
  if (rawData.length > 0) {
    const firstRow = rawData[0] as { [key: string]: string };
    for (const key of Object.keys(firstRow)) {
      const normalized = normalizeHeaderName(key);
      headerMap.set(normalized, key);
    }
  }

  // Helper function to get field value with fallback to normalized header
  const getFieldValue = (row: { [key: string]: string }, normalizedFieldName: string): string => {
    // Try exact match first
    if (row[normalizedFieldName] !== undefined) {
      return row[normalizedFieldName];
    }
    // Try normalized header lookup
    const rawKey = headerMap.get(normalizedFieldName);
    if (rawKey && row[rawKey] !== undefined) {
      return row[rawKey];
    }
    // Try with BOM prefix
    const bomKey = '\uFEFF' + normalizedFieldName;
    if (row[bomKey] !== undefined) {
      return row[bomKey];
    }
    return '';
  };

  return rawData.map((d: { [key: string]: string }) => ({
    Country: getFieldValue(d, 'Country'),
    Region: getFieldValue(d, 'Region'),
    'Expenditures  (US Dollars)': parseNumber(getFieldValue(d, 'Expenditures (US Dollars)')),
    'Total Libraries': parseNumber(getFieldValue(d, 'Total Libraries')),
    'Total Librarians': parseNumber(getFieldValue(d, 'Total Librarians')),
    'Total Volumes': parseNumber(getFieldValue(d, 'Total Volumes')),
    'Total Users': parseNumber(getFieldValue(d, 'Total Users')),
  }));
};

export const aggregateByRegion = (data: LibraryData[]): RegionSummary[] => {
  const regionMap = new Map<string, number>();

  data.forEach((item) => {
    const region = item.Region;
    const libraries = item['Total Libraries'] || 0;
    regionMap.set(region, (regionMap.get(region) || 0) + libraries);
  });

  const summaries: RegionSummary[] = Array.from(regionMap.entries()).map(
    ([Region, totalLibraries]) => ({
      Region,
      'Total Libraries': totalLibraries,
    })
  );

  // Sort descending by Total Libraries
  return summaries.sort((a, b) => b['Total Libraries'] - a['Total Libraries']);
};

export const getCountryDetails = (
  data: LibraryData[],
  selectedRegion: string | null
): CountryDetail[] => {
  let filteredData = data;

  if (selectedRegion) {
    filteredData = data.filter((item) => item.Region === selectedRegion);
  }

  const details: CountryDetail[] = filteredData.map((item) => ({
    Country: item.Country,
    'Expenditures  (US Dollars)': item['Expenditures  (US Dollars)'] || 0,
    'Total Users': item['Total Users'] || 0,
    'Total Volumes': item['Total Volumes'] || 0,
  }));

  // Sort descending by Total Volumes
  return details.sort((a, b) => b['Total Volumes'] - a['Total Volumes']);
};

export const getAllRegions = (data: LibraryData[]): string[] => {
  const regions = new Set(data.map((item) => item.Region));
  return Array.from(regions).sort();
};
