import { useEffect, useRef, useState } from 'react';
import { scaleTime, scaleLinear } from 'd3';
import { axisBottom, axisLeft } from 'd3';
import { line, curveMonotoneX } from 'd3';
import { select } from 'd3';
import type { TimeSeriesDataPoint } from '../types';

interface LineChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
  width?: number;
  height?: number;
}

export function LineChart({ data, title, width = 400, height = 300 }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; date: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    select(svgRef.current).selectAll('*').remove();

    const svg = select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = scaleTime()
      .domain([data[0].date, data[data.length - 1].date])
      .range([0, chartWidth]);

    const maxYValue = Math.max(...data.map(d => d.value));
    const yScale = scaleLinear()
      .domain([0, maxYValue * 1.1])
      .range([chartHeight, 0]);

    // Create line generator
    const lineGenerator = line<TimeSeriesDataPoint>()
      .x((d: TimeSeriesDataPoint) => xScale(d.date))
      .y((d: TimeSeriesDataPoint) => yScale(d.value))
      .curve(curveMonotoneX);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(axisBottom(xScale).ticks(width / 80).tickFormat((d) => {
        const date = new Date(d as Date);
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      }))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'system-ui, -apple-system, sans-serif');

    // Add Y axis
    svg.append('g')
      .call(axisLeft(yScale).ticks(5).tickFormat((d) => `$${(d as number).toLocaleString()}`))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'system-ui, -apple-system, sans-serif');

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', (d) => yScale(d as number))
      .attr('y2', (d) => yScale(d as number))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Add the line path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Add invisible rectangles for hover detection
    svg.selectAll('.hover-rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'hover-rect')
      .attr('x', (d: TimeSeriesDataPoint, i: number) => {
        if (i === data.length - 1) return xScale(d.date) - chartWidth / data.length / 2;
        return xScale(d.date) - chartWidth / data.length / 2;
      })
      .attr('y', 0)
      .attr('width', chartWidth / data.length)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d: TimeSeriesDataPoint) => {
        const dateStr = d.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          value: d.value,
          date: dateStr,
        });
      })
      .on('mouseleave', () => {
        setTooltip(null);
      });

    // Add circles for data points
    svg.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d: TimeSeriesDataPoint) => xScale(d.date))
      .attr('cy', (d: TimeSeriesDataPoint) => yScale(d.value))
      .attr('r', 4)
      .attr('fill', '#1f77b4')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

  }, [data, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {title}
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tooltip.date}</div>
          <div>Sales: ${tooltip.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      )}
    </div>
  );
}
