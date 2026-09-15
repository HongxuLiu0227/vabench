import type { SuperstoreOrder } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    dateRange: { min: string; max: string } | null;
    salesRange: { min: number; max: number } | null;
    uniqueCategories: number;
    uniqueSubCategories: number;
    uniqueProducts: number;
  };
}

/**
 * Validate the Tableau source data quality
 */
export function validateTableauData(data: SuperstoreOrder[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validRows = 0;
  let invalidRows = 0;

  // Initialize summary statistics
  const salesValues: number[] = [];
  const dates: string[] = [];
  const categories = new Set<string>();
  const subCategories = new Set<string>();
  const products = new Set<string>();

  // Check if data is empty
  if (!data || data.length === 0) {
    errors.push('No data loaded');
    return {
      isValid: false,
      errors,
      warnings,
      summary: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        dateRange: null,
        salesRange: null,
        uniqueCategories: 0,
        uniqueSubCategories: 0,
        uniqueProducts: 0,
      },
    };
  }

  // Validate each row
  data.forEach((row, index) => {
    let rowIsValid = true;

    // Check required fields exist
    if (!row['Order Date'] || row['Order Date'].trim() === '') {
      errors.push(`Row ${index + 1}: Missing Order Date`);
      rowIsValid = false;
    }

    if (!row['Order ID'] || row['Order ID'].trim() === '') {
      errors.push(`Row ${index + 1}: Missing Order ID`);
      rowIsValid = false;
    }

    // Validate date format and range
    const orderDate = new Date(row['Order Date']);
    if (isNaN(orderDate.getTime())) {
      errors.push(`Row ${index + 1}: Invalid Order Date "${row['Order Date']}"`);
      rowIsValid = false;
    } else if (orderDate.getFullYear() < 1900 || orderDate.getFullYear() > 2100) {
      errors.push(`Row ${index + 1}: Order Date out of reasonable range "${row['Order Date']}"`);
      rowIsValid = false;
    } else {
      dates.push(row['Order Date']);
    }

    // Validate numeric fields
    if (typeof row.Sales !== 'number' || isNaN(row.Sales)) {
      errors.push(`Row ${index + 1}: Invalid Sales value`);
      rowIsValid = false;
    } else {
      salesValues.push(row.Sales);
    }

    if (typeof row.Profit !== 'number' || isNaN(row.Profit)) {
      errors.push(`Row ${index + 1}: Invalid Profit value`);
      rowIsValid = false;
    }

    if (typeof row.Quantity !== 'number' || isNaN(row.Quantity)) {
      warnings.push(`Row ${index + 1}: Invalid Quantity value`);
    }

    if (typeof row.Discount !== 'number' || isNaN(row.Discount)) {
      warnings.push(`Row ${index + 1}: Invalid Discount value`);
    }

    // Check categorical fields
    if (row.Category && row.Category.trim() !== '') {
      categories.add(row.Category);
    } else {
      warnings.push(`Row ${index + 1}: Missing Category`);
    }

    if (row['Sub-Category'] && row['Sub-Category'].trim() !== '') {
      subCategories.add(row['Sub-Category']);
    } else {
      warnings.push(`Row ${index + 1}: Missing Sub-Category`);
    }

    if (row['Product Name'] && row['Product Name'].trim() !== '') {
      products.add(row['Product Name']);
    }

    if (rowIsValid) {
      validRows++;
    } else {
      invalidRows++;
    }
  });

  // Check for data quality issues
  if (salesValues.length > 0) {
    const allZeroSales = salesValues.every(v => v === 0);
    if (allZeroSales) {
      errors.push('All Sales values are zero - charts will be empty');
    }

    const hasNegativeSales = salesValues.some(v => v < 0);
    if (hasNegativeSales) {
      warnings.push('Some Sales values are negative');
    }
  }

  // Calculate summary statistics
  let dateRange: { min: string; max: string } | null = null;
  if (dates.length > 0) {
    dates.sort();
    dateRange = { min: dates[0], max: dates[dates.length - 1] };
  }

  let salesRange: { min: number; max: number } | null = null;
  if (salesValues.length > 0) {
    salesRange = {
      min: Math.min(...salesValues),
      max: Math.max(...salesValues),
    };
  }

  const summary = {
    totalRows: data.length,
    validRows,
    invalidRows,
    dateRange,
    salesRange,
    uniqueCategories: categories.size,
    uniqueSubCategories: subCategories.size,
    uniqueProducts: products.size,
  };

  // Determine overall validity
  const isValid = errors.length === 0 && invalidRows === 0;

  if (!isValid) {
    console.error('Tableau data validation FAILED:', {
      errors,
      warnings,
      summary,
    });
  } else {
    console.log('Tableau data validation PASSED:', {
      summary,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  }

  return {
    isValid,
    errors,
    warnings,
    summary,
  };
}

/**
 * Validate that required fields for Tableau render contract are present
 */
export function validateTableauFields(data: SuperstoreOrder[]): {
  isValid: boolean;
  missingFields: string[];
} {
  const requiredFields: (keyof SuperstoreOrder)[] = [
    'Order Date',
    'Sales',
    'Profit',
    'Quantity',
    'Sub-Category',
    'Product Name',
    'Category',
  ];

  const missingFields: string[] = [];

  // Check first row to see which fields exist
  if (data.length > 0) {
    const firstRow = data[0];
    requiredFields.forEach(field => {
      if (!(field in firstRow)) {
        missingFields.push(field);
      }
    });
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
