import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../../contexts/DashboardContext';
import { getCategoryProfits } from '../../services/dataService';
import type { SuperstoreRow } from '../../types';
import type { CategoryProfit } from '../../types';
import { CATEGORY_COLORS } from '../../types';
import './PieChartWorksheet.css';

interface ProfitByCategoryWorksheetProps {
  data: SuperstoreRow[];
}

export function ProfitByCategoryWorksheet({ data }: ProfitByCategoryWorksheetProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setFilter, clearHighlight } = useDashboard();
  const [chartData, setChartData] = useState<CategoryProfit[]>([]);

  useEffect(() => {
    setChartData(getCategoryProfits(data));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create pie layout
    const pie = d3.pie<CategoryProfit>()
      .value(d => d.profit)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<CategoryProfit>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc<d3.PieArcDatum<CategoryProfit>>()
      .innerRadius(0)
      .outerRadius(radius * 1.1);

    // Create arcs
    g.selectAll('.pie-slice')
      .data(pie(chartData))
      .enter()
      .append('path')
      .attr('class', 'pie-slice')
      .attr('d', arc)
      .attr('fill', d => CATEGORY_COLORS[d.data.category] || '#8138f7')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        clearHighlight();
        // Toggle category filter
        const currentCategories = filters.category || [];
        if (currentCategories.includes(d.data.category)) {
          const newCategories = currentCategories.filter(c => c !== d.data.category);
          setFilter('category', newCategories.length > 0 ? newCategories : []);
        } else {
          setFilter('category', [d.data.category]);
        }
      })
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arcHover as any);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arc as any);
      });

    // Add percentage labels
    g.selectAll('.pie-label')
      .data(pie(chartData))
      .enter()
      .append('text')
      .attr('class', 'pie-label')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => `${d.data.profitPercent.toFixed(1)}%`);

  }, [chartData, filters, setFilter, clearHighlight]);

  return (
    <div className="pie-chart-worksheet">
      <div className="chart-title">Profit % by Category</div>
      <svg ref={svgRef} width="100%" height="100%"></svg>
      <div className="pie-legend">
        {chartData.map(item => (
          <div key={item.category} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#8138f7' }}
            ></div>
            <span className="legend-text">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
