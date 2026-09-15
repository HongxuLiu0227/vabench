import { useState, useEffect } from 'react';
import { csvParse } from 'd3-dsv';
import type { TelcoRecord } from '../types';

// Add Tableau calculated field support
interface TelcoRecordWithCalculatedFields extends TelcoRecord {
  'Calculation_1852668344581492999': number;
  'Calculation_1852668344581746953': number;
  'Calculation_1852668344589979918': 'NO';
  'Calculation_1852668344621695264': number;
  'Calculation_1852668344621789474': number;
  'Churn (copy)_1852668344639775025': 'Yes' | 'No';
}

// Normalize CSV headers by stripping quotes, BOM, and extra whitespace
const normalizeHeader = (header: string): string => {
  let text = (header || '').replace('\ufeff', '').trim();
  // Remove matching outer quotes
  while (text.length >= 2 && text[0] === text[text.length - 1] && (text[0] === '"' || text[0] === "'")) {
    text = text.slice(1, -1).trim();
  }
  // Collapse multiple spaces to single space
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

export const useTelcoData = () => {
  const [data, setData] = useState<TelcoRecordWithCalculatedFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/WA_Fn-UseC_-Telco-Customer-Churn.csv');
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();

        // Parse CSV with header normalization
        const parsedData = csvParse(csvText, (rawRow: any) => {
          // Normalize all keys in the raw row
          const d: any = {};
          for (const [key, value] of Object.entries(rawRow)) {
            d[normalizeHeader(key)] = value;
          }

          return {
            customerID: d.customerID,
            gender: d.gender as 'Male' | 'Female',
            SeniorCitizen: (d.SeniorCitizen === '1' ? 1 : 0) as 0 | 1,
            Partner: d.Partner as 'Yes' | 'No',
            Dependents: d.Dependents as 'Yes' | 'No',
            tenure: Number(d.tenure),
            PhoneService: d.PhoneService as 'Yes' | 'No',
            MultipleLines: d.MultipleLines as 'Yes' | 'No' | 'No phone service',
            InternetService: d.InternetService as 'DSL' | 'Fiber optic' | 'No',
            OnlineSecurity: d.OnlineSecurity as 'Yes' | 'No' | 'No internet service',
            OnlineBackup: d.OnlineBackup as 'Yes' | 'No' | 'No internet service',
            DeviceProtection: d.DeviceProtection as 'Yes' | 'No' | 'No internet service',
            TechSupport: d.TechSupport as 'Yes' | 'No' | 'No internet service',
            StreamingTV: d.StreamingTV as 'Yes' | 'No' | 'No internet service',
            StreamingMovies: d.StreamingMovies as 'Yes' | 'No' | 'No internet service',
            Contract: d.Contract as 'Month-to-month' | 'One year' | 'Two year',
            PaperlessBilling: d.PaperlessBilling as 'Yes' | 'No',
            PaymentMethod: d.PaymentMethod,
            MonthlyCharges: Number(d.MonthlyCharges),
            TotalCharges: d.TotalCharges === '' ? 0 : Number(d.TotalCharges),
            Churn: d.Churn as 'Yes' | 'No',
            // Tableau calculated fields (created at runtime)
            'Calculation_1852668344581492999': 0, // AVG(0) in Tableau
            'Calculation_1852668344581746953': 0, // AVG(0) in Tableau
            'Calculation_1852668344589979918': 'NO' as const, // Fixed value from Tableau
            'Calculation_1852668344621695264': 0, // AVG(0) in Tableau
            'Calculation_1852668344621789474': 0, // AVG(0) in Tableau
            'Churn (copy)_1852668344639775025': d.Churn as 'Yes' | 'No', // Copy of Churn field
          };
        });

        setData(Array.from(parsedData) as TelcoRecordWithCalculatedFields[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
};
