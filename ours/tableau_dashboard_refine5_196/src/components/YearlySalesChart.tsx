import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { YearlySalesDataPoint } from '../types';

interface YearlySalesChartProps {
  data: YearlySalesDataPoint[];
  width: number;
  height: number;
  title?: string;
}

export const YearlySalesChart: React.FC<YearlySalesChartProps> = ({
  data,
  width,
  height,
  title = 'Total Sales Each Year',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales for line chart (using scalePoint for discrete years)
    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => d.year.toString()))
      .range([0, innerWidth])
      .padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight + 50})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Year');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Create line generator
    const line = d3
      .line<YearlySalesDataPoint>()
      .x((d) => xScale(d.year.toString()) || 0)
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Create area generator for fill
    const area = d3
      .area<YearlySalesDataPoint>()
      .x((d) => xScale(d.year.toString()) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add area fill
    g.append('path')
      .datum(data)
      .attr('fill', 'rgba(54, 162, 235, 0.2)')
      .attr('d', area);

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(54, 162, 235, 1)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.year.toString()) || 0)
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', 'rgba(54, 162, 235, 1)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 6);

        // Show tooltip
        d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'fixed')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .style('background', 'white')
          .style('border', '1px solid #ccc')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`
            <div><strong>Year:</strong> ${d.year}</div>
            <div><strong>Sales:</strong> $${d.sales.toFixed(2)}</div>
          `);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 4);
        d3.selectAll('.tooltip').remove();
      });

    // Add value labels on dots
    g.selectAll('text.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => xScale(d.year.toString()) || 0)
      .attr('y', (d) => yScale(d.sales) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .text((d) => `$${(d.sales / 1000).toFixed(0)}k`);

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);
  }, [data, width, height, title]);

  return <svg ref={svgRef} width={width} height={height} />;
};
