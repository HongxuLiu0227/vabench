import type { ModelPerformanceRow, ModelParameter, MAECategory, ClusterLabel } from '../types'


/**
 * Calculate Observed value: Math.exp(row.CumulativeUnits)
 */
export function calculateObserved(row: ModelPerformanceRow): number {
  return Math.exp(row['CumulativeUnits'])
}

/**
 * Get Model Parameter (Prediction) based on selected model
 */
export function getModelParameter(row: ModelPerformanceRow, model: ModelParameter): number {
  switch (model) {
    case 'Linear Regression':
      return row['Linear Preds']
    case 'Decision Tree':
      return row['Bagging Preds']
    case 'Random Forest ':
      return row['Randomforest Preds']
    case 'XGBoost':
      return row['XGBoost Preds']
    default:
      return row['Linear Preds']
  }
}

/**
 * Calculate MAE (Mean Absolute Error): |Observed - ModelParameter|
 */
export function calculateMAE(row: ModelPerformanceRow, model: ModelParameter): number {
  const observed = calculateObserved(row)
  const prediction = getModelParameter(row, model)
  return Math.abs(observed - prediction)
}

/**
 * Calculate Color - MAE category
 * - If MAE < 150: "Low Variance"
 * - If MAE < 280: "Medium Variance"
 * - Else: "High Variance"
 */
export function calculateMAECategory(mae: number): MAECategory {
  if (mae < 150) return 'Low Variance'
  if (mae < 280) return 'Medium Variance'
  return 'High Variance'
}

/**
 * Calculate Cluster Label
 * - If cluster.1 === 1: "Cluster-1"
 * - If cluster.2 === 1: "Cluster-2"
 * - Else: "Cluster-3"
 */
export function calculateClusterLabel(row: ModelPerformanceRow): ClusterLabel {
  if (row['cluster.1'] === 1) return 'Cluster-1'
  if (row['cluster.2'] === 1) return 'Cluster-2'
  return 'Cluster-3'
}

/**
 * Get Solid Flag label
 * - 0 = Solid
 * - 1 = Non-Solid
 */
export function getSolidFlagLabel(value: number): string {
  return value === 0 ? 'Solid' : 'Non-Solid'
}

/**
 * Check if a row matches the current filters
 */
export function rowMatchesFilters(
  row: ModelPerformanceRow,
  solidFlag: number,
  season: string,
  clusters: string[],
  merchants: string[],
  months: string[]
): boolean {
  // Check solid flag
  if (row['Solid_Flag.Non.Solid'] !== solidFlag) return false

  // Check season
  if (row['Season_ID'] !== season) return false

  // Check cluster
  const clusterLabel = calculateClusterLabel(row)
  if (clusters.length > 0 && !clusters.includes(clusterLabel)) return false

  // Check merchant
  if (merchants.length > 0 && !merchants.includes(row['merchant_ID'])) return false

  // Check month
  if (months.length > 0 && !months.includes(row['month_ID'])) return false

  return true
}

/**
 * Get unique values from a column
 */
export function getUniqueValues<T>(data: T[], column: keyof T): string[] {
  const values = new Set<string>()
  data.forEach((row) => {
    const value = String(row[column])
    values.add(value)
  })
  return Array.from(values).sort()
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Get MAE color for visualization
 */
export function getMAEColor(category: MAECategory): string {
  switch (category) {
    case 'Low Variance':
    case 'LOW Varaince':
      return '#59a14f'
    case 'Medium Variance':
      return '#f28e2b'
    case 'High Variance':
      return '#e15759'
    default:
      return '#bab0ac'
  }
}

/**
 * Get cluster color for visualization
 */
export function getClusterColor(cluster: number): string {
  switch (cluster) {
    case 1:
      return '#4e79a7'
    case 2:
      return '#f28e2b'
    case 3:
      return '#e15759'
    default:
      return '#bab0ac'
  }
}
