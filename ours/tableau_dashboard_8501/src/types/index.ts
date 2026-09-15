export interface PlayerData {
  Name: string;
  Age: number;
  Nationality: string;
  Overall: number;
  Potential: number;
  Club: string;
  Value: string;
  Wage: string;
  Position: string;
  'Preferred Foot': string;
  ID: number;
  [key: string]: string | number;
}

export interface PositionStats {
  position: string;
  minAge: number;
  maxAge: number;
  avgAge: number;
  count: number;
  minPlayer?: PlayerData;
  maxPlayer?: PlayerData;
}

export type FilterState = {
  selectedPosition: string | null;
  selectedWorksheet: string | null;
};

export type SelectionState = {
  worksheet: string;
  position: string;
} | null;
