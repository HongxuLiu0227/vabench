/**
 * Data record interface matching the CSV schema
 */
export interface DataRecord {
  '#': number;
  Filename: string;
  'File extension': string;
  Path: string;
  Size: number;
  'Date created': string;
}

/**
 * Aggregated data for Sheet 1 (by file extension)
 */
export interface Sheet1Data {
  extension: string;
  minSize: number;
}

/**
 * Aggregated data for Sheet 2 (by year and quarter)
 */
export interface Sheet2Data {
  year: number;
  quarter: number;
  minId: number;
}

/**
 * Year-specific data for coloring in Sheet 2
 */
export interface Sheet2YearData {
  year: number;
  minId: number;
}
