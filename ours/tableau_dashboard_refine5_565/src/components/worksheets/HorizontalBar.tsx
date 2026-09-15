import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getBarChartData } from '../../services/dataLoader';
import type { AggregatedSalesByCategory } from '../../types/data';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import EmptyState from '../ui/EmptyState';

interface HorizontalBarProps {
  width?: number;
  height?: number;
}

export default function HorizontalBar({ width = 400, height = 400 }: HorizontalBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<AggregatedSalesByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBarChartData()
      .then((data) => {
        setData(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load bar chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 20, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Sales)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    // Y scale (Categories)
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => `${d.category} - ${d.subCategory}`))
      .range([0, innerHeight])
      .padding(0.15);

    // Color scale by category
    const categories = Array.from(new Set(data.map((d) => d.category)));
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(categories)
      .range(d3.schemeTableau10);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '11px');

    // X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .text('Sales')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '10px')
      .style('text-anchor', 'end');

    // Title
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', 20)
      .text('Bar')
      .style('font-size', '16px')
      .style('font-weight', 'bold');

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('x', 0)
      .attr('width', (d) => xScale(d.sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => colorScale(d.category))
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (_event, d) {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke-width', 2);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.sales) + 5},${(yScale(`${d.category} - ${d.subCategory}`) || 0) + yScale.bandwidth() / 2})`);

        tooltip.append('rect')
          .attr('width', 140)
          .attr('height', 55)
          .attr('fill', 'white')
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('rx', 5);

        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 20)
          .text(`${d.category}`)
          .style('font-size', '11px')
          .style('font-weight', 'bold');

        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 36)
          .text(`${d.subCategory}`)
          .style('font-size', '10px');

        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 50)
          .text(`Sales: ${d.sales.toFixed(2)}`)
          .style('font-size', '10px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 0.5);

        svg.selectAll('.tooltip').remove();
      });

  }, [data, loading, width, height]);

  if (loading) {
    return <LoadingSpinner message="Loading bar chart..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (data.length === 0) {
    return <EmptyState message="No data available for bar chart" />;
  }

  return (
    <div>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}
