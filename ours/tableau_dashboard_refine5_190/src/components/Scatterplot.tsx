import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3-selection';
import { scaleLinear, scaleSqrt, scaleSequential } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { max, min } from 'd3-array';
import { interpolateBlues } from 'd3-scale-chromatic';
import type { ScatterplotData } from '../types';

interface ScatterplotProps {
  data: ScatterplotData[];
  width?: number;
  height?: number;
}

/**
 * Scatterplot worksheet component
 * X-axis: Sales
 * Y-axis: Profit
 * Size: Quantity
 * Color: Sales (continuous)
 */
export const Scatterplot: React.FC<ScatterplotProps> = ({
  data,
  width = 400,
  height = 300
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Margins
    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Scatterplot');

    // Create scales
    const xScale = scaleLinear()
      .domain([0, max(data, (d: ScatterplotData) => d.sales) || 1000])
      .nice()
      .range([0, innerWidth]);

    const yScale = scaleLinear()
      .domain([
        (min(data, (d: ScatterplotData) => d.profit) || 0) * 1.1,
        (max(data, (d: ScatterplotData) => d.profit) || 100) * 1.1
      ])
      .nice()
      .range([innerHeight, 0]);

    const sizeScale = scaleSqrt()
      .domain([0, max(data, (d: ScatterplotData) => d.quantity) || 10])
      .range([4, 20]);

    const maxSales = max(data, (d: ScatterplotData) => d.sales) || 1000;
    const colorScale = scaleSequential(interpolateBlues)
      .domain([0, maxSales]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).ticks(5))
      .selectAll('text')
      .attr('font-size', '10px');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text('Sales');

    // Add Y axis
    g.append('g')
      .call(axisLeft(yScale).ticks(5))
      .selectAll('text')
      .attr('font-size', '10px');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text('Profit');

    // Add circles
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '11px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    g.selectAll('.scatter-circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'scatter-circle')
      .attr('cx', d => xScale(d.sales))
      .attr('cy', d => yScale(d.profit))
      .attr('r', d => sizeScale(d.quantity))
      .attr('fill', d => colorScale(d.sales))
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#08519c')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', 2);
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="font-weight: bold; margin-bottom: 4px;">${d.productName}</div>
            <div>Sales: $${d.sales.toFixed(2)}</div>
            <div>Profit: $${d.profit.toFixed(2)}</div>
            <div>Quantity: ${d.quantity}</div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('fill-opacity', 0.6)
          .attr('stroke-width', 1);
        tooltip.style('visibility', 'hidden');
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [data, width, height]);

  return (
    <div className="scatterplot">
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};

export default Scatterplot;
