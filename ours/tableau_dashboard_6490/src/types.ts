export interface DataRow {
  '': number;
  Post: string;
  TRUE: number;
  Predicted: number;
  'True Label': string;
  'Predicted Label': string;
  Predicted_XY: number;
  True_XY: number;
  F1: number;
}

export interface FilterState {
  trueLabel: string | null;
  predictedLabel: string | null;
}

export interface ConfusionMatrixCell {
  trueLabel: string;
  predictedLabel: string;
  count: number;
  percentage: number;
}

export interface ScatterPoint {
  x: number;
  y: number;
  predictedLabel: string;
  trueLabel: string;
  f1: number;
  post: string;
}
