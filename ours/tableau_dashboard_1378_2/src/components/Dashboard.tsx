import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { MapChart } from './MapChart';
import { LinearChart } from './LinearChart';
import { AccAmpChart } from './AccAmpChart';
import { StateFilter } from './StateFilter';

export const Dashboard: React.FC = () => {
  const { data, selectedProvider, setSelectedProvider } = useDashboard();

  const handleClearSelection = () => {
    setSelectedProvider(null);
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>
            Sepsis: Interactive Dashboard
          </h1>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Showing {data.length} sepsis-related records
            {selectedProvider && (
              <span style={{ marginLeft: '10px', color: '#0066cc' }}>
                • Selected: {selectedProvider.providerName}
              </span>
            )}
          </div>
        </div>
        {selectedProvider && (
          <button
            onClick={handleClearSelection}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              cursor: 'pointer',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '3px',
            }}
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar with State Filter */}
        <div
          style={{
            width: '180px',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <StateFilter />
        </div>

        {/* Charts Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
          }}
        >
          {/* G-Map: Sepsis */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
              G-Map: Sepsis
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
              Click on a provider to filter other views
            </div>
            <MapChart width={900} height={300} />
          </div>

          {/* Linear: Sepsis */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
              Linear: Sepsis
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
              Total Discharges vs Average Total Payments
            </div>
            <LinearChart width={900} height={300} />
          </div>

          {/* Sepsis: ACC vs AMP */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
              Sepsis: ACC vs AMP
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
              Average Covered Charges vs Average Medicare Payments
            </div>
            <AccAmpChart width={900} height={350} />
          </div>
        </div>
      </div>
    </div>
  );
};
