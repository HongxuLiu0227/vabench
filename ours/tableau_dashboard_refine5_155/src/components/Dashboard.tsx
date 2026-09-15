import { useMemo } from 'react';
import { P121__scatterplot } from './worksheets/P121__scatterplot';
import { P121__bar } from './worksheets/P121__bar';
import { P1225__total_sales_each_year } from './worksheets/P1225__total_sales_each_year';
import { P1968__customer_overview } from './worksheets/P1968__customer_overview';
import { aggregateByProduct, aggregateByCategory, aggregateByYear, aggregateCustomerOverview } from '../utils/dataAggregation';
import type { ParsedOrder } from '../types';

interface DashboardProps {
  data: ParsedOrder[];
}

export function Dashboard({ data }: DashboardProps) {
  // Aggregate data for each worksheet
  const productData = useMemo(() => aggregateByProduct(data), [data]);
  const categoryData = useMemo(() => aggregateByCategory(data), [data]);
  const yearlyData = useMemo(() => aggregateByYear(data), [data]);
  const customerData = useMemo(() => aggregateCustomerOverview(data), [data]);

  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '8px',
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      {/* 2x2 Grid Layout matching Tableau zone coordinates */}
      {/* Top row: P121__bar (left), P1968__customer_overview (right) */}
      {/* Bottom row: P1225__total_sales_each_year (left), P121__scatterplot (right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto auto',
        gap: '4px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Top Left: P121__bar (zone: x=593, y=1054) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <P121__bar data={categoryData} width={580} height={480} />
        </div>

        {/* Top Right: P1968__customer_overview (zone: x=50000, y=1054) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <P1968__customer_overview data={customerData} width={580} height={480} />
        </div>

        {/* Bottom Left: P1225__total_sales_each_year (zone: x=593, y=49996) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <P1225__total_sales_each_year data={yearlyData} width={580} height={480} />
        </div>

        {/* Bottom Right: P121__scatterplot (zone: x=50000, y=49996) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <P121__scatterplot data={productData} width={580} height={480} />
        </div>
      </div>
    </div>
  );
}
