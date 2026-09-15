import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { BarChartData } from '../types';

interface HorizontalBarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  title?: string;
  maxBars?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  width = 400,
  height = 500,
  title = 'Bar',
  maxBars = 50
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: BarChartData } | null>(null);

  // Limit the number of bars shown
  const displayData = data.slice(0, maxBars);

  useEffect(() => {
    if (!svgRef.current || !displayData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 20, left: 180 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Sales)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(displayData, d => d.sales) || 0])
      .nice()
      .range([0, innerWidth]);

    // Y scale (Categories)
    const yScale = d3
      .scaleBand()
      .domain(displayData.map(d => `${d.category} - ${d.subCategory}`))
      .range([0, innerHeight])
      .padding(0.2);

    // Color scale (Sales)
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(displayData, d => d.sales) || 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '10px');

    // X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .text('Sales')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    // Title
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', 20)
      .text(title)
      .style('font-size', '14px')
      .style('font-weight', 'bold');

    // Bars
    g.selectAll('.bar')
      .data(displayData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.sales))
      .attr('fill', d => colorScale(d.sales))
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .attr('fill-opacity', 1)
          .attr('stroke-width', 2);
        const [x, y] = d3.pointer(event, svgRef.current!);
        setTooltip({ x, y, data: d });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .attr('fill-opacity', 0.8)
          .attr('stroke-width', 0.5);
        setTooltip(null);
      });

    // Y axis labels
    g.selectAll('.y-label')
      .data(displayData)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -5)
      .attr('y', d => (yScale(`${d.category} - ${d.subCategory}`) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .text(d => `${d.category} - ${d.subCategory}`)
      .style('font-size', '10px')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event, svgRef.current!);
        setTooltip({ x, y, data: d });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

  }, [displayData, width, height, title]);

  return (
    <div style={{ position: 'relative' }} role="img" aria-label={`Horizontal bar chart showing ${displayData.length} categories`}>
      <svg ref={svgRef} width={width} height={height} style={{ background: '#ffffff' }} aria-labelledby="barchart-title" />
      <title id="barchart-title">{title}: Sales by category</title>
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '11px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <div><strong>{tooltip.data.category} - {tooltip.data.subCategory}</strong></div>
          <div>Sales: ${tooltip.data.sales.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};
