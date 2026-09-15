/**
 * Dashboard component for "Synthetic Dashboard 204"
 * 2x2 grid layout following Tableau zone specification:
 * - Top-left: P1225__total_sales_each_year (line chart)
 * - Top-right: P9517__sales_by_sub_category (horizontal bar)
 * - Bottom-left: P121__scatterplot (scatterplot)
 * - Bottom-right: P121__bar (horizontal bar)
 */

import { useEffect, useState } from 'react';
import {
  SalesBySubCategory,
  TotalSalesEachYear,
  BarChart,
  ScatterPlotWorksheet,
} from './worksheets';
import { loadDashboardData } from '../services/dataService';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';
import type {
  AggregatedSalesBySubCategory,
  AggregatedSalesByCategorySubCategory,
  AggregatedSalesByYear,
  ScatterPlotData,
} from '../types/data';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    salesBySubCategory: AggregatedSalesBySubCategory[];
    salesByCategorySubCategory: AggregatedSalesByCategorySubCategory[];
    salesByYear: AggregatedSalesByYear[];
    scatterPlotData: ScatterPlotData[];
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await loadDashboardData();
        setData(dashboardData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        padding: '8px',
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '4px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Top-left: P1225__total_sales_each_year (line chart) */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '2px',
            overflow: 'auto',
          }}
        >
          <TotalSalesEachYear data={data.salesByYear} />
        </div>

        {/* Top-right: P9517__sales_by_sub_category (horizontal bar) */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '2px',
            overflow: 'auto',
          }}
        >
          <SalesBySubCategory data={data.salesBySubCategory} />
        </div>

        {/* Bottom-left: P121__scatterplot (scatterplot) */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '2px',
            overflow: 'auto',
          }}
        >
          <ScatterPlotWorksheet data={data.scatterPlotData} />
        </div>

        {/* Bottom-right: P121__bar (horizontal bar) */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '2px',
            overflow: 'auto',
          }}
        >
          <BarChart data={data.salesByCategorySubCategory} />
        </div>
      </div>
    </div>
  );
};
