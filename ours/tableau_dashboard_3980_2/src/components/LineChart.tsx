import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { HourRecord } from '../types';

interface LineChartProps {
  data: HourRecord[];
  title: string;
  yAxisTitle: string;
  width?: number;
  height?: number;
  highlightedHours?: number[];
  onHover?: (hour: number | null) => void;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  yAxisTitle,
  width = 600,
  height = 300,
  highlightedHours = [],
  onHover
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 23])
      .range([0, innerWidth]);

    const maxY = d3.max(data, d => d.count) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxY * 1.1]) // Add 10% padding at top
      .range([innerHeight, 0]);

    // Create line generator
    const line = d3.line<HourRecord>()
      .x(d => xScale(d.hour))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(24)
      .tickFormat(d => `${d}:00`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '11px');

    // Add Y axis
    const yAxis = d3.axisLeft(yScale);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add axis titles
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', 'bold')
      .text(yAxisTitle);

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', 'bold')
      .text('Hour of Day');

    // Add chart title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    // Add the line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    const dots = g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.hour))
      .attr('cy', d => yScale(d.count))
      .attr('r', 4)
      .attr('fill', '#1f77b4')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', d => highlightedHours.length > 0 ? (highlightedHours.includes(d.hour) ? 1 : 0.2) : 1);

    // Add hover behavior
    dots
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event, g.node());
        setTooltip({
          x: x + margin.left + 10,
          y: y + margin.top,
          content: `Hour: ${d.hour}:00<br/>Count: ${d.count}`
        });
        d3.select(event.currentTarget)
          .attr('r', 6)
          .attr('fill', '#ff7f0e');
        if (onHover) onHover(d.hour);
      })
      .on('mouseout', (event) => {
        setTooltip(null);
        d3.select(event.currentTarget)
          .attr('r', 4)
          .attr('fill', '#1f77b4');
        if (onHover) onHover(null);
      });

  }, [data, width, height, title, yAxisTitle, highlightedHours, onHover]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};
