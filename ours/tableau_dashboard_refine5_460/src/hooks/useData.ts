import { useState, useEffect } from 'react';
import {
  fetchCsvData,
  aggregateSalesByMonth,
  aggregateSalesByYear,
  aggregateSalesBySubCategory,
  prepareScatterplotData,
} from '../services/dataService';
import { validateTableauData, validateTableauFields } from '../services/dataValidator';
import type {
  SuperstoreOrder,
  SalesByDate,
  SalesByYear,
  SalesBySubCategory,
  SalesProfitPoint,
} from '../types';

interface UseDataResult {
  rawData: SuperstoreOrder[];
  salesByMonth: SalesByDate[];
  salesByYear: SalesByYear[];
  salesBySubCategory: SalesBySubCategory[];
  scatterplotData: SalesProfitPoint[];
  loading: boolean;
  error: string | null;
  validationErrors: string[];
  validationWarnings: string[];
}

export function useData(): UseDataResult {
  const [rawData, setRawData] = useState<SuperstoreOrder[]>([]);
  const [salesByMonth, setSalesByMonth] = useState<SalesByDate[]>([]);
  const [salesByYear, setSalesByYear] = useState<SalesByYear[]>([]);
  const [salesBySubCategory, setSalesBySubCategory] = useState<SalesBySubCategory[]>([]);
  const [scatterplotData, setScatterplotData] = useState<SalesProfitPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        setValidationErrors([]);
        setValidationWarnings([]);

        // Fetch and parse CSV data
        const data = await fetchCsvData();
        setRawData(data);

        // Validate data quality
        const validationResult = validateTableauData(data);
        const fieldsValidation = validateTableauFields(data);

        if (!validationResult.isValid) {
          setValidationErrors(validationResult.errors);
        }

        if (validationResult.warnings.length > 0) {
          setValidationWarnings(validationResult.warnings);
        }

        if (!fieldsValidation.isValid) {
          setValidationErrors(prev => [
            ...prev,
            `Missing required Tableau fields: ${fieldsValidation.missingFields.join(', ')}`,
          ]);
        }

        // Aggregate data for all visualizations
        setSalesByMonth(aggregateSalesByMonth(data));
        setSalesByYear(aggregateSalesByYear(data));
        setSalesBySubCategory(aggregateSalesBySubCategory(data));
        setScatterplotData(prepareScatterplotData(data));

        // Log validation summary
        console.log('Data validation summary:', validationResult.summary);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return {
    rawData,
    salesByMonth,
    salesByYear,
    salesBySubCategory,
    scatterplotData,
    loading,
    error,
    validationErrors,
    validationWarnings,
  };
}
