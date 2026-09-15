import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { YearlyData } from '../types';

interface YearlyLineChartProps {
  data: YearlyData[];
  width: number;
  height: number;
  title?: string;
}

export const YearlyLineChart: React.FC<YearlyLineChartProps> = ({ data, width, height, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: YearlyData } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions with margins
    const margin = { top: 40, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.year.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Create line generator
    const line = d3
      .line<YearlyData>()
      .x((d) => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#666')
      .selectAll('text')
      .style('font-size', '12px');

    // Add Y axis
    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#666')
      .selectAll('text')
      .style('font-size', '12px');

    // Add grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickValues(yScale.ticks(5))
          .tickFormat(() => '')
          .tickSize(-innerWidth)
      )
      .attr('color', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

    // Add the line path
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2ca02c')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 6)
      .attr('fill', '#2ca02c')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setTooltip({
          x: event.offsetX + margin.left,
          y: event.offsetY + margin.top,
          data: d,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // Add title if provided
    if (title) {
      svg
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);
    }
  }, [data, width, height, title]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div>Year: {tooltip.data.year}</div>
          <div>Sales: ${tooltip.data.sales.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};
