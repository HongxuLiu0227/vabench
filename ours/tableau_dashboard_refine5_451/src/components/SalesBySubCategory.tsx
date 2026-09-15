import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ParsedRecord } from '../types';
import { aggregateBySubCategory, formatCurrency } from '../utils/dataTransformations';

interface SalesBySubCategoryProps {
  data: ParsedRecord[];
  width: number;
  height: number;
}

export const SalesBySubCategory: React.FC<SalesBySubCategoryProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const aggregatedData = aggregateBySubCategory(data);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Calculate margins based on data
    const maxLabelLength = d3.max(aggregatedData, d => d["Sub-Category"].length) || 0;
    const leftMargin = Math.max(100, maxLabelLength * 7);
    const rightMargin = 80;
    const topMargin = 20;
    const bottomMargin = 40;

    const chartWidth = width - leftMargin - rightMargin;
    const chartHeight = height - topMargin - bottomMargin;

    const svg = d3.select(svgRef.current);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.Sales) || 0])
      .range([0, chartWidth]);

    const yScale = d3.scaleBand()
      .domain(aggregatedData.map(d => d["Sub-Category"]))
      .range([0, chartHeight])
      .padding(0.2);

    // Create main group with margins
    const g = svg.append('g')
      .attr('transform', `translate(${leftMargin}, ${topMargin})`);

    // Create x-axis (bottom)
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => formatCurrency(d as number));

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Create y-axis (left)
    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    g.append('g')
      .call(yAxis)
      .attr('color', '#333')
      .attr('font-size', '12px')
      .selectAll('.tick text')
      .style('text-anchor', 'end')
      .each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/);
        if (words.length > 1) {
          // For long labels, we'll let them render but ensure no clipping
        }
      });

    // Create bars
    const bars = g.selectAll('.bar')
      .data(aggregatedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d["Sub-Category"]) || 0)
      .attr('width', d => xScale(d.Sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', '#4e79a7')
      .attr('opacity', 0.9);

    // Add hover effects
    bars
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('fill', '#3a6496');
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d["Sub-Category"]}: ${formatCurrency(d.Sales)}`
        });
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.9)
          .attr('fill', '#4e79a7');
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
