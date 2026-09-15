import { useState, useEffect, useMemo } from 'react';
import type { ProcessedTripData, MonthlyTripData, MonthlyPercentageData, FilterState } from '../types/data';
import {
  fetchTripData,
  aggregateMonthlyTrips,
  aggregateMonthlyPercentages,
} from '../services/dataService';

/**
 * Hook to fetch and manage trip data
 */
export function useData() {
  const [data, setData] = useState<ProcessedTripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const tripData = await fetchTripData();
        if (!cancelled) {
          setData(tripData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

/**
 * Hook to get aggregated monthly trip data
 */
export function useMonthlyTrips(
  data: ProcessedTripData[],
  filters?: FilterState
): MonthlyTripData[] {
  return useMemo(() => {
    if (data.length === 0) return [];
    const filterParams = filters ? {
      month: filters.selectedMonth,
      userType: filters.selectedUserType,
      gender: filters.selectedGender,
    } : undefined;
    return aggregateMonthlyTrips(data, filterParams);
  }, [data, filters]);
}

/**
 * Hook to get percentage data by user type
 */
export function useUserTypePercentages(
  data: ProcessedTripData[],
  filters?: FilterState
): MonthlyPercentageData[] {
  return useMemo(() => {
    if (data.length === 0) return [];
    const filterParams = filters ? {
      month: filters.selectedMonth,
      userType: filters.selectedUserType,
      gender: filters.selectedGender,
    } : undefined;
    return aggregateMonthlyPercentages(data, 'userType', filterParams);
  }, [data, filters]);
}

/**
 * Hook to get percentage data by gender
 */
export function useGenderPercentages(
  data: ProcessedTripData[],
  filters?: FilterState
): MonthlyPercentageData[] {
  return useMemo(() => {
    if (data.length === 0) return [];
    const filterParams = filters ? {
      month: filters.selectedMonth,
      userType: filters.selectedUserType,
      gender: filters.selectedGender,
    } : undefined;
    return aggregateMonthlyPercentages(data, 'genderText', filterParams);
  }, [data, filters]);
}
