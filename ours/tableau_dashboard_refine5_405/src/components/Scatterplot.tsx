import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterplotData } from '../types/data';
import { formatCurrency, formatInteger } from '../utils/formatters';

interface ScatterplotProps {
  data: ScatterplotData[];
  width?: number;
  height?: number;
}

export function Scatterplot({ data, width = 800, height = 300 }: ScatterplotProps) {
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

    const margin = { top: 40, right: 40, bottom: 50, left: 60 };
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
      .text('Scatterplot');

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sumSales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sumProfit) || 0])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.sumQuantity) || 0])
      .range([3, 20]);

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => formatCurrency(d as number));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif');

    // X-axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-family', 'Arial, sans-serif')
      .text('Sales');

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => formatCurrency(d as number));

    g.append('g')
      .call(yAxis)
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif');

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-family', 'Arial, sans-serif')
      .text('Profit');

    // Circles (scatter plot points)
    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', d => xScale(d.sumSales))
      .attr('cy', d => yScale(d.sumProfit))
      .attr('r', d => sizeScale(d.sumQuantity))
      .attr('fill', '#75a1c7')
      .attr('stroke', '#000000')
      .attr('stroke-width', 1)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `<strong>${d.productName}</strong><br/>Sales: ${formatCurrency(d.sumSales)}<br/>Profit: ${formatCurrency(d.sumProfit)}<br/>Quantity: ${formatInteger(d.sumQuantity)}`,
        });
        d3.select(event.currentTarget).attr('opacity', 1);
      })
      .on('mouseout', (event) => {
        setTooltip(prev => ({ ...prev, visible: false }));
        d3.select(event.currentTarget).attr('opacity', 0.7);
      });

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
