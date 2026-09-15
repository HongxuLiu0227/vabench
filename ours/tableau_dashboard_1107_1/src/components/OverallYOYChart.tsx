import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { YearData } from '../types';
import { YEAR_COLORS } from '../types';

interface OverallYOYChartProps {
  data: YearData[];
  selectedYear?: number | null;
}

const OverallYOYChart = ({ data, selectedYear }: OverallYOYChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = 250;

    const margin = { top: 30, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.year.toString()))
      .range([0, chartWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .nice()
      .range([chartHeight, 0]);

    const xAxis = d3.axisBottom(x).tickSize(0);
    const yAxis = d3.axisLeft(y).ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('class', 'x-axis')
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('font-family', 'Segoe UI, Roboto, Helvetica, Arial, sans-serif');

    g.append('g')
      .call(yAxis)
      .attr('class', 'y-axis')
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('font-family', 'Segoe UI, Roboto, Helvetica, Arial, sans-serif');

    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.year.toString())!)
      .attr('y', chartHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', d => YEAR_COLORS[d.year] || '#888')
      .attr('opacity', d => selectedYear && selectedYear !== d.year ? 0.3 : 1)
      .attr('rx', 2);

    bars.transition()
      .duration(750)
      .attr('y', d => y(d.count)!)
      .attr('height', d => chartHeight - y(d.count)!);

    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.year.toString())! + x.bandwidth() / 2)
      .attr('y', d => y(d.count)! - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-family', 'Segoe UI, Roboto, Helvetica, Arial, sans-serif')
      .attr('opacity', d => selectedYear && selectedYear !== d.year ? 0.3 : 1)
      .text(d => d.pctDiff !== null ? `${d.pctDiff >= 0 ? '+' : ''}${d.pctDiff.toFixed(1)}%` : '');

  }, [data, selectedYear]);

  return (
    <div className="chart-container">
      <h3 className="chart-title">Overall YOY</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default OverallYOYChart;
