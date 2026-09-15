import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../../contexts/DashboardContext';
import { getYearMonthProfits } from '../../services/dataService';
import type { SuperstoreRow } from '../../types';
import type { YearMonthProfit } from '../../types';
import './ChartWorksheet.css';

interface ProfitByYearWorksheetProps {
  data: SuperstoreRow[];
}

export function ProfitByYearWorksheet({ data }: ProfitByYearWorksheetProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setFilter, clearHighlight } = useDashboard();
  const [chartData, setChartData] = useState<YearMonthProfit[]>([]);

  useEffect(() => {
    setChartData(getYearMonthProfits(data));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xDomain = chartData.map(d => d.monthYear);
    const x = d3.scaleBand()
      .domain(xDomain)
      .range([0, width])
      .padding(0.2);

    const maxY = d3.max(chartData, d => d.profit) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([height, 0]);

    // Create bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.monthYear) || 0)
      .attr('y', height)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', '#8138f7')
      .attr('rx', 2)
      .on('click', (_event, d) => {
        clearHighlight();
        setFilter('year', d.year);
        setFilter('month', d.month);
      })
      .on('mouseover', function() {
        d3.select(this).attr('fill', '#9b5cf7');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#8138f7');
      })
      .transition()
      .duration(500)
      .attr('y', d => y(d.profit))
      .attr('height', d => height - y(d.profit));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '10px');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d3.format(',.0f')(d as number)}`))
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
      .text('Profit');

  }, [chartData, filters, setFilter, clearHighlight]);

  return (
    <div className="chart-worksheet">
      <div className="chart-title">Profit by Year</div>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
