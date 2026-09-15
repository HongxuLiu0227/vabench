import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { YearlySalesData } from '../../types';

interface P1225TotalSalesEachYearProps {
  data: YearlySalesData[];
  width?: number;
  height?: number;
}

export function P1225__total_sales_each_year({ data, width = 400, height = 400 }: P1225TotalSalesEachYearProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: YearlySalesData } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.year) as [number, number])
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Create line generator
    const line = d3
      .line<YearlySalesData>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Create area generator
    const area = d3
      .area<YearlySalesData>()
      .x(d => xScale(d.year))
      .y0(innerHeight)
      .y1(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => '$' + d.toLocaleString()))
      .selectAll('text')
      .style('font-size', '11px');

    // Add X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Year');

    // Add Y axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -65)
      .attr('x', -innerHeight / 2)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Add area fill
    g.append('path')
      .datum(data)
      .attr('fill', 'rgba(54, 162, 235, 0.2)')
      .attr('d', area);

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#36a2eb')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', '#36a2eb')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event, g.node()!);
        setTooltip({
          x: x + margin.left,
          y: y + margin.top,
          data: d
        });
        d3.select(event.currentTarget)
          .attr('r', 6);
      })
      .on('mouseout', (event) => {
        setTooltip(null);
        d3.select(event.currentTarget)
          .attr('r', 4);
      });

  }, [data, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Total Sales Each Year</h3>
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
            Year: {tooltip.data.year}
          </div>
          <div>Sales: ${tooltip.data.sales.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
