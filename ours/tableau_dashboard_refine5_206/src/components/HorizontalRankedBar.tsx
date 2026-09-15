import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ParsedSalesRecord } from '../services/dataLoader';

interface HorizontalRankedBarProps {
  data: ParsedSalesRecord[];
  title: string;
  width?: number;
  height?: number;
}

interface BarData {
  subCategory: string;
  sales: number;
}

export function HorizontalRankedBar({
  data,
  title,
  width = 400,
  height = 300,
}: HorizontalRankedBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<BarData | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Aggregate sales by sub-category
    const aggregation = new Map<string, number>();
    data.forEach((record) => {
      const current = aggregation.get(record.subCategory) || 0;
      aggregation.set(record.subCategory, current + record.sales);
    });

    const chartData: BarData[] = Array.from(aggregation.entries())
      .map(([subCategory, sales]) => ({ subCategory, sales }))
      .sort((a, b) => b.sales - a.sales); // Sort descending by sales

    if (chartData.length === 0) return;

    // Set up dimensions with margins
    const margin = { top: 20, right: 30, bottom: 20, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.subCategory))
      .range([0, innerHeight])
      .padding(0.2);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Sales');

    // Create bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(d.subCategory) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', (d) => xScale(d.sales))
      .attr('fill', '#1f77b4')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        d3.select(event.currentTarget).attr('fill', '#ff7f0e');
      })
      .on('mouseout', (event) => {
        setHoveredData(null);
        d3.select(event.currentTarget).attr('fill', '#1f77b4');
      });

    // Add value labels on bars
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('y', (d) => (yScale(d.subCategory) || 0) + yScale.bandwidth() / 2)
      .attr('x', (d) => xScale(d.sales) + 5)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text((d) => `$${d.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(title);
  }, [data, title, width, height]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {hoveredData && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: '12px',
            zIndex: 10,
          }}
        >
          <div>
            <strong>Sub-Category:</strong> {hoveredData.subCategory}
          </div>
          <div>
            <strong>Sales:</strong> ${hoveredData.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  );
}
