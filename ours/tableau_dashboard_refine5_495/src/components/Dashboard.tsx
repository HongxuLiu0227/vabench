import { useEffect, useState } from 'react';
import { ScatterplotWorksheet } from './ScatterplotWorksheet';
import { HorizontalBarChart } from './HorizontalBarChart';
import { KPICard } from './KPICard';
import {
  loadData,
  calculateKPIs,
  aggregateScatterplotData,
  aggregateSalesBySubCategory,
  aggregateCategorySubCategoryData
} from '../services/dataLoader';
import type { ScatterplotDataPoint, BarChartDataPoint, KPIMetrics } from '../services/types';

/**
 * Main Dashboard Component
 * Layout based on Tableau dashboard zones:
 * - Top section (61.75% height):
 *   - Left (49.2% width): Scatterplot
 *   - Right (49.2% width): Sales by Sub-Category
 * - Bottom section (36.25% height):
 *   - Full width (98.4%): Category/Sub-Category bar chart
 */
export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null);
  const [scatterplotData, setScatterplotData] = useState<ScatterplotDataPoint[]>([]);
  const [salesBySubCategoryData, setSalesBySubCategoryData] = useState<BarChartDataPoint[]>([]);
  const [categorySubCategoryData, setCategorySubCategoryData] = useState<BarChartDataPoint[]>([]);

  useEffect(() => {
    const loadDataAndProcess = async () => {
      try {
        setLoading(true);
        const data = await loadData();

        // Calculate KPIs
        const kpis = calculateKPIs(data);
        setKpiMetrics(kpis);

        // Aggregate data for each worksheet
        const scatterData = aggregateScatterplotData(data);
        setScatterplotData(scatterData);

        const subCategoryData = aggregateSalesBySubCategory(data);
        setSalesBySubCategoryData(subCategoryData);

        const categoryData = aggregateCategorySubCategoryData(data);
        setCategorySubCategoryData(categoryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadDataAndProcess();
  }, []);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          fontSize: '18px'
        }}
      >
        <span aria-hidden="true">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        aria-label="Error loading dashboard"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          fontSize: '18px',
          color: 'red'
        }}
      >
        <span>Error: {error}</span>
      </div>
    );
  }

  // Dashboard dimensions based on Tableau spec (1000 x 800 base)
  const dashboardWidth = 1200;
  const topSectionHeight = 450;
  const bottomSectionHeight = 280;
  const topChartWidth = 560;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
        padding: '16px'
      }}
    >
      {/* KPI Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '24px'
        }}
      >
        {kpiMetrics && (
          <>
            <KPICard title="Total Sales" value={kpiMetrics.totalSales} format="currency" />
            <KPICard title="Total Profit" value={kpiMetrics.totalProfit} format="currency" />
            <KPICard title="Profit Ratio" value={kpiMetrics.profitRatio} format="percent" />
          </>
        )}
      </div>

      {/* Top Section: Scatterplot and Sales by Sub-Category */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '16px'
        }}
      >
        {/* P121__scatterplot - Top Left */}
        <div
          style={{
            flex: '0 0 auto',
            width: `${topChartWidth}px`,
            backgroundColor: '#ffffff'
          }}
        >
          <ScatterplotWorksheet
            data={scatterplotData}
            width={topChartWidth}
            height={topSectionHeight}
            title="Scatterplot"
          />
        </div>

        {/* P9517__sales_by_sub_category - Top Right */}
        <div
          style={{
            flex: '0 0 auto',
            width: `${topChartWidth}px`,
            backgroundColor: '#ffffff'
          }}
        >
          <HorizontalBarChart
            data={salesBySubCategoryData}
            width={topChartWidth}
            height={topSectionHeight}
            title="Sales by Sub Category"
          />
        </div>
      </div>

      {/* Bottom Section: Category/Sub-Category Bar Chart */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#ffffff'
        }}
      >
        <HorizontalBarChart
          data={categorySubCategoryData}
          width={dashboardWidth}
          height={bottomSectionHeight}
          title="Bar"
          colorByCategory={true}
        />
      </div>
    </div>
  );
};
