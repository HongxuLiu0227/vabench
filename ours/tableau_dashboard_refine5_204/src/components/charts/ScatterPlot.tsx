/**
 * ScatterPlot - D3-based scatter plot with size encoding
 * Used for P121__scatterplot
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ScatterPlotProps {
  data: Array<{
    'Product Name': string;
    'Sales': number;
    'Profit': number;
    'Quantity': number;
  }>;
  title: string;
  width?: number;
  height?: number;
  color?: string;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  title,
  width = 400,
  height = 300,
  color = '#4e79a7',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter out extreme outliers for better visualization
    const filteredData = data.filter(
      (d) => d['Sales'] >= 0 && d['Sales'] < 10000 && d['Profit'] > -2000 && d['Profit'] < 3000
    );

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d['Sales']) || 1000])
      .range([0, innerWidth])
      .nice();

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => d['Profit']) || 0,
        d3.max(filteredData, (d) => d['Profit']) || 1000,
      ])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(filteredData, (d) => d['Quantity']) || 1])
      .range([3, 15]);

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('~s')))
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Add x-axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text('Sales');

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format('~s')))
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Add y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text('Profit');

    // Add grid lines
    g.selectAll('.grid-line-x')
      .data(x.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line-x')
      .attr('x1', (d) => x(d))
      .attr('x2', (d) => x(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    g.selectAll('.grid-line-y')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line-y')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // Add zero line for y-axis if negative values exist
    if (y.domain()[0] < 0) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', y(0))
        .attr('y2', y(0))
        .attr('stroke', '#999')
        .attr('stroke-width', 1);
    }

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(255, 255, 255, 0.95)')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '11px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none');

    // Add circles
    g.selectAll('.dot')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d['Sales']))
      .attr('cy', (d) => y(d['Profit']))
      .attr('r', (d) => sizeScale(d['Quantity']))
      .attr('fill', color)
      .attr('fill-opacity', 0.6)
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill-opacity', 0.9).attr('r', sizeScale(d['Quantity']) + 2);
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d['Product Name']}</strong><br/>
            Sales: $${d3.format(',.2f')(d['Sales'])}<br/>
            Profit: $${d3.format(',.2f')(d['Profit'])}<br/>
            Quantity: ${d['Quantity']}
          `)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .attr('fill-opacity', 0.6)
          .attr('r', sizeScale(d['Quantity']));
        tooltip.style('visibility', 'hidden');
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, width, height, color]);

  return (
    <div style={{ width, height }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'left' }}>
        {title}
      </h3>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
