/**
 * Line Chart Worksheet Component
 * P121__line and P1225__total_sales_each_year
 *
 * - X-axis: Date (or Year)
 * - Y-axis: Sales
 * - Color: Sales (continuous)
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { LineDataPoint, YearlySalesDataPoint } from '../types/data';

interface LineChartProps {
  data: LineDataPoint[] | YearlySalesDataPoint[];
  width: number;
  height: number;
  title: string;
  isYearly?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ data, width, height, title, isYearly = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions with margins
    const margin = { top: 40, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = isYearly
      ? d3.scaleLinear()
          .domain([
            d3.min(data, d => (d as YearlySalesDataPoint).year) || 0,
            d3.max(data, d => (d as YearlySalesDataPoint).year) || 0
          ])
          .range([0, innerWidth])
      : d3.scaleTime()
          .domain([
            d3.min(data, d => (d as LineDataPoint).date) || new Date(),
            d3.max(data, d => (d as LineDataPoint).date) || new Date()
          ])
          .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Color scale based on Sales
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.Sales) || 0]);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'Arial, sans-serif')
      .text(title);

    // Add X axis
    if (isYearly) {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleLinear<number, number>).tickFormat(d3.format('d')))
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '11px');

      // Add X axis label
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 35)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Year');
    } else {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleTime<number, number>).ticks(width / 80))
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '11px');

      // Add X axis label
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 35)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Order Date');
    }

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '11px');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Create line generator
    const line = d3.line<LineDataPoint | YearlySalesDataPoint>()
      .x(d => xScale(isYearly ? (d as YearlySalesDataPoint).year : (d as LineDataPoint).date))
      .y(d => yScale(d.Sales))
      .curve(d3.curveMonotoneX);

    // Add area gradient
    const gradient = g.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4292c6')
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4292c6')
      .attr('stop-opacity', 0.05);

    // Add area under the line
    const area = d3.area<LineDataPoint | YearlySalesDataPoint>()
      .x(d => xScale(isYearly ? (d as YearlySalesDataPoint).year : (d as LineDataPoint).date))
      .y0(innerHeight)
      .y1(d => yScale(d.Sales))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Add the line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2171b5')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Add dots with interactivity
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(isYearly ? (d as YearlySalesDataPoint).year : (d as LineDataPoint).date))
      .attr('cy', d => yScale(d.Sales))
      .attr('r', 4)
      .attr('fill', d => colorScale(d.Sales))
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        let label = '';
        if (isYearly) {
          label = `Year: ${(d as YearlySalesDataPoint).year}`;
        } else {
          const date = (d as LineDataPoint).date;
          label = `Date: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`;
        }
        const tooltipContent = `
          <strong>${label}</strong><br/>
          Sales: $${d.Sales.toFixed(2)}
        `;
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: tooltipContent
        });
        d3.select(event.currentTarget)
          .attr('r', 6)
          .attr('stroke', '#000')
          .attr('stroke-width', 2);
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 10,
          y: event.pageY - 10
        }));
      })
      .on('mouseout', (event) => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
        d3.select(event.currentTarget)
          .attr('r', 4)
          .attr('stroke', '#333')
          .attr('stroke-width', 0.5);
      });

  }, [data, width, height, title, isYearly]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};
