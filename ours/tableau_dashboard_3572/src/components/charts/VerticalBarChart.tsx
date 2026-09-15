import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { BinnedData, AggregatedData } from '../../types/hrData';

interface VerticalBarChartProps {
  data: (BinnedData | AggregatedData)[];
  width: number;
  height: number;
  color?: string;
  getColor?: (category: string, series?: string) => string;
  stacked?: boolean;
  showLabels?: boolean;
  onBarClick?: (category: string, series?: string) => void;
  selectedCategories?: Set<string>;
  margin?: { top: number; right: number; bottom: number; left: number };
}

interface GroupedData {
  category: string;
  [key: string]: number | string;
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  width,
  height,
  color = '#4e79a7',
  getColor,
  stacked = false,
  showLabels = true,
  onBarClick,
  selectedCategories = new Set(),
  margin = { top: 20, right: 20, bottom: 60, left: 60 },
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique categories
    const categories = Array.from(new Set(data.map(d => ('category' in d ? d.category : d.bin))));

    // Get series if stacked
    const series = stacked
      ? Array.from(new Set(data.map(d => ('series' in d && d.series ? d.series : 'default'))))
      : ['default'];

    // Prepare data for stacking if needed
    let groupedData: GroupedData[] = [];
    if (stacked && series.length > 1) {
      const categoryMap = new Map<string, GroupedData>();
      data.forEach(d => {
        if (!('category' in d)) return;
        const cat = d.category;
        const ser = d.series || 'default';
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { category: cat });
        }
        (categoryMap.get(cat) as GroupedData)[ser] = d.value;
      });
      groupedData = Array.from(categoryMap.values());

      // Calculate cumulative values for proper stacking
      const stackedValues = groupedData.map(d => {
        let cumulative = 0;
        const values: Record<string, { start: number; end: number; value: number }> = {};
        series.forEach(ser => {
          const value = (d[ser] as number) || 0;
          values[ser] = { start: cumulative, end: cumulative + value, value };
          cumulative += value;
        });
        return { category: d.category, values };
      });

      // Calculate y-max from stacked values
      const maxY = d3.max(stackedValues, d => d3.sum(series.map(s => d.values[s]?.value || 0))) || 0;

      // Y scale
      const yScale = d3.scaleLinear()
        .domain([0, maxY * 1.1])
        .range([innerHeight, 0]);

      // X scale
      const xScale = d3.scaleBand()
        .domain(categories)
        .range([0, innerWidth])
        .padding(0.2);

      // Draw stacked bars
      series.forEach(ser => {
        g.selectAll(`.bar-${ser}`)
          .data(stackedValues)
          .enter()
          .append('rect')
          .attr('class', `bar-${ser}`)
          .attr('x', (d) => xScale(d.category) || 0)
          .attr('y', (d) => yScale(d.values[ser]?.end || 0))
          .attr('width', xScale.bandwidth())
          .attr('height', (d) => {
            const start = d.values[ser]?.start || 0;
            const end = d.values[ser]?.end || 0;
            return yScale(start) - yScale(end);
          })
          .attr('fill', () => getColor ? getColor('', ser) : color)
          .attr('opacity', (d) => {
            return selectedCategories.size === 0 || selectedCategories.has(d.category) ? 1 : 0.3;
          })
          .style('cursor', onBarClick ? 'pointer' : 'default')
          .on('click', (_event, d) => {
            if (onBarClick) {
              onBarClick(d.category, ser);
            }
          })
          .on('mouseover', function() {
            d3.select(this).attr('opacity', 0.8);
          })
          .on('mouseout', function() {
            d3.select(this).attr('opacity', 1);
          });

        // Add labels
        if (showLabels) {
          g.selectAll(`.label-${ser}`)
            .data(stackedValues)
            .enter()
            .append('text')
            .attr('class', `label-${ser}`)
            .attr('x', (d) => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
            .attr('y', (d) => {
              const start = d.values[ser]?.start || 0;
              const end = d.values[ser]?.end || 0;
              return (yScale(start) + yScale(end)) / 2;
            })
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', 'white')
            .text((d) => {
              const value = d.values[ser]?.value || 0;
              return value > 0 ? value.toFixed(0) : '';
            });
        }
      });

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('text-anchor', 'middle')
        .style('font-size', '11px')
        .attr('dy', '0.35em')
        .each(function() {
          const text = d3.select(this);
          const words = text.text().split('-');
          if (words.length > 1 && words[0].length > 5) {
            text.text(words[0]);
          }
        });

      // Y axis
      g.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '11px');

    } else {
      // Non-stacked bars
      groupedData = categories.map(cat => {
        const item = data.find(d => ('category' in d ? d.category : d.bin) === cat);
        return {
          category: cat,
          default: item ? ('value' in item ? item.value : ('count' in item ? item.count : 0)) : 0
        };
      });

      // X scale
      const xScale = d3.scaleBand()
        .domain(categories)
        .range([0, innerWidth])
        .padding(0.2);

      // Y scale
      const maxValue = d3.max(groupedData, d => (d.default as number)) || 0;
      const yScale = d3.scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([innerHeight, 0]);

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('text-anchor', 'middle')
        .style('font-size', '11px')
        .attr('dy', '0.35em')
        .each(function() {
          const text = d3.select(this);
          const words = text.text().split('-');
          if (words.length > 1 && words[0].length > 5) {
            text.text(words[0]);
          }
        });

      // Y axis
      g.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '11px');

      // Draw bars
      g.selectAll('.bar')
        .data(groupedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.category) || 0)
        .attr('y', (d) => yScale(d.default as number))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => innerHeight - yScale(d.default as number))
        .attr('fill', (d) => getColor ? getColor(d.category) : color)
        .attr('opacity', (d) => {
          return selectedCategories.size === 0 || selectedCategories.has(d.category) ? 1 : 0.3;
        })
        .style('cursor', onBarClick ? 'pointer' : 'default')
        .on('click', (_event, d) => {
          if (onBarClick) {
            onBarClick(d.category);
          }
        })
        .on('mouseover', function() {
          d3.select(this).attr('opacity', 0.8);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
        });

      // Add labels
      if (showLabels) {
        g.selectAll('.label')
          .data(groupedData)
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', (d) => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
          .attr('y', (d) => yScale(d.default as number) - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .text((d) => (d.default as number) > 0 ? (d.default as number).toFixed(0) : '');
      }
    }

  }, [data, width, height, color, getColor, stacked, showLabels, onBarClick, selectedCategories, margin]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
};
