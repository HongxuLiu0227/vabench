import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { SalesByYear } from '../types';

interface YearlySalesChartProps {
  data: SalesByYear[];
  width: number;
  height: number;
  title: string;
}

export const YearlySalesChart: React.FC<YearlySalesChartProps> = ({ data, width, height, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
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
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.year.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([d3.min(data, d => d.sales) || 0, d3.max(data, d => d.sales) || 0]);

    // Create line generator
    const line = d3.line<SalesByYear>()
      .x(d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add area fill
    const area = d3.area<SalesByYear>()
      .x(d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .y0(innerHeight)
      .y1(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

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

    // Add bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.year.toString()) || 0)
      .attr('y', d => yScale(d.sales))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.sales))
      .attr('fill', d => colorScale(d.sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7);

    // Add data labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.sales) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .text(d => {
        if (d.sales >= 1000) return (d.sales / 1000).toFixed(1) + 'K';
        return d.sales.toFixed(0);
      });

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Year');

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

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Sales');

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

    g.selectAll('rect')
      .on('mouseover', function(event, d) {
        const datum = d as SalesByYear;
        d3.select(this)
          .attr('opacity', 1);

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);

        tooltip.html(`
          <strong>${datum.year}</strong><br/>
          Sales: $${datum.sales.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.7);

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
