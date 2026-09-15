import React, { useState, useEffect } from 'react';
import { TypesOfBreachChart } from './TypesOfBreachChart';
import { AnnualByTypeYearChart } from './AnnualByTypeYearChart';
import { InformationSourceChart } from './InformationSourceChart';
import { BreachTypeLegend } from './BreachTypeLegend';
import { InfoSourceLegend } from './InfoSourceLegend';
import type { DataPoint } from '../types/data';
import { loadData } from '../services/dataLoader';
import { useFilter } from '../contexts/FilterContext';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { filter } = useFilter();

  useEffect(() => {
    loadData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main
        role="main"
        aria-label="Loading dashboard"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          role="status"
          aria-live="polite"
          style={{
            fontSize: '16px',
            color: '#333',
            textAlign: 'center',
          }}
        >
          <p>Loading data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        role="alert"
        aria-label="Error loading dashboard"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            color: '#d32f2f',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <p><strong>Error loading data:</strong> {error.message}</p>
        </div>
      </main>
    );
  }

  // Dashboard layout based on zone coordinates from tableau_spec.json
  // Normalized coordinates (0-1) converted to percentages
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    padding: '8px',
    boxSizing: 'border-box',
    backgroundColor: '#f5f5f5',
  };

  const mainContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '4px',
  };

  const topRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    height: '48.81%',
    gap: '4px',
  };

  const bottomRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    height: '48.81%',
    gap: '4px',
  };

  const sheetStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '2px',
    overflow: 'hidden',
  };

  const sidebarStyle: React.CSSProperties = {
    width: '27.38%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    height: '100%',
  };

  const legendStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '2px',
    overflow: 'hidden',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  };

  return (
    <main style={containerStyle} aria-label="Data Breach Dashboard">
      <div style={mainContentStyle}>
        {/* Top Row */}
        <section style={topRowStyle} aria-label="Top row charts">
          {/* Types of Breach - Left: 35.08% width */}
          <article style={{ ...sheetStyle, flex: '0 0 35.08%' }} aria-labelledby="types-of-breach-title">
            <header style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 id="types-of-breach-title" style={titleStyle}>Types of Breach</h2>
              <div style={{ flex: 1, minHeight: 0 }}>
                <TypesOfBreachChart data={data} width={350} height={400} />
              </div>
            </header>
          </article>

          {/* Annual % by Type & Year - Right: 35.08% width */}
          <article style={{ ...sheetStyle, flex: '0 0 35.08%' }} aria-labelledby="annual-by-type-title">
            <header style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 id="annual-by-type-title" style={titleStyle}>Annual % by Type & Year</h2>
              <div style={{ flex: 1, minHeight: 0 }}>
                <AnnualByTypeYearChart data={data} width={350} height={400} />
              </div>
            </header>
          </article>

          {/* Sidebar - Right: 27.38% width */}
          <aside style={sidebarStyle} aria-label="Legends and filters">
            {/* Information Source Legend - Top (38.9% height) */}
            <section style={{ ...legendStyle, flex: '0 0 38.9%', overflow: 'auto' }} aria-labelledby="info-source-legend-title">
              <header style={{ padding: '8px' }}>
                <h2 id="info-source-legend-title" style={titleStyle}>Information Source</h2>
                <InfoSourceLegend width={200} height={300} />
              </header>
            </section>

            {/* Breach Type Legend - Bottom (26.38% height) */}
            <section style={{ ...legendStyle, flex: '0 0 26.38%', overflow: 'auto' }} aria-labelledby="breach-type-legend-title">
              <header style={{ padding: '8px' }}>
                <h2 id="breach-type-legend-title" style={titleStyle}>Type of Breach</h2>
                <BreachTypeLegend width={200} height={175} />
              </header>
            </section>

            {/* Filter indicator - Remaining space */}
            <section style={{ ...legendStyle, flex: 1, padding: '8px' }} aria-labelledby="filter-status-title">
              <h2 id="filter-status-title" style={titleStyle}>Active Filter</h2>
              {filter.year || filter.breachType ? (
                <div style={{ fontSize: '13px', color: '#555' }} role="status" aria-live="polite">
                  {filter.year && <div>Year: {filter.year}</div>}
                  {filter.breachType && <div>Type: {filter.breachType}</div>}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#999' }} role="status">No filter active</div>
              )}
            </section>
          </aside>
        </section>

        {/* Bottom Row */}
        <section style={bottomRowStyle} aria-label="Bottom row charts">
          {/* Information Source for Breach - Full width (70.15% + spacing) */}
          <article style={{ ...sheetStyle, flex: '0 0 70.15%' }} aria-labelledby="info-source-chart-title">
            <header style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 id="info-source-chart-title" style={titleStyle}>Information Source for Breach</h2>
              <div style={{ flex: 1, minHeight: 0 }}>
                <InformationSourceChart data={data} width={700} height={400} />
              </div>
            </header>
          </article>
        </section>
      </div>
    </main>
  );
};
