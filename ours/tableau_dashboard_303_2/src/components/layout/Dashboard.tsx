/**
 * Dashboard: Main layout component for the Tableau dashboard
 * Layout matches Tableau zone coordinates from tableau_spec.json
 */
import type { ParsedAccidentRecord } from '../../types/data';
import { Q2_Weather } from '../charts/Q2_Weather';
import { Sheet28 } from '../charts/Sheet28';
import { Sheet13 } from '../charts/Sheet13';

interface DashboardProps {
  data: ParsedAccidentRecord[];
}

export function Dashboard({ data }: DashboardProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffe791',
        padding: '10px',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Main Grid Layout matching Tableau zones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto auto',
          gap: '10px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Top Left: Q2_Weather (zone: x=0, y=6689, w=43110, h=46321) */}
        <div
          style={{
            gridColumn: '1',
            gridRow: '1',
            backgroundColor: 'white',
            padding: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Q2_Weather width={420} height={320} />
        </div>

        {/* Top Right: Sheet13 (zone: x=43110, y=6689, w=43109, h=46321) */}
        <div
          style={{
            gridColumn: '2',
            gridRow: '1',
            backgroundColor: 'white',
            padding: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Sheet13 width={420} height={320} />
        </div>

        {/* Bottom: Sheet 28 (zone: x=0, y=53010, w=86219, h=46321) */}
        <div
          style={{
            gridColumn: '1 / span 2',
            gridRow: '2',
            backgroundColor: 'white',
            padding: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Sheet28 width={850} height={320} />
        </div>
      </div>

      {/* Filter Indicator */}
      {data.length > 0 && (
        <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '11px', color: '#666' }}>
          Click on any chart element to filter by weather condition. Click again or the background to clear filter.
        </div>
      )}
    </div>
  );
}
