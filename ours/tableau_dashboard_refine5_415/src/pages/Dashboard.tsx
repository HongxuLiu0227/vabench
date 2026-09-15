import { useEffect, useState } from 'react';
import { LineChart } from '../components/LineChart';
import { ScatterPlot } from '../components/ScatterPlot';
import { YearlyLineChart } from '../components/YearlyLineChart';
import { CustomerOverviewTable } from '../components/CustomerOverviewTable';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { getSuperstoreData } from '../services/dataLoader';
import { aggregateSalesByMonth, aggregateSalesByYear, aggregateByProduct, aggregateCustomerOverviewByRegion } from '../services/dataTransformers';
import type { TimeSeriesData, YearlyData, ScatterPoint, CustomerOverviewData } from '../types';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<TimeSeriesData[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [customerOverviewData, setCustomerOverviewData] = useState<CustomerOverviewData[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const data = await getSuperstoreData();

        // Transform data for each worksheet
        const monthly = aggregateSalesByMonth(data);
        const yearly = aggregateSalesByYear(data);
        const scatter = aggregateByProduct(data);
        const customerOverview = aggregateCustomerOverviewByRegion(data);

        setMonthlyData(monthly);
        setYearlyData(yearly);
        setScatterData(scatter);
        setCustomerOverviewData(customerOverview);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Calculate chart dimensions based on zone specifications
  // The dashboard is 1000px wide by 800px tall
  // Zone layout (2x2 grid):
  // - P121__scatterplot: top-left (x=800, y=1000, w=49200, h=49000)
  // - P121__line: top-right (x=50000, y=1000, w=49200, h=49000)
  // - P1968__customer_overview: bottom-left (x=800, y=50000, h=49000)
  // - P1225__total_sales_each_year: bottom-right (x=50000, y=50000, h=49000)

  // Normalized coordinates (0-1 scale):
  // scatterplot: x=0.008, y=0.01, w=0.492, h=0.49
  // line: x=0.5, y=0.01, w=0.492, h=0.49
  // customer_overview: x=0.008, y=0.5, w=0.492, h=0.49
  // total_sales: x=0.5, y=0.5, w=0.492, h=0.49

  const containerWidth = 1000;
  const containerHeight = 800;
  const margin = 16; // Margin around the dashboard

  // Calculate chart dimensions with margins between charts
  const chartGap = 20;
  const topHeight = (containerHeight - margin * 2 - chartGap) / 2;
  const bottomHeight = topHeight;
  const leftWidth = (containerWidth - margin * 2 - chartGap) / 2;
  const rightWidth = leftWidth;

  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight,
        margin: '0 auto',
        padding: `${margin}px`,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', gap: `${chartGap}px`, marginBottom: `${chartGap}px`, height: topHeight }}>
        {/* P121__scatterplot - top-left */}
        <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
          <ScatterPlot data={scatterData} width={leftWidth} height={topHeight} title="Scatterplot" />
        </div>

        {/* P121__line - top-right */}
        <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
          <LineChart data={monthlyData} width={rightWidth} height={topHeight} title="Line" />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', gap: `${chartGap}px`, height: bottomHeight }}>
        {/* P1968__customer_overview - bottom-left */}
        <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
          <CustomerOverviewTable data={customerOverviewData} width={leftWidth} height={bottomHeight} title="Customer Overview" />
        </div>

        {/* P1225__total_sales_each_year - bottom-right */}
        <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
          <YearlyLineChart data={yearlyData} width={rightWidth} height={bottomHeight} title="Total Sales Each Year" />
        </div>
      </div>
    </div>
  );
};
