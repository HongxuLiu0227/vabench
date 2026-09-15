import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getSalesByYearData } from '../../services/dataLoader';
import type { SalesByYear } from '../../types/data';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import EmptyState from '../ui/EmptyState';

interface SalesByYearProps {
  width?: number;
  height?: number;
}

export default function SalesByYear({ width = 400, height = 400 }: SalesByYearProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<SalesByYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSalesByYearData()
      .then((data) => {
        setData(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load sales by year data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Year)
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, innerWidth])
      .nice();

    // Y scale (Sales)
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Line generator
    const line = d3
      .line<SalesByYear>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((d) => d.toString())
          .ticks(data.length)
      )
      .selectAll('text')
      .style('font-size', '11px');

    // X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .text('Year')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px');

    // Y axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .text('Sales')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    // Title
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', 20)
      .text('Total Sales Each Year')
      .style('font-size', '16px')
      .style('font-weight', 'bold');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 0.5);

    // Line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4e79a7')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Data points
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', '#4e79a7')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (_event, d) {
        d3.select(this)
          .attr('r', 6)
          .attr('fill', '#e15759');

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.year) + 10},${yScale(d.sales) - 10})`);

        tooltip.append('rect')
          .attr('width', 120)
          .attr('height', 50)
          .attr('fill', 'white')
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('rx', 5);

        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 20)
          .text(`Year: ${d.year}`)
          .style('font-size', '11px')
          .style('font-weight', 'bold');

        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 38)
          .text(`Sales: ${d.sales.toFixed(2)}`)
          .style('font-size', '10px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('r', 4)
          .attr('fill', '#4e79a7');

        svg.selectAll('.tooltip').remove();
      });

  }, [data, loading, width, height]);

  if (loading) {
    return <LoadingSpinner message="Loading sales by year..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (data.length === 0) {
    return <EmptyState message="No data available for sales by year" />;
  }

  return (
    <div>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}
