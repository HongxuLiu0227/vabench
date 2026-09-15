/**
 * Total Tourism Demand (2014-17) Chart
 * Horizontal ranked bar chart showing tourism demand by location and year
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import type { LocationGroup } from '../../types/data';
import { LOCATION_GROUP_COLORS } from '../../types/data';
import { useDashboard } from '../../context/DashboardContext';

interface TotalDemandChartProps {
  width: number;
  height: number;
}

export function TotalDemandChart({ width, height }: TotalDemandChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, selections, setHoveredLocationGroup } = useDashboard();

  // Prepare and aggregate data
  const chartData = useMemo(() => {
    // Filter by selections
    const filtered = data.filter(d =>
      selections.selectedLocationGroups.includes(d.locationGroup) &&
      selections.selectedIndicators.includes(d.indicator)
    );

    // Aggregate by location and year
    const aggregated = new Map<string, { location: string; locationGroup: LocationGroup; year: number; value: number }>();

    filtered.forEach(d => {
      const key = `${d.location}-${d.year}`;
      const existing = aggregated.get(key);
      if (existing) {
        existing.value += d.value;
      } else {
        aggregated.set(key, {
          location: d.location,
          locationGroup: d.locationGroup,
          year: d.year,
          value: d.value
        });
      }
    });

    return Array.from(aggregated.values()).sort((a, b) => b.value - a.value);
  }, [data, selections]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Margins
    const margin = { top: 20, right: 20, bottom: 60, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (linear)
    const maxValue = Math.max(...chartData.map(d => d.value)) || 0;
    const xScale = scaleLinear()
      .domain([0, maxValue])
      .range([0, innerWidth]);

    // Y scale (band)
    const yScale = scaleBand()
      .domain(chartData.map(d => `${d.location} (${d.year})`))
      .range([0, innerHeight])
      .padding(0.1);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).ticks(5))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'Arial, sans-serif');

    // Y axis
    g.append('g')
      .call(axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'Arial, sans-serif');

    // Axis title
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .text('Total Tourism Demand (In Millions)');

    // Bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(`${d.location} (${d.year})`) || 0)
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        // Dim if not hovered and something is hovered
        if (selections.hoveredLocationGroup && selections.hoveredLocationGroup !== d.locationGroup) {
          return '#e0e0e0';
        }
        return LOCATION_GROUP_COLORS[d.locationGroup];
      })
      .attr('opacity', d => {
        // Highlight hovered
        if (selections.hoveredLocationGroup && selections.hoveredLocationGroup !== d.locationGroup) {
          return 0.3;
        }
        return 1;
      })
      .on('mouseenter', (event, d) => {
        setHoveredLocationGroup(d.locationGroup);
      })
      .on('mouseleave', () => {
        setHoveredLocationGroup(null);
      });

  }, [chartData, width, height, selections, setHoveredLocationGroup]);

  return (
    <div>
      <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
        Total Tourism Demand  (2014-17)
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #e0e0e0', backgroundColor: '#f7faf0' }}
      />
    </div>
  );
}
