import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { CategorySalesData } from '../../types';

interface P121BarProps {
  data: CategorySalesData[];
  width?: number;
  height?: number;
}

export function P121__bar({ data, width = 400, height = 400 }: P121BarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: CategorySalesData } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 20, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

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
      .domain(data.map(d => `${d.category} - ${d.subCategory}`))
      .range([0, innerHeight])
      .padding(0.1);

    // Color scale by category
    const categories = Array.from(new Set(data.map(d => d.category)));
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(categories)
      .range(d3.schemeCategory10);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '10px')
      .each(function() {
        const text = d3.select(this as SVGTextElement);
        const words = text.text().split(' - ');
        if (words.length === 2) {
          text.text('');
          text.append('tspan')
            .attr('x', -5)
            .attr('dy', '0.35em')
            .text(words[0])
            .style('font-weight', 'bold');
          text.append('tspan')
            .attr('x', -5)
            .attr('dy', '1.2em')
            .text(words[1])
            .style('font-weight', 'normal');
        }
      });

    // Add bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('y', d => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('x', 0)
      .attr('width', d => xScale(d.sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.category))
      .attr('fill-opacity', 0.7)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event, g.node()!);
        setTooltip({
          x: x + margin.left,
          y: y + margin.top,
          data: d
        });
        d3.select(event.currentTarget)
          .attr('fill-opacity', 1);
      })
      .on('mouseout', (event) => {
        setTooltip(null);
        d3.select(event.currentTarget)
          .attr('fill-opacity', 0.7);
      });

  }, [data, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Bar</h3>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.data.category}
          </div>
          <div>{tooltip.data.subCategory}</div>
          <div style={{ marginTop: '4px' }}>Sales: ${tooltip.data.sales.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
