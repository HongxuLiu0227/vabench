export interface HRData {
  'Average Montly Hours': number;
  'Last Evaluation': number;
  'Left': number; // 0 or 1
  'Number Project': number;
  'Promotion Last 5Years': number;
  'Salary': string;
  'Sales': string; // Department
  'Satisfaction Level': number;
  'Time Spend Company': number;
  'Work accident': number;
}

export interface BinnedData {
  bin: string;
  count: number;
}

export interface AggregatedData {
  category: string;
  value: number;
  series?: string;
}

export interface FilterState {
  sales?: string;
  timeSpendCompany?: number;
  numberProject?: number;
  left?: number;
}
