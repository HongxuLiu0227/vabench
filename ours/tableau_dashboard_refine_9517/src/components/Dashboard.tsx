import { useState, useEffect } from 'react';
import { filterData } from '../services/dataService';
import { useDashboard } from '../hooks/useDashboard';
import { Top10Customers } from './worksheets/Top10Customers';
import { Bottom10Customers } from './worksheets/Bottom10Customers';
import { SalesByCity } from './worksheets/SalesByCity';
import { SalesBySubCategory } from './worksheets/SalesBySubCategory';
import { CustomerSalesProfits } from './worksheets/CustomerSalesProfits';
import { SalesMap } from './worksheets/SalesMap';
import { Info } from './worksheets/Info';
import type { ParsedOrder } from '../types';

interface DashboardProps {
  data: ParsedOrder[];
}

export function Dashboard({ data }: DashboardProps) {
  const { filters, clearFilters } = useDashboard();
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    const filtered = filterData(data, filters);
    setFilteredData(filtered);
  }, [data, filters]);

  return (
    <div
      style={{
        padding: '8px',
        maxWidth: '1366px',
        margin: '0 auto',
        backgroundColor: '#fff',
        minHeight: '768px',
      }}
    >
      {/* Info Section - Full width */}
      <div style={{ marginBottom: '10px' }}>
        <Info data={filteredData} />
      </div>

      {/* Main Dashboard Layout - Matching Tableau zone coordinates */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          gap: '0',
          marginBottom: '10px',
        }}
      >
        {/* Sales by City - Left side (49.41% width) */}
        <div
          style={{
            flex: '0 0 49.41%',
            border: '1px solid #e0e0e0',
            borderRadius: '2px',
            padding: '4px',
            backgroundColor: '#fafafa',
            marginRight: '0',
            overflow: 'hidden',
          }}
        >
          <SalesByCity data={filteredData} />
        </div>

        {/* Right column (49.41% width) */}
        <div
          style={{
            flex: '0 0 49.41%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            marginLeft: 'auto',
          }}
        >
          {/* Sales by Sub Category - Top right */}
          <div
            style={{
              flex: '1',
              border: '1px solid #e0e0e0',
              borderRadius: '2px',
              padding: '4px',
              backgroundColor: '#fafafa',
              marginBottom: '10px',
              minHeight: '48%',
            }}
          >
            <SalesBySubCategory data={filteredData} />
          </div>

          {/* Customer Sales & Profits - Bottom right */}
          <div
            style={{
              flex: '1',
              border: '1px solid #e0e0e0',
              borderRadius: '2px',
              padding: '4px',
              backgroundColor: '#fafafa',
              minHeight: '48%',
            }}
          >
            <CustomerSalesProfits data={filteredData} />
          </div>
        </div>
      </div>

      {/* Top and Bottom Customers - Two columns */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            flex: '1',
            border: '1px solid #e0e0e0',
            borderRadius: '2px',
            padding: '4px',
            backgroundColor: '#fafafa',
          }}
        >
          <Top10Customers data={filteredData} />
        </div>

        <div
          style={{
            flex: '1',
            border: '1px solid #e0e0e0',
            borderRadius: '2px',
            padding: '4px',
            backgroundColor: '#fafafa',
          }}
        >
          <Bottom10Customers data={filteredData} />
        </div>
      </div>

      {/* Sales Map - Full width */}
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          padding: '4px',
          backgroundColor: '#fafafa',
          marginBottom: '10px',
        }}
      >
        <SalesMap data={filteredData} />
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#f0f8ff',
            border: '1px solid #b0d4f1',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <strong style={{ fontSize: '13px' }}>Active Filters:</strong>
          {Object.entries(filters).map(([key, value]) => (
            <span
              key={key}
              style={{
                padding: '4px 8px',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '12px',
                fontSize: '11px',
              }}
            >
              {key}: {value}
            </span>
          ))}
          <button
            onClick={() => {
              clearFilters();
            }}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
