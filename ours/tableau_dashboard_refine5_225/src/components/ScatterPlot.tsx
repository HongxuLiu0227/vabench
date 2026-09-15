import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { SalesByProduct } from '../types';

interface ScatterPlotProps {
  data: SalesByProduct[];
  width: number;
  height: number;
  title: string;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, width, height, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2 + 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.profit) || 0, d3.max(data, d => d.profit) || 0])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.quantity) || 0])
      .range([4, 20]);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([d3.min(data, d => d.sales) || 0, d3.max(data, d => d.sales) || 0]);

    // Add circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.sales))
      .attr('cy', d => yScale(d.profit))
      .attr('r', d => sizeScale(d.quantity))
      .attr('fill', d => colorScale(d.sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(width / 80)
        .tickFormat((d) => {
          const value = Number(d);
          if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
          return value.toString();
        })
      );

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Sales');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(height / 60)
        .tickFormat((d) => {
          const value = Number(d);
          if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
          if (value <= -1000) return (value / 1000).toFixed(0) + 'K';
          return value.toString();
        })
      );

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Profit');

    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('max-width', '250px');

    g.selectAll('circle')
      .on('mouseover', function(event, d) {
        const datum = d as SalesByProduct;
        d3.select(this)
          .attr('opacity', 1);

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);

        tooltip.html(`
          <strong>${datum.productName}</strong><br/>
          Sales: $${datum.sales.toFixed(2)}<br/>
          Profit: $${datum.profit.toFixed(2)}<br/>
          Quantity: ${datum.quantity}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.7);

        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height, title]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
};
