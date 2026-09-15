/**
 * Legend Component
 * Renders color legends for Sheet 1 and Sheet 2
 */

import type { LegendProps } from '../types';

const Legend: React.FC<LegendProps> = ({ title, categories, colorScale }) => {
  return (
    <div style={{
      padding: '8px',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '11px'
    }}>
      {title && (
        <div style={{
          fontWeight: 'bold',
          marginBottom: '6px',
          fontSize: '11px'
        }}>
          {title}
        </div>
      )}
      {categories.map(category => (
        <div
          key={category}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '4px'
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: colorScale.get(category) || '#666',
              marginRight: '6px',
              borderRadius: '2px',
              flexShrink: 0
            }}
          />
          <span style={{ color: '#333' }}>{category}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
