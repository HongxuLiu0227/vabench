/**
 * Type definitions for dashboard data
 */

export interface StockData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PredictionData {
  Date: Date;
  open: number;
  close: number;
  [key: string]: number | Date;
}

export interface ParsedCsvRow {
  [key: string]: string;
}
