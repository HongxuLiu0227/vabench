import { useMemo } from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import type { DiagnosisData } from '../types';

interface LegendProps {
  data: DiagnosisData[];
  width: number;
  height: number;
}

/**
 * Legend component for the bubble chart
 * Displays a sequential color scale showing the mapping between
 * Number of Records and color
 */
export function Legend({ data, width, height }: LegendProps) {
  const colorScale = useMemo(() => {
    const minRecord = Math.min(...data.map((d) => d.numberOfRecords));
    const maxRecord = Math.max(...data.map((d) => d.numberOfRecords));
    return scaleSequential(interpolateTurbo).domain([minRecord, maxRecord]);
  }, [data]);

  const numSteps = 10;
  const stepHeight = (height - 30) / numSteps; // Leave room for labels

  const minRecord = Math.min(...data.map((d) => d.numberOfRecords));
  const maxRecord = Math.max(...data.map((d) => d.numberOfRecords));

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 'bold',
          marginBottom: '6px',
          fontFamily: 'sans-serif',
        }}
      >
        Number of Records
      </div>
      <svg width={width - 16} height={height - 30}>
        {Array.from({ length: numSteps }).map((_, i) => {
          const value = minRecord + (i * (maxRecord - minRecord)) / (numSteps - 1);
          const y = i * stepHeight;
          return (
            <g key={i}>
              <rect
                x="20"
                y={y}
                width={width - 36}
                height={stepHeight}
                fill={colorScale(value)}
                stroke="none"
              />
              <text
                x="16"
                y={y + stepHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
                fontFamily="sans-serif"
              >
                {Math.round(value).toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
