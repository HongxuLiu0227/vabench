import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ParsedRecord } from '../types';
import { aggregateByMonth, formatCurrency } from '../utils/dataTransformations';

interface LineChartByMonthProps {
  data: ParsedRecord[];
  width: number;
  height: number;
}

export const LineChartByMonth: React.FC<LineChartByMonthProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const aggregatedData = aggregateByMonth(data);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(aggregatedData, d => d.Month) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.Sales) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Color scale based on Sales value
    const colorScale = d3.scaleSequential(d3.interpolateTurbo)
      .domain([0, d3.max(aggregatedData, d => d.Sales) || 0]);

    // Create line generator
    const line = d3.line<{ Month: Date; Sales: number }>()
      .x(d => xScale(d.Month))
      .y(d => yScale(d.Sales))
      .curve(d3.curveMonotoneX);

    // Create area generator for gradient fill
    const area = d3.area<{ Month: Date; Sales: number }>()
      .x(d => xScale(d.Month))
      .y0(chartHeight)
      .y1(d => yScale(d.Sales))
      .curve(d3.curveMonotoneX);

    // Create gradient definition
    const defs = svg.append('defs');

    const gradient = defs.append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.interpolateTurbo(0));

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.interpolateTurbo(1));

    // Create main group with margins
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add grid lines
    g.selectAll('.grid-line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('y1', d => yScale(d))
      .attr('x2', chartWidth)
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Create x-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(width > 400 ? 12 : 6)
      .tickFormat((d: Date | d3.NumberValue) => d3.timeFormat('%b %Y')(d as Date));

    const xAxisG = g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .attr('color', '#666')
      .attr('font-size', '10px');

    xAxisG.selectAll('text')
      .attr('transform', 'rotate(-25)')
      .style('text-anchor', 'end');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => formatCurrency(d as number));

    g.append('g')
      .call(yAxis)
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Create area fill
    g.append('path')
      .datum(aggregatedData)
      .attr('fill', 'url(#line-gradient)')
      .attr('opacity', 0.2)
      .attr('d', area);

    // Create line
    g.append('path')
      .datum(aggregatedData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Create dots
    const dots = g.selectAll('.dot')
      .data(aggregatedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.Month))
      .attr('cy', d => yScale(d.Sales))
      .attr('r', 4)
      .attr('fill', d => colorScale(d.Sales))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.9);

    // Add hover effects
    dots
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 6)
          .attr('opacity', 1);
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d3.timeFormat('%B %Y')(d.Month)}: ${formatCurrency(d.Sales)}`
        });
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 4)
          .attr('opacity', 0.9);
        setTooltip(null);
      });

  }, [data, width, height]);

  return (
    <>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontFamily: 'sans-serif'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
};
