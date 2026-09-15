import { useMemo, useState } from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import './ColorLegend.css';

interface ColorLegendProps {
  minValue: number;
  maxValue: number;
  title: string;
  height: number;
}

export default function ColorLegend({
  minValue,
  maxValue,
  title,
  height,
}: ColorLegendProps) {
  // Use useState with lazy initialization to generate ID once
  const [gradientId] = useState(() =>
    `legend-gradient-${Math.random().toString(36).substr(2, 9)}`
  );

  const colorScale = useMemo(
    () =>
      scaleSequential(interpolateRdBu).domain([minValue, maxValue]),
    [minValue, maxValue]
  );

  // Create gradient stops
  const numStops = 10;
  const stops = Array.from({ length: numStops }, (_, i) => {
    const value = minValue + (maxValue - minValue) * (i / (numStops - 1));
    return {
      offset: `${(i / (numStops - 1)) * 100}%`,
      color: String(colorScale(value)),
    };
  });

  return (
    <div className="color-legend" style={{ height: `${height}px` }}>
      <div className="legend-title">{title}</div>
      <svg width="30" height={height - 30} className="legend-gradient">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
            {stops.map((stop, i) => (
              <stop
                key={i}
                offset={stop.offset}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
        </defs>
        <rect
          width="20"
          height={height - 40}
          x="5"
          y="10"
          fill={`url(#${gradientId})`}
          rx="2"
        />
      </svg>
      <div className="legend-labels">
        <div className="legend-label max">{maxValue.toLocaleString()}</div>
        <div className="legend-label min">{minValue.toLocaleString()}</div>
      </div>
    </div>
  );
}
