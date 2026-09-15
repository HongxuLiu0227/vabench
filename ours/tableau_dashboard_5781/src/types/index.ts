// Primary data source: Model Performance data
export interface ModelPerformanceRow {
  'color_ID': string
  'LaunchDate_ID': string
  'merchant_ID': string
  'month_ID': string
  'Season_ID': string
  'CumulativeUnits': number
  'Solid_Flag.Non.Solid': number
  'totalsales_1W': number
  'totalsales_2W': number
  'totalsales_3W': number
  'units_1W': number
  'units_2W': number
  'units_3W': number
  'launched_2M': number
  'launched_3M': number
  'cluster.1': number
  'cluster.2': number
  'avgprice': number
  'launched_1M': number
  'relativeprice': number
  'Linear Preds': number
  'Randomforest Preds': number
  'XGBoost Preds': number
  'Bagging Preds': number
}

// Secondary data source: Cluster Profiles data
export interface ClusterProfileRow {
  'COLOR_DESCRIPTION': string
  'count_sku': number
  'count_styles': number
  'count_merchantclass': number
  'totalsales': number
  'units': number
  'total_margins': number
  'avg_margins': number
  'avg_price': number
  'cluster': number
}

// Calculated field types
export type ModelParameter = 'Linear Regression' | 'Decision Tree' | 'Random Forest ' | 'XGBoost'
export type TrainTest = 'Train Accuracy' | 'Test Accuracy'
export type MAECategory = 'Low Variance' | 'Medium Variance' | 'High Variance' | 'LOW Varaince'
export type ClusterLabel = 'Cluster-1' | 'Cluster-2' | 'Cluster-3'

// Filter types
export type SeasonFilter = string
export type SolidFlagFilter = number; // 0 = Solid, 1 = Non-Solid

// Dashboard state
export interface DashboardState {
  // Parameters
  trainTest: TrainTest
  model: ModelParameter

  // Filters
  solidFlag: SolidFlagFilter
  season: SeasonFilter
  clusters: string[]
  merchants: string[]
  months: string[]

  // Actions
  setTrainTest: (value: TrainTest) => void
  setModel: (value: ModelParameter) => void
  setSolidFlag: (value: SolidFlagFilter) => void
  setSeason: (value: SeasonFilter) => void
  setClusters: (value: string[]) => void
  setMerchants: (value: string[]) => void
  setMonths: (value: string[]) => void
}

// Highlight state for interactions
export interface HighlightState {
  selectedCluster: string | null
  selectedMAECategory: MAECategory | null
  selectedColorDescription: string | null
  setSelectedCluster: (cluster: string | null) => void
  setSelectedMAECategory: (category: MAECategory | null) => void
  setSelectedColorDescription: (description: string | null) => void
  clearHighlights: () => void
}

// Chart data types
export interface BarChartData {
  category: string
  value: number
  cluster?: number
}

export interface ScatterPlotData {
  x: number; // Actuals
  y: number; // Predictions
  mae: number
  maeCategory: MAECategory
  colorId: string
  merchantId: string
  cluster: ClusterLabel
  season: string
  month: string
}

export interface TableData {
  key: string
  value: number | string
}
