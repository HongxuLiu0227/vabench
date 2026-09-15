import { useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear, scaleSequential } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import type { ParsedSalesData } from '../../types/data';
import { aggregateSubCategorySales } from '../../services/dataAggregator';
import { useChartDimensions } from './BaseChart';

interface TotalSalesBySubCategoriesProps {
  data: ParsedSalesData[];
  filterYear: number | null;
}

// Manual sort order from tableau_spec.json
const SALES_SORT_ORDER = [
  'Phones',
  'Chairs',
  'Storage',
  'Tables',
  'Binders',
  'Machines',
  'Accessories',
  'Copiers',
  'Bookcases',
  'Appliances',
  'Furnishings',
  'Paper',
  'Supplies',
  'Art',
  'Envelopes',
  'Labels',
  'Fasteners',
];

export function TotalSalesBySubCategories({ data, filterYear }: TotalSalesBySubCategoriesProps) {
  const { ref, dimensions, margin } = useChartDimensions({ top: 20, right: 30, bottom: 40, left: 120 });
  const [chartData, setChartData] = useState(
    aggregateSubCategorySales(data, filterYear, SALES_SORT_ORDER)
  );

  useEffect(() => {
    setChartData(aggregateSubCategorySales(data, filterYear, SALES_SORT_ORDER));
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
      .domain([0, max(chartData, (d) => d.sales) || 0])
      .range([0, width])
      .nice();

    const color = scaleSequential((t) => {
      // Brown color scale
      const r = Math.floor(139 + (168 - 139) * t);
      const green = Math.floor(69 + (107 - 69) * t);
      const b = Math.floor(19 + (50 - 19) * t);
      return `rgb(${r}, ${green}, ${b})`;
    }).domain([0, max(chartData, (d) => d.sales) || 0]);

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
      .attr('width', (d) => x(d.sales))
      .attr('fill', (d) => color(d.sales))
      .attr('opacity', 1);

    // Value labels on bars
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('y', (d) => y(d.subCategory)! + y.bandwidth() / 2)
      .attr('x', (d) => x(d.sales) + 5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '11px')
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
      .text('Total Sales by Sub-Categories');

  }, [chartData, dimensions, margin, ref]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      <svg width="100%" height="100%">
        <g className="chart-area" transform={`translate(${margin.left},${margin.top})`}></g>
      </svg>
    </div>
  );
}
