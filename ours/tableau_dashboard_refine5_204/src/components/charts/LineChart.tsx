/**
 * LineChart - D3-based line chart
 * Used for P1225__total_sales_each_year
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LineChartProps {
  data: Array<{ [key: string]: string | number }>;
  xField: string;
  yField: string;
  title: string;
  width?: number;
  height?: number;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xField,
  yField,
  title,
  width = 400,
  height = 300,
  color = '#4e79a7',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d[xField] as string))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yField] as number) || 0])
      .range([innerHeight, 0])
      .nice();

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format('~s')))
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Add grid lines
    g.selectAll('.grid-line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1);

    // Create line generator
    const line = d3
      .line<{ [key: string]: string | number }>()
      .x((d) => (x(d[xField] as string) || 0) + x.bandwidth() / 2)
      .y((d) => y(d[yField] as number))
      .curve(d3.curveMonotoneX);

    // Add line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => (x(d[xField] as string) || 0) + x.bandwidth() / 2)
      .attr('cy', (d) => y(d[yField] as number))
      .attr('r', 4)
      .attr('fill', color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function() {
        d3.select(this).attr('r', 6);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4);
      });

    // Add value labels on dots
    g.selectAll('.dot-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'dot-label')
      .attr('x', (d) => (x(d[xField] as string) || 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d[yField] as number) - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .text((d) => d3.format(',.0f')(d[yField] as number));

  }, [data, xField, yField, width, height, color]);

  return (
    <div style={{ width, height }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'left' }}>
        {title}
      </h3>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
