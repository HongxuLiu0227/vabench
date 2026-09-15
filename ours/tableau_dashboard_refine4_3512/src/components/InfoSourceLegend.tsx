import React from 'react';
import { getInfoSourceColor } from '../utils/colors';

interface InfoSourceLegendProps {
  width: number;
  height: number;
}

export const InfoSourceLegend: React.FC<InfoSourceLegendProps> = ({ width, height }) => {
  const infoSources = [
    'Media',
    '(Null)',
    'Government Agency',
    'PHIPrivacy.net',
    'Health IT Security',
    'California Attorney General',
    'HHS via Databreaches.net',
    'Security Breach Letter',
    'HHS via PHIPrivacy.net',
    'Databreaches.net',
    'Vermont Attorney General',
    'Dataloss DB',
  ];

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <g transform={`translate(10, 10)`}>
        {infoSources.map((infoSource, index) => (
          <g key={infoSource} transform={`translate(0, ${index * 25})`}>
            <rect
              x={0}
              y={0}
              width={15}
              height={15}
              fill={getInfoSourceColor(infoSource)}
              stroke="none"
            />
            <text
              x={20}
              y={12}
              fontSize={12}
              fill="#333"
            >
              {infoSource}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};
