import { useMemo, useRef } from 'react';
import { Scatterplot } from './Scatterplot';
import { DiscountOverview } from './DiscountOverview';
import { LineChart } from './LineChart';
import { YearlySalesChart } from './YearlySalesChart';
import type { SuperstoreData } from '../services/types';
import {
  aggregateByProduct,
  aggregateByRegion,
  aggregateByMonth,
  aggregateByYear,
} from '../services/dataService';

interface DashboardProps {
  data: SuperstoreData[];
}

export function Dashboard({ data }: DashboardProps) {
  const productData = useMemo(() => aggregateByProduct(data), [data]);
  const regionData = useMemo(() => aggregateByRegion(data), [data]);
  const monthlyData = useMemo(() => aggregateByMonth(data), [data]);
  const yearlyData = useMemo(() => aggregateByYear(data), [data]);

  // Create refs for each chart container
  const discountRef = useRef<HTMLDivElement>(null);
  const yearlySalesRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const scatterplotRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        padding: '8px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '8px',
          height: 'calc(100vh - 16px)',
        }}
      >
        {/* Top-Left: Discount Overview by Region */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Discount Overview by Region
          </h3>
          <div ref={discountRef} style={{ flex: 1, overflow: 'auto' }}>
            <DiscountOverview data={regionData} />
          </div>
        </div>

        {/* Top-Right: Total Sales Each Year */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Total Sales Each Year
          </h3>
          <div ref={yearlySalesRef} style={{ flex: 1, overflow: 'hidden' }}>
            <YearlySalesChart
              data={yearlyData}
              containerRef={yearlySalesRef}
            />
          </div>
        </div>

        {/* Bottom-Left: Line Chart */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Line
          </h3>
          <div ref={lineChartRef} style={{ flex: 1, overflow: 'hidden' }}>
            <LineChart data={monthlyData} containerRef={lineChartRef} />
          </div>
        </div>

        {/* Bottom-Right: Scatterplot */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Scatterplot
          </h3>
          <div ref={scatterplotRef} style={{ flex: 1, overflow: 'hidden' }}>
            <Scatterplot data={productData} containerRef={scatterplotRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
