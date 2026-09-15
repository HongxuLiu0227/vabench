import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ProductSalesData } from '../../types';

interface P121ScatterplotProps {
  data: ProductSalesData[];
  width?: number;
  height?: number;
}

export function P121__scatterplot({ data, width = 400, height = 400 }: P121ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProductSalesData } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.profit) || 0])
      .nice()
      .range([innerHeight, 0]);

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, d => d.quantity) || 0])
      .range([4, 20]);

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.sales) || 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px');

    // Add X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Add Y axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Profit');

    // Add circles
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
        const [x, y] = d3.pointer(event, g.node()!);
        setTooltip({
          x: x + margin.left,
          y: y + margin.top,
          data: d
        });
        d3.select(event.currentTarget)
          .attr('stroke-width', 2)
          .attr('fill-opacity', 1);
      })
      .on('mouseout', (event) => {
        setTooltip(null);
        d3.select(event.currentTarget)
          .attr('stroke-width', 0.5)
          .attr('fill-opacity', 0.6);
      });

  }, [data, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Scatterplot</h3>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.data.productName.length > 30
              ? tooltip.data.productName.substring(0, 30) + '...'
              : tooltip.data.productName}
          </div>
          <div>Sales: ${tooltip.data.sales.toFixed(2)}</div>
          <div>Profit: ${tooltip.data.profit.toFixed(2)}</div>
          <div>Quantity: {tooltip.data.quantity}</div>
        </div>
      )}
    </div>
  );
}
