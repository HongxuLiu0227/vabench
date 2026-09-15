import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { AggregatedData, HighlightMap } from '../types/data';

interface VerticalRankedBarProps {
  data: AggregatedData[];
  title: string;
  highlights: HighlightMap;
  onHighlight: (field: string, value: string | number) => void;
  width: number;
  height: number;
}

const COLOR_SCALE = d3.scaleOrdinal(d3.schemeCategory10);

export const VerticalRankedBar: React.FC<VerticalRankedBarProps> = ({
  data,
  title,
  highlights,
  onHighlight,
  width,
  height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 40, right: 20, bottom: 60, left: 60 }), []);

  // Aggregate data by hour and light condition
  const { chartData, categories, seriesValues, maxValue } = useMemo(() => {
    const categoryMap = new Map<string, Map<string, number>>();

    data.forEach(({ category, series, value }) => {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Map());
      }
      const seriesMap = categoryMap.get(category)!;
      seriesMap.set(series, (seriesMap.get(series) || 0) + value);
    });

    const allSeries = new Set<string>();
    const sortedCategories = Array.from(categoryMap.keys()).sort((a, b) => {
      const totalA = Array.from(categoryMap.get(a)!.values()).reduce((sum, v) => sum + v, 0);
      const totalB = Array.from(categoryMap.get(b)!.values()).reduce((sum, v) => sum + v, 0);
      return totalB - totalA;
    });

    const chartData: Array<{
      category: string;
      series: string;
      value: number;
    }> = [];

    categoryMap.forEach((seriesMap, category) => {
      seriesMap.forEach((value, series) => {
        allSeries.add(series);
        chartData.push({ category, series, value });
      });
    });

    const maxValue = Math.max(...chartData.map((d) => d.value), 1);

    return {
      chartData,
      categories: sortedCategories,
      seriesValues: Array.from(allSeries).sort(),
      maxValue,
    };
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

    // x-scale for hours
    const x = d3.scaleBand().range([0, innerWidth]).padding(0.2);
    x.domain(categories);

    // y-scale for values
    const y = d3.scaleLinear().range([innerHeight, 0]).domain([0, maxValue]);

    // color scale for light conditions
    const color = d3.scaleOrdinal().domain(seriesValues).range(seriesValues.map((s) => COLOR_SCALE(s.toString()) as string));

    // Create grouped data for each hour
    const groupedData = categories.map((category) => {
      const seriesInCategory = seriesValues.map((series) => {
        const found = chartData.find((d) => d.category === category && d.series === series);
        return found ? found.value : 0;
      });
      return { category, values: seriesInCategory };
    });

    const xSubgroup = d3.scaleBand().domain(seriesValues).range([0, x.bandwidth()]).padding(0.05);

    // Add bars
    groupedData.forEach((d) => {
      const categoryGroup = g.append('g').attr('transform', `translate(${x(d.category)!},0)`);

      d.values.forEach((value, i) => {
        const series = seriesValues[i];

        // Check if this bar should be highlighted
        const hourHighlights = highlights['hr:Time:ok'];
        const lightHighlights = highlights['none:Light_Conditions:nk'];
        const isDimmed = Object.keys(highlights).length > 0 &&
          !((hourHighlights?.has(parseInt(d.category)) || false) ||
            (lightHighlights?.has(parseInt(series)) || false));

        categoryGroup
          .append('rect')
          .attr('x', xSubgroup(series)!)
          .attr('y', y(value))
          .attr('width', xSubgroup.bandwidth())
          .attr('height', innerHeight - y(value))
          .attr('fill', color(series) as string)
          .attr('opacity', isDimmed ? 0.3 : 1)
          .style('cursor', 'pointer')
          .on('click', (event) => {
            event.stopPropagation();
            onHighlight('hr:Time:ok', parseInt(d.category));
            onHighlight('none:Light_Conditions:nk', parseInt(series));
          })
          .on('mouseover', function () {
            d3.select(this).attr('opacity', 0.8);
          })
          .on('mouseout', function () {
            d3.select(this).attr('opacity', isDimmed ? 0.3 : 1);
          });
      });
    });

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat((d) => `${d}:00`))
      .selectAll('text')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add x-axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Time of Day (Hour)');

    // Add y-axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Number of Casualties');

  }, [chartData, categories, seriesValues, maxValue, width, height, margin, highlights, onHighlight]);

  return (
    <div style={{ width, height }}>
      <h3 style={{ color: '#0b2255', fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
        {title}
      </h3>
      <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }} />
    </div>
  );
};
