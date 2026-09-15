import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { BarChartDataPoint } from '../services/types';
import { formatCurrency, calculateDynamicMargins } from '../utils/formatters';

interface HorizontalBarChartProps {
  data: BarChartDataPoint[];
  width: number;
  height: number;
  title: string;
  colorByCategory?: boolean;
}

/**
 * Generic horizontal bar chart component
 * Used for both P9517__sales_by_sub_category and P121__bar worksheets
 */
export const HorizontalBarChart = ({
  data,
  width,
  height,
  title,
  colorByCategory = false
}: HorizontalBarChartProps) => {
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
    d3.select(svgRef.current).selectAll('*').remove();

    // Calculate dynamic left margin based on label lengths
    const maxLabelLength = Math.max(
      ...data.map(d => (d.subCategory ? `${d.category} - ${d.subCategory}` : d.category).length)
    );
    const leftMargin = calculateDynamicMargins(maxLabelLength, 'y', 60);

    const margin = { top: 40, right: 30, bottom: 30, left: leftMargin };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create group for chart area
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(data.map(d => (d.subCategory ? `${d.category} - ${d.subCategory}` : d.category)))
      .range([0, innerHeight])
      .padding(0.15);

    // Color scale (blue for Tableau-faithful look)
    const colorScale = d3.scaleOrdinal(d3.schemeBlues[9]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((d: d3.NumberValue) => `$${(Number(d) / 1000).toFixed(0)}k`))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 25})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .text('Sales');

    // Add Y axis
    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif');

    // Truncate long labels with ellipsis
    yAxis.each(function(d: unknown) {
      const maxLength = 35;
      const text = String(d);
      if (text.length > maxLength) {
        d3.select(this as SVGTextElement)
          .text(text.substring(0, maxLength) + '...')
          .append('title')
          .text(text); // Add tooltip with full text
      }
    });

    // Add bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.subCategory ? `${d.category} - ${d.subCategory}` : d.category) || 0)
      .attr('width', d => xScale(d.sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => (colorByCategory ? colorScale(d.category) : '#4e79a7'))
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const label = d.subCategory ? `${d.category} - ${d.subCategory}` : d.category;
        const tooltipContent = `
          <strong>${label}</strong><br/>
          Sales: ${formatCurrency(d.sales)}
        `;
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: tooltipContent
        });
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 10,
          y: event.pageY - 10
        }));
      })
      .on('mouseout', () => {
        setTooltip(prev => ({ ...prev, visible: false }));
      });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-family', 'sans-serif')
      .style('font-weight', 'bold')
      .text(title);
  }, [data, width, height, title, colorByCategory]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            fontSize: '12px',
            fontFamily: 'sans-serif',
            zIndex: 1000
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};
