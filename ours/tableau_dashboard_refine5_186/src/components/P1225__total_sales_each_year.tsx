import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesData } from '../types';
import { aggregateByYear } from '../services/dataService';

interface P1225TotalSalesEachYearProps {
  data: SalesData[];
  width: number;
  height: number;
}

export function P1225TotalSalesEachYear({ data, width, height }: P1225TotalSalesEachYearProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const yearlyData = aggregateByYear(data);
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
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
      .scaleBand()
      .domain(yearlyData.map((d) => d.year.toString()))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(yearlyData, (d) => d.sales) || 0])
      .range([chartHeight, 0]);

    // Color scale based on sales
    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(yearlyData, (d) => d.sales) || 0])
      .interpolator(d3.interpolateBlues);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale);
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

    // Create line
    const line = d3
      .line<{ year: number; sales: number }>()
      .x((d) => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(yearlyData)
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Create circles
    g.selectAll('.circle')
      .data(yearlyData)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 0)
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .attr('r', 8)
          .attr('opacity', 1);
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `Year: ${d.year}<br/>Sales: $${d.sales.toLocaleString()}`,
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .attr('r', 5)
          .attr('opacity', 0.8);
        setTooltip(null);
      })
      .transition()
      .duration(500)
      .attr('r', 5);

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'sans-serif')
      .text('Total Sales Each Year');
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
