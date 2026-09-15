import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesByDate, SalesByYear } from '../types';

interface BaseLineChartProps {
  title: string;
  width?: number;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

interface DateLineChartProps extends BaseLineChartProps {
  data: SalesByDate[];
}

interface YearLineChartProps extends BaseLineChartProps {
  data: SalesByYear[];
}

type LineChartProps = DateLineChartProps | YearLineChartProps;

function isDateData(data: SalesByDate[] | SalesByYear[]): data is SalesByDate[] {
  return data.length > 0 && 'date' in data[0];
}

export function LineChart({
  data,
  title,
  width = 400,
  height = 300,
  xAxisLabel = '',
  yAxisLabel = '',
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 40, right: 30, bottom: xAxisLabel ? 60 : 50, left: yAxisLabel ? 70 : 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const checkIsDateData = isDateData(data);

    if (checkIsDateData) {
      // Handle Date-based line chart
      const dateData = data as SalesByDate[];
      const dateExtent = d3.extent(dateData, (d) => d.date);
      const xScale = d3
        .scaleTime()
        .domain([dateExtent[0] || new Date(), dateExtent[1] || new Date()])
        .range([0, innerWidth]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(dateData, (d) => d.sales) || 0])
        .nice()
        .range([innerHeight, 0]);

      // Create line generator
      const line = d3
        .line<SalesByDate>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.sales))
        .curve(d3.curveMonotoneX);

      // Add X axis
      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%Y-%m') as any)
        .tickSize(-innerHeight)
        .tickPadding(10);

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis as any)
        .selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#666');

      // Add Y axis
      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10))
        .selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#666');

      // Remove axis lines
      g.selectAll('.x-axis path, .y-axis path').style('stroke', '#ccc').style('stroke-width', '1');
      g.selectAll('.x-axis .tick line, .y-axis .tick line').style('stroke', '#eee');

      // Add axis labels
      if (xAxisLabel) {
        g.append('text')
          .attr('class', 'x-label')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight + 45)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', '#333')
          .style('font-weight', '500')
          .text(xAxisLabel);
      }

      if (yAxisLabel) {
        g.append('text')
          .attr('class', 'y-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -innerHeight / 2)
          .attr('y', -55)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', '#333')
          .style('font-weight', '500')
          .text(yAxisLabel);
      }

      // Add the line path
      g.append('path')
        .datum(dateData)
        .attr('fill', 'none')
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add data points (circles)
      g.selectAll('.data-point')
        .data(dateData)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', (d) => xScale(d.date))
        .attr('cy', (d) => yScale(d.sales))
        .attr('r', 4)
        .attr('fill', '#1f77b4')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseover', function (_event, d) {
          d3.select(this).attr('r', 6).attr('fill', '#0d5a8f');
          const content = `Date: ${d3.timeFormat('%Y-%m')(d.date)}<br/>Sales: $${d.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          setTooltip({ x: _event.pageX, y: _event.pageY, content });
        })
        .on('mouseout', function () {
          d3.select(this).attr('r', 4).attr('fill', '#1f77b4');
          setTooltip(null);
        });
    } else {
      // Handle Year-based line chart
      const yearData = data as SalesByYear[];
      const yearExtent = d3.extent(yearData, (d) => d.year);
      const xScale = d3
        .scaleLinear()
        .domain([yearExtent[0] || 0, yearExtent[1] || 0])
        .range([0, innerWidth]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(yearData, (d) => d.sales) || 0])
        .nice()
        .range([innerHeight, 0]);

      // Create line generator
      const line = d3
        .line<SalesByYear>()
        .x((d) => xScale(d.year))
        .y((d) => yScale(d.sales))
        .curve(d3.curveMonotoneX);

      // Add X axis
      const xAxis = d3.axisBottom(xScale)
        .tickFormat((d: any) => d.toString())
        .tickSize(-innerHeight)
        .tickPadding(10);

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis as any)
        .selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#666');

      // Add Y axis
      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10))
        .selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#666');

      // Remove axis lines
      g.selectAll('.x-axis path, .y-axis path').style('stroke', '#ccc').style('stroke-width', '1');
      g.selectAll('.x-axis .tick line, .y-axis .tick line').style('stroke', '#eee');

      // Add axis labels
      if (xAxisLabel) {
        g.append('text')
          .attr('class', 'x-label')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight + 45)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', '#333')
          .style('font-weight', '500')
          .text(xAxisLabel);
      }

      if (yAxisLabel) {
        g.append('text')
          .attr('class', 'y-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -innerHeight / 2)
          .attr('y', -55)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', '#333')
          .style('font-weight', '500')
          .text(yAxisLabel);
      }

      // Add the line path
      g.append('path')
        .datum(yearData)
        .attr('fill', 'none')
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add data points (circles)
      g.selectAll('.data-point')
        .data(yearData)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', (d) => xScale(d.year))
        .attr('cy', (d) => yScale(d.sales))
        .attr('r', 4)
        .attr('fill', '#1f77b4')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseover', function (_event, d) {
          d3.select(this).attr('r', 6).attr('fill', '#0d5a8f');
          const content = `Year: ${d.year}<br/>Sales: $${d.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          setTooltip({ x: _event.pageX, y: _event.pageY, content });
        })
        .on('mouseout', function () {
          d3.select(this).attr('r', 4).attr('fill', '#1f77b4');
          setTooltip(null);
        });
    }

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .text(title);
  }, [data, width, height, title, xAxisLabel, yAxisLabel]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}
