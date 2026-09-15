import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { MonthlyAverage, DateRange } from '../types/stockData';

interface LineChartProps {
  data: MonthlyAverage[];
  dataKey: 'averageOpen' | 'averageClose';
  title?: string;
  color?: string;
  width?: number;
  height?: number;
  onFilter?: (range: DateRange) => void;
  axisTitle?: string;
}

export function LineChart({
  data,
  dataKey,
  title,
  color = '#b4b4b4',
  width = 800,
  height = 400,
  onFilter,
  axisTitle = 'Date',
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[dataKey])! * 0.95,
        d3.max(data, (d) => d[dataKey])! * 1.05,
      ])
      .range([innerHeight, 0]);

    // Create line generator
    const line = d3
      .line<MonthlyAverage>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d[dataKey]))
      .curve(d3.curveMonotoneX);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('color', '#b4b4b4')
      .style('font-family', 'Calibri, sans-serif')
      .style('font-size', '11px')
      .call(d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0))
      .call((g) => g.select('.domain').attr('stroke', '#b4b4b4'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#b4b4b4'));

    // Add X axis title
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .style('fill', '#b4b4b4')
      .style('font-family', 'Calibri, sans-serif')
      .style('font-size', '11px')
      .text(axisTitle);

    // Add Y axis
    g.append('g')
      .attr('color', '#b4b4b4')
      .style('font-family', 'Calibri, sans-serif')
      .style('font-size', '11px')
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', '#b4b4b4'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#b4b4b4'));

    // Create clip path for the chart area
    g.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // Add the line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('clip-path', 'url(#clip)');

    // Add brush for interaction
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on('start brush end', (event) => {
        const selection = event.selection;
        if (selection) {
          const [x0, x1] = selection as [number, number];
          const startDate = xScale.invert(x0);
          const endDate = xScale.invert(x1);
          const range: DateRange = {
            start: new Date(Math.min(startDate.getTime(), endDate.getTime())),
            end: new Date(Math.max(startDate.getTime(), endDate.getTime())),
          };
          if (onFilter) {
            onFilter(range);
          }
        } else if (event.type === 'end') {
          // Auto-clear on brush end (if selection is cleared)
          if (onFilter) {
            onFilter({});
          }
        }
      });

    g.append('g')
      .attr('class', 'brush')
      .call(brush)
      .selectAll('.selection')
      .attr('fill', color)
      .attr('fill-opacity', 0.2);

    // Add dots for hover effect
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d[dataKey]))
      .attr('r', 3)
      .attr('fill', color)
      .attr('opacity', 0)
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0);
      });

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#000000')
      .style('border', '1px solid #b4b4b4')
      .style('color', '#b4b4b4')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-family', 'Calibri, sans-serif')
      .style('font-size', '11px')
      .style('pointer-events', 'none');

    g.selectAll('.dot')
      .on('mouseover', function (event, d) {
        const dataPoint = d as MonthlyAverage;
        d3.select(this).attr('opacity', 1);
        tooltip
          .style('visibility', 'visible')
          .html(
            `<strong>${dataPoint.yearMonth}</strong><br/>${dataKey === 'averageOpen' ? 'Open' : 'Close'}: $${dataPoint[dataKey].toFixed(2)}`
          )
          .style('top', `${event.pageY - 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('top', `${event.pageY - 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0);
        tooltip.style('visibility', 'hidden');
      });

    return () => {
      tooltip.remove();
    };
  }, [data, dataKey, color, width, height, onFilter, axisTitle]);

  return (
    <div style={{ backgroundColor: '#000000', padding: '10px' }}>
      {title && (
        <div
          style={{
            color: '#b4b4b4',
            fontFamily: 'Calibri, sans-serif',
            fontSize: '11px',
            textAlign: 'center',
            marginBottom: '10px',
          }}
        >
          {title}
        </div>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  );
}
