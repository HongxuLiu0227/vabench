import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedData } from '../../lib/dataTransform';

interface ScatterPlotProps {
  data: AggregatedData<string>[];
  width: number;
  height: number;
  title: string;
  xLabel?: string;
  yLabel?: string;
}

export function ScatterPlot({ data, width, height, title, xLabel, yLabel }: ScatterPlotProps) {
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

    const xValue = (d: AggregatedData<string>) => d.Sales;
    const yValue = (d: AggregatedData<string>) => d.Profit;
    const sizeValue = (d: AggregatedData<string>) => d.Quantity;

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, xValue) || 0])
      .nice()
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, yValue) || 0, d3.max(data, yValue) || 0])
      .nice()
      .range([chartHeight, 0]);

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, sizeValue) || 0])
      .range([4, 20]);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => {
        const value = d as number;
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return value.toString();
      }))
      .style('font-size', '12px');

    g.append('g').call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => {
      const value = d as number;
      if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
      if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
      return value.toString();
    })).style('font-size', '12px');

    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(xValue(d))!)
      .attr('cy', (d) => yScale(yValue(d))!)
      .attr('r', (d) => sizeScale(sizeValue(d))!)
      .attr('fill', '#1f77b4')
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 1)
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
          .attr('transform', `translate(${xScale(xValue(d))! + margin.left + 15},${yScale(yValue(d)) + margin.top - 15})`);

        const textWidth = Math.max(100, d.key.length * 6);

        tooltip
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', textWidth)
          .attr('height', 70)
          .attr('fill', 'white')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 18)
          .text(d.key.substring(0, 25) + (d.key.length > 25 ? '...' : ''))
          .style('font-size', '11px')
          .style('font-weight', 'bold');

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 35)
          .text(`Sales: $${(d.Sales / 1000).toFixed(1)}K`)
          .style('font-size', '10px');

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 50)
          .text(`Profit: $${(d.Profit / 1000).toFixed(1)}K`)
          .style('font-size', '10px');

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 65)
          .text(`Qty: ${d.Quantity}`)
          .style('font-size', '10px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.6)
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
