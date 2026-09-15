import * as d3 from 'd3';
import type { MovieData, StudioAggregation, StudioYearAggregation } from '../types';

const DATA_URL = '/data/NewMostMovie5.csv';

let cachedData: MovieData[] | null = null;

export async function loadData(): Promise<MovieData[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    let csvText = await response.text();

    // Remove UTF-8 BOM if present (EF BB BF)
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }

    // Normalize CSV headers by stripping quotes/extra whitespace
    // Split into lines to access and normalize the header row
    const lines = csvText.split('\n');
    if (lines.length > 0) {
      // Normalize header row: strip triple quotes, double quotes, and extra whitespace
      // This handles patterns like: headers.map or replace(/^["']+|["']+$)/g
      const headers = lines[0].split(',');
      lines[0] = headers
        .map((header: string) => {
          // Remove BOM character if present at start
          let h = header.replace(/^\uFEFF/, '');
          // Strip triple quotes ("""...""") - handles startsWith('"""') pattern
          if (h.startsWith('"""') && h.endsWith('"""')) {
            h = h.slice(3, -3);
          }
          // Strip any remaining leading/trailing double quotes
          h = h.replace(/^"+|"+$/g, '');
          // Trim whitespace
          return h.trim();
        })
        .join(',');
    }
    const normalizedCsvText = lines.join('\n');

    const parsedData = d3.csvParse(normalizedCsvText, (row) => {
      // After header normalization, values are already clean
      // Just trim any remaining whitespace from values
      return {
        ranks: Number(row.ranks) || 0,
        titles: (row.titles || '').trim(),
        studios: (row.studios || '').trim(),
        gross: Number(row.gross) || 0,
        years: row.years ? new Date(row.years.trim()) : new Date()
      };
    });

    cachedData = parsedData.filter(d => d.studios && !isNaN(d.gross));
    return cachedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

export function filterByYearRange(data: MovieData[], startYear: number, endYear: number): MovieData[] {
  return data.filter(d => {
    const year = d.years.getFullYear();
    return year >= startYear && year <= endYear;
  });
}

export function filterByStudio(data: MovieData[], studio: string | null): MovieData[] {
  if (!studio) return data;
  return data.filter(d => d.studios === studio);
}

export function aggregateByStudio(data: MovieData[]): StudioAggregation[] {
  const grouped = d3.group(data, d => d.studios);

  return Array.from(grouped, ([studio, movies]) => {
    const totalGross = d3.sum(movies, d => d.gross);
    return {
      studio,
      avgGross: totalGross / movies.length,
      count: movies.length
    };
  }).sort((a, b) => b.avgGross - a.avgGross);
}

export function aggregateByStudioAndYear(data: MovieData[]): StudioYearAggregation[] {
  const grouped = d3.group(data, d => `${d.studios}-${d.years.getFullYear()}`);

  return Array.from(grouped, ([key, movies]) => {
    const [studio, yearStr] = key.split('-');
    const year = Number(yearStr);
    const totalGross = d3.sum(movies, d => d.gross);
    return {
      studio,
      year,
      avgGross: totalGross / movies.length,
      count: movies.length
    };
  }).sort((a, b) => b.avgGross - a.avgGross);
}

export function getStudioOrder(data: MovieData[]): string[] {
  const aggregations = aggregateByStudio(data);
  return aggregations.map(a => a.studio);
}

export function getStudioYearOrder(data: MovieData[]): Array<{ studio: string; year: number }> {
  const aggregations = aggregateByStudioAndYear(data);

  // Group by studio to get studio order
  const studioAggs = aggregateByStudio(data);
  const studioOrder = studioAggs.map(a => a.studio);

  // Sort by studio order, then by year descending
  const result: Array<{ studio: string; year: number }> = [];
  studioOrder.forEach(studio => {
    const studioYears = aggregations
      .filter(a => a.studio === studio)
      .sort((a, b) => a.year - b.year); // Years ascending within studio
    studioYears.forEach(sy => {
      result.push({ studio: sy.studio, year: sy.year });
    });
  });

  return result;
}
