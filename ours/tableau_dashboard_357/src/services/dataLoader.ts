/**
 * Data Loading Service
 * Handles fetching and parsing CSV data from the public/data directory
 */

export interface IrisDataRow {
  F1: number;  // Sepal Length
  F2: number;  // Sepal Width
  F3: number;  // Petal Length
  F4: number;  // Petal Width
  F5: string;  // Class
}

export interface TransformedData extends IrisDataRow {
  manualCluster: string;
  calculation1: boolean;
  tableauCluster: number;
  // Tableau-specific fields required by spec
  AdhocCluster: number;
  Calculation_539869044126969857: boolean;
  NumberofRecords: number;
}

/**
 * Normalize header by removing all levels of quotes and extra whitespace
 * Handles: "F1", ""F1"", """F1""", and any other quote variations
 */
function normalizeHeader(header: string): string {
  let normalized = header.trim();

  // Remove quotes from both ends repeatedly until no more quotes
  // This handles: "F1", ""F1"", """F1""", etc.
  while (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  // Replace remaining double-double-quotes with single quotes
  normalized = normalized.replace(/""/g, '"');

  return normalized;
}

/**
 * Parse CSV text into array of objects
 * Handles:
 * - BOM (Byte Order Mark)
 * - Triple-quoted headers ("""F1""","""F2""",...)
 * - Numeric field parsing with validation
 * - Proper header-to-column mapping
 */
async function parseCSV(csvText: string): Promise<IrisDataRow[]> {
  // Remove BOM from the start of the file if present
  let csvTextClean = csvText;
  if (csvTextClean.charCodeAt(0) === 0xFEFF) {
    csvTextClean = csvTextClean.slice(1);
  } else if (csvTextClean.startsWith('\uFEFF')) {
    csvTextClean = csvTextClean.slice(1);
  }

  const lines = csvTextClean.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse and normalize headers
  const headerLine = lines[0];
  const rawHeaders = headerLine.split(',');
  const headers = rawHeaders.map(h => normalizeHeader(h));

  // Validate expected headers
  const expectedHeaders = ['F1', 'F2', 'F3', 'F4', 'F5'];
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}. Found: ${headers.join(', ')}`);
  }

  // Find column indices for each field
  const colIndices: Record<string, number> = {};
  headers.forEach((header, index) => {
    colIndices[header] = index;
  });

  const data: IrisDataRow[] = [];
  let parseErrors = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');

    // Validate row has enough columns
    if (values.length < headers.length) {
      console.warn(`Row ${i}: Expected ${headers.length} columns, got ${values.length}`);
      parseErrors++;
      continue;
    }

    // Parse numeric fields with validation
    const f1 = parseFloat(values[colIndices['F1']] ?? '0');
    const f2 = parseFloat(values[colIndices['F2']] ?? '0');
    const f3 = parseFloat(values[colIndices['F3']] ?? '0');
    const f4 = parseFloat(values[colIndices['F4']] ?? '0');
    const f5 = (values[colIndices['F5']] ?? '').trim().replace(/^"|"$/g, '');

    // Validate numeric values
    if (isNaN(f1) || isNaN(f2) || isNaN(f3) || isNaN(f4)) {
      console.warn(`Row ${i}: Invalid numeric values - F1=${f1}, F2=${f2}, F3=${f3}, F4=${f4}`);
      parseErrors++;
      continue;
    }

    data.push({
      F1: f1,
      F2: f2,
      F3: f3,
      F4: f4,
      F5: f5
    });
  }

  if (data.length === 0) {
    throw new Error('No valid data rows found in CSV');
  }

  if (parseErrors > 0) {
    console.warn(`CSV parsing completed with ${parseErrors} errors out of ${lines.length - 1} data rows`);
  }

  console.log(`Successfully parsed ${data.length} rows from CSV`);

  return data;
}

/**
 * Manual cluster lookup based on (F3, F4) pairs
 * This replicates the "Petal Length & Petal Width (clusters)" calculation from Tableau
 */
function getManualCluster(f3: number, f4: number): string {
  // Iris-setosa clusters (small petals)
  const setosaPairs = [
    [1.4, 0.2], [1.3, 0.2], [1.5, 0.2], [1.4, 0.2], [1.7, 0.4],
    [1.4, 0.3], [1.5, 0.2], [1.4, 0.2], [1.5, 0.1], [1.5, 0.2],
    [1.6, 0.2], [1.4, 0.1], [1.1, 0.1], [1.2, 0.2], [1.5, 0.4],
    [1.3, 0.4], [1.4, 0.3], [1.7, 0.3], [1.5, 0.3], [1.7, 0.2],
    [1.9, 0.2], [1.6, 0.4], [1.6, 0.2], [1.5, 0.4], [1.4, 0.2],
    [1.6, 0.2], [1.6, 0.2], [1.5, 0.4], [1.5, 0.1], [1.4, 0.2],
    [1.5, 0.2], [1.5, 0.1], [1.5, 0.2], [1.3, 0.2], [1.4, 0.4],
    [1.5, 0.4], [1.3, 0.3], [1.4, 0.3], [1.5, 0.3], [1.4, 0.3],
    [1.5, 0.2], [1.4, 0.2], [1.5, 0.2], [1.4, 0.2], [1.3, 0.3],
    [1.5, 0.3]
  ];

  // Iris-versicolor clusters (medium petals)
  const versicolorPairs = [
    [4.7, 1.4], [4.5, 1.3], [4.9, 1.5], [4.0, 1.3], [4.6, 1.5],
    [4.5, 1.3], [4.7, 1.6], [3.3, 1.0], [4.6, 1.3], [3.9, 1.4],
    [4.6, 1.4], [4.7, 1.5], [3.6, 1.0], [3.9, 1.1], [4.4, 1.3],
    [4.5, 1.3], [4.4, 1.3], [4.8, 1.4], [4.0, 1.3], [4.5, 1.5],
    [3.5, 1.0], [3.8, 1.1], [4.3, 1.3], [4.1, 1.3], [4.4, 1.2],
    [4.0, 1.0], [4.5, 1.5], [3.9, 1.1], [4.2, 1.3], [4.2, 1.3],
    [4.3, 1.3], [4.1, 1.3], [4.3, 1.2], [4.3, 1.3], [4.5, 1.3],
    [3.8, 1.1], [4.0, 1.1], [4.0, 1.2], [4.1, 1.2], [4.2, 1.3],
    [3.3, 1.0], [4.2, 1.3], [4.0, 1.0], [4.3, 1.4], [4.1, 1.0],
    [4.5, 1.2], [3.9, 1.4], [4.6, 1.4], [3.7, 1.0], [4.2, 1.3]
  ];

  // Iris-virginica clusters (large petals)
  const virginicaPairs = [
    [6.0, 2.5], [5.1, 1.9], [5.9, 2.1], [5.6, 1.8], [5.8, 2.2],
    [6.6, 2.1], [4.5, 1.7], [6.3, 1.8], [5.8, 1.8], [6.1, 2.5],
    [5.1, 2.0], [5.3, 1.9], [5.5, 2.1], [5.0, 2.0], [5.1, 2.4],
    [5.3, 2.3], [5.5, 1.8], [6.7, 2.2], [6.9, 2.3], [5.0, 1.5],
    [5.7, 2.3], [4.9, 2.0], [6.7, 2.0], [4.9, 1.8], [5.7, 2.1],
    [5.0, 2.3], [6.0, 1.8], [6.1, 2.4], [5.6, 2.1], [5.9, 1.8],
    [6.0, 2.0], [6.1, 1.8], [6.3, 1.6], [5.8, 1.9], [6.0, 2.4],
    [5.9, 2.1], [5.6, 1.8], [5.8, 2.2], [6.1, 1.6], [6.0, 1.9],
    [6.7, 2.0], [5.6, 2.2], [5.8, 1.9], [5.7, 2.1], [5.6, 2.4],
    [5.8, 2.2], [5.4, 2.3], [6.0, 2.5], [6.0, 1.8], [5.6, 2.1]
  ];

  // Check Iris-setosa
  for (const pair of setosaPairs) {
    if (Math.abs(f3 - pair[0]) < 0.01 && Math.abs(f4 - pair[1]) < 0.01) {
      return 'Iris-setosa';
    }
  }

  // Check Iris-versicolor
  for (const pair of versicolorPairs) {
    if (Math.abs(f3 - pair[0]) < 0.01 && Math.abs(f4 - pair[1]) < 0.01) {
      return 'Iris-versicolor';
    }
  }

  // Check Iris-virginica
  for (const pair of virginicaPairs) {
    if (Math.abs(f3 - pair[0]) < 0.01 && Math.abs(f4 - pair[1]) < 0.01) {
      return 'Iris-virginica';
    }
  }

  return 'Not Clustered';
}

/**
 * Calculate K-Means clustering (k=3) on F3 and F4 values
 */
function calculateKMeans(data: IrisDataRow[]): number[] {
  const points = data.map(d => [d.F3, d.F4]);

  // Simple K-Means implementation (k=3)
  const k = 3;
  let centroids: number[][] = [];

  // Initialize centroids using first k data points
  for (let i = 0; i < k; i++) {
    centroids.push([...points[i]]);
  }

  const assignments = new Array(data.length).fill(0);
  const maxIterations = 100;
  let iteration = 0;
  let converged = false;

  while (!converged && iteration < maxIterations) {
    // Assign points to nearest centroid
    const newAssignments = points.map(point => {
      let minDist = Infinity;
      let assignment = 0;
      centroids.forEach((centroid, i) => {
        const dist = Math.sqrt(
          Math.pow(point[0] - centroid[0], 2) +
          Math.pow(point[1] - centroid[1], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          assignment = i;
        }
      });
      return assignment;
    });

    // Check for convergence
    converged = newAssignments.every((a, i) => a === assignments[i]);
    if (!converged) {
      newAssignments.forEach((a, i) => assignments[i] = a);

      // Update centroids
      centroids = centroids.map((_, clusterIndex) => {
        const clusterPoints = points.filter((_, i) => assignments[i] === clusterIndex);
        if (clusterPoints.length === 0) return centroids[clusterIndex];

        const mean = [
          clusterPoints.reduce((sum, p) => sum + p[0], 0) / clusterPoints.length,
          clusterPoints.reduce((sum, p) => sum + p[1], 0) / clusterPoints.length
        ];
        return mean;
      });
    }
    iteration++;
  }

  // Map cluster assignments to 1-based IDs
  return assignments.map(a => a + 1);
}

/**
 * Transform raw data by adding calculated fields
 */
function transformData(data: IrisDataRow[]): TransformedData[] {
  // Calculate K-Means clusters
  const tableauClusters = calculateKMeans(data);

  return data.map((row, index) => {
    const manualCluster = getManualCluster(row.F3, row.F4);
    const calculation1 = manualCluster === row.F5;
    const tableauCluster = tableauClusters[index];

    return {
      ...row,
      manualCluster,
      calculation1,
      tableauCluster,
      // Tableau-specific fields required by spec
      AdhocCluster: tableauCluster,
      Calculation_539869044126969857: calculation1,
      NumberofRecords: 1
    };
  });
}

/**
 * Main data loading function
 * Fetches CSV from public/data and returns transformed data
 */
export async function loadIrisData(): Promise<TransformedData[]> {
  try {
    const response = await fetch('/data/TEMP_0ufyovf1yz1z5e10183zt00hd8o2.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const rawData = await parseCSV(csvText);
    const transformedData = transformData(rawData);

    return transformedData;
  } catch (error) {
    console.error('Error loading iris data:', error);
    throw error;
  }
}
