import { useEffect, useRef, useState } from 'react';
import { select, scaleLinear, scalePoint, line, axisLeft, axisBottom, max, curveMonotoneX } from 'd3';
import type { MonthlyTripData, TooltipData } from '../types/data';

interface TripsOverTimeChartProps {
  data: MonthlyTripData[];
  width?: number;
  height?: number;
  onMonthClick?: (month: string) => void;
  highlightedMonth?: string | null;
  highlightedMeasure?: string | null;
}

const COUNT_COLOR = '#e15759'; // Red
const DURATION_COLOR = '#4e79a7'; // Blue
const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 20, right: 50, bottom: 50, left: 60 };

export function TripsOverTimeChart({
  data,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  onMonthClick,
  highlightedMonth,
  highlightedMeasure,
}: TripsOverTimeChartProps) {
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

    // X scale
    const xScale = scalePoint()
      .domain(data.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.5);

    // Y scale for count (left axis)
    const yCountScale = scaleLinear()
      .domain([0, max(data, d => d.count) || 0])
      .range([innerHeight, 0]);

    // Y scale for duration (right axis)
    const yDurationScale = scaleLinear()
      .domain([0, max(data, d => d.avgDuration) || 0])
      .range([innerHeight, 0]);

    // Line generator for count
    const countLine = line<MonthlyTripData>()
      .x(d => xScale(d.month) || 0)
      .y(d => yCountScale(d.count))
      .curve(curveMonotoneX);

    // Line generator for duration
    const durationLine = line<MonthlyTripData>()
      .x(d => xScale(d.month) || 0)
      .y(d => yDurationScale(d.avgDuration))
      .curve(curveMonotoneX);

    // Draw count line
    const countOpacity = highlightedMeasure === null || highlightedMeasure === 'Count of Trips' ? 1 : 0.3;
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', COUNT_COLOR)
      .attr('stroke-width', 2.5)
      .attr('d', countLine)
      .attr('opacity', countOpacity);

    // Draw duration line
    const durationOpacity = highlightedMeasure === null || highlightedMeasure === 'Avg Trip Duration (Minutes)' ? 1 : 0.3;
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', DURATION_COLOR)
      .attr('stroke-width', 2.5)
      .attr('d', durationLine)
      .attr('opacity', durationOpacity);

    // Draw points for count
    g.selectAll('.count-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'count-point')
      .attr('cx', d => xScale(d.month) || 0)
      .attr('cy', d => yCountScale(d.count))
      .attr('r', d => highlightedMonth === d.month ? 6 : 4)
      .attr('fill', COUNT_COLOR)
      .attr('opacity', countOpacity)
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent, d: MonthlyTripData) => {
        event.stopPropagation();
        if (onMonthClick) {
          onMonthClick(d.month);
        }
      })
      .on('mouseover', (event: MouseEvent, d: MonthlyTripData) => {
        setTooltip({
          month: d.month,
          count: d.count,
          avgDuration: d.avgDuration,
        });
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on('mouseout', () => {
        setTooltip(null);
        setTooltipPosition(null);
      });

    // Draw points for duration
    g.selectAll('.duration-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'duration-point')
      .attr('cx', d => xScale(d.month) || 0)
      .attr('cy', d => yDurationScale(d.avgDuration))
      .attr('r', d => highlightedMonth === d.month ? 6 : 4)
      .attr('fill', DURATION_COLOR)
      .attr('opacity', durationOpacity)
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent, d: MonthlyTripData) => {
        event.stopPropagation();
        if (onMonthClick) {
          onMonthClick(d.month);
        }
      })
      .on('mouseover', (event: MouseEvent, d: MonthlyTripData) => {
        setTooltip({
          month: d.month,
          count: d.count,
          avgDuration: d.avgDuration,
        });
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on('mouseout', () => {
        setTooltip(null);
        setTooltipPosition(null);
      });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Y axis for count (left)
    g.append('g')
      .call(axisLeft(yCountScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Y axis label for count
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Count of Trips');

    // Y axis for duration (right)
    g.append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(axisLeft(yDurationScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Y axis label for duration
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', innerWidth + 40)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Avg Trip Duration (Minutes)');

  }, [data, width, height, onMonthClick, highlightedMonth, highlightedMeasure]);

  return (
    <div className="trips-over-time-chart">
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
          {tooltip.count !== undefined && (
            <div>Count: {tooltip.count.toLocaleString()}</div>
          )}
          {tooltip.avgDuration !== undefined && (
            <div>Avg Duration: {tooltip.avgDuration.toFixed(1)} min</div>
          )}
        </div>
      )}
    </div>
  );
}
