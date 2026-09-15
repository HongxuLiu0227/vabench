import { useData } from '../hooks/useData';
import { Scatterplot } from '../charts/Scatterplot';
import { TotalSalesByYear } from '../charts/TotalSalesByYear';
import { CustomerOverview } from '../charts/CustomerOverview';
import { ChartContainer } from './ChartContainer';

export function Dashboard() {
  const { productData, yearData, regionData, loading, error } = useData();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
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
          color: '#d32f2f',
        }}
      >
        Error loading dashboard: {error}
      </div>
    );
  }

  const dashboardWidth = 1000;
  const dashboardHeight = 800;

  // Calculate dimensions based on normalized ratios from tableau_spec.json
  const scatterplotWidth = Math.floor(dashboardWidth * 0.492);
  const scatterplotHeight = Math.floor(dashboardHeight * 0.6175);

  const salesByYearWidth = Math.floor(dashboardWidth * 0.492);
  const salesByYearHeight = Math.floor(dashboardHeight * 0.6175);

  return (
    <div
      style={{
        width: `${dashboardWidth}px`,
        height: `${dashboardHeight}px`,
        backgroundColor: '#ffffff',
        padding: '8px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '62% 36%',
          gap: '0px',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Top Left: Scatterplot */}
        <div
          style={{
            backgroundColor: '#e6e6e6',
            gridRow: '1',
            gridColumn: '1',
            overflow: 'hidden',
          }}
        >
          <ChartContainer title="Scatterplot">
            <Scatterplot
              data={productData}
              width={scatterplotWidth}
              height={scatterplotHeight}
            />
          </ChartContainer>
        </div>

        {/* Top Right: Total Sales Each Year */}
        <div
          style={{
            backgroundColor: '#e6e6e6',
            gridRow: '1',
            gridColumn: '2',
            overflow: 'hidden',
          }}
        >
          <ChartContainer title="Total Sales Each Year">
            <TotalSalesByYear
              data={yearData}
              width={salesByYearWidth}
              height={salesByYearHeight}
            />
          </ChartContainer>
        </div>

        {/* Bottom: Customer Overview (spans both columns) */}
        <div
          style={{
            backgroundColor: '#e6e6e6',
            gridRow: '2',
            gridColumn: '1 / span 2',
            overflow: 'hidden',
          }}
        >
          <ChartContainer title="Customer Overview">
            <CustomerOverview data={regionData} />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
