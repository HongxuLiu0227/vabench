import React from 'react';
import { LineChart } from './LineChart';
import { ScatterPlot } from './ScatterPlot';
import { YearlySalesChart } from './YearlySalesChart';
import { HorizontalBarChart } from './HorizontalBarChart';
import type { DashboardData } from '../hooks/useData';

interface DashboardProps {
  data: DashboardData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Calculate dimensions for each chart based on the zone specifications
  // The dashboard is 1000x800 total with 2x2 grid
  const containerWidth = 1000;
  const containerHeight = 800;
  const chartWidth = (containerWidth - 24) / 2; // Subtract margins and divide by 2
  const chartHeight = (containerHeight - 24) / 2; // Subtract margins and divide by 2

  return (
    <div style={{
      width: '100%',
      maxWidth: `${containerWidth}px`,
      height: 'auto',
      margin: '0 auto',
      padding: '8px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '4px',
        width: '100%',
        height: 'auto'
      }}>
        {/* Top Left: P121__scatterplot */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}>
          <ScatterPlot
            data={data.salesByProduct}
            width={chartWidth}
            height={chartHeight}
            title="Scatterplot"
          />
        </div>

        {/* Top Right: P121__line */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}>
          <LineChart
            data={data.salesByMonth}
            width={chartWidth}
            height={chartHeight}
            title="Line"
          />
        </div>

        {/* Bottom Left: P9517__sales_by_sub_category */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}>
          <HorizontalBarChart
            data={data.salesBySubCategory}
            width={chartWidth}
            height={chartHeight}
            title="Sales by Sub Category"
          />
        </div>

        {/* Bottom Right: P1225__total_sales_each_year */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}>
          <YearlySalesChart
            data={data.salesByYear}
            width={chartWidth}
            height={chartHeight}
            title="Total Sales Each Year"
          />
        </div>
      </div>
    </div>
  );
};
