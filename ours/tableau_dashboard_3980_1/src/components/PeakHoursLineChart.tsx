import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { max } from 'd3-array';
import { format } from 'd3-format';
import type { PeakHoursLineChartProps } from '../types';
import './PeakHoursLineChart.css';

const PeakHoursLineChart: React.FC<PeakHoursLineChartProps> = ({
  data,
  title,
  type,
  highlightedHour,
  onHourHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

  // Margins for axis labels and titles
  const margin = { top: 20, right: 30, bottom: 60, left: 80 };
  const width = dimensions.width - margin.left - margin.right;
  const height = dimensions.height - margin.top - margin.bottom;

  // Handle responsive resize
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(300, container.clientWidth * 0.5),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (band scale for hours 0-23) - use strings for domain
    const xScale = scaleBand()
      .domain(data.map((d) => d.hour.toString()))
      .range([0, width])
      .padding(0.1);

    // Y scale (linear for count)
    const yScale = scaleLinear()
      .domain([0, max(data, (d) => d.count) || 0])
      .nice()
      .range([height, 0]);

    // Line generator
    const lineGenerator = line<{ hour: number; count: number }>()
      .x((d) => (xScale(d.hour.toString()) || 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.count))
      .curve(curveMonotoneX);

    // Create area under the line for better visual
    const areaGenerator = line<{ hour: number; count: number }>()
      .x((d) => (xScale(d.hour.toString()) || 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.count))
      .curve(curveMonotoneX);

    // Draw grid lines (horizontal)
    g.selectAll('.grid-line')
      .data(yScale.ticks())
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .style('stroke', '#e0e0e0')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4,4');

    // Draw area under line
    g.append('path')
      .datum(data)
      .attr('fill', 'rgba(255, 170, 0, 0.1)')
      .attr(
        'd',
        `
        M 0,${height}
        ${areaGenerator(data)}
        L ${width},${height}
        Z
      `
      );

    // Draw the line
    g.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#ffaa00')
      .attr('stroke-width', 3)
      .attr('d', lineGenerator(data));

    // Draw data points (circles)
    const dots = g
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => (xScale(d.hour.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.count))
      .attr('r', 5)
      .attr('fill', '#ffaa00')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'crosshair')
      .on('mouseover', function (_event, d) {
        onHourHover(d.hour);
        d3.select(this).attr('r', 8).attr('stroke-width', 3);
      })
      .on('mouseout', function () {
        onHourHover(null);
        d3.select(this).attr('r', 5).attr('stroke-width', 2);
      });

    // Highlight the selected hour
    if (highlightedHour !== null) {
      dots
        .filter((d) => d.hour === highlightedHour)
        .attr('r', 10)
        .attr('stroke', '#333')
        .attr('stroke-width', 3)
        .raise();

      // Highlight line segment
      g.append('line')
        .attr('class', 'highlight-line')
        .attr(
          'x1',
          (xScale(highlightedHour.toString()) || 0) + xScale.bandwidth() / 2
        )
        .attr(
          'x2',
          (xScale(highlightedHour.toString()) || 0) + xScale.bandwidth() / 2
        )
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'rgba(0,0,0,0.1)')
        .attr('stroke-width', 20)
        .attr('stroke-dasharray', '5,5')
        .style('pointer-events', 'none');
    }

    // X Axis
    const xAxis = axisBottom(xScale)
      .tickFormat((d) => `${d}:00`)
      .tickSizeOuter(0);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif');

    // Y Axis
    const yAxis = axisLeft(yScale)
      .tickFormat(format(',.0f'))
      .tickSizeOuter(0);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif');

    // X Axis Label
    g.append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .text(`HOUR(${type === 'start' ? 'starttime' : 'stoptime'})`)
      .style('font-size', '14px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .style('fill', '#333');

    // Y Axis Label
    g.append('text')
      .attr('class', 'y-axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -60)
      .text('Number of Records')
      .style('font-size', '14px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .style('fill', '#333');

    // Chart title
    g.append('text')
      .attr('class', 'chart-title')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', -10)
      .text(title)
      .style('font-size', '16px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .style('fill', '#333');

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(255, 255, 255, 0.95)')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('pointer-events', 'none')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');

    dots.on('mouseover', function (event, d) {
      onHourHover(d.hour);
      tooltip
        .style('opacity', 0.95)
        .html(`
          <strong>Hour: ${d.hour}:00</strong><br/>
          Count: ${d.count.toLocaleString()}
        `)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');
      d3.select(this).attr('r', 8).attr('stroke-width', 3);
    });

    dots.on('mouseout', function () {
      onHourHover(null);
      tooltip.style('opacity', 0);
      d3.select(this).attr('r', 5).attr('stroke-width', 2);
    });

    return () => {
      tooltip.remove();
    };
  }, [data, dimensions, highlightedHour, onHourHover, type, title, width, height, margin.left, margin.top]);

  return (
    <div className="chart-container">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
};

export default PeakHoursLineChart;
