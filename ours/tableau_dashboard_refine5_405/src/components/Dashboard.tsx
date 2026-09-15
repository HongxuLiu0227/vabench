import { useWorksheetData } from '../services/dataService';
import { DiscountOverview } from './DiscountOverview';
import { SalesBySubCategory } from './SalesBySubCategory';
import { Scatterplot } from './Scatterplot';

export function Dashboard() {
  const { discountOverview, salesBySubCategory, scatterplot, loading, error } = useWorksheetData();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading dashboard...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we fetch the data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#c00' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Error loading data</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1000px',
        height: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '8px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Top Row: 62% height */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          height: '62%',
        }}
      >
        {/* Left: Discount Overview by Region - 50% width */}
        <div
          style={{
            flex: '1',
            backgroundColor: '#e6e6e6',
            padding: '8px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '8px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <DiscountOverview data={discountOverview} width={450} height={450} />
          </div>
        </div>

        {/* Right: Sales by Sub Category - 50% width */}
        <div
          style={{
            flex: '1',
            padding: '8px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '8px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <SalesBySubCategory data={salesBySubCategory} width={450} height={450} />
          </div>
        </div>
      </div>

      {/* Bottom Row: 38% height */}
      <div
        style={{
          height: '38%',
          padding: '8px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '8px',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Scatterplot data={scatterplot} width={900} height={270} />
        </div>
      </div>
    </div>
  );
}
