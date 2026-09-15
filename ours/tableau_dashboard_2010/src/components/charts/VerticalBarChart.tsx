import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { AggregatedMetric } from '../../services/dataAggregator';

interface VerticalBarChartProps {
  data: AggregatedMetric[];
  width: number;
  height: number;
  title?: string;
  groupBySeries?: boolean;
  categoryOrder?: string[];
  seriesOrder?: string[];
  colorScale?: d3.ScaleOrdinal<string, string>;
  showLabels?: boolean;
  onBarClick?: (category: string, series?: string) => void;
  selectedCategory?: string | null;
  selectedSeries?: string | null;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export function VerticalBarChart({
  data,
  width,
  height,
  title,
  groupBySeries = false,
  categoryOrder,
  seriesOrder,
  colorScale,
  showLabels = true,
  onBarClick,
  selectedCategory,
  selectedSeries,
  margin = { top: 40, right: 20, bottom: 60, left: 60 }
}: VerticalBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const chartData = useMemo(() => {
    if (!categoryOrder) return data;

    // Sort by category order
    const categoryIndex = new Map(categoryOrder.map((c, i) => [c, i]));
    return [...data].sort((a, b) => {
      const aIndex = categoryIndex.get(a.category) ?? 999;
      const bIndex = categoryIndex.get(b.category) ?? 999;
      return aIndex - bIndex;
    });
  }, [data, categoryOrder]);

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
    const series = seriesOrder || (groupBySeries ? Array.from(new Set(chartData.map(d => d.series || 'all'))) : ['all']);

    // Create scales
    const x0 = d3.scaleBand()
      .domain(categories)
      .range([0, innerWidth])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(series)
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const maxValue = d3.max(chartData, d => d.value) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0])
      .nice();

    // Color scale
    const color = colorScale || d3.scaleOrdinal(d3.schemeCategory10);

    // Create groups for each category
    const categoryGroups = g.selectAll('.category-group')
      .data(categories)
      .enter()
      .append('g')
      .attr('class', 'category-group')
      .attr('transform', d => `translate(${x0(d)},0)`);

    // Add bars
    categoryGroups.selectAll('.bar')
      .data(d => {
        const categoryData = chartData.filter(cd => cd.category === d);
        return series.map(s => {
          const found = categoryData.find(cd => (cd.series || 'all') === s);
          return found || { category: d, series: s, value: 0 };
        });
      })
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x1(d.series || 'all') || 0)
      .attr('y', innerHeight)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('fill', d => color(String(d.series || 'all')))
      .attr('opacity', d => {
        if (selectedCategory && selectedCategory !== d.category) return 0.3;
        if (selectedSeries && selectedSeries !== (d.series || 'all')) return 0.3;
        return 1;
      })
      .style('cursor', onBarClick ? 'pointer' : 'default')
      .on('click', (_event, d) => {
        if (onBarClick) {
          onBarClick(d.category, d.series || 'all');
        }
      })
      .transition()
      .duration(750)
      .attr('y', d => y(d.value))
      .attr('height', d => innerHeight - y(d.value));

    // Add labels
    if (showLabels) {
      categoryGroups.selectAll('.label')
        .data(d => {
          const categoryData = chartData.filter(cd => cd.category === d);
          return series.map(s => {
            const found = categoryData.find(cd => (cd.series || 'all') === s);
            return found || { category: d, series: s, value: 0 };
          });
        })
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => (x1(d.series || 'all') || 0) + x1.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text(d => d.value > 0 ? d.value.toFixed(0) : '');
    }

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
      .call(d3.axisLeft(y))
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

  }, [chartData, width, height, margin, groupBySeries, categoryOrder, seriesOrder, colorScale, showLabels, onBarClick, selectedCategory, selectedSeries, title]);

  return (
    <svg ref={svgRef} width={width} height={height} />
  );
}
