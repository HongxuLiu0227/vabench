import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface LineChartProps {
  data: Array<{ month: Date; sales: number } | { year: number; sales: number }>;
  title: string;
  width?: number;
  height?: number;
  timeAxis?: boolean;
}

export function LineChart({
  data,
  title,
  width = 400,
  height = 300,
  timeAxis = true,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Margins
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .nice()
      .range([innerHeight, 0]);

    if (timeAxis) {
      // Time-based x-axis (for monthly data)
      const timeData = data as Array<{ month: Date; sales: number }>;
      const xScale = d3
        .scaleTime()
        .domain(d3.extent(timeData.map((d) => d.month)) as [Date, Date])
        .range([0, innerWidth]);

      // Create line generator
      const line = d3
        .line<{ month: Date; sales: number }>()
        .x((d) => xScale(d.month))
        .y((d) => yScale(d.sales))
        .curve(d3.curveMonotoneX);

      // Add X axis
      svg
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat((d) => d3.timeFormat('%b %Y')(d as Date)))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '10px');

      // Add Y axis
      svg
        .append('g')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('~s')))
        .selectAll('text')
        .style('font-size', '11px');

      // Add grid lines
      svg
        .append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(
          d3
            .axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        );

      // Add the line
      const path = svg
        .append('path')
        .datum(timeData)
        .attr('fill', 'none')
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add animation
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 1000;
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

      // Add dots
      svg
        .selectAll('.dot')
        .data(timeData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => xScale(d.month))
        .attr('cy', (d) => yScale(d.sales))
        .attr('r', 4)
        .attr('fill', '#1f77b4')
        .style('opacity', 0)
        .on('mouseover', (event, d) => {
          const xLabel = d3.timeFormat('%b %Y')(d.month);

          setTooltip({
            visible: true,
            x: event.pageX,
            y: event.pageY,
            content: `${xLabel}<br/>Sales: $${d.sales.toFixed(2)}`,
          });

          d3.select(event.currentTarget)
            .attr('r', 6)
            .attr('fill', '#ff7f0e');
        })
        .on('mouseout', (event) => {
          setTooltip({ visible: false, x: 0, y: 0, content: '' });

          d3.select(event.currentTarget)
            .attr('r', 4)
            .attr('fill', '#1f77b4');
        })
        .transition()
        .delay((_d, i) => i * 20)
        .duration(500)
        .style('opacity', 1);
    } else {
      // Linear x-axis (for yearly data)
      const linearData = data as Array<{ year: number; sales: number }>;
      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(linearData.map((d) => d.year)) as [number, number])
        .range([0, innerWidth]);

      // Create line generator
      const line = d3
        .line<{ year: number; sales: number }>()
        .x((d) => xScale(d.year))
        .y((d) => yScale(d.sales))
        .curve(d3.curveMonotoneX);

      // Add X axis
      svg
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat((d) => d.toString()))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '10px');

      // Add Y axis
      svg
        .append('g')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('~s')))
        .selectAll('text')
        .style('font-size', '11px');

      // Add grid lines
      svg
        .append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(
          d3
            .axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        );

      // Add the line
      const path = svg
        .append('path')
        .datum(linearData)
        .attr('fill', 'none')
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add animation
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 1000;
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

      // Add dots
      svg
        .selectAll('.dot')
        .data(linearData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => xScale(d.year))
        .attr('cy', (d) => yScale(d.sales))
        .attr('r', 4)
        .attr('fill', '#1f77b4')
        .style('opacity', 0)
        .on('mouseover', (event, d) => {
          setTooltip({
            visible: true,
            x: event.pageX,
            y: event.pageY,
            content: `${d.year}<br/>Sales: $${d.sales.toFixed(2)}`,
          });

          d3.select(event.currentTarget)
            .attr('r', 6)
            .attr('fill', '#ff7f0e');
        })
        .on('mouseout', (event) => {
          setTooltip({ visible: false, x: 0, y: 0, content: '' });

          d3.select(event.currentTarget)
            .attr('r', 4)
            .attr('fill', '#1f77b4');
        })
        .transition()
        .delay((_d, i) => i * 20)
        .duration(500)
        .style('opacity', 1);
    }
  }, [data, width, height, timeAxis]);

  return (
    <div className="line-chart-container">
      <h3 className="chart-title">{title}</h3>
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}
