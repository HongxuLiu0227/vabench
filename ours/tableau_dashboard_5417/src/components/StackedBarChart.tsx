import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SentimentData } from '../types';

interface StackedBarChartProps {
  data: SentimentData[];
  width: number;
  height: number;
  title?: string;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  width,
  height,
  title,
  onCategoryClick,
  selectedCategory,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Stack the data
    const keys = ['positive', 'neutral', 'negative'] as const;
    const stack = d3.stack<SentimentData, keyof SentimentData>().keys(keys);
    const stackedData = stack(data);

    // X scale
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.category))
      .range([0, chartWidth])
      .padding(0.2);

    // Y scale
    const maxY = d3.max(stackedData, d => d3.max(d, v => v[1])) || 0;
    const y = d3.scaleLinear().domain([0, maxY]).range([chartHeight, 0]);

    // Color scale
    const color = d3
      .scaleOrdinal()
      .domain(keys)
      .range(['#4CAF50', '#9E9E9E', '#F44336']);

    // Create bars
    g.selectAll('.category')
      .data(stackedData)
      .join('g')
      .attr('fill', d => color(d.key) as string)
      .selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => x(d.data.category) || 0)
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .attr('class', d =>
        selectedCategory && d.data.category === selectedCategory
          ? 'bar rect-selected'
          : 'bar'
      )
      .style('cursor', onCategoryClick ? 'pointer' : 'default')
      .on('click', (_event, d) => {
        if (onCategoryClick) {
          onCategoryClick(d.data.category);
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this).attr('opacity', selectedCategory && d.data.category === selectedCategory ? 1 : 1);
      });

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-25)')
      .style('font-size', '10px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .style('font-size', '10px');

    // Add title
    if (title) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none');

    g.selectAll('rect')
      .on('mousemove', function(event, d) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = d as any;
        const category = data.data.category;
        const value = data[1] - data[0];
        tooltip
          .style('opacity', 1)
          .html(`<strong>${category}</strong><br/>Value: ${value.toFixed(0)}`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      });
  }, [data, width, height, title, onCategoryClick, selectedCategory]);

  return <svg ref={svgRef}></svg>;
};
