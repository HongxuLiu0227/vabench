/**
 * Provincial Tourism Growth Rates (2014-17) Chart
 * Horizontal bar chart showing growth rates by province
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import type { LocationGroup } from '../../types/data';
import { LOCATION_GROUP_COLORS } from '../../types/data';
import { useDashboard } from '../../context/DashboardContext';

interface GrowthRatesChartProps {
  width: number;
  height: number;
}

export function GrowthRatesChart({ width, height }: GrowthRatesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, selections, setHoveredLocationGroup } = useDashboard();

  // Prepare growth rate data
  const chartData = useMemo(() => {
    // Filter by total demand only
    const filtered = data.filter(d =>
      d.indicator === 'Total demand' &&
      selections.selectedLocationGroups.includes(d.locationGroup)
    );

    // Aggregate by location and year
    const yearlyData = new Map<string, number>();
    filtered.forEach(d => {
      const key = `${d.location}-${d.year}`;
      yearlyData.set(key, (yearlyData.get(key) || 0) + d.value);
    });

    // Calculate growth rates
    const growthRates: { location: string; locationGroup: LocationGroup; growthRate: number }[] = [];
    const locations = Array.from(new Set(filtered.map(d => d.location)));
    const years = [2014, 2015, 2016, 2017];

    locations.forEach(location => {
      const group = filtered.find(d => d.location === location)?.locationGroup || 'Other';
      let totalGrowth = 0;
      let count = 0;

      for (let i = 1; i < years.length; i++) {
        const prevValue = yearlyData.get(`${location}-${years[i - 1]}`) || 0;
        const currValue = yearlyData.get(`${location}-${years[i]}`) || 0;

        if (prevValue > 0) {
          totalGrowth += ((currValue - prevValue) / prevValue) * 100;
          count++;
        }
      }

      if (count > 0) {
        growthRates.push({
          location,
          locationGroup: group,
          growthRate: totalGrowth / count
        });
      }
    });

    return growthRates.sort((a, b) => b.growthRate - a.growthRate);
  }, [data, selections]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxValue = Math.max(...chartData.map(d => d.growthRate)) || 0;
    const minValue = Math.min(...chartData.map(d => d.growthRate)) || 0;

    const xScale = scaleLinear()
      .domain([Math.min(0, minValue), Math.max(0, maxValue)])
      .range([0, innerWidth]);

    const yScale = scaleBand()
      .domain(chartData.map(d => d.location))
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

    // Axis titles
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .text('Year (2014 - 2017)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -100)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .text('Tourism Demand Growth Rates');

    // Bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.location) || 0)
      .attr('width', d => xScale(Math.max(0, d.growthRate)))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        if (selections.hoveredLocationGroup && selections.hoveredLocationGroup !== d.locationGroup) {
          return '#e0e0e0';
        }
        return LOCATION_GROUP_COLORS[d.locationGroup];
      })
      .attr('opacity', d => {
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
        Provinical Tourism Growth Rates
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
