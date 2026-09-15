import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { SalesByTime } from '../types';

interface LineChartProps {
  data: SalesByTime[];
  title: string;
  width: number;
  height: number;
  timeFormat?: 'year' | 'month';
}

export const LineChart: React.FC<LineChartProps> = ({ data, title, width, height, timeFormat = 'month' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: SalesByTime } | null>(null);

  const margin = useMemo(() => ({ top: 40, right: 30, bottom: 60, left: 80 }), []);
  const innerWidth = useMemo(() => width - margin.left - margin.right, [width, margin]);
  const innerHeight = useMemo(() => height - margin.top - margin.bottom, [height, margin]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Create line generator
    const lineGenerator = d3.line<SalesByTime>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Add X axis
    const xAxis = d3.axisBottom(xScale);
    if (timeFormat === 'year') {
      xAxis.tickFormat(((date: Date | d3.NumberValue) => {
        return d3.timeFormat('%Y')(date as Date);
      }) as (domainValue: Date | d3.NumberValue, index: number) => string);
      xAxis.ticks(d3.timeYear.every(1));
    } else {
      xAxis.tickFormat(((date: Date | d3.NumberValue) => {
        return d3.timeFormat('%b %Y')(date as Date);
      }) as (domainValue: Date | d3.NumberValue, index: number) => string);
      xAxis.ticks(width > 500 ? d3.timeMonth.every(3) : d3.timeMonth.every(6));
    }

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '12px');

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickFormat((d) => `$${(d as number).toLocaleString()}`))
      .selectAll('text')
      .style('font-size', '12px');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .tickFormat(() => '')
          .tickSize(-innerWidth)
      )
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

    // Add the line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', '#1f77b4')
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        const [x, y] = d3.pointer(event, g.node() as SVGGElement);
        setTooltip({ x: x + margin.left, y: y + margin.top, data: d });
        d3.select(this).attr('r', 6).attr('fill', '#ff7f0e');
      })
      .on('mouseout', function() {
        setTooltip(null);
        d3.select(this).attr('r', 4).attr('fill', '#1f77b4');
      });

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);
  }, [data, width, height, timeFormat, innerWidth, innerHeight, margin, title]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg ref={svgRef} width={width} height={height}>
        {/* SVG content will be rendered by D3 */}
      </svg>
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <div>
            <strong>
              {timeFormat === 'year'
                ? tooltip.data.year
                : tooltip.data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
            </strong>
          </div>
          <div>Sales: ${tooltip.data.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      )}
    </div>
  );
};
