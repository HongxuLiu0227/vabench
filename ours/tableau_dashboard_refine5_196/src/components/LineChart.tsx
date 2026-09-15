import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { LineDataPoint } from '../types';

interface LineChartProps {
  data: LineDataPoint[];
  width: number;
  height: number;
  title?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, width, height, title = 'Line' }) => {
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

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(width / 80)
          .tickFormat((date) => d3.timeFormat('%b %Y')(date as Date))
      )
      .selectAll('text')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-25)')
      .style('text-anchor', 'end');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight + 50})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Order Date');

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
      .line<LineDataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add area
    const area = d3
      .area<LineDataPoint>()
      .x((d) => xScale(d.date))
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
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 3)
      .attr('fill', 'rgba(54, 162, 235, 1)')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 5);

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
            <div><strong>Date:</strong> ${d.monthYear}</div>
            <div><strong>Sales:</strong> $${d.sales.toFixed(2)}</div>
          `);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 3);
        d3.selectAll('.tooltip').remove();
      });

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
