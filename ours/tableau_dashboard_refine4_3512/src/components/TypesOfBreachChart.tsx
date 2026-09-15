import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { DataPoint } from '../types/data';
import { getBreachTypeColor } from '../utils/colors';
import { aggregateByBreachType, filterData } from '../services/dataAggregator';
import { useFilter } from '../contexts/FilterContext';

interface TypesOfBreachChartProps {
  data: DataPoint[];
  width: number;
  height: number;
}

export const TypesOfBreachChart: React.FC<TypesOfBreachChartProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filter } = useFilter();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Apply filter
    const filteredData = filterData(data, filter);

    // Aggregate data
    const aggregated = aggregateByBreachType(filteredData);

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup dimensions with dynamic margins for long labels
    const margin = { top: 20, right: 20, bottom: 80, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(aggregated.map(d => d.breachType))
      .range([0, innerWidth])
      .padding(0.2);

    const maxY = d3.max(aggregated, d => d.count) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxY * 1.1]) // Add 10% headroom
      .range([innerHeight, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create x-axis with rotated labels for better visibility
    const xAxis = d3.axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.75em')
      .attr('transform', 'rotate(-30)')
      .style('font-size', '11px');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale);
    g.append('g')
      .call(yAxis);

    // Create tooltip group (hidden by default)
    const tooltip = g.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    tooltip.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(0, 0, 0, 0.8)');

    const tooltipText = tooltip.append('text')
      .attr('fill', '#fff')
      .style('font-size', '12px');

    // Create bars
    g.selectAll('.bar')
      .data(aggregated)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.breachType) || 0)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', d => getBreachTypeColor(d.breachType))
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 1);

        // Show tooltip
        const tooltipContent = `${d.breachType}\n${d.count} breaches`;

        tooltipText.selectAll('tspan').remove();
        tooltipContent.split('\n').forEach((line, i) => {
          tooltipText.append('tspan')
            .attr('x', 10)
            .attr('dy', i === 0 ? '1.2em' : '1.4em')
            .text(line);
        });

        const bbox = (tooltipText.node() as SVGTextElement)?.getBBox();
        if (bbox) {
          tooltip.select('rect')
            .attr('x', bbox.x - 5)
            .attr('y', bbox.y - 5)
            .attr('width', bbox.width + 10)
            .attr('height', bbox.height + 10);
        }

        tooltip
          .attr('transform', `translate(${event.offsetX + 10},${event.offsetY + 10})`)
          .style('opacity', 1);
      })
      .on('mousemove', function(event) {
        tooltip
          .attr('transform', `translate(${event.offsetX + 10},${event.offsetY + 10})`);
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.8);
        tooltip.style('opacity', 0);
      });

    // Add value labels on bars (only if bar is tall enough)
    g.selectAll('.bar-label')
      .data(aggregated)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => (xScale(d.breachType) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => {
        // Only show label if bar height is sufficient
        return innerHeight - yScale(d.count) > 20 ? d.count.toString() : '';
      });

  }, [data, width, height, filter]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
};
