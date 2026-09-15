import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedByProduct } from '../types/data';

interface ScatterPlotProps {
  data: AggregatedByProduct[];
  width: number;
  height: number;
  title?: string;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  width,
  height,
  title = 'Scatterplot',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter out extreme outliers for better visualization
    const filteredData = data.filter(
      (d) => d.sales >= 0 && d.profit >= -1000 && d.profit <= 5000
    );

    const maxSales = d3.max(filteredData, (d) => d.sales) || 0;
    const minProfit = d3.min(filteredData, (d) => d.profit) || 0;
    const maxProfit = d3.max(filteredData, (d) => d.profit) || 0;
    const maxQuantity = d3.max(filteredData, (d) => d.quantity) || 0;

    // Create color scale (blue sequential)
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxSales])
      .interpolator(d3.interpolateRgb('#c6dbef', '#08306b'));

    // Create size scale
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, maxQuantity])
      .range([3, 15]);

    // Create x scale (Sales)
    const xScale = d3
      .scaleLinear()
      .domain([0, maxSales * 1.05])
      .range([0, innerWidth]);

    // Create y scale (Profit)
    const yScale = d3
      .scaleLinear()
      .domain([minProfit * 1.1, maxProfit * 1.1])
      .range([innerHeight, 0]);

    // Add x axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(',.0f'));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Inter, system-ui, sans-serif');

    // Add x axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .text('Sales');

    // Add y axis
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(',.0f'));

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Inter, system-ui, sans-serif');

    // Add y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .text('Profit');

    // Add circles
    g.selectAll('.circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .attr('fill-opacity', 0.7)
      .on('mouseover', (event, d) => {
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `<strong>${d.productName}</strong><br/>Sales: $${d.sales.toLocaleString()}<br/>Profit: $${d.profit.toLocaleString()}<br/>Quantity: ${d.quantity}`,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .text(title);
  }, [data, width, height, title]);

  return (
    <>
      <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontFamily: 'Inter, system-ui, sans-serif',
            maxWidth: '250px',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};

export default ScatterPlot;
