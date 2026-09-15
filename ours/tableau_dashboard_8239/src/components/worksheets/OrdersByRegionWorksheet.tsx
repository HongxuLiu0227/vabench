import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../../contexts/DashboardContext';
import { getRegionCategoryOrders } from '../../services/dataService';
import type { SuperstoreRow } from '../../types';
import type { RegionOrderData } from '../../types';
import { CATEGORY_COLORS } from '../../types';
import './StackedBarWorksheet.css';

interface OrdersByRegionWorksheetProps {
  data: SuperstoreRow[];
}

export function OrdersByRegionWorksheet({ data }: OrdersByRegionWorksheetProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setFilter, clearHighlight } = useDashboard();
  const [chartData, setChartData] = useState<RegionOrderData[]>([]);

  useEffect(() => {
    setChartData(getRegionCategoryOrders(data));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Group data by region
    const regionGroups = d3.groups(chartData, d => d.region);

    // Create scales
    const x = d3.scaleBand()
      .domain(regionGroups.map(([region]) => region))
      .range([0, width])
      .padding(0.3);

    const maxY = d3.max(chartData, d => d.orderCount) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([height, 0]);

    // Create stacked data
    const stackedData = regionGroups.map(([region, values]) => {
      let y0 = 0;
      const bars = values.map(v => {
        const y1 = y0 + v.orderCount;
        const bar = { ...v, y0, y1 };
        y0 = y1;
        return bar;
      });
      return { region, bars };
    });

    // Create bars
    stackedData.forEach(({ region, bars }) => {
      g.selectAll(`.bar-${region}`)
        .data(bars)
        .enter()
        .append('rect')
        .attr('class', `bar bar-${region}`)
        .attr('x', x(region) || 0)
        .attr('y', d => y(d.y1))
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', d => CATEGORY_COLORS[d.category] || '#8138f7')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('rx', 2)
        .style('cursor', 'pointer')
        .on('click', (_event, d) => {
          clearHighlight();
          setFilter('region', [region]);
          setFilter('category', [d.category]);
        })
        .on('mouseover', function() {
          d3.select(this).attr('opacity', 0.8);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
        })
        .transition()
        .duration(500)
        .attr('y', d => y(d.y1))
        .attr('height', d => y(d.y0) - y(d.y1));
    });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#333');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '10px');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#666')
      .text('Order Count');

  }, [chartData, filters, setFilter, clearHighlight]);

  return (
    <div className="stacked-bar-worksheet">
      <div className="chart-title">Orders by Region & Category</div>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
