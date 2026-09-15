import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterDataPoint } from '../types';

interface ScatterplotProps {
  data: ScatterDataPoint[];
  width?: number;
  height?: number;
  title?: string;
}

export const Scatterplot: React.FC<ScatterplotProps> = ({
  data,
  width = 400,
  height = 500,
  title = 'Scatterplot'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ScatterDataPoint } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Sales)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .nice()
      .range([0, innerWidth]);

    // Y scale (Profit)
    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, d => d.profit) || 0,
        d3.max(data, d => d.profit) || 0
      ])
      .nice()
      .range([innerHeight, 0]);

    // Size scale (Quantity)
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, d => d.quantity) || 0])
      .range([4, 20]);

    // Color scale (Sales)
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.sales) || 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '11px');

    // X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .text('Sales')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px');

    // Y axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .text('Profit')
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

    // Circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.sales))
      .attr('cy', d => yScale(d.profit))
      .attr('r', d => sizeScale(d.quantity))
      .attr('fill', d => colorScale(d.sales))
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', 2);
        const [x, y] = d3.pointer(event, svgRef.current!);
        setTooltip({ x, y, data: d });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .attr('fill-opacity', 0.6)
          .attr('stroke-width', 0.5);
        setTooltip(null);
      });

  }, [data, width, height, title]);

  return (
    <div style={{ position: 'relative' }} role="img" aria-label={`Scatter plot showing ${data.length} data points`}>
      <svg ref={svgRef} width={width} height={height} style={{ background: '#ffffff' }} aria-labelledby="scatterplot-title" />
      <title id="scatterplot-title">{title}: Sales vs Profit with Quantity as bubble size</title>
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
          <div><strong>{tooltip.data.productName}</strong></div>
          <div>Sales: ${tooltip.data.sales.toFixed(2)}</div>
          <div>Profit: ${tooltip.data.profit.toFixed(2)}</div>
          <div>Quantity: {tooltip.data.quantity}</div>
        </div>
      )}
    </div>
  );
};
