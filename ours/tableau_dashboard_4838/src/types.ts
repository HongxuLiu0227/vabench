export interface TelcoRecord {
  customerID: string;
  gender: 'Male' | 'Female';
  SeniorCitizen: 0 | 1;
  Partner: 'Yes' | 'No';
  Dependents: 'Yes' | 'No';
  tenure: number;
  PhoneService: 'Yes' | 'No';
  MultipleLines: 'Yes' | 'No' | 'No phone service';
  InternetService: 'DSL' | 'Fiber optic' | 'No';
  OnlineSecurity: 'Yes' | 'No' | 'No internet service';
  OnlineBackup: 'Yes' | 'No' | 'No internet service';
  DeviceProtection: 'Yes' | 'No' | 'No internet service';
  TechSupport: 'Yes' | 'No' | 'No internet service';
  StreamingTV: 'Yes' | 'No' | 'No internet service';
  StreamingMovies: 'Yes' | 'No' | 'No internet service';
  Contract: 'Month-to-month' | 'One year' | 'Two year';
  PaperlessBilling: 'Yes' | 'No';
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number;
  Churn: 'Yes' | 'No';
}

export interface BarChartData {
  category: string;
  value: number;
}

export interface PieChartData {
  category: string;
  value: number;
  percentage: number;
}

export interface HighlightState {
  dimension: string | null;
  value: string | null;
}

export interface WorksheetZone {
  x: number;
  y: number;
  w: number;
  h: number;
  aspect_ratio?: number;
  normalized?: {
    x_ratio: number;
    y_ratio: number;
    w_ratio: number;
    h_ratio: number;
  };
}

export interface DashboardTextZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  text_runs: Array<{
    text: string;
    style: {
      bold?: string;
      fontalignment?: string;
      fontcolor?: string;
      fontname?: string;
      fontsize?: string;
    };
  }>;
}
