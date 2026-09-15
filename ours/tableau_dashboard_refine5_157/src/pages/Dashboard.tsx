import { useEffect, useState } from 'react';
import { LineChart } from '../components/LineChart';
import { HorizontalBarChart } from '../components/HorizontalBarChart';
import { YearlyLineChart } from '../components/YearlyLineChart';
import {
  loadData,
  aggregateSalesByMonth,
  aggregateSalesByCategory,
  aggregateSalesByYear,
} from '../services/dataService';
import type { TimeSeriesDataPoint, CategoryDataPoint, YearlyDataPoint } from '../types';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<TimeSeriesDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyDataPoint[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const rawData = await loadData();

        // Aggregate data for different charts
        setMonthlyData(aggregateSalesByMonth(rawData));
        setCategoryData(aggregateSalesByCategory(rawData));
        setYearlyData(aggregateSalesByYear(rawData));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#ffffff',
        }}
      >
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#d32f2f',
          backgroundColor: '#ffffff',
        }}
      >
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '1000px',
        height: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* P121__line - Top Left */}
      <div
        style={{
          position: 'absolute',
          left: '8px',
          top: '8px',
          width: '492px',
          height: '494px',
          backgroundColor: '#ffffff',
        }}
      >
        <LineChart data={monthlyData} title="Line" width={492} height={494} />
      </div>

      {/* P121__bar - Top Right */}
      <div
        style={{
          position: 'absolute',
          left: '500px',
          top: '8px',
          width: '492px',
          height: '494px',
          backgroundColor: '#ffffff',
        }}
      >
        <HorizontalBarChart data={categoryData} title="Bar" width={492} height={494} />
      </div>

      {/* P1225__total_sales_each_year - Bottom Full Width */}
      <div
        style={{
          position: 'absolute',
          left: '8px',
          top: '502px',
          width: '984px',
          height: '290px',
          backgroundColor: '#ffffff',
        }}
      >
        <YearlyLineChart data={yearlyData} title="Total Sales Each Year" width={984} height={290} />
      </div>
    </div>
  );
}
