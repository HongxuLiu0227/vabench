import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ParsedSalesRecord } from '../services/dataLoader';

interface LineChartProps {
  data: ParsedSalesRecord[];
  title: string;
  timeGranularity: 'month' | 'year';
  width?: number;
  height?: number;
}

interface DataPoint {
  date: Date;
  sales: number;
}

export function LineChart({ data, title, timeGranularity, width = 400, height = 300 }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<DataPoint | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Aggregate data based on time granularity
    let aggregatedData: DataPoint[] = [];
    if (timeGranularity === 'year') {
      const aggregation = new Map<number, number>();
      data.forEach((record) => {
        const year = record.orderDate.getFullYear();
        const current = aggregation.get(year) || 0;
        aggregation.set(year, current + record.sales);
      });
      aggregatedData = Array.from(aggregation.entries())
        .map(([year, sales]) => ({ date: new Date(year, 0, 1), sales }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      // Month granularity
      const aggregation = new Map<string, number>();
      data.forEach((record) => {
        const dateKey = `${record.orderDate.getFullYear()}-${String(record.orderDate.getMonth() + 1).padStart(2, '0')}`;
        const current = aggregation.get(dateKey) || 0;
        aggregation.set(dateKey, current + record.sales);
      });
      aggregatedData = Array.from(aggregation.entries())
        .map(([dateStr, sales]) => ({
          date: new Date(dateStr + '-01'),
          sales,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    if (aggregatedData.length === 0) return;

    // Set up dimensions with margins
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG group
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(aggregatedData, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(aggregatedData, (d) => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Create line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(timeGranularity === 'year' ? 5 : 8)
          .tickFormat((d) => {
            const date = d as Date;
            if (timeGranularity === 'year') {
              return d3.timeFormat('%Y')(date);
            }
            return d3.timeFormat('%b %Y')(date);
          })
      )
      .selectAll('text')
      .attr('transform', 'rotate(-25)')
      .style('text-anchor', 'end')
      .style('font-size', '11px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Sales');

    // Add the line path
    g.append('path')
      .datum(aggregatedData)
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(aggregatedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', '#1f77b4')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        d3.select(event.currentTarget).attr('r', 6).attr('fill', '#ff7f0e');
      })
      .on('mouseout', (event) => {
        setHoveredData(null);
        d3.select(event.currentTarget).attr('r', 4).attr('fill', '#1f77b4');
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(title);
  }, [data, title, timeGranularity, width, height]);

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
            <strong>Date:</strong>{' '}
            {timeGranularity === 'year'
              ? hoveredData.date.getFullYear()
              : hoveredData.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </div>
          <div>
            <strong>Sales:</strong> ${hoveredData.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  );
}
