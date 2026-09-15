import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ProductAggregation } from '../types/data';

interface ScatterplotProps {
  data: ProductAggregation[];
  width: number;
  height: number;
}

interface TooltipData {
  productName: string;
  sumSales: number;
  sumProfit: number;
  sumQuantity: number;
  x: number;
  y: number;
}

export function Scatterplot({ data, width, height }: ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sumSales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sumProfit) || 0])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.sumQuantity) || 0])
      .range([3, 20]);

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, (d) => d.sumSales) || 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px');

    // X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .text('Sales')
      .style('font-size', '14px')
      .style('font-weight', 'bold');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Y axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .text('Profit')
      .style('font-size', '14px')
      .style('font-weight', 'bold');

    // Circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.sumSales))
      .attr('cy', (d) => yScale(d.sumProfit))
      .attr('r', (d) => sizeScale(d.sumQuantity))
      .attr('fill', (d) => colorScale(d.sumSales))
      .attr('stroke', '#000000')
      .attr('stroke-width', 1)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event);
        setTooltip({
          productName: d.productName,
          sumSales: d.sumSales,
          sumProfit: d.sumProfit,
          sumQuantity: d.sumQuantity,
          x: x + margin.left + 10,
          y: y + margin.top + 10,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });
  }, [data, innerWidth, innerHeight, margin.left, margin.top]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.productName}
          </div>
          <div>Sales: {tooltip.sumSales.toFixed(2)}</div>
          <div>Profit: {tooltip.sumProfit.toFixed(2)}</div>
          <div>Quantity: {tooltip.sumQuantity}</div>
        </div>
      )}
    </div>
  );
}
