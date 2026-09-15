/**
 * Horizontal Ranked Bar Worksheet Component
 * P9517__sales_by_sub_category
 *
 * - Y-axis: Sub-Category / Product Name
 * - X-axis: Sales
 * - Sorted descending by Sales
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesBySubCategory } from '../types/data';

interface HorizontalRankedBarProps {
  data: SalesBySubCategory[];
  width: number;
  height: number;
  title: string;
}

export const HorizontalRankedBar: React.FC<HorizontalRankedBarProps> = ({ data, width, height, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions with margins
    const margin = { top: 40, right: 30, bottom: 30, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleBand()
      .domain(data.map(d => `${d['Sub-Category']}: ${d['Product Name']}`))
      .range([0, innerHeight])
      .padding(0.1);

    // Color scale based on Sales
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.Sales) || 0]);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'Arial, sans-serif')
      .text(title);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '11px');

    // Add X axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 25)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Add Y axis with full labels
    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '10px');

    // Ensure text doesn't get clipped
    yAxis.selectAll('text')
      .style('text-anchor', 'end')
      .each(function() {
        const text = d3.select(this);
        const words = text.text().split(': ');
        if (words.length === 2) {
          text.text('');
          text.append('tspan')
            .text(words[0])
            .attr('font-weight', 'bold')
            .attr('fill', '#333');
          text.append('tspan')
            .text(': ' + words[1]);
        }
      });

    // Add bars with interactivity
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(`${d['Sub-Category']}: ${d['Product Name']}`) || 0)
      .attr('width', d => xScale(d.Sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.Sales))
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const tooltipContent = `
          <strong>${d['Product Name']}</strong><br/>
          Sub-Category: ${d['Sub-Category']}<br/>
          Sales: $${d.Sales.toFixed(2)}
        `;
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: tooltipContent
        });
        d3.select(event.currentTarget)
          .attr('stroke', '#000')
          .attr('stroke-width', 2)
          .attr('fill-opacity', 0.8);
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 10,
          y: event.pageY - 10
        }));
      })
      .on('mouseout', (event) => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
        d3.select(event.currentTarget)
          .attr('stroke', '#333')
          .attr('stroke-width', 0.5)
          .attr('fill-opacity', 1);
      });

  }, [data, width, height, title]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};
