import type { DataRow, AugmentedDataRow, PANASScores, AggregatedData } from '../types';
import { loadNormalizedCSV, validateFields } from '../utils/csvParser';

// PANAS Positive items (field names from CSV - without trailing spaces for normalization)
const POSITIVE_ITEMS = [
  'B1. Indicate to what extent the feelings you experience after a performance: Interested',
  'B3. Indicate to what extent the feelings you experience after a performance: Excited',
  'B5. Indicate to what extent the feelings you experience after a performance: Strong',
  'B9. Indicate to what extent the feelings you experience after a performance: Enthusiastic',
  'B10. Indicate to what extent the feelings you experience after a performance: Proud',
  'B12. Indicate to what extent the feelings you experience after a performance: Alert',
  'B14. Indicate to what extent the feelings you experience after a performance: Inspired',
  'B16. Indicate to what extent the feelings you experience after a performance: Determined',
  'B17. Indicate to what extent the feelings you experience after a performance: Attentive',
  'B19. Indicate to what extent the feelings you experience after a performance: Active',
];

// PANAS Negative items (field names from CSV - without trailing spaces for normalization)
const NEGATIVE_ITEMS = [
  'B2. Indicate to what extent the feelings you experience after a performance: Distressed',
  'B4. Indicate to what extent the feelings you experience after a performance: Upset',
  'B6. Indicate to what extent the feelings you experience after a performance: Guilty',
  'B7. Indicate to what extent the feelings you experience after a performance: Scared',
  'B8. Indicate to what extent the feelings you experience after a performance: Hostile',
  'B11. Indicate to what extent the feelings you experience after a performance: Irritable',
  'B13. Indicate to what extent the feelings you experience after a performance: Ashamed',
  'B15. Indicate to what extent the feelings you experience after a performance: Nervous',
  'B18. Indicate to what extent the feelings you experience after a performance: Jittery',
  'B20. Indicate to what extent the feelings you experience after a performance: Afraid',
];

// Response value to numeric mapping
const RESPONSE_VALUES: { [key: string]: number } = {
  'Very Slightly or Not at All': 1,
  'A Little': 2,
  'Moderately': 3,
  'Quite a Bit': 4,
  'Extremely': 5,
  'Null': 0,
  '': 0,
};

// Convert response string to numeric value
function getResponseValue(response: string | number | null | undefined): number {
  if (!response) return 0;
  const strValue = String(response).trim();
  return RESPONSE_VALUES[strValue] || 0;
}

// Calculate PANAS scores for a single row
function calculatePANASScores(row: DataRow): PANASScores {
  let positiveScore = 0;
  let negativeScore = 0;

  // Sum positive items
  POSITIVE_ITEMS.forEach(item => {
    positiveScore += getResponseValue(row[item]);
  });

  // Sum negative items
  NEGATIVE_ITEMS.forEach(item => {
    negativeScore += getResponseValue(row[item]);
  });

  return {
    positiveScore,
    negativeScore,
    positiveNegativeScore: positiveScore - negativeScore,
  };
}

// Load and parse the CSV data with header normalization
export async function loadData(): Promise<AugmentedDataRow[]> {
  try {
    // Load CSV with normalized headers (handles no-break spaces, BOM, quotes, etc.)
    const rawData = await loadNormalizedCSV('/data/1.Who-PANAS - F _Visulizaton.csv');

    // Validate that required fields exist (using both original and canonical names)
    const requiredFields = [
      'A1. Gender:',  // Exact field name from CSV
      'A2. Age:',     // Exact field name from CSV
      'A3. What is your marital status?  If "other" please specify',  // Exact field name from CSV
      'A4. What is your ethnicity?  If "other" please specify',  // Exact field name from CSV
      'A5. What is your highest level of education?',  // Exact field name from CSV
      'A6. What is your annual income?',  // Exact field name from CSV
      'A7. What is your employment status as a musician?  If "other" please specify',  // Exact field name from CSV
      // Use partial match for A24 since the full header is very long
      'A24. After a performance, do you consume any form of non-prescription depressants?',
      ...POSITIVE_ITEMS,
      ...NEGATIVE_ITEMS,
    ];
    validateFields(rawData, requiredFields);

    // Augment data with calculated scores and aliases
    const augmentedData: AugmentedDataRow[] = rawData.map((row) => {
      const typedRow: DataRow = row as DataRow;
      const scores = calculatePANASScores(typedRow);

      // Create augmented row with both original and aliased field names
      const augmented: AugmentedDataRow = {
        ...typedRow,
        ...scores,
        // Add explicit aliases for Tableau compatibility
        'Positive-Score': scores.positiveScore,
        'Negative Score': scores.negativeScore,
        'Positive Score': scores.positiveScore,
      };

      return augmented;
    });

    console.log(`Loaded ${augmentedData.length} rows successfully`);
    return augmentedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Calculate global aggregates
export function calculateGlobalAggregates(data: AugmentedDataRow[]) {
  const overallPositiveCount = data.filter(
    row => row.positiveNegativeScore > 0
  ).length;
  const overallNegativeCount = data.filter(
    row => row.positiveNegativeScore < 0
  ).length;
  const totalRespondents = data.length;

  const total = overallPositiveCount + overallNegativeCount;
  const overallPositivePct = total > 0 ? (overallPositiveCount / total) * 100 : 0;
  const overallNegativePct = total > 0 ? (overallNegativeCount / total) * 100 : 0;

  return {
    overallPositiveCount,
    overallNegativeCount,
    totalRespondents,
    overallPositivePct,
    overallNegativePct,
  };
}

// Filter data based on current filters
export function filterData(
  data: AugmentedDataRow[],
  filters: {
    positiveNegativeFilter: 'positive' | 'negative' | 'all' | null;
    ageFilter: string[];
    ethnicityFilter: string[];
    genderFilter: string[];
    maritalStatusFilter: string[];
  }
): AugmentedDataRow[] {
  let filtered = [...data];

  // Apply positive/negative filter
  if (filters.positiveNegativeFilter === 'positive') {
    filtered = filtered.filter(row => row.positiveNegativeScore > 0);
  } else if (filters.positiveNegativeFilter === 'negative') {
    filtered = filtered.filter(row => row.positiveNegativeScore < 0);
  }

  // Apply demographic filters
  if (filters.ageFilter.length > 0) {
    filtered = filtered.filter(row =>
      filters.ageFilter.includes(row['A2. Age:'])
    );
  }

  if (filters.ethnicityFilter.length > 0) {
    filtered = filtered.filter(row =>
      filters.ethnicityFilter.includes(row['A4. What is your ethnicity? If "other" please specify'])
    );
  }

  if (filters.genderFilter.length > 0) {
    filtered = filtered.filter(row =>
      filters.genderFilter.includes(row['A1. Gender:'])
    );
  }

  if (filters.maritalStatusFilter.length > 0) {
    filtered = filtered.filter(row =>
      filters.maritalStatusFilter.includes(row['A3. What is your marital status? If "other" please specify'])
    );
  }

  return filtered;
}

// Aggregate data by dimension (for pie charts)
export function aggregateByDimension(
  data: AugmentedDataRow[],
  dimension: keyof DataRow,
  excludeValues: string[] = ['Null'],
  includeOnlyValues: string[] = []
): AggregatedData[] {
  const counts: { [key: string]: number } = {};

  data.forEach(row => {
    const value = row[dimension];
    if (value && typeof value === 'string') {
      // Skip excluded values
      if (excludeValues.includes(value)) return;

      // If includeOnlyValues is specified, only include those
      if (includeOnlyValues.length > 0 && !includeOnlyValues.includes(value)) {
        return;
      }

      counts[value] = (counts[value] || 0) + 1;
    }
  });

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return Object.entries(counts)
    .map(([category, value]) => ({
      category,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

// Manual sort orders from Tableau spec
export const AGE_ORDER = [
  '18-24 years old',
  '25-34 years old',
  '35-44 years old',
  '45-54 years old',
  '55-64 years old',
  '65-74 years old',
  '75 years or older',
];

export const ETHNICITY_ORDER = [
  'Caucasian/White',
  'Asian',
  'Aboriginal, First Nations, Inuit, Metis',
  'Hispanic or Latino',
  'African American/Black',
  'Native Hawaiian or Other Pacific Islander',
  'American Indian or Alaska Native',
  'Other',
];

export const MARITAL_STATUS_ORDER = [
  'Single',
  'Married',
  'Common-law',
  'Separated',
  'Other',
];

// Sort aggregated data by manual order
export function sortByManualOrder(
  data: AggregatedData[],
  order: string[]
): AggregatedData[] {
  const orderMap = new Map(order.map((item, index) => [item, index]));

  return data.sort((a, b) => {
    const aIndex = orderMap.get(a.category) ?? 999;
    const bIndex = orderMap.get(b.category) ?? 999;
    return aIndex - bIndex;
  });
}

// Color palettes from Tableau spec
export const COLOR_PALETTES = {
  Gender: {
    'Male': '#3896c4',
    'Female': '#eb1e2c',
    'Other': '#76b7b2',
  },
  Age: {
    '18-24 years old': '#9e3d22',
    '25-34 years old': '#c14f22',
    '35-44 years old': '#db5e20',
    '45-54 years old': '#f2882d',
    '55-64 years old': '#f59c3c',
    '65-74 years old': '#f9b665',
    '75 years or older': '#ffc685',
  },
  Ethnicity: {
    'Caucasian/White': '#59a14f',
    'Asian': '#76b7b2',
    'Aboriginal, First Nations, Inuit, Metis': '#4e79a7',
    'Hispanic or Latino': '#edc948',
    'African American/Black': '#f28e2b',
    'Native Hawaiian or Other Pacific Islander': '#b07aa1',
    'American Indian or Alaska Native': '#e15759',
    'Other': '#9c755f',
  },
  'Marital Status': {
    'Single': '#4e79a7',
    'Married': '#a0cbe8',
    'Common-law': '#f28e2b',
    'Separated': '#ffbe7d',
    'Other': '#59a14f',
  },
};
