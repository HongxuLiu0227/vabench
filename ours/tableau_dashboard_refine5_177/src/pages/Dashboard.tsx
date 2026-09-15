import { useEffect, useState } from 'react';
import {
  loadSuperstoreData,
  aggregateSalesByCategory,
  aggregateByRegion,
  prepareScatterData,
  aggregateSalesByYear,
  type SalesByCategory,
  type RegionSummary,
  type ScatterPoint,
  type YearlySales,
} from '../services/dataLoader';
import HorizontalRankedBar from '../components/HorizontalRankedBar';
import CustomerOverview from '../components/CustomerOverview';
import Scatterplot from '../components/Scatterplot';
import YearlySalesChart from '../components/YearlySalesChart';
import './Dashboard.css';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barData, setBarData] = useState<SalesByCategory[]>([]);
  const [regionData, setRegionData] = useState<RegionSummary[]>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlySales[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadSuperstoreData();

        // Process data for each worksheet
        setBarData(aggregateSalesByCategory(data));
        setRegionData(aggregateByRegion(data));
        setScatterData(prepareScatterData(data));
        setYearlyData(aggregateSalesByYear(data));

        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Top-left: Customer Overview */}
        <div className="dashboard-cell dashboard-cell-top-left">
          <CustomerOverview data={regionData} />
        </div>

        {/* Top-right: Bar Chart */}
        <div className="dashboard-cell dashboard-cell-top-right">
          <HorizontalRankedBar data={barData} />
        </div>

        {/* Bottom-left: Yearly Sales Line Chart */}
        <div className="dashboard-cell dashboard-cell-bottom-left">
          <YearlySalesChart data={yearlyData} />
        </div>

        {/* Bottom-right: Scatterplot */}
        <div className="dashboard-cell dashboard-cell-bottom-right">
          <Scatterplot data={scatterData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
