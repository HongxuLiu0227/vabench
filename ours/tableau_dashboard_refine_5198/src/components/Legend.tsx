import React from "react";
import { LABEL_COLORS } from '../types';

interface LegendProps {
  title?: string;
  width?: number;
  onItemClick?: (label: string) => void;
}

export function Legend({ title, width = 150, onItemClick }: LegendProps) {
  const labels = Object.keys(LABEL_COLORS) as Array<keyof typeof LABEL_COLORS>;

  return (
    <div style={{ width }}>
      {title && (
        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>
          {title}
        </h4>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {labels.map(label => (
          <div
            key={label}
            onClick={() => onItemClick?.(label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: onItemClick ? 'pointer' : 'default',
              padding: '4px',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              if (onItemClick) {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: LABEL_COLORS[label],
                border: '1px solid #ddd',
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: '12px', color: '#333', textTransform: 'capitalize' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
