import type React from 'react';

interface SegmentLegendProps {
  segments: string[];
}

// Tableau color palette for Customer Segment
const SEGMENT_COLORS: Record<string, string> = {
  'Consumer': '#1f77b4',
  'Home Office': '#2ca02c',
  'Corporate': '#ff7f0e',
  'Small Business': '#d62728',
};

export const SegmentLegend: React.FC<SegmentLegendProps> = ({ segments }) => {
  return (
    <div
      style={{
        padding: '8px',
        background: '#fff',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: '500',
          marginBottom: '6px',
          color: '#333',
        }}
      >
        Customer Segment
      </div>
      {segments.map(segment => (
        <div
          key={segment}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '4px',
            fontSize: '11px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: SEGMENT_COLORS[segment] || '#7f7f7f',
              marginRight: '6px',
              borderRadius: '2px',
            }}
          />
          <span style={{ color: '#333' }}>{segment}</span>
        </div>
      ))}
    </div>
  );
};
