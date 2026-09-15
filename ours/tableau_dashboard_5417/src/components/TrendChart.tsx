import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { TrendData } from '../types';

interface TrendChartProps {
  data: TrendData[];
  width: number;
  height: number;
  title?: string;
  axisTitleX?: string;
  axisTitleY?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  width,
  height,
  title,
  axisTitleX = 'Date',
  axisTitleY = 'Score',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (time)
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, chartWidth]);

    // Y scale (score)
    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([chartHeight, 0]);

    // Line generators
    const lineMetascore = d3
      .line<TrendData>()
      .x(d => x(d.date))
      .y(d => y(d.avgMetascore))
      .curve(d3.curveMonotoneX);

    const lineUserScore = d3
      .line<TrendData>()
      .x(d => x(d.date))
      .y(d => y(d.avgUserScore))
      .curve(d3.curveMonotoneX);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom<Date>(x).ticks(10).tickFormat(d3.timeFormat('%Y-%m')))
      .style('font-size', '10px')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-25)');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(10))
      .style('font-size', '10px');

    // Add axis labels
    g.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 50})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(axisTitleX);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -chartHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(axisTitleY);

    // Add title
    if (title) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Add lines
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2196F3')
      .attr('stroke-width', 2)
      .attr('d', lineMetascore);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#FF9800')
      .attr('stroke-width', 2)
      .attr('d', lineUserScore);

    // Add dots
    g.selectAll('.dot-metascore')
      .data(data)
      .join('circle')
      .attr('class', 'dot-metascore')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.avgMetascore))
      .attr('r', 3)
      .attr('fill', '#2196F3')
      .on('mouseover', function() {
        d3.select(this).attr('r', 5);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 3);
      });

    g.selectAll('.dot-userscore')
      .data(data)
      .join('circle')
      .attr('class', 'dot-userscore')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.avgUserScore))
      .attr('r', 3)
      .attr('fill', '#FF9800')
      .on('mouseover', function() {
        d3.select(this).attr('r', 5);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 3);
      });

    // Add legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 120}, 40)`);

    const legendData = [
      { color: '#2196F3', label: 'Metascore' },
      { color: '#FF9800', label: 'User Score' },
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 6)
        .attr('y2', 6)
        .attr('stroke', item.color)
        .attr('stroke-width', 2);

      legendRow
        .append('circle')
        .attr('cx', 10)
        .attr('cy', 6)
        .attr('r', 3)
        .attr('fill', item.color);

      legendRow
        .append('text')
        .attr('x', 28)
        .attr('y', 10)
        .style('font-size', '11px')
        .text(item.label);
    });

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
      .style('pointer-events', 'none')
      .style('font-size', '11px');

    // Create a transparent overlay for better tooltip detection
    g.append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event);
        const date = x.invert(mx);

        // Find closest data point
        const closest = data.reduce((prev, curr) =>
          Math.abs(curr.date.getTime() - date.getTime()) <
          Math.abs(prev.date.getTime() - date.getTime())
            ? curr
            : prev
        );

        if (closest) {
          tooltip
            .style('opacity', 1)
            .html(
              `<strong>${d3.timeFormat('%Y-%m')(closest.date)}</strong><br/>` +
              `Metascore: ${closest.avgMetascore.toFixed(1)}<br/>` +
              `User Score: ${closest.avgUserScore.toFixed(1)}<br/>` +
              `Games: ${closest.count}`
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
        }
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      });

  }, [data, width, height, title, axisTitleX, axisTitleY]);

  return <svg ref={svgRef}></svg>;
};
