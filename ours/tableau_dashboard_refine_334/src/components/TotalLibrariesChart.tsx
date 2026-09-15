import { useEffect, useRef, useState } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import type { RegionSummary } from '../types/libraryData';

interface TotalLibrariesChartProps {
  data: RegionSummary[];
  selectedRegion: string | null;
  onRegionSelect: (region: string) => void;
}

export const TotalLibrariesChart: React.FC<TotalLibrariesChartProps> = ({
  data,
  selectedRegion,
  onRegionSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate dynamic left margin based on longest region label
  const labelWidths = data.map((d) => {
    const text = `${d.Region}`;
    // Approximate character width for Arial 12px
    return text.length * 7;
  });
  const maxLabelWidth = Math.max(...labelWidths, 100);
  const dynamicLeftMargin = maxLabelWidth + 10;

  const { width, height } = dimensions;
  const margin = { top: 10, right: 30, bottom: 20, left: dynamicLeftMargin };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xScale = scaleLinear()
    .domain([0, Math.max(...data.map((d) => d['Total Libraries'])) * 1.1])
    .range([0, chartWidth]);

  const yScale = scaleBand()
    .domain(data.map((d) => d.Region))
    .range([0, chartHeight])
    .padding(0.2);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {data.map((d) => {
            const y = yScale(d.Region);
            const barHeight = yScale.bandwidth();
            const barWidth = xScale(d['Total Libraries']);
            const isSelected = selectedRegion === d.Region;

            if (y === undefined || barHeight === undefined) return null;

            return (
              <g key={d.Region}>
                <rect
                  x={0}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isSelected ? '#1f77b4' : '#5c9ad3'}
                  stroke={isSelected ? '#0d47a1' : 'none'}
                  strokeWidth={isSelected ? 2 : 0}
                  style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                  onClick={() => onRegionSelect(d.Region)}
                />
                <text
                  x={barWidth + 5}
                  y={y + barHeight / 2}
                  dy="0.35em"
                  fontSize="12"
                  fill="#333"
                  textAnchor="start"
                >
                  {d['Total Libraries'].toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Y-axis labels */}
          {data.map((d) => {
            const y = yScale(d.Region);
            const barHeight = yScale.bandwidth();

            if (y === undefined || barHeight === undefined) return null;

            return (
              <text
                key={`label-${d.Region}`}
                x={-5}
                y={y + barHeight / 2}
                dy="0.35em"
                fontSize="12"
                fill="#333"
                textAnchor="end"
                style={{ pointerEvents: 'none' }}
              >
                {d.Region}
              </text>
            );
          })}

          {/* X-axis line */}
          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#333"
            strokeWidth={1}
          />
        </g>
      </svg>
    </div>
  );
};
