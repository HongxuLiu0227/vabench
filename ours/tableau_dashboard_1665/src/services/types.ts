export interface DataRow {
  artist: string;
  "13 Years Old": number;
  "12 Years Old": number;
  "11 Years Old": number;
  "10 Years Old": number;
  "9 Years Old": number;
  "8 Years Old": number;
  "7 Years Old": number;
  "6 Years Old": number;
  "5 Years Old": number;
  "4 Years Old": number;
  "3 Years Old": number;
  "2 Years Old": number;
  "1 Years Old": number;
  "Year Born": number;
  "Recognition by Millennials": number;
  "Recognition by Gen-Zs": number;
  "No. of Songs": number;
  "Calculation_788129974626648065": number;
}

export interface PRecognizabilityData {
  artist: string;
  measureName: string;
  value: number;
}

export interface ScatterDataPoint {
  artist: string;
  noOfSongs: number;
  recognizability: number;
  measureName: string;
}

export interface ComparisonDataPoint {
  measureName: string;
  value: number;
  artist?: string;
}

export type SelectedArtist = string | null;
