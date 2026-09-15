import React from 'react';

interface LegendProps {
  colorScale: Record<string | number, string>;
  title?: string;
}

export const Legend: React.FC<LegendProps> = ({ colorScale, title }) => {
  const entries = Object.entries(colorScale);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '8px',
        fontFamily: 'sans-serif',
      }}
    >
      {title && (
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '4px',
          }}
        >
          {title}
        </div>
      )}
      {entries.map(([key, color]) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: color,
              border: '1px solid #ccc',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '11px',
              color: '#333',
            }}
          >
            {key}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
