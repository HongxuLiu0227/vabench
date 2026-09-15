import { useSuperstoreData } from '../hooks/useSuperstoreData';
import { HorizontalRankedBar } from './HorizontalRankedBar';
import { LineChart } from './LineChart';

export function Dashboard() {
  const { salesBySubCategory, salesByYear, salesByMonth, loading, error } = useSuperstoreData();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading data...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we fetch the dashboard data</div>
        </div>
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
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', color: '#d32f2f' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Error loading data</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  // Dashboard layout based on tableau_spec.json zone specifications
  // Zone layout (normalized to percentage):
  // - P9517__sales_by_sub_category: x=0.8%, y=1%, w=49.2%, h=61.75% (left column, top)
  // - P1225__total_sales_each_year: x=50%, y=1%, w=49.2%, h=61.75% (right column, top)
  // - P121__line: x=0.8%, y=62.75%, w=98.4%, h=36.25% (full width, bottom)

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top row: Two columns */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: '0 0 auto',
          height: '62%',
          marginBottom: '1%',
        }}
      >
        {/* Left column: P9517__sales_by_sub_category */}
        <div
          style={{
            flex: '0 0 49%',
            marginRight: '1%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HorizontalRankedBar
            data={salesBySubCategory}
            title="Sales by Sub Category"
            width={500}
            height={500}
          />
        </div>

        {/* Right column: P1225__total_sales_each_year */}
        <div
          style={{
            flex: '0 0 49%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LineChart
            data={salesByYear}
            title="Total Sales Each Year"
            width={500}
            height={500}
            dataKey="year"
          />
        </div>
      </div>

      {/* Bottom row: P121__line (full width) */}
      <div
        style={{
          flex: '1 1 auto',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LineChart
          data={salesByMonth}
          title="Line"
          width={1100}
          height={350}
          dataKey="month"
        />
      </div>
    </div>
  );
}
