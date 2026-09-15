import { useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear, scaleSequential } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import type { ParsedSalesData } from '../../types/data';
import { aggregateYearlySales } from '../../services/dataAggregator';
import { useChartDimensions } from './BaseChart';

interface TotalSalesEachYearProps {
  data: ParsedSalesData[];
  selectedYear: number | null;
  onYearSelect: (year: number | null) => void;
}

export function TotalSalesEachYear({ data, selectedYear, onYearSelect }: TotalSalesEachYearProps) {
  const { ref, dimensions, margin } = useChartDimensions({ top: 20, right: 20, bottom: 60, left: 80 });
  const [chartData, setChartData] = useState(aggregateYearlySales(data));

  useEffect(() => {
    setChartData(aggregateYearlySales(data));
  }, [data]);

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
      .domain([0, max(chartData, (d) => d.sales) || 0])
      .range([height, 0])
      .nice();

    const color = scaleSequential((t) => {
      // Brown color scale (d3-interpolateYlOrBr approximation)
      const r = Math.floor(139 + (168 - 139) * t);
      const green = Math.floor(69 + (107 - 69) * t);
      const b = Math.floor(19 + (50 - 19) * t);
      return `rgb(${r}, ${green}, ${b})`;
    }).domain([0, max(chartData, (d) => d.sales) || 0]);

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
      .attr('y', (d) => y(d.sales))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.sales))
      .attr('fill', (d) => color(d.sales))
      .attr('opacity', (d) => (selectedYear !== null && d.year !== selectedYear ? 0.3 : 1))
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onYearSelect(selectedYear === d.year ? null : d.year);
      });

    // Value labels on bars
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d) => (x(d.year.toString())! + x.bandwidth() / 2))
      .attr('y', (d) => y(d.sales) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .style('pointer-events', 'none')
      .text((d) => `$${Math.round(d.sales / 1000)}K`);

    // Title
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Total Sales Each Year');

  }, [chartData, dimensions, margin, ref, selectedYear, onYearSelect]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      <svg width="100%" height="100%">
        <g className="chart-area" transform={`translate(${margin.left},${margin.top})`}></g>
      </svg>
    </div>
  );
}
