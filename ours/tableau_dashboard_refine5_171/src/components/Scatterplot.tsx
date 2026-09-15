/**
 * Scatterplot Worksheet Component
 * P121__scatterplot
 *
 * - X-axis: Sales
 * - Y-axis: Profit
 * - Color: Sales (continuous color scale)
 * - Size: Quantity
 * - Detail: Product Name
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterDataPoint } from '../types/data';

interface ScatterplotProps {
  data: ScatterDataPoint[];
  width: number;
  height: number;
  title: string;
}

export const Scatterplot: React.FC<ScatterplotProps> = ({ data, width, height, title }) => {
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
    const margin = { top: 40, right: 60, bottom: 60, left: 70 };
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

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.Profit) || 0, d3.max(data, d => d.Profit) || 0])
      .range([innerHeight, 0])
      .nice();

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.Sales) || 0]);

    const sizeScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.Quantity) || 0, d3.max(data, d => d.Quantity) || 0])
      .range([4, 20]);

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
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '11px');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Profit');

    // Add dots with interactivity
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.Sales))
      .attr('cy', d => yScale(d.Profit))
      .attr('r', d => sizeScale(d.Quantity))
      .attr('fill', d => colorScale(d.Sales))
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const tooltipContent = `
          <strong>${d['Product Name']}</strong><br/>
          Sales: $${d.Sales.toFixed(2)}<br/>
          Profit: $${d.Profit.toFixed(2)}<br/>
          Quantity: ${d.Quantity}
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
          .attr('fill-opacity', 1);
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
          .attr('fill-opacity', 0.6);
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
