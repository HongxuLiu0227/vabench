import { useEffect, useRef, useState } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import type { SalesBySubCategory } from '../types';

interface HorizontalRankedBarProps {
  data: SalesBySubCategory[];
  title?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const TABLEAU_COLORS = {
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
  purple: '#B07AA1',
  pink: '#FF9DA7',
  brown: '#9C755F',
  gray: '#BAB0AC',
};

export function HorizontalRankedBar({
  data,
  title = 'Sales by Sub Category',
  width = 400,
  height = 500,
  margin = { top: 40, right: 20, bottom: 20, left: 150 },
}: HorizontalRankedBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.sales)) * 1.1]) // Add 10% padding
      .range([0, innerWidth]);

    const yScale = scaleBand()
      .domain(data.map((d) => d.subCategory))
      .range([0, innerHeight])
      .padding(0.2);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    if (title) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'system-ui, -apple-system, sans-serif')
        .text(title);
    }

    // Create bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', (d: SalesBySubCategory) => `translate(0,${yScale(d.subCategory) || 0})`);

    bars
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', (d: SalesBySubCategory) => xScale(d.sales))
      .attr('fill', TABLEAU_COLORS.blue)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event: MouseEvent, d: SalesBySubCategory) {
        select(this as SVGGElement).attr('fill', TABLEAU_COLORS.orange);
        const rect = (event.target as SVGRectElement).getBoundingClientRect();
        setTooltip({
          x: rect.left,
          y: rect.top,
          content: `${d.subCategory}: $${d.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        });
      })
      // eslint-disable-next-line react-hooks/unsupported-syntax
      .on('mouseout', function (this: SVGRectElement) {
        select(this).attr('fill', TABLEAU_COLORS.blue);
        setTooltip(null);
      });

    // Add y-axis with category labels
    g.append('g')
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', (d: SalesBySubCategory) => (yScale(d.subCategory) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('font-family', 'system-ui, -apple-system, sans-serif')
      .text((d: SalesBySubCategory) => d.subCategory);

    // Add value labels at the end of bars
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d: SalesBySubCategory) => xScale(d.sales) + 5)
      .attr('y', (d: SalesBySubCategory) => (yScale(d.subCategory) || 0) + yScale.bandwidth() / 2)
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'system-ui, -apple-system, sans-serif')
      .text((d: SalesBySubCategory) => `$${Math.round(d.sales).toLocaleString()}`);

    // Add x-axis labels
    g.selectAll('.x-label')
      .data(xScale.ticks(5))
      .enter()
      .append('text')
      .attr('x', (d: number) => xScale(d))
      .attr('y', innerHeight + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'system-ui, -apple-system, sans-serif')
      .text((d: number) => `$${(d / 1000).toFixed(0)}k`);
  }, [data, width, height, margin, title]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
