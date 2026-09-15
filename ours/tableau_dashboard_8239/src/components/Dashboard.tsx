import { useEffect, useState, useMemo } from 'react';
import { DashboardProvider, useDashboard } from '../contexts/DashboardContext';
import { loadSuperstoreData, applyFilters } from '../services/dataService';
import type { SuperstoreRow } from '../types';
import { YearWorksheet } from './worksheets/YearWorksheet';
import { MonthWorksheet } from './worksheets/MonthWorksheet';
import { SalesQuantityWorksheet } from './worksheets/SalesQuantityWorksheet';
import { TotalProfitWorksheet } from './worksheets/TotalProfitWorksheet';
import { ProfitByYearWorksheet } from './worksheets/ProfitByYearWorksheet';
import { ProfitByCategoryWorksheet } from './worksheets/ProfitByCategoryWorksheet';
import { OrdersByRegionWorksheet } from './worksheets/OrdersByRegionWorksheet';
import { ProfitByMarketsWorksheet } from './worksheets/ProfitByMarketsWorksheet';
import { SalesQuantityByMarketsWorksheet } from './worksheets/SalesQuantityByMarketsWorksheet';
import { Top5ItemsWorksheet } from './worksheets/Top5ItemsWorksheet';
import './Dashboard.css';

interface DashboardContentProps {
  allData: SuperstoreRow[];
}

function DashboardContent({ allData }: DashboardContentProps) {
  const { filters } = useDashboard();
  const filteredData = useMemo(() => applyFilters(allData, filters), [allData, filters]);

  return (
    <div className="dashboard">
      {/* Dashboard Text Zones */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span className="title-part-1">Sales </span>
          <span className="title-part-2">Insights Dashboard</span>
        </div>
        <div className="dashboard-subtitle">
          Data Viz. for Tableau Dataset:<br />
          <span className="subtitle-highlight">Sample - Superstore</span>
        </div>
        <div className="dashboard-footer">
          © Sagar Tanna
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Year - Position based on contract: x_ratio=0.4023, y_ratio=-0.0042 */}
        <div className="grid-item year-item">
          <YearWorksheet data={filteredData} />
        </div>

        {/* Month - Position based on contract: x_ratio=0.0578, y_ratio=0.0347 */}
        <div className="grid-item month-item">
          <MonthWorksheet data={filteredData} />
        </div>

        {/* Total Profit - Position based on contract: x_ratio=0.0688, y_ratio=0.1931 */}
        <div className="grid-item total-profit-item">
          <TotalProfitWorksheet data={filteredData} />
        </div>

        {/* Sales Quantity - Position based on contract: x_ratio=0.2945, y_ratio=0.1903 */}
        <div className="grid-item sales-quantity-item">
          <SalesQuantityWorksheet data={filteredData} />
        </div>

        {/* Profit by Year - Position based on contract: x_ratio=0.5055, y_ratio=0.0694 */}
        <div className="grid-item profit-by-year-item">
          <ProfitByYearWorksheet data={filteredData} />
        </div>

        {/* Profit % by Category - Position based on contract: x_ratio=0.5437, y_ratio=0.3597 */}
        <div className="grid-item profit-by-category-item">
          <ProfitByCategoryWorksheet data={filteredData} />
        </div>

        {/* Top 5 items by Sales - Position based on contract: x_ratio=0.7711, y_ratio=0.3625 */}
        <div className="grid-item top-5-items-item">
          <Top5ItemsWorksheet data={filteredData} />
        </div>

        {/* Profit by Markets - Position based on contract: x_ratio=0.0016, y_ratio=0.3 */}
        <div className="grid-item profit-by-markets-item">
          <ProfitByMarketsWorksheet data={filteredData} />
        </div>

        {/* Sales Quantity by Markets - Position based on contract: x_ratio=0.2727, y_ratio=0.3014 */}
        <div className="grid-item sales-quantity-by-markets-item">
          <SalesQuantityByMarketsWorksheet data={filteredData} />
        </div>

        {/* Orders by Region & Category - Position based on contract: x_ratio=0.5773, y_ratio=0.6792 */}
        <div className="grid-item orders-by-region-item">
          <OrdersByRegionWorksheet data={filteredData} />
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<SuperstoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const loadedData = await loadSuperstoreData();
        setData(loadedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <DashboardContent allData={data} />
    </DashboardProvider>
  );
}
