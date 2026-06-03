import React from 'react';
import { scaleLinear } from '@visx/scale';

type HeatmapData = {
  date: string;
  hour: number;
  value: number;
};

type HeatmapProps = {
  data: HeatmapData[];
};

export default function Heatmap(props) {
  // This is a simplified implementation
  // A full heatmap would require more complex data processing
  
  const width = 800;
  const height = 400;
  const binSize = 20;
  
  // Process data into bins (simplified for example)
  const bins = Array(7).fill(0).map(() => Array(24).fill(0));
  
  props.data.forEach(item => {
    const day = new Date(item.date).getDay(); // 0-6 (Sun-Sat)
    bins[day][item.hour] += item.value;
  });
  
  const maxValue = Math.max(...bins.flat());
  
  const colorScale = scaleLinear<string>({
    domain: [0, maxValue],
    range: ['#f0f9ff', '#0369a1'],
  });

  return (
    <svg width={width} height={height}>
      {bins.map((day, dayIndex) => (
        day.map((value, hourIndex) => (
          <rect
            key={`${dayIndex}-${hourIndex}`}
            x={hourIndex * binSize}
            y={dayIndex * binSize}
            width={binSize - 2}
            height={binSize - 2}
            fill={colorScale(value)}
            rx={2}
          />
        ))
      ))}
    </svg>
  );
};