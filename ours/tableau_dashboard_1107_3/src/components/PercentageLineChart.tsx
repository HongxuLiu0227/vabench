import { useEffect, useRef, useState } from 'react';
import { select, scaleLinear, scalePoint, line, axisLeft, axisBottom, max, curveMonotoneX } from 'd3';
import type { MonthlyPercentageData, TooltipData } from '../types/data';

interface PercentageLineChartProps {
  data: MonthlyPercentageData[];
  title?: string;
  width?: number;
  height?: number;
  yAxisTitle?: string;
  onSeriesClick?: (month: string, category: string) => void;
  highlightedMonth?: string | null;
  highlightedCategory?: string | null;
  colorScale?: (category: string) => string;
}

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 250;
const MARGIN = { top: 20, right: 30, bottom: 50, left: 60 };

// Default colors
const DEFAULT_COLORS: Record<string, string> = {
  'Subscriber': '#4e79a7',
  'Customer': '#f28e2b',
  // Per Tableau contract filter_members, gender chart only shows Female and Unknown
  'Female': '#4e79a7',
  'Unknown': '#e15759',
};

interface SeriesDataPoint {
  month: string;
  category: string;
  percentage: number;
}

export function PercentageLineChart({
  data,
  title,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  yAxisTitle = '% of Total Trips',
  onSeriesClick,
  highlightedMonth,
  highlightedCategory,
  colorScale = (cat) => DEFAULT_COLORS[cat] || '#999999',
}: PercentageLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Get unique categories and months
    const categories = Array.from(new Set(data.map(d => d.category)));
    const months = Array.from(new Set(data.map(d => d.month))).sort((a, b) => {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    // X scale
    const xScale = scalePoint()
      .domain(months)
      .range([0, innerWidth])
      .padding(0.5);

    // Y scale
    const maxY = max(data, d => d.percentage) || 100;
    const yScale = scaleLinear()
      .domain([0, Math.max(100, maxY * 1.1)])
      .range([innerHeight, 0]);

    // Create series data
    const seriesData = categories.map(category => {
      return months.map(month => {
        const found = data.find(d => d.month === month && d.category === category);
        return {
          month,
          category,
          percentage: found?.percentage || 0,
        };
      });
    });

    // Line generator
    const lineGenerator = line<SeriesDataPoint>()
      .x(d => xScale(d.month) || 0)
      .y(d => yScale(d.percentage))
      .curve(curveMonotoneX);

    // Draw lines for each category
    seriesData.forEach(series => {
      const category = series[0]?.category;
      if (!category) return;

      const isHighlighted = highlightedCategory === null || highlightedCategory === category;
      const opacity = isHighlighted ? 1 : 0.2;

      // Draw the line
      g.append('path')
        .datum(series)
        .attr('fill', 'none')
        .attr('stroke', colorScale(category))
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator)
        .attr('opacity', opacity);

      // Draw points
      g.selectAll(`.point-${category.replace(/\s+/g, '-')}`)
        .data(series)
        .enter()
        .append('circle')
        .attr('class', `point-${category.replace(/\s+/g, '-')}`)
        .attr('cx', d => xScale(d.month) || 0)
        .attr('cy', d => yScale(d.percentage))
        .attr('r', d => {
          if (highlightedMonth === d.month && highlightedCategory === category) return 7;
          if (highlightedMonth === d.month || highlightedCategory === category) return 5;
          return 3.5;
        })
        .attr('fill', colorScale(category))
        .attr('opacity', opacity)
        .style('cursor', 'pointer')
        .on('click', (event: MouseEvent, d: SeriesDataPoint) => {
          event.stopPropagation();
          if (onSeriesClick) {
            onSeriesClick(d.month, category);
          }
        })
        .on('mouseover', (event: MouseEvent, d: SeriesDataPoint) => {
          setTooltip({
            month: d.month,
            category: d.category,
            percentage: d.percentage,
          });
          setTooltipPosition({ x: event.pageX, y: event.pageY });
        })
        .on('mouseout', () => {
          setTooltip(null);
          setTooltipPosition(null);
        });
    });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Y axis
    g.append('g')
      .call(axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(yAxisTitle);

  }, [data, width, height, yAxisTitle, onSeriesClick, highlightedMonth, highlightedCategory, colorScale]);

  return (
    <div className="percentage-line-chart">
      {title && <div className="chart-title" style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</div>}
      <svg ref={svgRef} width={width} height={height}></svg>
      {tooltip && tooltipPosition && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            pointerEvents: 'none',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <div><strong>{tooltip.month}</strong></div>
          {tooltip.category && <div>{tooltip.category}</div>}
          {tooltip.percentage !== undefined && (
            <div>{tooltip.percentage.toFixed(1)}%</div>
          )}
        </div>
      )}
    </div>
  );
}
