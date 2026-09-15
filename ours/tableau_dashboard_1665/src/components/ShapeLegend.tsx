import React from 'react';

interface ShapeLegendProps {
  style?: React.CSSProperties;
}

const ShapeLegend: React.FC<ShapeLegendProps> = ({ style }) => {
  return (
    <div
      style={{
        padding: '12px',
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        ...style
      }}
    >
      <h4
        style={{
          margin: '0 0 10px 0',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#333',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '6px'
        }}
      >
        Measure Names
      </h4>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#4e79a7',
              borderRadius: '50%',
              flexShrink: 0,
              border: '1px solid #ccc'
            }}
          />
          <span
            style={{
              fontSize: '11px',
              color: '#333'
            }}
          >
            Recognition by Gen-Zs
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#4e79a7',
              borderRadius: '1px',
              flexShrink: 0,
              border: '1px solid #ccc'
            }}
          />
          <span
            style={{
              fontSize: '11px',
              color: '#333'
            }}
          >
            Recognition by Millennials
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShapeLegend;
