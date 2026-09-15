import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AggregatedSalesByMarket } from '../types';

interface SalesByMarketProps {
  data: AggregatedSalesByMarket[];
  selectedSegment: string | null;
  width?: number;
  height?: number;
}

export default function SalesByMarket({ data, selectedSegment, width = 780, height = 290 }: SalesByMarketProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Profit color scale (sequential gray scale)
    const profitExtent = d3.extent(data, (d) => d.Profit);
    const colorScale = d3
      .scaleSequential()
      .domain(profitExtent as [number, number])
      .interpolator(d3.interpolateGreys);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.Sales) || 0])
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.Country))
      .range([0, innerHeight])
      .padding(0.2);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', '10px');

    // X axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Sales');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px')
      .each(function(d: unknown) {
        const text = String(d);
        const self = d3.select(this);
        self.text(text);
        // Add title attribute for full value on hover
        self.selectAll('title').remove();
        self.append('title').text(text);
      });

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -100)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Country');

    // Bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.Country) || 0)
      .attr('width', (d) => xScale(d.Sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => colorScale(d.Profit))
      .attr('stroke', '#fff')
      .attr('stroke-width', '1px')
      .attr('opacity', () => {
        // When a segment is selected, dim all bars in SalesByMarket
        // since it doesn't have segment-level data
        return selectedSegment ? 0.3 : 0.9;
      })
      .style('cursor', 'pointer')
      .on('mouseover', function (_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        // Tooltip
        const tooltip = svg
          .append('g')
          .attr('class', 'tooltip')
          .attr(
            'transform',
            `translate(${xScale(d.Sales) + margin.left + 10},${(yScale(d.Country) || 0) + margin.top})`
          );

        tooltip
          .append('rect')
          .attr('width', 150)
          .attr('height', 60)
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
          .text(d.Country);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 38)
          .attr('font-size', '10px')
          .text(`Sales: $${d.Sales.toFixed(2)}`);

        tooltip
          .append('text')
          .attr('x', 10)
          .attr('y', 53)
          .attr('font-size', '10px')
          .text(`Profit: $${d.Profit.toFixed(2)}`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', () => {
            return selectedSegment ? 0.3 : 0.9;
          });

        svg.selectAll('.tooltip').remove();
      });
  }, [data, selectedSegment, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}
