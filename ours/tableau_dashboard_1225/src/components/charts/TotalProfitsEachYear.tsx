import { useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear, scaleSequential } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import type { ParsedSalesData } from '../../types/data';
import { aggregateYearlyProfit } from '../../services/dataAggregator';
import { useChartDimensions } from './BaseChart';

interface TotalProfitsEachYearProps {
  data: ParsedSalesData[];
  filterYear: number | null;
}

export function TotalProfitsEachYear({ data, filterYear }: TotalProfitsEachYearProps) {
  const { ref, dimensions, margin } = useChartDimensions({ top: 20, right: 20, bottom: 60, left: 80 });
  const [chartData, setChartData] = useState(aggregateYearlyProfit(data, filterYear));

  useEffect(() => {
    setChartData(aggregateYearlyProfit(data, filterYear));
  }, [data, filterYear]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    if (chartData.length === 0) return;

    const svg = select(ref.current).select<SVGSVGElement>('svg');
    if (svg.empty()) return;

    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg.select<SVGGElement>('.chart-area');

    // Clear previous content
    g.selectAll('*').remove();

    // Scales
    const x = scaleBand()
      .domain(chartData.map((d) => d.year.toString()))
      .range([0, width])
      .padding(0.3);

    const y = scaleLinear()
      .domain([0, max(chartData, (d) => d.profit) || 0])
      .range([height, 0])
      .nice();

    const color = scaleSequential((t) => {
      // Orange/Gold color scale (d3-interpolateOranges approximation)
      const r = Math.floor(255 + (255 - 255) * t);
      const green = Math.floor(140 + (180 - 140) * t);
      const b = Math.floor(0 + (80 - 0) * t);
      return `rgb(${r}, ${green}, ${b})`;
    }).domain([0, max(chartData, (d) => d.profit) || 0]);

    // X Axis
    const xAxisG = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);

    xAxisG.call(axisBottom(x) as any);

    xAxisG.selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#000');

    xAxisG.selectAll('.domain, .tick line')
      .style('stroke', '#000');

    // Y Axis
    const yAxisG = g.append('g')
      .attr('class', 'y-axis');

    yAxisG.call(axisLeft(y).tickFormat((d: any) => {
      if (typeof d === 'number') {
        return `$${(d / 1000).toFixed(0)}K`;
      }
      return d;
    }) as any);

    yAxisG.selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#000');

    yAxisG.selectAll('.domain, .tick line')
      .style('stroke', '#000');

    // Bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.year.toString())!)
      .attr('y', (d) => y(d.profit))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.profit))
      .attr('fill', (d) => color(d.profit))
      .attr('opacity', 1);

    // Value labels on bars
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d) => (x(d.year.toString())! + x.bandwidth() / 2))
      .attr('y', (d) => y(d.profit) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .style('pointer-events', 'none')
      .text((d) => `$${Math.round(d.profit / 1000)}K`);

    // Title
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Total Profits Each Year');

  }, [chartData, dimensions, margin, ref]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      <svg width="100%" height="100%">
        <g className="chart-area" transform={`translate(${margin.left},${margin.top})`}></g>
      </svg>
    </div>
  );
}
