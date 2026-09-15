import React, { useState, useEffect } from 'react';
import { OfficeSupplyData } from '../types';
import { loadOfficeSuppliesData, filterData } from '../services/dataLoader';
import { useDashboardFilters } from '../contexts/DashboardContext';
import { SalesRepVsUnits } from './SalesRepVsUnits';
import { SalesRepVsRevenue } from './SalesRepVsRevenue';
import { DataTable } from './DataTable';
import { LineChart } from './LineChart';

export function Dashboard() {
  const [allData, setAllData] = useState<OfficeSupplyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useDashboardFilters();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadOfficeSuppliesData();
        setAllData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Apply filters to data
  const filteredData = React.useMemo(() => {
    return filterData(allData, filters);
  }, [allData, filters]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#d32f2f'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: '8px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
    }}>
      {/* Filter Status */}
      {(filters.selectedSalesRep || filters.selectedItem || filters.selectedDate) && (
        <div style={{
          marginBottom: '8px',
          padding: '10px 15px',
          backgroundColor: '#fff3e0',
          borderRadius: '4px',
          border: '1px solid #ff9800',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px'
        }}>
          <strong>Active Filters:</strong>
          {filters.selectedSalesRep && (
            <span style={{
              backgroundColor: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ff9800'
            }}>
              Sales Rep: {filters.selectedSalesRep}
            </span>
          )}
          {filters.selectedItem && (
            <span style={{
              backgroundColor: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ff9800'
            }}>
              Item: {filters.selectedItem}
            </span>
          )}
          {filters.selectedDate && (
            <span style={{
              backgroundColor: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ff9800'
            }}>
              Date: {filters.selectedDate}
            </span>
          )}
        </div>
      )}

      {/* Dashboard Layout - Matches Tableau zone coordinates */}
      <div style={{
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        flex: 1,
        minHeight: 0,
      }}>
        {/* Top Left: Sales rep vs Units */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Sales rep vs Units
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <SalesRepVsUnits data={filteredData} />
          </div>
        </div>

        {/* Top Right: sales rep vs revenue */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            sales rep vs revenue
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <SalesRepVsRevenue data={filteredData} />
          </div>
        </div>

        {/* Bottom Left: datatable (narrower per Tableau zone: w_ratio: 0.1598) */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            datatable
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <DataTable data={filteredData} />
          </div>
        </div>

        {/* Bottom Right: Line chart (wider per Tableau zone: w_ratio: 0.8305) */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Line chart
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <LineChart data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
}
