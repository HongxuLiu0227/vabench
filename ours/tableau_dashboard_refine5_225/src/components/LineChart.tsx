import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { SalesByMonth } from '../types';

interface LineChartProps {
  data: SalesByMonth[];
  width: number;
  height: number;
  title: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, width, height, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2 + 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.month) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Create color scale
    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([d3.min(data, d => d.sales) || 0, d3.max(data, d => d.sales) || 0]);

    // Create line generator
    const line = d3.line<SalesByMonth>()
      .x(d => xScale(d.month))
      .y(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Create area generator for filled area under line
    const area = d3.area<SalesByMonth>()
      .x(d => xScale(d.month))
      .y0(innerHeight)
      .y1(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add area fill
    g.append('path')
      .datum(data)
      .attr('fill', 'rgba(100, 149, 237, 0.1)')
      .attr('d', area);

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4169E1')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.month))
      .attr('cy', d => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', d => colorScale(d.sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom<Date>(xScale)
        .ticks(width / 80)
        .tickFormat(d3.timeFormat('%Y-%m'))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(height / 60)
        .tickFormat((d) => {
          const value = Number(d);
          if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
          return value.toString();
        })
      );

    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px');

    g.selectAll('circle')
      .on('mouseover', function(event, d) {
        const datum = d as SalesByMonth;
        d3.select(this)
          .attr('r', 6)
          .attr('opacity', 1);

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);

        tooltip.html(`
          <strong>${d3.timeFormat('%B %Y')(datum.month)}</strong><br/>
          Sales: $${datum.sales.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 4)
          .attr('opacity', 0.8);

        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height, title]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
};
