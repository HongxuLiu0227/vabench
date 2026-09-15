import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AggregatedSalesByDate } from '../types';

interface LineChartProps {
  data: AggregatedSalesByDate[];
  width: number;
  height: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (time)
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    // Y scale (linear)
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Color scale
    const colorScale = d3
      .scaleSequential()
      .interpolator(d3.interpolateWarm)
      .domain([0, d3.max(data, d => d.sales) || 0]);

    // Line generator
    const line = d3
      .line<AggregatedSalesByDate>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Area generator
    const area = d3
      .area<AggregatedSalesByDate>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Draw area
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#gradient)')
      .attr('d', area)
      .attr('opacity', 0.3);

    // Define gradient
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.interpolateWarm(1));

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.interpolateWarm(0) as string)
      .attr('stop-opacity', 0);

    // Draw line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', d3.interpolateWarm(1))
      .attr('stroke-width', 2)
      .attr('d', line);

    // Draw points
    g.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', d => colorScale(d.sales))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .append('title')
      .text(d => {
        const dateStr = d3.timeFormat('%b %Y')(d.date);
        const salesStr = d3.format(',.0f')(d.sales);
        return `${dateStr}\nSales: $${salesStr}`;
      });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(width < 400 ? 6 : 12)
          .tickFormat((d: any) => d3.timeFormat('%b %Y')(d))
      )
      .attr('font-size', '11px')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Y axis
    g.append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((d: any) => {
            const value = Number(d);
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          })
      )
      .attr('font-size', '11px');

    // Grid lines (horizontal)
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .attr('opacity', 0.1);

    // Move grid to back
    svg.select('.grid').lower();
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />;
};
