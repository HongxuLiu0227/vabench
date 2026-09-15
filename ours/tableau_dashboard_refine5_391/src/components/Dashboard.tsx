import { useEffect, useState } from 'react';
import { TotalSalesEachYearChart } from './TotalSalesEachYearChart';
import { LineChart } from './LineChart';
import { SalesBySubCategoryChart } from './SalesBySubCategoryChart';
import { ScatterPlotChart } from './ScatterPlotChart';
import { Worksheet } from './Worksheet';
import {
  loadOrdersData,
  aggregateByYear,
  aggregateByMonth,
  aggregateBySubCategory,
  aggregateScatterData
} from '../services/dataLoader';

interface YearlyData {
  year: number;
  sales: number;
}

interface MonthlyData {
  year: number;
  month: number;
  sales: number;
  dateKey: string;
}

interface SubCategoryData {
  subCategory: string;
  sales: number;
  count: number;
}

interface ScatterData {
  sales: number;
  profit: number;
  quantity: number;
  productName: string;
}

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [subCategoryData, setSubCategoryData] = useState<SubCategoryData[]>([]);
  const [scatterData, setScatterData] = useState<ScatterData[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const orders = await loadOrdersData();

        setYearlyData(aggregateByYear(orders));
        setMonthlyData(aggregateByMonth(orders));
        setSubCategoryData(aggregateBySubCategory(orders));
        setScatterData(aggregateScatterData(orders));

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>Error loading dashboard: {error}</p>
        <p>Please ensure the data file is available at /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-row">
          <div className="dashboard-col">
            <Worksheet title="Line">
              <LineChart data={monthlyData} />
            </Worksheet>
          </div>
          <div className="dashboard-col">
            <Worksheet title="Scatterplot">
              <ScatterPlotChart data={scatterData} />
            </Worksheet>
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-col">
            <Worksheet title="Sales by Sub Category">
              <SalesBySubCategoryChart data={subCategoryData} />
            </Worksheet>
          </div>
          <div className="dashboard-col">
            <Worksheet title="Total Sales Each Year">
              <TotalSalesEachYearChart data={yearlyData} />
            </Worksheet>
          </div>
        </div>
      </div>
    </div>
  );
};
