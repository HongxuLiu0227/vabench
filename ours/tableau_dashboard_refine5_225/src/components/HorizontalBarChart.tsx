import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { SalesBySubCategory } from '../types';

interface HorizontalBarChartProps {
  data: SalesBySubCategory[];
  width: number;
  height: number;
  title: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, width, height, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 100, bottom: 40, left: 150 };
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
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.subCategory))
      .range([0, innerHeight])
      .padding(0.15);

    // Create color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.sales) || 0]);

    // Add bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('y', d => yScale(d.subCategory) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.sales))
      .attr('fill', d => colorScale(d.sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(width / 100)
        .tickFormat((d) => {
          const value = Number(d);
          if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
          return value.toString();
        })
      );

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 35})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Sales');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add data labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', d => xScale(d.sales) + 10)
      .attr('y', d => (yScale(d.subCategory) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .text(d => {
        if (d.sales >= 1000) return (d.sales / 1000).toFixed(1) + 'K';
        return d.sales.toFixed(0);
      });

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
        const datum = d as SalesBySubCategory;
        d3.select(this)
          .attr('opacity', 1);

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);

        tooltip.html(`
          <strong>${datum.subCategory}</strong><br/>
          Sales: $${datum.sales.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
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
