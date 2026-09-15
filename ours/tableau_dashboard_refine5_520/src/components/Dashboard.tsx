import { useEffect, useState } from 'react';
import type { DataRow, RegionMetrics, MonthlySales, YearlySales, ProductMetrics } from '../types';
import {
  loadData,
  aggregateByRegion,
  aggregateByMonth,
  aggregateByYear,
  aggregateByProduct,
  validateDataQuality,
} from '../services/dataLoader';
import P121Line from './P121__line';
import P1968CustomerOverview from './P1968__customer_overview';
import P1225TotalSalesEachYear from './P1225__total_sales_each_year';
import P121Scatterplot from './P121__scatterplot';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [regionData, setRegionData] = useState<RegionMetrics[]>([]);
  const [monthlySalesData, setMonthlySalesData] = useState<MonthlySales[]>([]);
  const [yearlySalesData, setYearlySalesData] = useState<YearlySales[]>([]);
  const [productData, setProductData] = useState<ProductMetrics[]>([]);

  useEffect(() => {
    const loadDataAndAggregate = async () => {
      try {
        setLoading(true);
        console.log('Starting data load...');

        const data: DataRow[] = await loadData();

        // Validate data quality
        const validation = validateDataQuality(data);
        if (!validation.valid) {
          console.error('Data quality issues detected:', validation.issues);
          setWarnings(validation.issues);
          // Don't fail completely, just warn
        }

        // Aggregate data
        console.log('Aggregating data...');
        const regionMetrics = aggregateByRegion(data);
        const monthlySales = aggregateByMonth(data);
        const yearlySales = aggregateByYear(data);
        const productMetrics = aggregateByProduct(data);

        // Validate aggregated data
        if (regionMetrics.length === 0) {
          throw new Error('No region data available after aggregation');
        }
        if (monthlySales.length === 0) {
          throw new Error('No monthly sales data available after aggregation');
        }
        if (yearlySales.length === 0) {
          throw new Error('No yearly sales data available after aggregation');
        }
        if (productMetrics.length === 0) {
          throw new Error('No product data available after aggregation');
        }

        console.log('Data aggregation complete:', {
          regions: regionMetrics.length,
          months: monthlySales.length,
          years: yearlySales.length,
          products: productMetrics.length,
        });

        setRegionData(regionMetrics);
        setMonthlySalesData(monthlySales);
        setYearlySalesData(yearlySales);
        setProductData(productMetrics);

        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error loading data:', err);
        setError(`Failed to load data: ${errorMessage}`);
        setLoading(false);
      }
    };

    loadDataAndAggregate();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          fontFamily: 'sans-serif',
          gap: '20px',
        }}
      >
        <div>Loading dashboard...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Fetching and parsing CSV data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: 'red',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '20px' }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (warnings.length > 0) {
    console.warn('Data quality warnings:', warnings);
  }

  return (
    <div
      style={{
        padding: '8px',
        fontFamily: 'sans-serif',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
      }}
    >
      {/* 2x2 Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '4px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Top-Left: Customer Overview */}
        <div
          style={{
            padding: '4px',
            minHeight: '400px',
          }}
        >
          <P1968CustomerOverview data={regionData} />
        </div>

        {/* Top-Right: Scatterplot */}
        <div
          style={{
            padding: '4px',
            minHeight: '400px',
          }}
        >
          <P121Scatterplot data={productData} width={500} height={350} />
        </div>

        {/* Bottom-Left: Total Sales Each Year */}
        <div
          style={{
            padding: '4px',
            minHeight: '400px',
          }}
        >
          <P1225TotalSalesEachYear data={yearlySalesData} width={500} height={350} />
        </div>

        {/* Bottom-Right: Line (Monthly Sales) */}
        <div
          style={{
            padding: '4px',
            minHeight: '400px',
          }}
        >
          <P121Line data={monthlySalesData} width={500} height={350} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
