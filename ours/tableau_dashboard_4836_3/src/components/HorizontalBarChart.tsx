/**
 * Horizontal Bar Chart component using D3
 * Renders ranked horizontal bars with Tableau-faithful styling
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { HorizontalBarChartProps } from '../types';
import { getPerformanceColor } from '../services/dataService';

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  axisTitle,
  seriesField,
  showLegend = false,
  legendData = [],
  width = 400,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          const containerWidth = container.clientWidth;
          // Maintain aspect ratio
          const newHeight = Math.max(300, Math.round(containerWidth * 0.6));
          setDimensions({ width: containerWidth, height: newHeight });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Validate data to prevent NaN issues
    const validData = data.filter(d => d != null && !isNaN(d.value) && d.value >= 0);
    if (validData.length === 0) {
      console.warn('No valid data points for chart');
      return;
    }

    const { width: w, height: h } = dimensions;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h);

    // Calculate margins based on label length
    const maxLabelLength = d3.max(validData, d => d.category?.length || 0) || 0;
    const leftMargin = Math.max(120, maxLabelLength * 7);
    const rightMargin = 60;
    const topMargin = 40;
    const bottomMargin = showLegend ? 80 : 50;

    const chartWidth = w - leftMargin - rightMargin;
    const chartHeight = h - topMargin - bottomMargin;

    // Create chart group
    const g = svg.append('g')
      .attr('transform', `translate(${leftMargin}, ${topMargin})`);

    // Create scales with safe domain to prevent NaN
    const maxValue = d3.max(validData, d => d.value) || 0;
    const safeMaxValue = Math.max(maxValue, 1); // Ensure at least 1 to avoid zero-width scale
    const xScale = d3.scaleLinear()
      .domain([0, safeMaxValue])
      .range([0, chartWidth]);

    const yScale = d3.scaleBand()
      .domain(validData.map(d => d.category))
      .range([0, chartHeight])
      .padding(0.2);

    // Add title
    g.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('text-anchor', 'start')
      .attr('font-family', 'Verdana, sans-serif')
      .attr('font-size', '11px')
      .attr('fill', '#333333')
      .text(title);

    // Add bars
    const bars = g.selectAll('.bar')
      .data(validData)
      .enter()
      .append('g')
      .attr('class', 'bar');

    // Add bar rectangles
    bars.append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.category) || 0)
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        if (d.series) {
          return getPerformanceColor(d.series as 'Above 67%' | '34 - 66%' | 'Below 33%');
        }
        return '#4a90a4'; // Default Tableau blue
      })
      .attr('rx', 0)
      .attr('opacity', 0.9);

    // Add value labels on bars
    bars.append('text')
      .attr('x', d => xScale(d.value) + 5)
      .attr('y', d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('font-family', 'Verdana, sans-serif')
      .attr('font-size', '10px')
      .attr('fill', '#333333')
      .text(d => {
        if (axisTitle.includes('%')) {
          return `${d.value}%`;
        }
        return d.value.toString();
      });

    // Add Y axis (category labels)
    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('font-family', 'Verdana, sans-serif')
      .attr('font-size', '10px')
      .attr('fill', '#333333')
      .attr('text-anchor', 'end');

    // Add X axis (value axis)
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(0);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-family', 'Verdana, sans-serif')
      .attr('font-size', '10px')
      .attr('fill', '#333333');

    // Add X axis title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Verdana, sans-serif')
      .attr('font-size', '10px')
      .attr('fill', '#666666')
      .text(axisTitle);

    // Add legend if required
    if (showLegend && legendData.length > 0) {
      const legendGroup = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${leftMargin}, ${h - bottomMargin + 10})`);

      const legendItemWidth = 120;
      const legendItemHeight = 20;

      legendData.forEach((item, index) => {
        const itemX = (index * legendItemWidth) % (w - leftMargin - rightMargin);
        const itemY = Math.floor((index * legendItemWidth) / (w - leftMargin - rightMargin)) * legendItemHeight;

        const legendItem = legendGroup.append('g')
          .attr('transform', `translate(${itemX}, ${itemY})`);

        // Color box
        legendItem.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', item.color)
          .attr('rx', 1);

        // Label
        legendItem.append('text')
          .attr('x', 16)
          .attr('y', 10)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'start')
          .attr('font-family', 'Verdana, sans-serif')
          .attr('font-size', '10px')
          .attr('fill', '#333333')
          .text(item.category);
      });
    }

  }, [data, title, axisTitle, seriesField, showLegend, legendData, dimensions]);

  return (
    <div className="horizontal-bar-chart" style={{ width: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default HorizontalBarChart;
