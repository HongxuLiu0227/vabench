import React from 'react';
import { getBreachTypeColor } from '../utils/colors';

interface BreachTypeLegendProps {
  width: number;
  height: number;
}

export const BreachTypeLegend: React.FC<BreachTypeLegendProps> = ({ width, height }) => {
  const breachTypes = ['DISC', 'PORT', 'PHYS', 'UNKN', 'INSD', 'STAT', 'HACK'];

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <g transform={`translate(10, 10)`}>
        {breachTypes.map((breachType, index) => (
          <g key={breachType} transform={`translate(0, ${index * 25})`}>
            <rect
              x={0}
              y={0}
              width={15}
              height={15}
              fill={getBreachTypeColor(breachType)}
              stroke="none"
            />
            <text
              x={20}
              y={12}
              fontSize={12}
              fill="#333"
            >
              {breachType}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};
