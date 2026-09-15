import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-scale';
import type { BarChartData } from '../../types/data';

interface VerticalRankedBarProps {
  data: BarChartData[];
  title?: string;
  highlightedCategories?: Set<string>;
  onHighlight?: (category: string) => void;
  onClearHighlight?: () => void;
  width?: number;
  height?: number;
}

const VerticalRankedBar: React.FC<VerticalRankedBarProps> = ({
  data,
  title,
  highlightedCategories = new Set(),
  onHighlight,
  onClearHighlight,
  width = 600,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const parentWidth = svgRef.current.parentElement.clientWidth;
        const parentHeight = Math.max(300, parentWidth * 0.6);
        setDimensions({ width: parentWidth, height: parentHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate dynamic bottom margin based on longest category label
  const maxLabelLength = Math.max(...data.map(d => d.category.length));
  const estimatedLabelWidth = maxLabelLength * 6; // Approximate 6px per character
  const dynamicBottomMargin = Math.max(60, estimatedLabelWidth + 20);

  const margin = { top: 20, right: 30, bottom: dynamicBottomMargin, left: 60 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, chartWidth])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, Math.max(...data.map(d => d.value))])
    .range([chartHeight, 0]);

  const isHighlighted = (category: string) => {
    if (highlightedCategories.size === 0) return true;
    return highlightedCategories.has(category);
  };

  const getOpacity = (category: string) => {
    if (hoveredBar && hoveredBar !== category) return 0.3;
    if (highlightedCategories.size === 0) return 1;
    return isHighlighted(category) ? 1 : 0.3;
  };

  const handleBarClick = (category: string) => {
    if (onHighlight) {
      onHighlight(category);
    }
  };

  const handleChartClick = () => {
    if (onClearHighlight) {
      onClearHighlight();
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {title && (
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '500' }}>
          {title}
        </h3>
      )}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleChartClick}
        style={{ cursor: 'pointer' }}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y axis */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={chartHeight}
            stroke="#ccc"
            strokeWidth={1}
          />

          {/* X axis */}
          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#ccc"
            strokeWidth={1}
          />

          {data.map((d) => {
            const x = xScale(d.category);
            const barWidth = xScale.bandwidth();
            const barHeight = chartHeight - yScale(d.value);
            const y = yScale(d.value);

            return (
              <g key={d.category}>
                <rect
                  x={x!}
                  y={y}
                  width={barWidth!}
                  height={barHeight}
                  fill="#4e79a7"
                  opacity={getOpacity(d.category)}
                  onMouseEnter={() => setHoveredBar(d.category)}
                  onMouseLeave={() => setHoveredBar(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBarClick(d.category);
                  }}
                  style={{ transition: 'opacity 0.2s' }}
                />
                <text
                  x={x! + barWidth! / 2}
                  y={chartHeight + 15}
                  fontSize="11"
                  fill="#333"
                  textAnchor="middle"
                  opacity={getOpacity(d.category)}
                  style={{ pointerEvents: 'none' }}
                >
                  <title>{d.category}</title>
                  {d.category}
                </text>
              </g>
            );
          })}

          {/* Y axis labels */}
          {yScale.ticks(5).map((tick: number) => (
            <g key={tick}>
              <text
                x={-5}
                y={yScale(tick)}
                fontSize="11"
                fill="#666"
                textAnchor="end"
                dy=".35em"
              >
                {tick.toLocaleString()}
              </text>
              <line
                x1={0}
                y1={yScale(tick)}
                x2={chartWidth}
                y2={yScale(tick)}
                stroke="#eee"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default VerticalRankedBar;
