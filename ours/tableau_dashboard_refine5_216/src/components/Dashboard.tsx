import { useDashboardData } from '../hooks/useDashboardData';
import { TotalSalesEachYear } from './worksheets/TotalSalesEachYear';
import { CustomerOverview } from './worksheets/CustomerOverview';
import { Scatterplot } from './worksheets/Scatterplot';
import { BarChart } from './worksheets/BarChart';

export function Dashboard() {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          fontFamily: 'sans-serif',
        }}
      >
        Loading dashboard data...
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
          fontFamily: 'sans-serif',
          color: 'red',
        }}
      >
        Error loading dashboard: {error.message}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div
      style={{
        width: '1000px',
        height: '800px',
        margin: '0 auto',
        padding: '8px',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '0',
          height: '784px',
        }}
      >
        {/* Top-Left: Customer Overview */}
        <div
          style={{
            padding: '4px',
            overflow: 'auto',
          }}
        >
          <CustomerOverview data={data.customerOverview} />
        </div>

        {/* Top-Right: Total Sales Each Year */}
        <div
          style={{
            padding: '4px',
          }}
        >
          <TotalSalesEachYear data={data.yearlySales} />
        </div>

        {/* Bottom-Left: Bar */}
        <div
          style={{
            padding: '4px',
          }}
        >
          <BarChart data={data.barChart} />
        </div>

        {/* Bottom-Right: Scatterplot */}
        <div
          style={{
            padding: '4px',
          }}
        >
          <Scatterplot data={data.scatterplot} />
        </div>
      </div>
    </div>
  );
}
