import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VerticalBarChartProps {
  data: Array<{ category: string; value: number }>;
  width: number;
  height: number;
  xLabel?: string;
  yLabel?: string;
  onBarClick?: (category: string) => void;
  margin?: { top: number; right: number; bottom: number; left: number };
  color?: string;
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  width,
  height,
  xLabel,
  yLabel,
  onBarClick,
  margin = { top: 20, right: 20, bottom: 60, left: 60 },
  color = '#4e79a7',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([innerHeight, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');

    // Y axis
    g.append('g').call(d3.axisLeft(y));

    // X axis label
    if (xLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + margin.bottom - 5)
        .text(xLabel);
    }

    // Y axis label
    if (yLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -margin.left + 15)
        .text(yLabel);
    }

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.category) || 0)
      .attr('width', x.bandwidth())
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', color)
      .style('cursor', onBarClick ? 'pointer' : 'default')
      .on('click', (_event, d) => {
        if (onBarClick) {
          onBarClick(d.category);
        }
      })
      .transition()
      .duration(750)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => innerHeight - y(d.value));

    // Value labels on bars
    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => (x(d.category) || 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .text((d) => d.value.toString())
      .style('opacity', 0)
      .transition()
      .delay(750)
      .duration(500)
      .style('opacity', 1);
  }, [data, width, height, margin, color, xLabel, yLabel, onBarClick]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
};
