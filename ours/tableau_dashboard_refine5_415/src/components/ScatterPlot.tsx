import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterPoint } from '../types';

interface ScatterPlotProps {
  data: ScatterPoint[];
  width: number;
  height: number;
  title?: string;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, width, height, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ScatterPoint } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions with margins
    const margin = { top: 40, right: 30, bottom: 60, left: 70 };
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
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.profit) || 0, d3.max(data, (d) => d.profit) || 0])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.quantity) || 0])
      .range([4, 20]);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', '#666')
      .selectAll('text')
      .style('font-size', '11px');

    // Add X axis label
    svg
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Add Y axis
    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#666')
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Profit');

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

    // Add circles
    svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', '#ff7f0e')
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#ff7f0e')
      .attr('stroke-width', 1)
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
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 10,
            maxWidth: '200px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tooltip.data.productName}</div>
          <div>Sales: ${tooltip.data.sales.toFixed(2)}</div>
          <div>Profit: ${tooltip.data.profit.toFixed(2)}</div>
          <div>Quantity: {tooltip.data.quantity}</div>
        </div>
      )}
    </div>
  );
};
