/**
 * Dashboard Component
 * Synthetic Dashboard 171
 *
 * Layout based on tableau_spec.json zone coordinates:
 * - P9517__sales_by_sub_category: x=800, y=1000, w=49200, h=49000 (top-left)
 * - P121__scatterplot: x=50000, y=1000, w=49200, h=49000 (top-right)
 * - P1225__total_sales_each_year: x=800, y=50000, w=49200, h=49000 (bottom-left)
 * - P121__line: x=50000, y=50000, w=49200, h=49000 (bottom-right)
 */

import React, { useState, useEffect } from 'react';
import { Scatterplot } from './Scatterplot';
import { HorizontalRankedBar } from './HorizontalRankedBar';
import { LineChart } from './LineChart';
import {
  loadScatterplotData,
  loadSalesBySubCategory,
  loadLineChartData,
  loadYearlySalesData
} from '../services/dataService';
import type { ScatterDataPoint, SalesBySubCategory, LineDataPoint, YearlySalesDataPoint } from '../types/data';

export const Dashboard: React.FC = () => {
  const [scatterData, setScatterData] = useState<ScatterDataPoint[]>([]);
  const [barData, setBarData] = useState<SalesBySubCategory[]>([]);
  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlySalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [scatter, bar, line, yearly] = await Promise.all([
          loadScatterplotData(),
          loadSalesBySubCategory(),
          loadLineChartData(),
          loadYearlySalesData()
        ]);
        setScatterData(scatter);
        setBarData(bar.slice(0, 50)); // Limit to top 50 for readability
        setLineData(line);
        setYearlyData(yearly);
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
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard data"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          gap: '16px'
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #2171b5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <p>Loading dashboard data...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
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
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#d32f2f',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Error Loading Dashboard</h2>
        <p style={{ fontSize: '16px', marginBottom: '16px' }}>{error}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Please ensure the data file is available at:
          <br />
          <code style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
            /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv
          </code>
        </p>
      </div>
    );
  }

  // Calculate dimensions based on container size
  // Dashboard is 1000x800, split into 2x2 grid
  const containerWidth = 1000;
  const containerHeight = 800;
  const margin = 8;

  // Each worksheet gets roughly half the width/height minus margins
  const worksheetWidth = (containerWidth - margin * 3) / 2;
  const worksheetHeight = (containerHeight - margin * 3) / 2;

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      padding: '8px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '4px',
        flex: 1,
        width: '100%',
        height: '100%'
      }}>
        {/* Top Left: P9517__sales_by_sub_category */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          padding: '4px',
          backgroundColor: '#fafafa',
          overflow: 'hidden'
        }}>
          <HorizontalRankedBar
            data={barData}
            width={worksheetWidth}
            height={worksheetHeight}
            title="Sales by Sub Category"
          />
        </div>

        {/* Top Right: P121__scatterplot */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          padding: '4px',
          backgroundColor: '#fafafa',
          overflow: 'hidden'
        }}>
          <Scatterplot
            data={scatterData}
            width={worksheetWidth}
            height={worksheetHeight}
            title="Scatterplot"
          />
        </div>

        {/* Bottom Left: P1225__total_sales_each_year */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          padding: '4px',
          backgroundColor: '#fafafa',
          overflow: 'hidden'
        }}>
          <LineChart
            data={yearlyData}
            width={worksheetWidth}
            height={worksheetHeight}
            title="Total Sales Each Year"
            isYearly={true}
          />
        </div>

        {/* Bottom Right: P121__line */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          padding: '4px',
          backgroundColor: '#fafafa',
          overflow: 'hidden'
        }}>
          <LineChart
            data={lineData}
            width={worksheetWidth}
            height={worksheetHeight}
            title="Line"
            isYearly={false}
          />
        </div>
      </div>
    </div>
  );
};
