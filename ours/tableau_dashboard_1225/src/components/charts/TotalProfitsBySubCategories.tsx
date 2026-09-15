import { useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear, scaleSequential } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import type { ParsedSalesData } from '../../types/data';
import { aggregateSubCategoryProfit } from '../../services/dataAggregator';
import { useChartDimensions } from './BaseChart';

interface TotalProfitsBySubCategoriesProps {
  data: ParsedSalesData[];
  filterYear: number | null;
}

// Manual sort order from tableau_spec.json
const PROFIT_SORT_ORDER = [
  'Copiers',
  'Phones',
  'Accessories',
  'Paper',
  'Binders',
  'Chairs',
  'Storage',
  'Appliances',
  'Furnishings',
  'Envelopes',
  'Art',
  'Labels',
  'Machines',
  'Fasteners',
  'Supplies',
  'Bookcases',
  'Tables',
];

export function TotalProfitsBySubCategories({ data, filterYear }: TotalProfitsBySubCategoriesProps) {
  const { ref, dimensions, margin } = useChartDimensions({ top: 20, right: 30, bottom: 40, left: 120 });
  const [chartData, setChartData] = useState(
    aggregateSubCategoryProfit(data, filterYear, PROFIT_SORT_ORDER)
  );

  useEffect(() => {
    setChartData(aggregateSubCategoryProfit(data, filterYear, PROFIT_SORT_ORDER));
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
    const y = scaleBand()
      .domain(chartData.map((d) => d.subCategory))
      .range([0, height])
      .padding(0.3);

    const x = scaleLinear()
      .domain([0, max(chartData, (d) => d.profit) || 0])
      .range([0, width])
      .nice();

    const color = scaleSequential((t) => {
      // Orange/Gold color scale
      const r = Math.floor(255 + (255 - 255) * t);
      const green = Math.floor(140 + (180 - 140) * t);
      const b = Math.floor(0 + (80 - 0) * t);
      return `rgb(${r}, ${green}, ${b})`;
    }).domain([0, max(chartData, (d) => d.profit) || 0]);

    // X Axis
    const xAxisG = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);

    xAxisG.call(axisBottom(x).tickFormat((d: any) => {
      if (typeof d === 'number') {
        return `$${(d / 1000).toFixed(0)}K`;
      }
      return d;
    }) as any);

    xAxisG.selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#000');

    xAxisG.selectAll('.domain, .tick line')
      .style('stroke', '#000');

    // Y Axis
    const yAxisG = g.append('g')
      .attr('class', 'y-axis');

    yAxisG.call(axisLeft(y) as any);

    yAxisG.selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#000');

    yAxisG.selectAll('.domain, .tick line')
      .style('stroke', '#000');

    // Bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.subCategory)!)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', (d) => x(d.profit))
      .attr('fill', (d) => color(d.profit))
      .attr('opacity', 1);

    // Value labels on bars
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('y', (d) => y(d.subCategory)! + y.bandwidth() / 2)
      .attr('x', (d) => x(d.profit) + 5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '11px')
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
      .text('Total Profits by Sub-Categories');

  }, [chartData, dimensions, margin, ref]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      <svg width="100%" height="100%">
        <g className="chart-area" transform={`translate(${margin.left},${margin.top})`}></g>
      </svg>
    </div>
  );
}
