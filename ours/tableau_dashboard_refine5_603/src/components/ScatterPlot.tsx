import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterDataPoint } from '../types';

interface ScatterPlotProps {
  data: ScatterDataPoint[];
  title: string;
  width?: number;
  height?: number;
}

export function ScatterPlot({
  data,
  title,
  width = 400,
  height = 300,
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Margins
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };
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
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.profit) || 0,
        d3.max(data, (d) => d.profit) || 0,
      ])
      .nice()
      .range([innerHeight, 0]);

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.quantity) || 0])
      .range([4, 20]);

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, (d) => d.sales) || 0]);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('~s')))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '10px');

    // Add Y axis
    svg
      .append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('~s')))
      .selectAll('text')
      .style('font-size', '11px');

    // Add grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Add circles
    svg
      .selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('opacity', 0.6)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          content: `
            <strong>${d.productName}</strong><br/>
            Sales: $${d.sales.toFixed(2)}<br/>
            Profit: $${d.profit.toFixed(2)}<br/>
            Quantity: ${d.quantity}
          `,
        });

        d3.select(event.currentTarget).attr('opacity', 1);
      })
      .on('mouseout', (event) => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
        d3.select(event.currentTarget).attr('opacity', 0.6);
      })
      .transition()
      .duration(500)
      .attr('r', (d) => sizeScale(d.quantity));
  }, [data, width, height]);

  return (
    <div className="scatterplot-container">
      <h3 className="chart-title">{title}</h3>
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '250px',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}
