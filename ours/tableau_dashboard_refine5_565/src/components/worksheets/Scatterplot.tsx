import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getScatterPlotData } from '../../services/dataLoader';
import type { ScatterPoint } from '../../types/data';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import EmptyState from '../ui/EmptyState';

interface ScatterplotProps {
  width?: number;
  height?: number;
}

export default function Scatterplot({ width = 400, height = 400 }: ScatterplotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<ScatterPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getScatterPlotData()
      .then((data) => {
        setData(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load scatter plot data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 70 };
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

    // Y scale (Profit)
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.profit) || 0, d3.max(data, (d) => d.profit) || 0])
      .range([innerHeight, 0])
      .nice();

    // Size scale (Quantity)
    const sizeScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.quantity) || 0, d3.max(data, (d) => d.quantity) || 0])
      .range([3, 15]);

    // Color scale (Sales)
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, (d) => d.sales) || 0]);

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
      .attr('y', innerHeight + 50)
      .text('Sales')
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
      .text('Profit')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    // Title
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', 20)
      .text('Scatterplot')
      .style('font-size', '16px')
      .style('font-weight', 'bold');

    // Circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (_event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 2);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.sales) + 10},${yScale(d.profit) - 10})`);

        tooltip.append('rect')
          .attr('width', 150)
          .attr('height', 70)
          .attr('fill', 'white')
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('rx', 5);

        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 20)
          .text(d.productName)
          .style('font-size', '11px')
          .style('font-weight', 'bold');

        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 38)
          .text(`Sales: ${d.sales.toFixed(2)}`)
          .style('font-size', '10px');

        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 54)
          .text(`Profit: ${d.profit.toFixed(2)}`)
          .style('font-size', '10px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('opacity', 0.6)
          .attr('stroke-width', 0.5);

        svg.selectAll('.tooltip').remove();
      });

  }, [data, loading, width, height]);

  if (loading) {
    return <LoadingSpinner message="Loading scatter plot..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (data.length === 0) {
    return <EmptyState message="No data available for scatter plot" />;
  }

  return (
    <div>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}
