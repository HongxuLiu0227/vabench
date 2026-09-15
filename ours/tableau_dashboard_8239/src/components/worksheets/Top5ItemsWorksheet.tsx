import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../../contexts/DashboardContext';
import { getTopSubCategorySales } from '../../services/dataService';
import type { SuperstoreRow } from '../../types';
import type { SubCategorySales } from '../../types';
import './HorizontalBarWorksheet.css';

interface Top5ItemsWorksheetProps {
  data: SuperstoreRow[];
}

export function Top5ItemsWorksheet({ data }: Top5ItemsWorksheetProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setFilter, clearHighlight } = useDashboard();
  const [chartData, setChartData] = useState<SubCategorySales[]>([]);

  useEffect(() => {
    setChartData(getTopSubCategorySales(data, 5));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 60, bottom: 20, left: 120 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const y = d3.scaleBand()
      .domain(chartData.map(d => d.subCategory))
      .range([0, height])
      .padding(0.2);

    const maxX = d3.max(chartData, d => d.sales) || 0;
    const x = d3.scaleLinear()
      .domain([0, maxX * 1.1])
      .range([0, width]);

    // Create bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.subCategory) || 0)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', 0)
      .attr('fill', '#8138f7')
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        clearHighlight();
        // Toggle sub-category filter
        const currentSubCategory = filters.subCategory?.[0];
        if (currentSubCategory === d.subCategory) {
          setFilter('subCategory', []);
        } else {
          setFilter('subCategory', [d.subCategory]);
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('fill', '#9b5cf7');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#8138f7');
      })
      .transition()
      .duration(500)
      .attr('width', d => x(d.sales));

    // Y axis (sub-category names)
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#333');

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `$${d3.format(',.0f')(d as number)}`))
      .selectAll('text')
      .style('font-size', '10px');

  }, [chartData, filters, setFilter, clearHighlight]);

  return (
    <div className="horizontal-bar-worksheet">
      <div className="chart-title">Top 5 items by Sales</div>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
