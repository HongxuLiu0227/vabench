import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3-selection';
import * as d3scale from 'd3-scale';
import type { TelcoRecord } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface HorizontalRankedBarProps {
  data: TelcoRecord[];
  dimension: keyof TelcoRecord;
  title?: string;
  categoryOrder?: string[];
  colorMap?: Record<string, string>;
}

export const HorizontalRankedBar: React.FC<HorizontalRankedBarProps> = ({
  data,
  dimension,
  title,
  categoryOrder,
  colorMap,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlightState, setHighlight, clearHighlight } = useDashboard();

  // Aggregate and prepare data
  const chartData = useMemo(() => {
    const grouped = data.reduce((acc, record) => {
      const key = String(record[dimension]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let entries = Object.entries(grouped).map(([category, value]) => ({
      category,
      value,
    }));

    // Sort by value descending, unless categoryOrder is specified
    if (categoryOrder && categoryOrder.length > 0) {
      entries = entries.sort(
        (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
      );
    } else {
      entries = entries.sort((a, b) => b.value - a.value);
    }

    return entries;
  }, [data, dimension, categoryOrder]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 60, bottom: 20, left: 120 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = chartData.length * 35 + margin.top + margin.bottom;

    svg
      .attr('width', svgRef.current.clientWidth)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3scale
      .scaleLinear()
      .domain([0, Math.max(...chartData.map((d) => d.value))])
      .range([0, width]);

    const yScale = d3scale
      .scaleBand()
      .domain(chartData.map((d) => d.category))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.2);

    // Default color palette
    const defaultColors = [
      '#4e79a7',
      '#f28e2b',
      '#e15759',
      '#76b7b2',
      '#59a14f',
      '#edc948',
      '#b07aa1',
      '#ff9da7',
      '#9c755f',
      '#bab0ac',
    ];

    // Color scale
    const colorScale = (category: string) => {
      if (colorMap && colorMap[category]) {
        return colorMap[category];
      }
      const index = chartData.findIndex((d) => d.category === category);
      return defaultColors[index % defaultColors.length];
    };

    // Check if this bar should be highlighted
    const isHighlighted = (category: string) => {
      if (!highlightState.dimension || !highlightState.value) return true;
      // If the highlight is on a different dimension, don't filter
      if (highlightState.dimension !== dimension) return true;
      return category === highlightState.value;
    };

    // Bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(d.category) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', (d) => xScale(d.value))
      .attr('fill', (d) => colorScale(d.category))
      .attr('opacity', (d) => (isHighlighted(d.category) ? 1 : 0.3))
      .attr('rx', 2)
      .on('click', (_event, d) => {
        if (highlightState.dimension === dimension && highlightState.value === d.category) {
          clearHighlight();
        } else {
          setHighlight(dimension, d.category);
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this).attr('opacity', isHighlighted(d.category) ? 1 : 0.3);
      });

    // Labels (category)
    g.selectAll('.category-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'category-label')
      .attr('y', (d) => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr('x', -10)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text((d) => d.category);

    // Value labels
    g.selectAll('.value-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', (d) => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr('x', (d) => xScale(d.value) + 5)
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text((d) => d.value.toLocaleString());

    // Title
    if (title) {
      svg
        .append('text')
        .attr('x', svgRef.current.clientWidth / 2)
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(title);
    }
  }, [chartData, dimension, highlightState, colorMap, title, setHighlight, clearHighlight]);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
};
