import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesProfitPoint } from '../types';

interface ScatterplotProps {
  data: SalesProfitPoint[];
  title: string;
  width?: number;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function Scatterplot({
  data,
  title,
  width = 400,
  height = 300,
  xAxisLabel = '',
  yAxisLabel = '',
}: ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 40, right: 30, bottom: xAxisLabel ? 60 : 50, left: yAxisLabel ? 70 : 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
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
      .domain(d3.extent(data, (d) => d.profit) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Size scale for quantity
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.quantity) || 0])
      .range([4, 20]);

    // Color scale for sales
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, (d) => d.sales) || 0]);

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(10))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#666');

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#666');

    // Remove axis lines
    g.selectAll('.x-axis path, .y-axis path').style('stroke', '#ccc').style('stroke-width', '1');
    g.selectAll('.x-axis .tick line, .y-axis .tick line').style('stroke', '#eee');

    // Add axis labels
    if (xAxisLabel) {
      g.append('text')
        .attr('class', 'x-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .style('font-weight', '500')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      g.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -55)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .style('font-weight', '500')
        .text(yAxisLabel);
    }

    // Add circles
    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke-width', 2);
        const content = `${d.productName}<br/>Sales: $${d.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>Profit: $${d.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>Quantity: ${d.quantity}`;
        setTooltip({ x: event.pageX, y: event.pageY, content });
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.7).attr('stroke-width', 1);
        setTooltip(null);
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .text(title);
  }, [data, width, height, title, xAxisLabel, yAxisLabel]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            maxWidth: '300px',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}
