import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedData } from '../../lib/dataTransform';

interface LineChartProps {
  data: AggregatedData<number | string>[];
  width: number;
  height: number;
  title: string;
  xLabel?: string;
  yLabel?: string;
}

export function LineChart({ data, width, height, title, xLabel, yLabel }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height]);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xValue = (d: AggregatedData<number | string>) => d.key;
    const yValue = (d: AggregatedData<number | string>) => d.Sales;

    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => String(xValue(d))))
      .range([0, chartWidth])
      .padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, yValue) || 0])
      .nice()
      .range([chartHeight, 0]);

    const line = d3
      .line<AggregatedData<number | string>>()
      .x((d) => xScale(String(xValue(d)))!)
      .y((d) => yScale(yValue(d)))
      .curve(d3.curveMonotoneX);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '12px');

    g.append('g').call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => {
      const value = d as number;
      if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
      if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
      return value.toString();
    })).style('font-size', '12px');

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(String(xValue(d)))!)
      .attr('cy', (d) => yScale(yValue(d)))
      .attr('r', 4)
      .attr('fill', '#1f77b4')
      .style('cursor', 'pointer')
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('fill', '#ff7f0e');

        const tooltip = svg
          .append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(String(xValue(d)))! + margin.left + 10},${yScale(yValue(d)) + margin.top - 10})`);

        tooltip
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 120)
          .attr('height', 50)
          .attr('fill', 'white')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 20)
          .text(`${xLabel || 'Year'}: ${d.key}`)
          .style('font-size', '12px')
          .style('font-weight', 'bold');

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 40)
          .text(`Sales: $${(d.Sales / 1000).toFixed(1)}K`)
          .style('font-size', '11px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4)
          .attr('fill', '#1f77b4');

        svg.selectAll('.tooltip').remove();
      });

    if (xLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 55)
        .text(xLabel)
        .style('font-size', '14px')
        .style('font-weight', 'bold');
    }

    if (yLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -60)
        .text(yLabel)
        .style('font-size', '14px')
        .style('font-weight', 'bold');
    }

  }, [data, dimensions, xLabel, yLabel]);

  return (
    <div style={{ width: dimensions.width, height: dimensions.height }}>
      <h3 style={{ textAlign: 'center', marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>{title}</h3>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
    </div>
  );
}
