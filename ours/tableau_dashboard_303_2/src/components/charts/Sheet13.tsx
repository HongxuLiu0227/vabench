/**
 * Sheet13: Vertical ranked bar chart showing accidents by weather and road surface conditions
 */
import { useEffect, useRef, useMemo } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { max } from 'd3-array';
import { format } from 'd3-format';
import { ROAD_SURFACE_COLORS } from '../../types/data';
import { aggregateByWeatherSurface } from '../../services/dataService';
import { useDashboard } from '../../context/DashboardContext';

interface Sheet13Props {
  width?: number;
  height?: number;
}

export function Sheet13({ width = 400, height = 300 }: Sheet13Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { weatherFilter, setWeatherFilter, filteredData } = useDashboard();

  // Aggregate data when filtered data changes
  const chartData = useMemo(() => {
    return aggregateByWeatherSurface(filteredData);
  }, [filteredData]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique weather conditions for grouping
    const weatherConditions = Array.from(new Set(chartData.map(d => d.weather)));

    // Get unique road surface conditions
    const roadSurfaces = Array.from(new Set(chartData.map(d => d.road_surface)));

    // Calculate max count for y-axis
    const maxCount = max(chartData, d => d.count) || 0;

    // Create x-scale with grouped bars
    const xScale = scaleBand()
      .domain(weatherConditions)
      .range([0, innerWidth])
      .padding(0.2);

    // Create sub-scale for road surface within each weather condition
    const xSubScale = scaleBand()
      .domain(roadSurfaces)
      .range([0, xScale.bandwidth()])
      .padding(0.05);

    // Create y-scale
    const yScale = scaleLinear()
      .domain([0, maxCount])
      .range([innerHeight, 0])
      .nice();

    // Create x-axis with rotated labels
    const xAxis = axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');

    // Create y-axis
    const yAxis = axisLeft(yScale);
    g.append('g')
      .call(yAxis);

    // Create bars grouped by weather condition and road surface
    chartData.forEach(d => {
      const x = xScale(d.weather);
      const xSub = xSubScale(d.road_surface);

      if (x !== undefined && xSub !== undefined) {
        g.append('rect')
          .attr('class', 'bar')
          .attr('x', x + xSub)
          .attr('y', yScale(d.count))
          .attr('width', xSubScale.bandwidth())
          .attr('height', innerHeight - yScale(d.count))
          .attr('fill', weatherFilter && d.weather !== weatherFilter ? '#cccccc' : ROAD_SURFACE_COLORS[d.road_surface])
          .attr('opacity', weatherFilter && d.weather !== weatherFilter ? 0.3 : 1)
          .style('cursor', 'pointer')
          .on('click', (event) => {
            event.stopPropagation();
            if (weatherFilter === d.weather) {
              setWeatherFilter(null);
            } else {
              setWeatherFilter(d.weather);
            }
          })
          .append('title')
          .text(`Weather: ${d.weather}, Road Surface: ${d.road_surface}, Count: ${format(',d')(d.count)}`);
      }
    });

  }, [chartData, width, height, weatherFilter, setWeatherFilter]);

  // Handle background click to clear filter
  const handleBackgroundClick = () => {
    setWeatherFilter(null);
  };

  return (
    <div onClick={handleBackgroundClick} style={{ cursor: 'pointer' }}>
      <h3 style={{ color: '#0b2255', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
        Impact of Weather and Road Surface Conditions on Number of Accidents
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
      {chartData.length > 0 && (
        <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
          Weather and Road Surface conditions together contribute to most number of accidents
        </div>
      )}
    </div>
  );
}
