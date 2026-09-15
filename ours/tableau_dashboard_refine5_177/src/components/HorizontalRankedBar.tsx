import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesByCategory } from '../services/dataLoader';
import './Worksheet.css';

interface HorizontalRankedBarProps {
  data: SalesByCategory[];
}

function HorizontalRankedBar({ data }: HorizontalRankedBarProps) {
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

    const margin = { top: 20, right: 20, bottom: 20, left: 200 };
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
    const xScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.sales) || 0]).range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => `${d.category} - ${d.subCategory}`))
      .range([0, height])
      .padding(0.2);

    // Create color scale by category
    const categories = Array.from(new Set(data.map((d) => d.category)));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(categories);

    // Add x-axis
    const xAxis = d3.axisTop(xScale).ticks(5).tickFormat((d) => `$${(d as number) / 1000}k`);

    g.append('g').attr('class', 'x-axis').call(xAxis);

    // Add y-axis
    const yAxis = d3.axisLeft(yScale);
    g.append('g').attr('class', 'y-axis').call(yAxis);

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', (d) => xScale(d.sales))
      .attr('fill', (d) => colorScale(d.category) as string)
      .attr('opacity', 0.8);

    // Add value labels at the end of bars
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('y', (d) => (yScale(`${d.category} - ${d.subCategory}`) || 0) + yScale.bandwidth() / 2)
      .attr('x', (d) => xScale(d.sales) + 5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text((d) => `$${d.sales.toFixed(2)}`);
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="worksheet-container">
      <div className="worksheet-header">
        <h3 className="worksheet-title">Bar</h3>
      </div>
      <div className="worksheet-content">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}

export default HorizontalRankedBar;
