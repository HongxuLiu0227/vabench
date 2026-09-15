import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ParsedRecord } from '../types';
import { aggregateByYear, formatCurrency } from '../utils/dataTransformations';

interface TotalSalesEachYearProps {
  data: ParsedRecord[];
  width: number;
  height: number;
}

export const TotalSalesEachYear: React.FC<TotalSalesEachYearProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const aggregatedData = aggregateByYear(data);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(aggregatedData.map(d => d.Year.toString()))
      .range([0, chartWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.Sales) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Color scale based on Sales value
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(aggregatedData, d => d.Sales) || 0]);

    // Create main group with margins
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d);

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => formatCurrency(d as number));

    g.append('g')
      .call(yAxis)
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Add grid lines
    g.selectAll('.grid-line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('y1', d => yScale(d))
      .attr('x2', chartWidth)
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Create bars
    const bars = g.selectAll('.bar')
      .data(aggregatedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.Year.toString()) || 0)
      .attr('y', d => yScale(d.Sales))
      .attr('width', xScale.bandwidth())
      .attr('height', d => chartHeight - yScale(d.Sales))
      .attr('fill', d => colorScale(d.Sales))
      .attr('opacity', 0.9);

    // Add data labels on top of bars
    g.selectAll('.label')
      .data(aggregatedData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.Year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.Sales) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(d => formatCurrency(d.Sales));

    // Add hover effects
    bars
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1);
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `Year ${d.Year}: ${formatCurrency(d.Sales)}`
        });
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.9);
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
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
};
