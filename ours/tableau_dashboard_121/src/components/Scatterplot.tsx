import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AggregatedProductMetrics } from '../types';

interface ScatterplotProps {
  data: AggregatedProductMetrics[];
  width: number;
  height: number;
}

export const Scatterplot: React.FC<ScatterplotProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Sales)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    // Y scale (Profit)
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, d => d.profit) || 0, d3.max(data, d => d.profit) || 0])
      .range([innerHeight, 0])
      .nice();

    // Size scale (Quantity)
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, d => d.quantity) || 0])
      .range([3, 20]);

    // Draw points
    g.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.sales))
      .attr('cy', d => yScale(d.profit))
      .attr('r', d => sizeScale(d.quantity))
      .attr('fill', '#75a1c7')
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#4a7c9e')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .append('title')
      .text(d => {
        const salesStr = d3.format(',.0f')(d.sales);
        const profitStr = d3.format(',.0f')(d.profit);
        const quantityStr = d3.format(',.0f')(d.quantity);
        return `${d.productName}\nSales: $${salesStr}\nProfit: $${profitStr}\nQuantity: ${quantityStr}`;
      });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat((d: any) => {
            const value = Number(d);
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          })
      )
      .attr('font-size', '11px');

    // Y axis
    g.append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((d: any) => {
            const value = Number(d);
            if (value <= -1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value <= -1000) return (value / 1000).toFixed(0) + 'K';
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          })
      )
      .attr('font-size', '11px');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      )
      .attr('opacity', 0.1)
      .attr('transform', `translate(0,${innerHeight})`);

    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .attr('opacity', 0.1);

    // Move grid to back
    svg.selectAll('.grid').lower();
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />;
};
