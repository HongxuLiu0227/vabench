import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AggregatedSalesByCategory } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface BarChartProps {
  data: AggregatedSalesByCategory[];
  width: number;
  height: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filter, setFilter, clearFilter } = useDashboard();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 80, bottom: 20, left: 180 };
    const innerWidth = width - margin.left - margin.right;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create hierarchical structure
    const nestedData = d3.rollup(
      data,
      v => d3.sum(v, d => d.sales),
      d => d.category
    );

    const categories = Array.from(nestedData.keys());

    // Create flattened data with hierarchy info
    const flatData: Array<{
      category: string;
      subCategory: string;
      sales: number;
      isCategory: boolean;
      y: number;
      height: number;
    }> = [];

    let currentY = 0;
    const barHeight = 18;
    const gap = 2;

    categories.forEach(category => {
      const categorySales = nestedData.get(category) || 0;
      const categorySubCategories = data.filter(d => d.category === category);

      // Add category bar
      flatData.push({
        category,
        subCategory: '',
        sales: categorySales,
        isCategory: true,
        y: currentY,
        height: barHeight
      });
      currentY += barHeight + gap;

      // Add sub-category bars
      categorySubCategories.forEach(sc => {
        flatData.push({
          category: sc.category,
          subCategory: sc.subCategory,
          sales: sc.sales,
          isCategory: false,
          y: currentY,
          height: barHeight
        });
        currentY += barHeight + gap;
      });
    });

    // Update height based on actual data
    const totalHeight = currentY;
    svg.attr('height', Math.max(height, totalHeight + margin.top + margin.bottom));

    // X scale
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([0, innerWidth]);

    // Color scale
    const colorScale = d3
      .scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.sales) || 0]);

    // Draw bars
    const bars = g
      .selectAll('.bar')
      .data(flatData)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', d => `translate(0,${d.y})`);

    // Bar rect
    bars
      .append('rect')
      .attr('width', d => xScale(d.sales))
      .attr('height', d => d.height)
      .attr('fill', d => colorScale(d.sales))
      .attr('opacity', d => {
        // Highlight selected items
        if (filter.category && filter.subCategory) {
          return d.subCategory === filter.subCategory ? 1 : 0.3;
        }
        if (filter.category) {
          return d.category === filter.category ? 1 : 0.3;
        }
        return 0.9;
      })
      .attr('stroke', d => {
        // Highlight selected items
        if (filter.category && filter.subCategory) {
          return d.subCategory === filter.subCategory ? '#000' : 'none';
        }
        if (filter.category && d.isCategory) {
          return d.category === filter.category ? '#000' : 'none';
        }
        return 'none';
      })
      .attr('stroke-width', d => (d.isCategory ? 2 : 1))
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.isCategory) {
          // Toggle category filter
          if (filter.category === d.category && !filter.subCategory) {
            clearFilter();
          } else {
            setFilter({ category: d.category, subCategory: null });
          }
        } else {
          // Toggle sub-category filter
          if (filter.subCategory === d.subCategory) {
            clearFilter();
          } else {
            setFilter({ category: d.category, subCategory: d.subCategory });
          }
        }
      });

    // Labels
    bars
      .append('text')
      .attr('x', -8)
      .attr('y', d => d.height / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', d => (d.isCategory ? '12px' : '11px'))
      .style('font-weight', d => (d.isCategory ? 'bold' : 'normal'))
      .text(d => {
        if (d.isCategory) {
          return d.category;
        }
        return `  ${d.subCategory}`;
      });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${totalHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat((d: any) => {
            const value = Number(d);
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toString();
          })
      )
      .attr('font-size', '11px');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-totalHeight)
          .tickFormat(() => '')
      )
      .attr('opacity', 0.1);

    // Move grid to back
    svg.select('.grid').lower();
  }, [data, width, height, filter, setFilter, clearFilter]);

  return (
    <div style={{ overflow: 'auto', maxHeight: height }}>
      <svg ref={svgRef} width={width} style={{ display: 'block' }} />
    </div>
  );
};
