import { useState, useEffect } from 'react';
import { MonthlyProfitChart } from './MonthlyProfitChart';
import { TopProductsChart } from './TopProductsChart';
import { TopCustomersChart } from './TopCustomersChart';
import type { ParsedDataRow, MonthlyProfitData, TopItemData, SelectionState } from '../types';
import {
  loadCsv,
  aggregateMonthlyProfit,
  aggregateTopProducts,
  aggregateTopCustomers,
  validateDataQuality,
} from '../services/dataService';
import './Dashboard.css';

const DEFAULT_SELECTED_MONTH = '201009';

export function Dashboard() {
  const [data, setData] = useState<ParsedDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<SelectionState>(DEFAULT_SELECTED_MONTH);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const parsedData = await loadCsv();

        // Validate data quality before using it
        validateDataQuality(parsedData);

        setData(parsedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const monthlyProfitData: MonthlyProfitData[] = aggregateMonthlyProfit(data);
  const topProductsData: TopItemData[] = aggregateTopProducts(data, selectedMonth, 10);
  const topCustomersData: TopItemData[] = aggregateTopCustomers(data, selectedMonth, 10);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="dashboard-top">
          <MonthlyProfitChart
            data={monthlyProfitData}
            selectedMonth={selectedMonth}
            onMonthSelect={setSelectedMonth}
            width={987}
            height={404}
          />
        </div>
        <div className="dashboard-bottom">
          <div className="dashboard-left">
            <h2 className="chart-title" style={{ fontSize: '26px' }}>
              Top Products by Profit
            </h2>
            <TopProductsChart
              data={topProductsData}
              width={493}
              height={570}
            />
          </div>
          <div className="dashboard-right">
            <h2 className="chart-title" style={{ fontSize: '26px' }}>
              Top Ten Customers by Profit
            </h2>
            <TopCustomersChart
              data={topCustomersData}
              width={493}
              height={570}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
