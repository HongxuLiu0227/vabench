import { useEffect, useRef, useState } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import type { SelectionState } from '../types';

interface DataPoint {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  data: DataPoint[];
  title: string;
  width?: number;
  height?: number;
  onBarClick?: (label: string) => void;
  selection?: SelectionState | null;
  worksheetName?: string;
}

export function HorizontalBarChart({
  data,
  title,
  width = 500,
  height = 400,
  onBarClick,
  selection,
  worksheetName,
}: HorizontalBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // Calculate dynamic left margin based on longest label
  const maxLabelLength = Math.max(...data.map((d) => d.label.length));
  const dynamicLeftMargin = Math.min(200, Math.max(150, maxLabelLength * 8));
  const margin = { top: 40, right: 80, bottom: 40, left: dynamicLeftMargin };

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const containerWidth = svgRef.current.parentElement?.clientWidth || width;
        setDimensions({ width: containerWidth, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  const xScale = scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.value)) * 1.1])
    .range([0, chartWidth]);

  const yScale = scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, chartHeight])
    .padding(0.2);

  const isHighlighted = (label: string) => {
    if (!selection) return true;
    if (selection.field === 'Customer Name' && worksheetName) {
      return selection.value === label;
    }
    if (selection.field === 'City' && worksheetName) {
      return selection.value === label;
    }
    if (selection.field === 'Sub-Category' && worksheetName) {
      return selection.value === label;
    }
    return true;
  };

  const getBarColor = (label: string) => {
    if (!selection) return '#1f77b4';
    return isHighlighted(label) ? '#1f77b4' : '#d3d3d3';
  };

  // Truncate label if too long
  const truncateLabel = (label: string, maxLength: number = 25) => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength) + '...';
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>{title}</h3>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {data.map((d) => {
            const y = yScale(d.label);
            const barHeight = yScale.bandwidth();
            const barWidth = xScale(d.value);

            return (
              <g key={d.label}>
                <rect
                  x={0}
                  y={y ?? 0}
                  width={barWidth}
                  height={barHeight}
                  fill={getBarColor(d.label)}
                  stroke="#fff"
                  strokeWidth={1}
                  style={{
                    cursor: onBarClick ? 'pointer' : 'default',
                    transition: 'opacity 0.2s',
                  }}
                  onClick={() => onBarClick?.(d.label)}
                  onMouseEnter={() => setHoveredLabel(d.label)}
                  onMouseLeave={() => setHoveredLabel(null)}
                  opacity={isHighlighted(d.label) ? 1 : 0.3}
                />
                <text
                  x={barWidth + 5}
                  y={(y ?? 0) + barHeight / 2}
                  dy="0.35em"
                  style={{ fontSize: '12px', fill: '#333' }}
                >
                  {d.value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </text>
              </g>
            );
          })}

          {data.map((d) => {
            const y = yScale(d.label);
            const truncatedLabel = truncateLabel(d.label, Math.floor((margin.left - 10) / 8));

            return (
              <text
                key={`label-${d.label}`}
                x={-5}
                y={(y ?? 0) + yScale.bandwidth() / 2}
                dy="0.35em"
                textAnchor="end"
                style={{
                  fontSize: '12px',
                  fill: '#333',
                  pointerEvents: 'none',
                }}
              >
                {truncatedLabel}
              </text>
            );
          })}

          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#ccc"
            strokeWidth={1}
          />
        </g>
      </svg>

      {/* Tooltip for hovered label */}
      {hoveredLabel && hoveredLabel.length > 25 && (
        <div
          style={{
            position: 'absolute',
            left: margin.left - 10,
            top: dimensions.height / 2,
            transform: 'translate(-100%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          {hoveredLabel}
        </div>
      )}
    </div>
  );
}
