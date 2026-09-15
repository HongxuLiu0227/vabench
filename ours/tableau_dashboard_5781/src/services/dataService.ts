import { csvParse } from 'd3-dsv';
import type { ModelPerformanceRow, ClusterProfileRow } from '../types'


/**
 * TABLEAU DATA SOURCE MAPPING
 *
 * This service handles deterministic ingestion of Tableau dashboard data sources.
 *
 * Primary Data Sources:
 * - TEMP_0enkxox0ducr1y1f3m1ij0v8zhav.csv: Model Performance data
 *   Contains: color_ID, LaunchDate_ID, merchant_ID, month_ID, Season_ID,
 *             CumulativeUnits, predictions (Linear Preds, Randomforest Preds, etc.)
 *
 * - TEMP_18y7hw40viidyy134x5u807v8m5r.csv: Cluster Profile data
 *   Contains: COLOR_DESCRIPTION, count_sku, count_styles, count_merchantclass,
 *             totalsales, units, margins, cluster
 *
 * IMPORTANT: Calculation_* Fields
 * Fields named "Calculation_[HASH]" (e.g., Calculation_1057431142530928640) are
 * Tableau-generated computed fields that do NOT exist in the raw CSV files.
 * These are derived fields created by Tableau's calculation engine and are
 * computed at runtime from the base CSV columns.
 *
 * Header Normalization:
 * CSV files use triple-quoted headers (e.g., """FieldName""") which are
 * automatically normalized to clean column names during parsing.
 */

// FIXED: Correct data paths (were previously swapped)
// TEMP_0enkxox0ducr1y1f3m1ij0v8zhav.csv contains Model Performance data (color_ID, LaunchDate_ID, etc.)
// TEMP_18y7hw40viidyy134x5u807v8m5r.csv contains Cluster Profile data (COLOR_DESCRIPTION, count_sku, etc.)
const DATA_PATHS = {
  modelPerformance: '/data/TEMP_0enkxox0ducr1y1f3m1ij0v8zhav.csv',
  clusterProfiles: '/data/TEMP_18y7hw40viidyy134x5u807v8m5r.csv',
}

/**
 * Remove BOM (Byte Order Mark) from text.
 * CSV files may start with a BOM character that can interfere with parsing.
 */
function removeBOM(text: string): string {
  // Remove UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1)
  }
  // Also check for the actual BOM character
  if (text.startsWith('\uFEFF')) {
    return text.slice(1)
  }
  return text
}

/**
 * Clean column names by removing triple quotes and normalizing.
 * Handles: """ColumnName""" -> ColumnName
 */
function cleanColumnName(name: string): string {
  return name
    .replace(/^"""/g, '')    // Remove leading triple quotes
    .replace(/"""$/g, '')    // Remove trailing triple quotes
    .replace(/^"/g, '')      // Remove leading single quote
    .replace(/"$/g, '')      // Remove trailing single quote
    .trim()                  // Remove any whitespace
}

/**
 * Detect and skip preamble rows before the actual CSV header
 * Returns the index of the real header row
 */
function findHeaderRow(lines: string[]): number {
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim()
    // Skip empty lines
    if (!line) continue

    // Check if this line looks like a header (has triple-quoted column names)
    // A valid header should have multiple comma-separated values with triple quotes
    const hasTripleQuotedColumns = line.split(',').some(col =>
      col.trim().startsWith('"""') || col.trim().startsWith('"')
    )

    if (hasTripleQuotedColumns) {
      return i
    }
  }
  // Default to first line if no clear header found
  return 0
}

/**
 * Parse CSV with improved handling for:
 * - BOM characters
 * - Preamble rows before header
 * - Triple-quoted column names
 * - Numeric value conversion
 * - Data quality validation
 */
function parseCSV<T>(text: string): T[] {
  // Remove BOM if present
  const cleanText = removeBOM(text)

  // Validate input is not empty
  if (!cleanText || cleanText.trim().length === 0) {
    throw new Error('CSV text is empty after BOM removal')
  }

  // Split into lines and find the real header
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim())
  const headerRowIndex = findHeaderRow(lines)

  if (headerRowIndex >= lines.length) {
    throw new Error('Could not find valid CSV header')
  }

  // Skip preamble rows and parse only the data portion
  const dataText = lines.slice(headerRowIndex).join('\n')

  // Additional validation: check for common CSV parsing issues
  const parsed = csvParse(dataText)

  if (parsed.length === 0) {
    throw new Error('CSV parsing produced no data rows')
  }

  // Track data quality issues
  let rowsWithEmptyValues = 0
  let rowsWithInvalidNumbers = 0

  const result = parsed.map((row, rowIndex) => {
    const cleanedRow: Record<string, string | number> = {}
    const originalKeys = Object.keys(row)

    if (originalKeys.length === 0) {
      console.warn(`Row ${rowIndex} has no columns`)
    }

    originalKeys.forEach((key) => {
      const cleanedKey = cleanColumnName(key)
      const value = row[key]

      if (value === undefined || value === null || value === '') {
        // Keep empty values as empty strings, not NaN
        cleanedRow[cleanedKey] = ''
        rowsWithEmptyValues++
        return
      }

      // Try to parse as number
      const trimmedValue = value.trim()
      const numValue = parseFloat(trimmedValue)

      if (!isNaN(numValue) && isFinite(numValue)) {
        cleanedRow[cleanedKey] = numValue
      } else {
        // Check if it looks like a number but failed to parse
        if (trimmedValue !== '' && !isNaN(Number(trimmedValue)) === false) {
          // It's a non-numeric string, which is fine
          cleanedRow[cleanedKey] = trimmedValue
        } else if (trimmedValue === '' || trimmedValue === 'NaN' || trimmedValue === 'Infinity' || trimmedValue === '-Infinity') {
          // Invalid numeric value
          rowsWithInvalidNumbers++
          cleanedRow[cleanedKey] = trimmedValue
        } else {
          cleanedRow[cleanedKey] = trimmedValue
        }
      }
    })

    return cleanedRow as T
  })

  // Log data quality summary
  if (rowsWithEmptyValues > 0) {
    console.warn(`Data quality note: ${rowsWithEmptyValues} empty cell(s) found across all rows`)
  }
  if (rowsWithInvalidNumbers > 0) {
    console.warn(`Data quality note: ${rowsWithInvalidNumbers} invalid numeric value(s) found (NaN, Infinity, etc.)`)
  }

  return result
}

/**
 * Validate Model Performance data structure
 * Ensures required fields are present and have reasonable values
 */
function validateModelPerformanceData(data: ModelPerformanceRow[]): void {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Model performance data is empty or not an array')
  }

  const firstRow = data[0]
  const requiredFields = [
    'color_ID',
    'LaunchDate_ID',
    'merchant_ID',
    'month_ID',
    'Season_ID',
    'CumulativeUnits',
    'Linear Preds',
    'Randomforest Preds',
    'XGBoost Preds',
    'Bagging Preds'
  ]

  const missingFields = requiredFields.filter(field => !(field in firstRow))
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in model performance data: ${missingFields.join(', ')}`)
  }

  // Check for NaN values in numeric fields
  const numericFields = ['CumulativeUnits', 'Linear Preds', 'Randomforest Preds', 'XGBoost Preds', 'Bagging Preds']
  numericFields.forEach(field => {
    const value = (firstRow as unknown as Record<string, unknown>)[field]
    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
      console.warn(`Row 0 has invalid ${field}: ${value}`)
    }
  })

  console.log(`✓ Model performance data validated: ${data.length} rows`)
}

/**
 * Validate Cluster Profile data structure
 * Ensures required fields are present and have reasonable values
 */
function validateClusterProfileData(data: ClusterProfileRow[]): void {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Cluster profile data is empty or not an array')
  }

  const firstRow = data[0]
  const requiredFields = [
    'COLOR_DESCRIPTION',
    'count_sku',
    'count_styles',
    'count_merchantclass',
    'totalsales',
    'units',
    'cluster'
  ]

  const missingFields = requiredFields.filter(field => !(field in firstRow))
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in cluster profile data: ${missingFields.join(', ')}`)
  }

  // Check for NaN values in numeric fields
  const numericFields = ['count_sku', 'count_styles', 'count_merchantclass', 'totalsales', 'units', 'cluster']
  numericFields.forEach(field => {
    const value = (firstRow as unknown as Record<string, unknown>)[field]
    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
      console.warn(`Row 0 has invalid ${field}: ${value}`)
    }
  })

  console.log(`✓ Cluster profile data validated: ${data.length} rows`)
}

export async function loadModelPerformanceData(): Promise<ModelPerformanceRow[]> {
  try {
    const response = await fetch(DATA_PATHS.modelPerformance)
    if (!response.ok) {
      throw new Error(`Failed to fetch model performance data: ${response.statusText}`)
    }
    const text = await response.text()

    if (!text || text.trim().length === 0) {
      throw new Error('Model performance CSV file is empty')
    }

    const data = parseCSV<ModelPerformanceRow>(text)
    validateModelPerformanceData(data)
    return data
  } catch (error) {
    console.error('Error loading model performance data:', error)
    throw error
  }
}

export async function loadClusterProfileData(): Promise<ClusterProfileRow[]> {
  try {
    const response = await fetch(DATA_PATHS.clusterProfiles)
    if (!response.ok) {
      throw new Error(`Failed to fetch cluster profile data: ${response.statusText}`)
    }
    const text = await response.text()

    if (!text || text.trim().length === 0) {
      throw new Error('Cluster profile CSV file is empty')
    }

    const data = parseCSV<ClusterProfileRow>(text)
    validateClusterProfileData(data)
    return data
  } catch (error) {
    console.error('Error loading cluster profile data:', error)
    throw error
  }
}

export async function loadAllData() {
  const [modelPerformance, clusterProfiles] = await Promise.all([
    loadModelPerformanceData(),
    loadClusterProfileData(),
  ])

  return {
    modelPerformance,
    clusterProfiles,
  }
}
