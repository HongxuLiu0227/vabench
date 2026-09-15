import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { YearlySales } from '../services/dataLoader';
import './Worksheet.css';

interface YearlySalesChartProps {
  data: YearlySales[];
}

function YearlySalesChart({ data }: YearlySalesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    if (!data || data.length === 0) {
      return;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 40, bottom: 60, left: 80 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, width])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([height, 0])
      .nice();

    // Create line generator
    const line = d3
      .line<YearlySales>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add x-axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format('d'));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    // Add x-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .text('Year');

    // Add y-axis
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `$${(d as number) / 1000}k`);

    g.append('g').attr('class', 'y-axis').call(yAxis);

    // Add y-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -60)
      .text('Sales');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

    // Add line path
    g.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add data points
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', '#1f77b4')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    g.selectAll('.dot')
      .on('mouseover', function (event, d) {
        const data = d as YearlySales;
        d3.select(this).attr('r', 6).attr('fill', '#ff7f0e');
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip
          .html(
            `<strong>${data.year}</strong><br/>
            Sales: $${data.sales.toFixed(2)}`
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 4).attr('fill', '#1f77b4');
        tooltip
          .transition()
          .duration(500)
          .style('opacity', 0);
      });
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="worksheet-container">
      <div className="worksheet-header">
        <h3 className="worksheet-title">Total Sales Each Year</h3>
      </div>
      <div className="worksheet-content">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}

export default YearlySalesChart;
