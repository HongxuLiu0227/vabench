import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ScatterPoint } from '../types';

interface PlotOfSalesProps {
  data: ScatterPoint[];
  selectedSegment: string | null;
  width?: number;
  height?: number;
}

const SEGMENT_COLORS: Record<string, string> = {
  Consumer: '#4e79a7',
  'Home Office': '#59a14f',
  Corporate: '#f28e2b',
};

export default function PlotOfSales({ data, selectedSegment, width = 390, height = 415 }: PlotOfSalesProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.Sales) || 0])
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.Profit) || 0])
      .nice()
      .range([innerHeight, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', '10px');

    // X axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Sales');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Profit');

    // Add dots
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.Sales))
      .attr('cy', (d) => yScale(d.Profit))
      .attr('r', 6)
      .attr('fill', (d) => SEGMENT_COLORS[d.Segment] || '#cccccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', '1.5px')
      .attr('opacity', (d) => {
        if (selectedSegment && selectedSegment !== d.Segment) {
          return 0.2;
        }
        return 0.8;
      })
      .style('cursor', 'pointer')
      .on('mouseover', function (_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 9)
          .attr('opacity', 1);

        // Tooltip
        const tooltip = svg
          .append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.Sales) + 10},${yScale(d.Profit) - 10})`);

        tooltip
          .append('rect')
          .attr('width', 140)
          .attr('height', 70)
          .attr('fill', 'white')
          .attr('stroke', '#ccc')
          .attr('stroke-width', '1px')
          .attr('rx', 4)
          .attr('opacity', 0.95);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 20)
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(`${d.Category}`);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 35)
          .attr('font-size', '10px')
          .text(`Market: ${d.Market}`);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 50)
          .attr('font-size', '10px')
          .text(`Sales: $${d.Sales.toFixed(2)}`);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 65)
          .attr('font-size', '10px')
          .text(`Profit: $${d.Profit.toFixed(2)}`);
      })
      .on('mouseout', function (_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('opacity', (selectedSegment && selectedSegment !== d.Segment) ? 0.2 : 0.8);

        svg.selectAll('.tooltip').remove();
      });
  }, [data, selectedSegment, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}
