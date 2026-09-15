import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { AggregatedMetric } from '../../services/dataAggregator';

interface VerticalStackedPercentageBarProps {
  data: AggregatedMetric[];
  width: number;
  height: number;
  title?: string;
  categoryOrder?: string[];
  seriesOrder?: string[];
  colorScale?: d3.ScaleOrdinal<string, string>;
  showLabels?: boolean;
  onBarClick?: (category: string, series?: string) => void;
  selectedCategory?: string | null;
  selectedSeries?: string | null;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export function VerticalStackedPercentageBar({
  data,
  width,
  height,
  title,
  categoryOrder,
  seriesOrder,
  colorScale,
  showLabels = true,
  onBarClick,
  selectedCategory,
  selectedSeries,
  margin = { top: 40, right: 20, bottom: 60, left: 60 }
}: VerticalStackedPercentageBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const chartData = useMemo(() => {
    // Group by category
    const grouped = new Map<string, AggregatedMetric[]>();
    data.forEach(d => {
      if (!grouped.has(d.category)) {
        grouped.set(d.category, []);
      }
      grouped.get(d.category)!.push(d);
    });

    // For each category, normalize values to percentages
    const result: AggregatedMetric[] = [];
    grouped.forEach((metrics) => {
      const total = metrics.reduce((sum, m) => sum + m.value, 0);
      metrics.forEach(m => {
        result.push({
          ...m,
          value: total > 0 ? (m.value / total) * 100 : 0
        });
      });
    });

    return result;
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique categories and series
    const categories = categoryOrder || Array.from(new Set(chartData.map(d => d.category)));
    const seriesList = seriesOrder || Array.from(new Set(chartData.map(d => d.series || 'all')));

    // Create scales
    const x0 = d3.scaleBand()
      .domain(categories)
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Color scale
    const color = colorScale || d3.scaleOrdinal(d3.schemeCategory10);

    // Create groups for each category
    const categoryGroups = g.selectAll('.category-group')
      .data(categories)
      .enter()
      .append('g')
      .attr('class', 'category-group')
      .attr('transform', d => `translate(${x0(d)},0)`);

    // Add stacked bars
    categoryGroups.each(function(category: string) {
      const categoryData = chartData.filter(d => d.category === category);
      const seriesData = (seriesOrder || seriesList).map(s => {
        const found = categoryData.find(d => (d.series || 'all') === s);
        return found || { category, series: s, value: 0 };
      });

      let currentY = innerHeight;
      const group = d3.select(this);

      seriesData.forEach((d) => {
        const barHeight = innerHeight - y(d.value);
        currentY -= barHeight;

        group.append('rect')
          .attr('class', 'bar')
          .attr('x', 0)
          .attr('y', currentY)
          .attr('width', x0.bandwidth())
          .attr('height', barHeight)
          .attr('fill', color(String(d.series || 'all')))
          .attr('opacity', () => {
            if (selectedCategory && selectedCategory !== d.category) return 0.3;
            if (selectedSeries && selectedSeries !== (d.series || 'all')) return 0.3;
            return 1;
          })
          .style('cursor', onBarClick ? 'pointer' : 'default')
          .on('click', () => {
            if (onBarClick) {
              onBarClick(d.category, d.series || 'all');
            }
          });

        // Add labels
        if (showLabels && d.value > 5) {
          group.append('text')
            .attr('x', x0.bandwidth() / 2)
            .attr('y', currentY + barHeight / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#fff')
            .text(`${d.value.toFixed(1)}%`);
        }
      });
    });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(0)')
      .style('font-size', '12px');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(10).tickFormat((d: any) => `${d}%`))
      .selectAll('text')
      .style('font-size', '12px');

    // Title
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(title);
    }

  }, [chartData, width, height, margin, categoryOrder, seriesOrder, colorScale, showLabels, onBarClick, selectedCategory, selectedSeries, title]);

  return (
    <svg ref={svgRef} width={width} height={height} />
  );
}
