import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ParsedRecord } from '../types';
import { aggregateByProduct, formatCurrency, formatNumber } from '../utils/dataTransformations';

interface ScatterplotProps {
  data: ParsedRecord[];
  width: number;
  height: number;
}

export const Scatterplot: React.FC<ScatterplotProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const aggregatedData = aggregateByProduct(data);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.Sales) || 0])
      .nice()
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(aggregatedData, d => d.Profit) || 0, d3.max(aggregatedData, d => d.Profit) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Color scale based on Sales
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(aggregatedData, d => d.Sales) || 0]);

    // Size scale based on Quantity (using sqrt for area scaling)
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(aggregatedData, d => d.Quantity) || 0])
      .range([3, 15]);

    // Create main group with margins
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => formatCurrency(d as number));

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => formatCurrency(d as number));

    g.append('g')
      .call(yAxis)
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Add axis lines
    g.append('line')
      .attr('x1', 0)
      .attr('y1', chartHeight)
      .attr('x2', chartWidth)
      .attr('y2', chartHeight)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);

    g.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);

    // Create circles
    const circles = g.selectAll('.circle')
      .data(aggregatedData)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', d => xScale(d.Sales))
      .attr('cy', d => yScale(d.Profit))
      .attr('r', d => sizeScale(d.Quantity))
      .attr('fill', d => colorScale(d.Sales))
      .attr('stroke', '#000000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7);

    // Add hover effects
    circles
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 1.5);
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `<strong>${d["Product Name"]}</strong><br/>Sales: ${formatCurrency(d.Sales)}<br/>Profit: ${formatCurrency(d.Profit)}<br/>Quantity: ${formatNumber(d.Quantity)}`
        });
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.7)
          .attr('stroke-width', 0.5);
        setTooltip(null);
      });

  }, [data, width, height]);

  return (
    <>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontFamily: 'sans-serif'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};
