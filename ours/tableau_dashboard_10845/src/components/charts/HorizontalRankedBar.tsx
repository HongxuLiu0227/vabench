import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-scale';
import type { BarChartData } from '../../types/data';

interface HorizontalRankedBarProps {
  data: BarChartData[];
  title?: string;
  highlightedCategories?: Set<string>;
  onHighlight?: (category: string) => void;
  onClearHighlight?: () => void;
  width?: number;
  height?: number;
}

const HorizontalRankedBar: React.FC<HorizontalRankedBarProps> = ({
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

  // Calculate dynamic left margin based on longest category label
  const maxLabelLength = Math.max(...data.map(d => d.category.length));
  const estimatedLabelWidth = maxLabelLength * 7; // Approximate 7px per character
  const dynamicLeftMargin = Math.max(120, estimatedLabelWidth + 20);

  const margin = { top: 20, right: 30, bottom: 40, left: dynamicLeftMargin };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear()
    .domain([0, Math.max(...data.map(d => d.value))])
    .range([0, chartWidth]);

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, chartHeight])
    .padding(0.2);

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
          {data.map((d) => {
            const y = yScale(d.category);
            const barHeight = yScale.bandwidth();
            const barWidth = xScale(d.value);

            return (
              <g key={d.category}>
                <rect
                  x={0}
                  y={y!}
                  width={barWidth}
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
                  x={barWidth + 5}
                  y={y! + barHeight / 2}
                  dy=".35em"
                  fontSize="12"
                  fill="#333"
                  opacity={getOpacity(d.category)}
                  style={{ pointerEvents: 'none' }}
                >
                  {d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </text>
                <text
                  x={-5}
                  y={y! + barHeight / 2}
                  dy=".35em"
                  fontSize="12"
                  fill="#333"
                  textAnchor="end"
                  opacity={getOpacity(d.category)}
                  style={{ pointerEvents: 'none' }}
                >
                  <title>{d.category}</title>
                  {d.category}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HorizontalRankedBar;
