import React, { useEffect, useState } from 'react';
import { Scatterplot } from './Scatterplot';
import { HorizontalBarChart } from './HorizontalBarChart';
import { SalesBySubCategory } from './SalesBySubCategory';
import { loadSalesData, aggregateScatterData, aggregateBarDataByCategory, aggregateBarDataBySubCategory } from '../services/dataLoader';
import type { ScatterDataPoint, BarChartData } from '../types';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scatterData, setScatterData] = useState<ScatterDataPoint[]>([]);
  const [barData, setBarData] = useState<BarChartData[]>([]);
  const [subCategoryData, setSubCategoryData] = useState<BarChartData[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadSalesData();

        const scatter = aggregateScatterData(data);
        const bar = aggregateBarDataByCategory(data);
        const subCategory = aggregateBarDataBySubCategory(data);

        setScatterData(scatter);
        setBarData(bar);
        setSubCategoryData(subCategory);
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
        aria-label="Loading dashboard"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}
      >
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{ padding: '20px', color: 'red', fontSize: '16px' }}
      >
        <strong>Error loading dashboard:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: '8px',
      background: '#ffffff',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Top row container */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '0px',
        marginBottom: '0px',
        height: '620px'
      }}>
        {/* Left: Scatterplot */}
        <div style={{
          flex: '0 0 49.2%',
          background: '#e6e6e6',
          padding: '4px',
          boxSizing: 'border-box'
        }}>
          <div style={{ background: '#ffffff', padding: '4px' }}>
            <Scatterplot data={scatterData} width={480} height={600} title="Scatterplot" />
          </div>
        </div>

        {/* Right: Bar chart */}
        <div style={{
          flex: '0 0 49.2%',
          background: '#ffffff',
          padding: '4px',
          boxSizing: 'border-box'
        }}>
          <div style={{ background: '#ffffff', padding: '4px' }}>
            <HorizontalBarChart data={barData} width={480} height={600} title="Bar" maxBars={50} />
          </div>
        </div>
      </div>

      {/* Bottom row: Sales by Sub Category */}
      <div style={{
        background: '#ffffff',
        padding: '4px',
        boxSizing: 'border-box',
        height: '370px'
      }}>
        <div style={{ background: '#ffffff', padding: '4px' }}>
          <SalesBySubCategory data={subCategoryData} width={980} height={360} />
        </div>
      </div>
    </div>
  );
};
