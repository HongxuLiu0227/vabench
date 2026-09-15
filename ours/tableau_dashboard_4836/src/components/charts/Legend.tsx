import React from 'react';
import type { LegendProps } from '../../types';

const Legend: React.FC<LegendProps> = ({
  categories,
  colors,
  title,
  orientation = 'vertical'
}) => {
  const isVertical = orientation === 'vertical';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        flexWrap: isVertical ? 'nowrap' : 'wrap',
        gap: isVertical ? '8px' : '16px',
        padding: '12px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
      {title && (
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: isVertical ? '8px' : '0',
            marginRight: isVertical ? '0' : '16px',
          }}
        >
          {title}
        </div>
      )}
      {categories.map((category, index) => (
        <div
          key={category}
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
              backgroundColor: colors[index % colors.length],
              border: '1px solid #ccc',
              borderRadius: '2px',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              color: '#333',
            }}
          >
            {category}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
