/**
 * BarChart Component
 * Renders vertical ranked bar chart for Sheet 3
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { BarChartProps } from '../types';

const BarChart: React.FC<BarChartProps> = ({
  data,
  width,
  height,
  title,
  categoryField,
  filterState,
  highlightField
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Calculate margins
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter data based on filter state
    const isFiltered = filterState.selectedIndices.size > 0;
    const filteredData = isFiltered
      ? data.filter((_, i) => filterState.selectedIndices.has(i))
      : data;

    // Aggregate by category
    const categoryCounts = new Map<string, number>();
    filteredData.forEach(d => {
      const category = String(d[categoryField]);
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    });

    // Convert to array and sort descending
    const aggregatedData = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Check for highlighting
    const highlightValue = highlightField && filterState.selectedIndices.size > 0
      ? String(data[Array.from(filterState.selectedIndices)[0]][highlightField])
      : null;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(aggregatedData.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.count) ?? 1])
      .range([innerHeight, 0])
      .nice();

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#666');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#666');

    // Draw bars
    g.selectAll('rect')
      .data(aggregatedData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.category) ?? 0)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', d => {
        if (highlightValue && d.category !== highlightValue) {
          return '#ccc';
        }
        return '#4e79a7';
      })
      .attr('opacity', 0.8)
      .attr('stroke', 'none')
      .attr('rx', 2);

    // Add value labels on bars
    g.selectAll('text.label')
      .data(aggregatedData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.category) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text(d => d.count);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(title);

  }, [data, width, height, title, categoryField, filterState, highlightField]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
};

export default BarChart;
