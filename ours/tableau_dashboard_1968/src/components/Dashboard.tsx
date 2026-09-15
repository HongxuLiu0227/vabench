import { useState, useEffect, useMemo } from 'react';
import { DashboardProvider, useDashboard } from '../contexts/DashboardContext';
import { loadData, filterData, aggregateByCustomer, aggregateByRegion, type DataRow } from '../services/dataLoader';
import { CustomerOverview } from './CustomerOverview';
import { CustomerRank } from './CustomerRank';
import { SalesAndProfitByCustomers } from './SalesAndProfitByCustomers';
import { FilterControls } from './FilterControls';
import { ColorLegend } from './ColorLegend';

function DashboardContent() {
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useDashboard();

  // Load data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await loadData();
        setRawData(data);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter data based on dashboard filters
  const filteredData = useMemo(() => {
    return filterData(rawData, state.filters);
  }, [rawData, state.filters]);

  // Further filter by selected region (from interaction)
  const interactionFilteredData = useMemo(() => {
    if (!state.selectedRegion) return filteredData;
    return filteredData.filter((d) => d.region === state.selectedRegion);
  }, [filteredData, state.selectedRegion]);

  // Aggregate by region (for Customer Overview)
  const regionData = useMemo(() => {
    return aggregateByRegion(filteredData);
  }, [filteredData]);

  // Aggregate by customer (for Customer Rank and Scatter)
  const customerData = useMemo(() => {
    let data = interactionFilteredData;
    // Further filter by selected customer if set
    if (state.selectedCustomer) {
      data = data.filter((d) => d.customerName === state.selectedCustomer);
    }
    return aggregateByCustomer(data);
  }, [interactionFilteredData, state.selectedCustomer]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            Loading Dashboard...
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Please wait while we load the data.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'red' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            Error
          </div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0', textAlign: 'center' }}>
          Customer Sales Dashboard
        </h1>

        {/* Dashboard Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Row: Customer Overview */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              Customer Overview
            </h2>
            <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
              <CustomerOverview data={regionData} width={1100} height={200} />
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Left: Sales and Profit by Customers */}
            <div style={{ flex: '0 0 450px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                Sales and Profit by Customers
              </h2>
              <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                <SalesAndProfitByCustomers data={customerData} width={430} height={600} />
              </div>
            </div>

            {/* Middle: Customer Rank */}
            <div style={{ flex: '0 0 450px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                Customer Rank
              </h2>
              <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                <CustomerRank data={customerData} width={430} height={600} maxBars={20} />
              </div>
            </div>

            {/* Right: Filters and Legend */}
            <div style={{ flex: '1', minWidth: '150px' }}>
              <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                <FilterControls data={rawData} />
                <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                <ColorLegend />
              </div>
            </div>
          </div>
        </div>

        {/* Selection info */}
        {(state.selectedRegion || state.selectedCustomer) && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '4px',
            fontSize: '12px',
          }}>
            <strong>Active Filters:</strong>
            {state.selectedRegion && <span> Region: {state.selectedRegion}</span>}
            {state.selectedCustomer && <span> Customer: {state.selectedCustomer}</span>}
            <button
              onClick={() => {
                // Clear selections - this will be handled by context
                window.location.reload();
              }}
              style={{
                marginLeft: '10px',
                padding: '2px 8px',
                fontSize: '11px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
