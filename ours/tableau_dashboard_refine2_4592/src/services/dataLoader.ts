import { csvParse } from 'd3-dsv';
import { OfficeSupplyData } from '../types';
import { validateTableauFieldMappings, getDataQualityMetrics } from '../utils/fieldMapping';

const DATA_URL = '/data/OfficeSupplies (Office_Supplies data set (Class work module 1)).csv';

/**
 * Normalize CSV headers by removing excessive quotes and BOM
 * Handles cases like """Order_Date""" -> Order_Date
 * Also removes BOM (Byte Order Mark) if present
 */
function normalizeHeaders(csvText: string): string {
  // Remove BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const lines = csvText.split('\n');
  if (lines.length === 0) return csvText;

  // Process header line (first non-empty line)
  let headerIndex = 0;
  while (headerIndex < lines.length && lines[headerIndex].trim() === '') {
    headerIndex++;
  }

  if (headerIndex >= lines.length) return csvText;

  const headerLine = lines[headerIndex];

  // Remove triple quotes and replace with plain text
  // Pattern: """FieldName""" -> FieldName
  // Also handles: ""FieldName"" -> FieldName
  let normalizedHeader = headerLine.replace(/"""([^"]*)"""/g, '$1');
  normalizedHeader = normalizedHeader.replace(/""([^"]*)""/g, '$1');

  lines[headerIndex] = normalizedHeader;

  return lines.join('\n');
}

/**
 * Clean and parse column names from CSV
 * Handles quoted column names with extra quotes and whitespace
 */
function cleanColumnName(name: string): string {
  // Remove extra quotes (both single and double) and whitespace
  let cleaned = name.replace(/^["']+|["']+$/g, '').trim();
  // Also remove any remaining quotes from the middle
  cleaned = cleaned.replace(/^["']+|["']+$/g, '').trim();
  return cleaned;
}

/**
 * Parse CSV date string to Date object
 */
function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Load and parse the Office Supplies CSV data
 */
export async function loadOfficeSuppliesData(): Promise<OfficeSupplyData[]> {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    let csvText = await response.text();

    // Normalize headers to handle triple quotes and other formatting issues
    csvText = normalizeHeaders(csvText);

    const rawData = csvParse(csvText);

    // Transform raw CSV data to typed OfficeSupplyData
    const data: OfficeSupplyData[] = rawData
      .filter((row: any) => {
        // Skip empty rows
        const values = Object.values(row);
        return values.some(v => v !== null && v !== undefined && v !== '');
      })
      .map((row: any, index: number) => {
        try {
          // Get all available column names (already normalized by d3)
          const columns = Object.keys(row);

          // Helper function to find column by fuzzy matching
          const findColumn = (searchTerms: string[]): string | null => {
            for (const term of searchTerms) {
              const found = columns.find(col =>
                col.toLowerCase().includes(term.toLowerCase())
              );
              if (found) return found;
            }
            return null;
          };

          // Find required columns with fuzzy matching
          const orderDateKey = findColumn(['order_date', 'order date']) || columns[0];
          const salesRegionKey = findColumn(['sales region', 'sales_region']) || columns[1];
          const salesRepKey = findColumn(['sales representative', 'sales_representative', 'sales rep']) || columns[2];
          const itemKey = findColumn(['item']) || columns[3];
          const unitsSoldKey = findColumn(['units sold', 'units_sold']) || columns[4];
          const unitPriceKey = findColumn(['unit price', 'unit_price']) || columns[5];

          // Validate that we found the columns
          if (!orderDateKey || !unitsSoldKey || !unitPriceKey) {
            console.warn(`Row ${index}: Missing required columns`, {
              orderDateKey,
              unitsSoldKey,
              unitPriceKey,
              availableColumns: columns
            });
            return null;
          }

          // Extract and parse values
          const orderDateStr = row[orderDateKey];
          const unitsSoldStr = row[unitsSoldKey];
          const unitPriceStr = row[unitPriceKey];

          // Validate required fields
          if (!orderDateStr || unitsSoldStr === undefined || unitPriceStr === undefined) {
            console.warn(`Row ${index}: Missing required field values`, {
              orderDateStr,
              unitsSoldStr,
              unitPriceStr
            });
            return null;
          }

          const unitsSold = parseFloat(String(unitsSoldStr));
          const unitPrice = parseFloat(String(unitPriceStr));

          // Check for NaN
          if (isNaN(unitsSold) || isNaN(unitPrice)) {
            console.warn(`Row ${index}: Invalid numeric values`, {
              unitsSold: unitsSoldStr,
              unitPrice: unitPriceStr
            });
            return null;
          }

          const orderDate = parseDate(String(orderDateStr));

          // Validate date
          if (isNaN(orderDate.getTime())) {
            console.warn(`Row ${index}: Invalid date`, { orderDateStr });
            return null;
          }

          const revenue = unitsSold * unitPrice;
          const year = orderDate.getFullYear();
          const month = orderDate.getMonth();
          const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

          return {
            Order_Date: orderDate,
            'Sales Region': cleanColumnName(String(row[salesRegionKey] || '')),
            'Sales representative': cleanColumnName(String(row[salesRepKey] || '')),
            Item: cleanColumnName(String(row[itemKey] || '')),
            'Units Sold': unitsSold,
            'Unit Price': unitPrice,
            Revenue: revenue,
            Year: year,
            Month: month,
            YearMonth: yearMonth,
          };
        } catch (error) {
          console.error(`Error processing row ${index}:`, error);
          return null;
        }
      })
      .filter((row): row is OfficeSupplyData => row !== null);

    if (data.length === 0) {
      throw new Error('No valid data rows found in CSV. Check CSV format and column names.');
    }

    // Validate first row against Tableau field mappings
    const firstRow = data[0];
    const mappingValidation = validateTableauFieldMappings(firstRow);

    if (!mappingValidation.valid) {
      console.error('Tableau field mapping validation failed:', {
        missingFields: mappingValidation.missingFields,
        sampleRow: firstRow,
      });
      throw new Error(
        `Tableau field mapping validation failed. Missing fields: ${mappingValidation.missingFields.join(', ')}`
      );
    }

    // Log data quality metrics
    const qualityMetrics = getDataQualityMetrics(data);
    console.log('Data quality metrics:', qualityMetrics);

    if (qualityMetrics.invalidRows > 0) {
      console.warn(
        `Found ${qualityMetrics.invalidRows} invalid rows out of ${qualityMetrics.totalRows} total`
      );
    }

    if (qualityMetrics.nanCount > 0) {
      console.warn(`Found ${qualityMetrics.nanCount} rows with NaN values`);
    }

    console.log(`Successfully loaded ${data.length} rows from CSV`);

    return data;
  } catch (error) {
    console.error('Error loading office supplies data:', error);
    throw error;
  }
}

/**
 * Filter data based on dashboard filter state
 */
export function filterData(
  data: OfficeSupplyData[],
  filters: {
    selectedSalesRep: string | null;
    selectedItem: string | null;
    selectedDate: string | null;
  }
): OfficeSupplyData[] {
  return data.filter(row => {
    if (filters.selectedSalesRep && row['Sales representative'] !== filters.selectedSalesRep) {
      return false;
    }
    if (filters.selectedItem && row.Item !== filters.selectedItem) {
      return false;
    }
    if (filters.selectedDate && row.YearMonth !== filters.selectedDate) {
      return false;
    }
    return true;
  });
}
