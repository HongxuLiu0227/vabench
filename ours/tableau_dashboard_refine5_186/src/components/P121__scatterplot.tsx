import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesData } from '../types';
import { aggregateForScatterplot } from '../services/dataService';

interface P121ScatterplotProps {
  data: SalesData[];
  width: number;
  height: number;
}

export function P121Scatterplot({ data, width, height }: P121ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const scatterData = aggregateForScatterplot(data);
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(scatterData, (d) => d.sales) || 0])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(scatterData, (d) => d.profit) || 0, d3.max(scatterData, (d) => d.profit) || 0])
      .range([chartHeight, 0])
      .nice();

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(scatterData, (d) => d.quantity) || 0])
      .range([4, 20]);

    // Color scale based on sales
    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(scatterData, (d) => d.sales) || 0])
      .interpolator(d3.interpolateBlues);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => {
      const value = d as number;
      return `$${(value / 1000).toFixed(0)}K`;
    });

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      const value = d as number;
      return `$${(value / 1000).toFixed(0)}K`;
    });

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif');

    // Create circles
    g.selectAll('.circle')
      .data(scatterData)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', 0)
      .attr('fill', (d) => colorScale(d.sales))
      .attr('opacity', 0.7)
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d.productName}<br/>Sales: $${d.sales.toLocaleString()}<br/>Profit: $${d.profit.toLocaleString()}<br/>Quantity: ${d.quantity}`,
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 0.7);
        setTooltip(null);
      })
      .transition()
      .duration(500)
      .attr('r', (d) => sizeScale(d.quantity));

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'sans-serif')
      .text('Scatterplot');
  }, [data, width, height]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            pointerEvents: 'none',
            fontSize: '12px',
            fontFamily: 'sans-serif',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}
