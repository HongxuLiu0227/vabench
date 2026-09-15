import React from 'react';
import type { LegendProps } from '../types';

export const Legend: React.FC<LegendProps> = ({ title, colorMap, data }) => {
  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '12px',
      }}
    >
      {title && (
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
            borderBottom: '1px solid #ddd',
            paddingBottom: '4px',
          }}
        >
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.map(item => (
          <div
            key={item.category}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: colorMap[item.category] || '#cccccc',
                border: '1px solid #999',
                borderRadius: '2px',
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>{item.category}</span>
            <span style={{ fontWeight: 'bold', marginLeft: 'auto' }}>
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
