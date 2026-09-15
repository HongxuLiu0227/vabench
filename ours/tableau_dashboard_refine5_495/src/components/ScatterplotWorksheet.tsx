import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterplotDataPoint } from '../services/types';

interface ScatterplotWorksheetProps {
  data: ScatterplotDataPoint[];
  width: number;
  height: number;
  title?: string;
}

/**
 * P121__scatterplot - Scatterplot visualization
 * Tableau spec:
 * - Rows: Profit (sum)
 * - Cols: Sales (sum)
 * - Color: Sales (sum)
 * - Size: Quantity (sum)
 * - LOD: Product Name
 */
export const ScatterplotWorksheet = ({
  data,
  width,
  height,
  title = 'Scatterplot'
}: ScatterplotWorksheetProps) => {
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

    // Dimensions and margins
    const margin = { top: 40, right: 20, bottom: 60, left: 70 };
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
      .scaleLinear()
      .domain([0, d3.max(data, d => d.profit) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Size scale for Quantity
    const sizeScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.quantity) || 0])
      .range([4, 20]);

    // Color scale for Sales
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.sales) || 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 45})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .text('Sales');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .text('Profit');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-family', 'sans-serif')
      .style('font-weight', 'bold')
      .text(title);

    // Add circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.sales))
      .attr('cy', d => yScale(d.profit))
      .attr('r', d => sizeScale(d.quantity))
      .attr('fill', d => colorScale(d.sales))
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const tooltipContent = `
          <strong>${d.productName}</strong><br/>
          Sales: $${d.sales.toFixed(2)}<br/>
          Profit: $${d.profit.toFixed(2)}<br/>
          Quantity: ${d.quantity}
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
  }, [data, width, height, title]);

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
