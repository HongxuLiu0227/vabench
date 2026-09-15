import * as d3 from 'd3-dsv';
import type { DataRow, PRecognizabilityData, ScatterDataPoint, ComparisonDataPoint } from './types';

const DATA_URL = '/data/final_df.csv';

let cachedData: DataRow[] | null = null;

export async function loadData(): Promise<DataRow[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const csvText = await response.text();
    const rawData = d3.csvParse(csvText);

    // Parse numeric values
    const parsedData: DataRow[] = rawData.map((row: d3.DSVRowString) => {
      const parsedRow: Record<string, string | number> = { artist: row.artist };

      // Parse all age columns
      for (let i = 1; i <= 13; i++) {
        const key = `${i} Years Old`;
        parsedRow[key] = Number(row[key]) || 0;
      }

      // Parse other numeric fields
      parsedRow['Year Born'] = Number(row['Year Born']) || 0;
      parsedRow['Recognition by Millennials'] = Number(row['Recognition by Millennials']) || 0;
      parsedRow['Recognition by Gen-Zs'] = Number(row['Recognition by Gen-Zs']) || 0;
      parsedRow['No. of Songs'] = Number(row['No. of Songs']) || 0;

      // Add calculated field for Tableau compatibility
      // Calculation_788129974626648065 is used for color encoding in visualizations
      // Deriving it from Year Born as a base value
      parsedRow['Calculation_788129974626648065'] = parsedRow['Year Born'];

      return parsedRow as unknown as DataRow;
    });

    cachedData = parsedData;
    return parsedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Transform data for line chart (pivoted by age)
export function transformLineChartData(data: DataRow[]): PRecognizabilityData[] {
  const ageColumns = [
    'Year Born',
    '1 Years Old',
    '2 Years Old',
    '3 Years Old',
    '4 Years Old',
    '5 Years Old',
    '6 Years Old',
    '7 Years Old',
    '8 Years Old',
    '9 Years Old',
    '10 Years Old',
    '11 Years Old',
    '12 Years Old',
    '13 Years Old'
  ];

  const result: PRecognizabilityData[] = [];

  data.forEach((row) => {
    ageColumns.forEach((ageCol) => {
      result.push({
        artist: row.artist,
        measureName: ageCol,
        value: row[ageCol as keyof DataRow] as number
      });
    });
  });

  return result;
}

// Transform data for mean line chart
export function transformMeanLineChartData(
  data: DataRow[],
  selectedArtist: string | null
): { measureName: string; value: number }[] {
  const ageColumns = [
    'Year Born',
    '1 Years Old',
    '2 Years Old',
    '3 Years Old',
    '4 Years Old',
    '5 Years Old',
    '6 Years Old',
    '7 Years Old',
    '8 Years Old',
    '9 Years Old',
    '10 Years Old',
    '11 Years Old',
    '12 Years Old',
    '13 Years Old'
  ];

  const filteredData = selectedArtist
    ? data.filter((row) => row.artist === selectedArtist)
    : data;

  return ageColumns.map((ageCol) => {
    const sum = filteredData.reduce(
      (acc, row) => acc + (row[ageCol as keyof DataRow] as number),
      0
    );
    return {
      measureName: ageCol,
      value: sum / filteredData.length
    };
  });
}

// Transform data for scatter plot
export function transformScatterData(data: DataRow[]): ScatterDataPoint[] {
  const result: ScatterDataPoint[] = [];

  data.forEach((row) => {
    result.push({
      artist: row.artist,
      noOfSongs: row['No. of Songs'],
      recognizability: row['Recognition by Millennials'],
      measureName: 'Recognition by Millennials'
    });
    result.push({
      artist: row.artist,
      noOfSongs: row['No. of Songs'],
      recognizability: row['Recognition by Gen-Zs'],
      measureName: 'Recognition by Gen-Zs'
    });
  });

  return result;
}

// Transform data for comparison chart
export function transformComparisonData(
  data: DataRow[],
  selectedArtist: string | null
): ComparisonDataPoint[] {
  const filteredData = selectedArtist
    ? data.filter((row) => row.artist === selectedArtist)
    : data;

  const millennialsSum = filteredData.reduce(
    (acc, row) => acc + row['Recognition by Millennials'],
    0
  );
  const genZSum = filteredData.reduce(
    (acc, row) => acc + row['Recognition by Gen-Zs'],
    0
  );

  return [
    {
      measureName: 'Recognition by Millennials',
      value: millennialsSum / filteredData.length,
      artist: selectedArtist || undefined
    },
    {
      measureName: 'Recognition by Gen-Zs',
      value: genZSum / filteredData.length,
      artist: selectedArtist || undefined
    }
  ];
}

// Get unique artists sorted by number of songs (descending)
export function getSortedArtists(data: DataRow[]): string[] {
  return [...data]
    .sort((a, b) => b['No. of Songs'] - a['No. of Songs'])
    .map((row) => row.artist);
}

// Get artist color mapping
export function getArtistColor(artist: string): string {
  const colorScale: Record<string, string> = {
    'Ace Of Base': '#4e79a7',
    'Boyz II Men': '#4e79a7',
    'The Notorious B.I.G': '#4e79a7',
    'Madonna': '#59a14f',
    'Celine Dion': '#76b7b2',
    'Wilson Phillips': '#8cd17d',
    'Toni Braxton': '#9c755f',
    'Puff Daddy': '#9d7660',
    'Savage Garden': '#a0cbe8',
    'R. Kelly': '#b07aa1',
    'Color Me Badd': '#b6992d',
    'Whitney Houston': '#bab0ac',
    'Monica': '#d37295',
    'Phil Collins': '#d4a6c8',
    'Roxette': '#d7b5a6',
    'C+C Music Factory': '#e15759',
    'Janet Jackson': '#e15759',
    'Mariah Carey': '#edc948',
    'Michael Jackson': '#edc948',
    'En Vogue': '#f1ce63',
    'Bryan Adams': '#f28e2b',
    'Paula Abdul': '#fabfd2',
    'Michael Bolton': '#ff9d9a',
    'TLC': '#ff9da7',
    'Brandy': '#ffbe7d',
    'Usher': '#ffbe7d'
  };

  return colorScale[artist] || '#888888';
}

// Get all unique artists
export function getUniqueArtists(data: DataRow[]): string[] {
  return Array.from(new Set(data.map((row) => row.artist)));
}
