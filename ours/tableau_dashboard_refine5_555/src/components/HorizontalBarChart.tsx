import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedByCategory } from '../types/data';

interface HorizontalBarChartProps {
  data: AggregatedByCategory[];
  width: number;
  height: number;
  title?: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  width,
  height,
  title = 'Bar',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create color scale (blue-teal gradient)
    const maxSales = d3.max(data, (d) => d.sales) || 0;
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxSales])
      .interpolator(d3.interpolateRgb('#e0f3f8', '#0868ac'));

    // Create x scale
    const xScale = d3
      .scaleLinear()
      .domain([0, maxSales * 1.1])
      .range([0, innerWidth]);

    // Create y scale
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => `${d.category} - ${d.subCategory}`))
      .range([0, innerHeight])
      .padding(0.15);

    // Create x axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(',.0f'));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Inter, system-ui, sans-serif');

    // Create y axis
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Inter, system-ui, sans-serif');

    // Create bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('x', 0)
      .attr('width', (d) => xScale(d.sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .on('mouseover', (event, d) => {
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d.category} - ${d.subCategory}<br/>Sales: $${d.sales.toLocaleString()}`,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .text(title);
  }, [data, width, height, title]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};

export default HorizontalBarChart;
