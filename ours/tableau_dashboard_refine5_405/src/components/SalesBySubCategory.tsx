import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesBySubCategoryData } from '../types/data';
import { formatCurrency } from '../utils/formatters';

interface SalesBySubCategoryProps {
  data: SalesBySubCategoryData[];
  width?: number;
  height?: number;
}

export function SalesBySubCategory({ data, width = 400, height = 300 }: SalesBySubCategoryProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 80, bottom: 20, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create title
    g.append('text')
      .attr('x', 0)
      .attr('y', -15)
      .attr('text-anchor', 'start')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Arial, sans-serif')
      .text('Sales by Sub Category');

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sumSales) || 0])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.subCategory))
      .range([0, innerHeight])
      .padding(0.2);

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => formatCurrency(d as number));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif');

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.subCategory) || 0)
      .attr('width', d => xScale(d.sumSales))
      .attr('height', yScale.bandwidth())
      .attr('fill', '#1f77b4')
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `<strong>${d.subCategory}</strong><br/>Sales: ${formatCurrency(d.sumSales)}`,
        });
        d3.select(event.currentTarget).attr('fill', '#3a8ccf');
      })
      .on('mouseout', (event) => {
        setTooltip(prev => ({ ...prev, visible: false }));
        d3.select(event.currentTarget).attr('fill', '#1f77b4');
      });

    // Bar labels (values at end of bars)
    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.sumSales) + 5)
      .attr('y', d => (yScale(d.subCategory) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'start')
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif')
      .text(d => formatCurrency(d.sumSales));

    // Y-axis labels (sub-category names)
    g.selectAll('.y-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -5)
      .attr('y', d => (yScale(d.subCategory) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('font-family', 'Arial, sans-serif')
      .text(d => d.subCategory);

  }, [data, width, height]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
}
