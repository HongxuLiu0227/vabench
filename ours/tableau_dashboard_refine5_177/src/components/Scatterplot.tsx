import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterPoint } from '../services/dataLoader';
import './Worksheet.css';

interface ScatterplotProps {
  data: ScatterPoint[];
}

function Scatterplot({ data }: ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    if (!data || data.length === 0) {
      return;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 40, bottom: 60, left: 80 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([0, width])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.profit) || 0, d3.max(data, (d) => d.profit) || 0])
      .range([height, 0])
      .nice();

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.quantity) || 0])
      .range([4, 20]);

    const colorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(data, (d) => d.sales) || 0]);

    // Add x-axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat((d) => `$${(d as number) / 1000}k`);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    // Add x-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .text('Sales');

    // Add y-axis
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `$${(d as number) / 1000}k`);

    g.append('g').attr('class', 'y-axis').call(yAxis);

    // Add y-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -60)
      .text('Profit');

    // Add zero line for profit
    const zeroY = yScale(0);
    if (zeroY >= 0 && zeroY <= height) {
      g.append('line')
        .attr('class', 'zero-line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', zeroY)
        .attr('y2', zeroY)
        .attr('stroke', '#999')
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-width', 1);
    }

    // Add circles
    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5);

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    g.selectAll('.circle')
      .on('mouseover', function (event, d) {
        const data = d as ScatterPoint;
        d3.select(this).attr('opacity', 1).attr('stroke-width', 2);
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip
          .html(
            `<strong>${data.productName}</strong><br/>
            Sales: $${data.sales.toFixed(2)}<br/>
            Profit: $${data.profit.toFixed(2)}<br/>
            Quantity: ${data.quantity}`
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.6).attr('stroke-width', 0.5);
        tooltip
          .transition()
          .duration(500)
          .style('opacity', 0);
      });
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="worksheet-container">
      <div className="worksheet-header">
        <h3 className="worksheet-title">Scatterplot</h3>
      </div>
      <div className="worksheet-content">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}

export default Scatterplot;
