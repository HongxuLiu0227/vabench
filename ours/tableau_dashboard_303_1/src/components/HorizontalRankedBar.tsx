import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { AggregatedData, HighlightMap } from '../types/data';
import { getDayOfWeekName } from '../utils/dataTransform';

interface HorizontalRankedBarProps {
  data: AggregatedData[];
  title: string;
  highlights: HighlightMap;
  onHighlight: (field: string, value: string | number) => void;
  width: number;
  height: number;
}

const DEFAULT_COLOR = '#4477AA';

export const HorizontalRankedBar: React.FC<HorizontalRankedBarProps> = (props) => {
  const { data, title, onHighlight, width, height } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 40, right: 30, bottom: 40, left: 100 }), []);

  // Aggregate and sort data
  const { chartData, maxValue } = useMemo(() => {
    // Aggregate by day of week
    const categoryMap = new Map<string, number>();

    data.forEach(({ category, value }) => {
      categoryMap.set(category, (categoryMap.get(category) || 0) + value);
    });

    const chartData = Array.from(categoryMap.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);

    const maxValue = Math.max(...chartData.map((d) => d.value), 1);

    return { chartData, maxValue };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // y-scale for days
    const y = d3.scaleBand().range([0, innerHeight]).padding(0.3);
    y.domain(chartData.map((d) => d.category));

    // x-scale for values
    const x = d3.scaleLinear().range([0, innerWidth]).nice().domain([0, maxValue]);

    // Add bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.category)!)
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', (d) => x(d.value))
      .attr('fill', DEFAULT_COLOR)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const dayNum = parseInt(d.category);
        onHighlight('none:Day_of_Week:qk', dayNum);
      })
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.8);
      });

    // Add value labels
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('y', (d) => (y(d.category) || 0) + y.bandwidth() / 2)
      .attr('x', (d) => x(d.value) + 5)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text((d) => d.value.toLocaleString());

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y).tickFormat((d) => getDayOfWeekName(parseInt(d))))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-weight', '500');

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add x-axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Number of Accidents');

  }, [chartData, maxValue, width, height, margin, onHighlight]);

  return (
    <div style={{ width, height }}>
      <h3 style={{ color: '#0b2255', fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
        {title}
      </h3>
      <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }} />
    </div>
  );
};
