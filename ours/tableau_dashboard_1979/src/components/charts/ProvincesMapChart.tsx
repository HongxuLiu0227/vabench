/**
 * Provinces with Highest Demand (2017) Map Chart
 * Map visualization showing tourism demand by province
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import { select } from 'd3-selection';
import { LOCATION_GROUP_COLORS } from '../../types/data';
import { useDashboard } from '../../context/DashboardContext';

interface ProvincesMapChartProps {
  width: number;
  height: number;
}

// Approximate coordinates for Canadian provinces
const PROVINCE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'Alberta': { lat: 55, lon: -115 },
  'British Columbia': { lat: 51, lon: -125 },
  'Ontario': { lat: 50, lon: -86 },
  'Quebec': { lat: 52, lon: -71 },
  'Manitoba': { lat: 57, lon: -98 },
  'Saskatchewan': { lat: 55, lon: -106 },
  'Newfoundland and Labrador': { lat: 50, lon: -56 },
  'New Brunswick': { lat: 46, lon: -66 },
  'Nova Scotia': { lat: 45, lon: -63 },
  'Prince Edward Island': { lat: 46, lon: -63 },
  'Northwest Territories': { lat: 65, lon: -115 },
  'Yukon': { lat: 64, lon: -135 },
  'Nunavut': { lat: 70, lon: -85 },
  'Canada': { lat: 60, lon: -100 }
};

export function ProvincesMapChart({ width, height }: ProvincesMapChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data } = useDashboard();

  // Prepare map data for 2017
  const mapData = useMemo(() => {
    const filtered = data.filter(d =>
      d.indicator === 'Total demand' &&
      d.year === 2017
    );

    // Aggregate by location
    const aggregated = new Map<string, number>();
    filtered.forEach(d => {
      aggregated.set(d.location, (aggregated.get(d.location) || 0) + d.value);
    });

    return Array.from(aggregated.entries())
      .map(([location, value]) => ({
        location,
        value,
        ...PROVINCE_COORDINATES[location] || PROVINCE_COORDINATES['Canada']
      }))
      .filter(d => d.value > 0);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || mapData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Projection to map lat/lon to SVG coordinates
    const lonExtent = [-140, -50];
    const latExtent = [40, 70];

    const xScale = scaleLinear()
      .domain(lonExtent)
      .range([40, width - 40]);

    const yScale = scaleLinear()
      .domain(latExtent)
      .range([height - 40, 40]);

    const sizeScale = scaleSqrt()
      .domain([0, Math.max(...mapData.map(d => d.value))])
      .range([5, Math.min(width, height) / 8]);

    // Draw simple map background (Canada outline approximation)
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#e8f4f8');

    // Draw circles for each province
    svg.selectAll('.province')
      .data(mapData)
      .enter()
      .append('circle')
      .attr('class', 'province')
      .attr('cx', d => xScale(d.lon))
      .attr('cy', d => yScale(d.lat))
      .attr('r', d => sizeScale(d.value))
      .attr('fill', d => LOCATION_GROUP_COLORS[d.location as keyof typeof LOCATION_GROUP_COLORS] || '#c7c7c7')
      .attr('opacity', 0.7)
      .attr('stroke', '#666')
      .attr('stroke-width', 1);

    // Add labels
    svg.selectAll('.label')
      .data(mapData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.lon))
      .attr('y', d => yScale(d.lat) + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('font-family', 'Arial, sans-serif')
      .style('fill', '#333')
      .text(d => d.location);

  }, [mapData, width, height]);

  return (
    <div>
      <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
        Provinces with Highest Tourism Demand
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
