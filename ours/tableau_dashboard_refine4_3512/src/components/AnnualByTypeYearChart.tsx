import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { DataPoint } from '../types/data';
import { getBreachTypeColor } from '../utils/colors';
import { aggregatePieSlices } from '../services/dataAggregator';
import { useFilter } from '../contexts/FilterContext';

interface AnnualByTypeYearChartProps {
  data: DataPoint[];
  width: number;
  height: number;
}

export const AnnualByTypeYearChart: React.FC<AnnualByTypeYearChartProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filter, setFilter, clearFilter } = useFilter();
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Aggregate pie slices with current filter
    const slices = aggregatePieSlices(data, { year: null, breachType: null }); // Pie chart shows all data

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create pie layout
    const pie = d3.pie<PieSlice>()
      .value(d => d.count)
      .sort((a, b) => b.count - a.count); // Sort by count descending

    const pieData = pie(slices);

    // Create arc generator
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const arc = d3.arc<d3.PieArcDatum<PieSlice>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Create pie group centered
    const pieGroup = g.append('g')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

    // Create arcs
    pieGroup.selectAll('.slice')
      .data(pieData)
      .enter()
      .append('path')
      .attr('class', 'slice')
      .attr('d', d => arc(d) || '')
      .attr('fill', d => getBreachTypeColor(d.data.breachType))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', d => {
        if (hoveredSlice && hoveredSlice !== `${d.data.breachType}-${d.data.year}`) {
          return 0.3;
        }
        return 0.8;
      })
      .on('click', (_event, d) => {
        // Toggle filter on click
        if (filter.year === d.data.year && filter.breachType === d.data.breachType) {
          clearFilter();
        } else {
          setFilter({ year: d.data.year, breachType: d.data.breachType });
        }
      })
      .on('mouseover', (event, d) => {
        setHoveredSlice(`${d.data.breachType}-${d.data.year}`);
        d3.select(event.currentTarget).style('opacity', 1);
      })
      .on('mouseout', (_event, _d) => {
        setHoveredSlice(null);
        d3.select(event.currentTarget).style('opacity', 0.8);
      });

    // Add percentage labels on slices
    pieGroup.selectAll('.label')
      .data(pieData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('transform', (d: d3.PieArcDatum<PieSlice>) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text((d: d3.PieArcDatum<PieSlice>) => {
        if (d.data.percentage < 5) return ''; // Don't show label for small slices
        return `${d.data.percentage.toFixed(1)}%`;
      });

    // Add tooltip group (hidden by default)
    const tooltip = g.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    tooltip.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(0, 0, 0, 0.8)');

    const tooltipText = tooltip.append('text')
      .attr('fill', '#fff')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    pieGroup.selectAll('.slice')
      .on('mousemove', (event, d) => {
        const tooltipText_content = `${d.data.breachType} (${d.data.year})\n${d.data.count} records\n${d.data.percentage.toFixed(1)}%`;

        tooltipText.selectAll('tspan').remove();
        tooltipText_content.split('\n').forEach((line, i) => {
          tooltipText.append('tspan')
            .attr('x', 10)
            .attr('dy', i === 0 ? '1.2em' : '1.4em')
            .text(line);
        });

        const bbox = (tooltipText.node() as SVGTextElement)?.getBBox();
        if (bbox) {
          tooltip.select('rect')
            .attr('x', bbox.x - 5)
            .attr('y', bbox.y - 5)
            .attr('width', bbox.width + 10)
            .attr('height', bbox.height + 10);
        }

        tooltip
          .attr('transform', `translate(${event.offsetX + 10},${event.offsetY + 10})`)
          .style('opacity', 1);
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
      });

  }, [data, width, height, filter, setFilter, clearFilter, hoveredSlice]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
};

interface PieSlice {
  breachType: string;
  year: number;
  count: number;
  percentage: number;
}
