import { useEffect, useState } from 'react';
import { Scatterplot } from './Scatterplot';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { CustomerOverview } from './CustomerOverview';
import {
  loadData,
  aggregateScatterplotData,
  aggregateBarChartData,
  aggregateYearlySalesData,
  aggregateCustomerOverviewData,
} from '../services/dataService';
import type { ScatterplotData, BarChartData, YearlySalesData, CustomerOverviewData } from '../types';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scatterplotData, setScatterplotData] = useState<ScatterplotData[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [yearlySalesData, setYearlySalesData] = useState<YearlySalesData[]>([]);
  const [customerOverviewData, setCustomerOverviewData] = useState<CustomerOverviewData[]>([]);

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        setError(null);

        const data = await loadData();

        // Aggregate data for each worksheet
        setScatterplotData(aggregateScatterplotData(data));
        setBarChartData(aggregateBarChartData(data));
        setYearlySalesData(aggregateYearlySalesData(data));
        setCustomerOverviewData(aggregateCustomerOverviewData(data));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: 'red',
        }}
      >
        Error: {error}
      </div>
    );
  }

  // Dashboard size: 1000x800
  // 2x2 grid with margins
  const containerWidth = 1000;
  const containerHeight = 800;
  const outerMargin = 8;
  const innerMargin = 4;

  // Calculate worksheet sizes
  const worksheetWidth = (containerWidth - 2 * outerMargin - innerMargin) / 2;
  const worksheetHeight = (containerHeight - 2 * outerMargin - innerMargin) / 2;

  return (
    <div
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        margin: '0 auto',
        padding: `${outerMargin}px`,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
      }}
    >
      <h1
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        Synthetic Dashboard 455
      </h1>

      {/* Top Row */}
      <div style={{ display: 'flex', marginBottom: `${innerMargin}px` }}>
        {/* Top Left: Bar Chart (P121__bar) */}
        <div
          style={{
            width: `${worksheetWidth}px`,
            height: `${worksheetHeight}px`,
            marginRight: `${innerMargin}px`,
          }}
        >
          <BarChart data={barChartData} width={worksheetWidth} height={worksheetHeight} />
        </div>

        {/* Top Right: Scatterplot (P121__scatterplot) */}
        <div
          style={{
            width: `${worksheetWidth}px`,
            height: `${worksheetHeight}px`,
          }}
        >
          <Scatterplot data={scatterplotData} width={worksheetWidth} height={worksheetHeight} />
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'flex' }}>
        {/* Bottom Left: Yearly Sales (P1225__total_sales_each_year) */}
        <div
          style={{
            width: `${worksheetWidth}px`,
            height: `${worksheetHeight}px`,
            marginRight: `${innerMargin}px`,
          }}
        >
          <LineChart data={yearlySalesData} width={worksheetWidth} height={worksheetHeight} />
        </div>

        {/* Bottom Right: Customer Overview (P1968__customer_overview) */}
        <div
          style={{
            width: `${worksheetWidth}px`,
            height: `${worksheetHeight}px`,
          }}
        >
          <CustomerOverview data={customerOverviewData} width={worksheetWidth} height={worksheetHeight} />
        </div>
      </div>
    </div>
  );
}
