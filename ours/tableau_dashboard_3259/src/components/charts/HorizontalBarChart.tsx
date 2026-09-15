import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HorizontalBarChartProps {
  data: Array<{ category: string; value: number }>;
  width: number;
  height: number;
  xLabel?: string;
  yLabel?: string;
  onBarClick?: (category: string) => void;
  margin?: { top: number; right: number; bottom: number; left: number };
  color?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  width,
  height,
  xLabel,
  yLabel,
  onBarClick,
  margin = { top: 20, right: 30, bottom: 40, left: 150 },
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

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.2);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([0, innerWidth]);

    // Y axis
    g.append('g').call(d3.axisLeft(y));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    // X axis label
    if (xLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + margin.bottom - 5)
        .text(xLabel);
    }

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.category) || 0)
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', color)
      .style('cursor', onBarClick ? 'pointer' : 'default')
      .on('click', (_event, d) => {
        if (onBarClick) {
          onBarClick(d.category);
        }
      })
      .transition()
      .duration(750)
      .attr('width', (d) => x(d.value));

    // Value labels
    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('y', (d) => (y(d.category) || 0) + y.bandwidth() / 2)
      .attr('x', (d) => x(d.value) + 5)
      .attr('dy', '0.35em')
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
