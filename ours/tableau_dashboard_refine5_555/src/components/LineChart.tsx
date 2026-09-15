import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedByMonth, AggregatedByYear } from '../types/data';

interface LineChartProps {
  data: AggregatedByMonth[] | AggregatedByYear[];
  width: number;
  height: number;
  title?: string;
  type: 'month' | 'year';
  showLabels?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  title = 'Line',
  type,
  showLabels = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxSales = d3.max(data, (d: AggregatedByMonth | AggregatedByYear) => d.sales) || 0;

    // Create color scale
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxSales])
      .interpolator(type === 'month' ? d3.interpolateRgb('#fee391', '#d94801') : d3.interpolateRgb('#c6dbef', '#3182bd'));

    // Add y axis
    const yScale = d3
      .scaleLinear()
      .domain([0, maxSales * 1.1])
      .range([innerHeight, 0]);

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(',.0f')))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Inter, system-ui, sans-serif');

    if (type === 'month') {
      // Handle month-based line chart
      const monthData = data as AggregatedByMonth[];
      const xScale = d3
        .scaleTime()
        .domain(d3.extent(monthData, (d) => d.month) as [Date, Date])
        .range([0, innerWidth]);

      // Add x axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .attr('class', 'x-axis')
        .call(d3.axisBottom(xScale).ticks(width < 300 ? 4 : 6).tickFormat((d) => d3.timeFormat('%b %Y')(d as unknown as Date)))
        .selectAll('text')
        .style('font-size', '11px')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .attr('transform', 'rotate(-25)')
        .style('text-anchor', 'end');

      // Prepare data for line/area
      const lineData = monthData.map((d) => ({
        x: xScale(d.month),
        y: yScale(d.sales),
        sales: d.sales,
        original: d,
      }));

      // Add area fill
      const area = d3
        .area<typeof lineData[number]>()
        .x((d) => d.x)
        .y0(innerHeight)
        .y1((d) => d.y)
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(lineData)
        .attr('fill', () => colorScale(maxSales))
        .attr('fill-opacity', 0.3)
        .attr('d', area);

      // Add line
      const line = d3
        .line<typeof lineData[number]>()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', () => colorScale(maxSales))
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add dots
      g.selectAll('.dot')
        .data(lineData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', 4)
        .attr('fill', (d) => colorScale(d.sales))
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, d) => {
          const dateStr = d3.timeFormat('%b %Y')(d.original.month);
          setTooltip({
            x: event.pageX + 10,
            y: event.pageY - 10,
            content: `${dateStr}<br/>Sales: $${d.sales.toLocaleString()}`,
          });
        })
        .on('mouseout', () => {
          setTooltip(null);
        });
    } else {
      // Handle year-based bar chart
      const yearData = data as AggregatedByYear[];
      const xScale = d3
        .scaleBand()
        .domain(yearData.map((d) => String(d.year)))
        .range([0, innerWidth])
        .padding(0.2);

      // Add x axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .attr('class', 'x-axis')
        .call(d3.axisBottom(xScale).tickFormat((d) => String(d)))
        .selectAll('text')
        .style('font-size', '11px')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .style('text-anchor', 'middle');

      // Prepare data
      const barData = yearData.map((d) => ({
        x: (xScale(String(d.year)) || 0) + xScale.bandwidth() / 2,
        y: yScale(d.sales),
        sales: d.sales,
        original: d,
        barX: xScale(String(d.year)) || 0,
        barWidth: xScale.bandwidth(),
      }));

      // Add bars
      g.selectAll('.bar')
        .data(barData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => d.barX)
        .attr('y', (d) => d.y)
        .attr('width', (d) => d.barWidth)
        .attr('height', (d) => innerHeight - d.y)
        .attr('fill', (d) => colorScale(d.sales))
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, d) => {
          setTooltip({
            x: event.pageX + 10,
            y: event.pageY - 10,
            content: `Year ${d.original.year}<br/>Sales: $${d.sales.toLocaleString()}`,
          });
        })
        .on('mouseout', () => {
          setTooltip(null);
        });

      // Add labels
      if (showLabels) {
        g.selectAll('.label')
          .data(barData)
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', (d) => d.x)
          .attr('y', (d) => d.y - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('font-family', 'Inter, system-ui, sans-serif')
          .text((d) => `$${(d.sales / 1000).toFixed(1)}K`);
      }
    }

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .text(title);
  }, [data, width, height, title, type, showLabels]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};

export default LineChart;
