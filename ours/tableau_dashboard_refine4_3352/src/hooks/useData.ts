import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import type { DataRecord, Sheet1Data, Sheet2Data } from '../types/data';
import { parseNormalizedCSV, validateFields } from '../utils/csvParser';

const DATA_URL = '/data/TableauTemp_06jfdtn1lakc5a1amq8mn12idbt8.csv';

// Required fields for validation
const REQUIRED_FIELDS = ['#', 'Filename', 'File extension', 'Path', 'Size', 'Date created'];

/**
 * Hook to fetch and parse CSV data
 * Returns loaded data, loading state, and error if any
 */
export function useData() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(DATA_URL);

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const csvText = await response.text();

        // Use the robust CSV parser with header normalization
        const parsedData = parseNormalizedCSV<DataRecord>(csvText, (row) => {
          // Parse and coerce numeric fields
          const id = row['#'];
          const size = row['Size'];

          return {
            '#': id ? Number(id) : 0,
            Filename: row['Filename'] || '',
            'File extension': row['File extension'] || '',
            Path: row['Path'] || '',
            Size: size ? Number(size) : 0,
            'Date created': row['Date created'] || '',
          };
        });

        // Validate that we have all required fields
        const validation = validateFields(parsedData, REQUIRED_FIELDS);
        if (!validation.valid) {
          throw new Error(
            `Missing required fields after parsing: ${validation.missing.join(', ')}`
          );
        }

        // Check for NaN values which indicate parsing issues
        const hasNaN = parsedData.some(d => isNaN(d['#']) || isNaN(d.Size));
        if (hasNaN) {
          console.warn('Some records contain NaN values after parsing');
        }

        setData(parsedData);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to aggregate data for Sheet 1
 * Groups by File extension and calculates MIN(Size)
 * Applies manual sort order: .wma, .mp3, .m4b
 */
export function useSheet1Data(data: DataRecord[]): Sheet1Data[] {
  const [sheet1Data, setSheet1Data] = useState<Sheet1Data[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setSheet1Data([]);
      return;
    }

    // Group by File extension and calculate MIN(Size)
    const grouped = Array.from(
      d3.group(data, (d) => d['File extension']).entries()
    ).map(([extension, records]) => ({
      extension,
      minSize: d3.min(records, (d) => d.Size) || 0,
    }));

    // Apply manual sort order from spec: .wma, .mp3, .m4b
    const manualOrder = ['.wma', '.mp3', '.m4b'];
    const sorted = grouped.sort((a, b) => {
      const indexA = manualOrder.indexOf(a.extension);
      const indexB = manualOrder.indexOf(b.extension);

      // If both are in manual order, use that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one is in manual order, it comes first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Otherwise, sort alphabetically
      return a.extension.localeCompare(b.extension);
    });

    setSheet1Data(sorted);
  }, [data]);

  return sheet1Data;
}

/**
 * Hook to aggregate data for Sheet 2
 * Groups by YEAR(Date created) and QUARTER(Date created)
 * Calculates MIN('#') for each group
 */
export function useSheet2Data(data: DataRecord[]): Sheet2Data[] {
  const [sheet2Data, setSheet2Data] = useState<Sheet2Data[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setSheet2Data([]);
      return;
    }

    // Parse dates and extract year/quarter
    const withYearQuarter = data.map((d) => {
      const date = new Date(d['Date created']);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      const quarter = Math.ceil(month / 3); // 1-4

      return {
        year,
        quarter,
        id: d['#'],
      };
    });

    // Group by year and quarter, calculate MIN('#')
    const grouped = Array.from(
      d3.group(withYearQuarter, (d) => `${d.year}-${d.quarter}`).entries()
    ).map(([key, records]) => {
      const [year, quarter] = key.split('-').map(Number);
      return {
        year,
        quarter,
        minId: d3.min(records, (d) => d.id) || 0,
      };
    });

    // Sort by year, then by quarter
    const sorted = grouped.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.quarter - b.quarter;
    });

    setSheet2Data(sorted);
  }, [data]);

  return sheet2Data;
}

/**
 * Hook to get year-specific data for Sheet 2 coloring
 */
export function useSheet2YearData(data: DataRecord[]): Sheet2Data[] {
  const [yearData, setYearData] = useState<Sheet2Data[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setYearData([]);
      return;
    }

    // Group by year and calculate MIN('#')
    const grouped = Array.from(
      d3.group(data, (d) => {
        const date = new Date(d['Date created']);
        return date.getFullYear();
      }).entries()
    ).map(([year, records]) => ({
      year: Number(year),
      minId: d3.min(records, (d) => d['#']) || 0,
    }));

    // Sort by year
    const sorted = grouped.sort((a, b) => a.year - b.year);

    setYearData(sorted);
  }, [data]);

  return yearData;
}
