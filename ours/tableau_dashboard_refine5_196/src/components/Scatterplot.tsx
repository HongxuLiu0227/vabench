import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterDataPoint } from '../types';

interface ScatterplotProps {
  data: ScatterDataPoint[];
  width: number;
  height: number;
  title?: string;
}

export const Scatterplot: React.FC<ScatterplotProps> = ({ data, width, height, title = 'Scatterplot' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ScatterDataPoint } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.profit) || 0, d3.max(data, (d) => d.profit) || 0])
      .nice()
      .range([innerHeight, 0]);

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.quantity) || 0])
      .range([4, 20]);

    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .interpolator(d3.interpolateBlues);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight + 50})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Profit');

    // Add circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', 2);
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          data: d,
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .attr('fill-opacity', 0.6)
          .attr('stroke-width', 0.5);
        setTooltip(null);
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);
  }, [data, width, height, title]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px',
          }}
        >
          <div><strong>Product:</strong> {tooltip.data.productName}</div>
          <div><strong>Sales:</strong> ${tooltip.data.sales.toFixed(2)}</div>
          <div><strong>Profit:</strong> ${tooltip.data.profit.toFixed(2)}</div>
          <div><strong>Quantity:</strong> {tooltip.data.quantity}</div>
        </div>
      )}
    </div>
  );
};
