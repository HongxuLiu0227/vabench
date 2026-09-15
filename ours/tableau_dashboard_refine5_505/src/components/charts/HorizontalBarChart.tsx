import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedData } from '../../lib/dataTransform';

interface HorizontalBarChartProps {
  data: AggregatedData<string>[];
  width: number;
  height: number;
  title: string;
  xLabel?: string;
  yLabel?: string;
  maxBars?: number;
}

export function HorizontalBarChart({ data, width, height, title, xLabel, yLabel, maxBars = 20 }: HorizontalBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height]);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 150 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const displayData = data.slice(0, maxBars);

    const xValue = (d: AggregatedData<string>) => d.Sales;
    const yValue = (d: AggregatedData<string>) => d.key;

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(displayData, xValue) || 0])
      .nice()
      .range([0, chartWidth]);

    const yScale = d3
      .scaleBand()
      .domain(displayData.map(yValue))
      .range([0, chartHeight])
      .padding(0.2);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => {
        const value = d as number;
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return value.toString();
      }))
      .style('font-size', '11px');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px')
      .style('text-anchor', 'end');

    g.selectAll('.bar')
      .data(displayData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => yScale(yValue(d))!)
      .attr('width', (d) => xScale(xValue(d))!)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#1f77b4')
      .attr('fill-opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 1)
          .attr('fill', '#ff7f0e');

        const tooltip = svg
          .append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(xValue(d))! + margin.left + 10},${yScale(yValue(d))! + margin.top + yScale.bandwidth() / 2})`);

        tooltip
          .append('rect')
          .attr('x', 0)
          .attr('y', -25)
          .attr('width', 120)
          .attr('height', 50)
          .attr('fill', 'white')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', -5)
          .text(d.key)
          .style('font-size', '12px')
          .style('font-weight', 'bold');

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 15)
          .text(`Sales: $${(d.Sales / 1000).toFixed(1)}K`)
          .style('font-size', '11px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.8)
          .attr('fill', '#1f77b4');

        svg.selectAll('.tooltip').remove();
      });

    if (xLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 35)
        .text(xLabel)
        .style('font-size', '14px')
        .style('font-weight', 'bold');
    }

    if (yLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -130)
        .text(yLabel)
        .style('font-size', '14px')
        .style('font-weight', 'bold');
    }

  }, [data, dimensions, xLabel, yLabel, maxBars]);

  return (
    <div style={{ width: dimensions.width, height: dimensions.height }}>
      <h3 style={{ textAlign: 'center', marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>{title}</h3>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
    </div>
  );
}
