import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { select, scaleLinear, max } from 'd3';
import { useDashboard } from '../contexts/DashboardContext';
import { getEndStationLocations } from '../services/dataLoader';

interface Map1Props {
  width?: number;
  height?: number;
}

interface StationData {
  name: string;
  latitude: number;
  longitude: number;
  count: number;
}

export function Map1({ width = 600, height = 400 }: Map1Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const { filteredData, filterState, setFilterState } = useDashboard();
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  // Get end station locations
  const stationData = useMemo(() => {
    const locations = getEndStationLocations(filteredData);
    return Array.from(locations.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [filteredData]);

  // Check if this station is highlighted
  const isHighlighted = useCallback((stationName: string) => {
    return (
      filterState.selectedEndStation === null || filterState.selectedEndStation === stationName
    );
  }, [filterState.selectedEndStation]);

  const handleCircleClick = useCallback((stationName: string) => {
    // Auto-clear behavior: if clicking the same station, clear the filter
    if (filterState.selectedEndStation === stationName) {
      setFilterState({ selectedStation: null, selectedEndStation: null });
    } else {
      setFilterState({ ...filterState, selectedEndStation: stationName });
    }
  }, [filterState, setFilterState]);

  useEffect(() => {
    if (!svgRef.current || stationData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get the bounds of the data with some padding
    const latExtent = [
      Math.min(...stationData.map((d) => d.latitude)) - 0.01,
      Math.max(...stationData.map((d) => d.latitude)) + 0.01,
    ];
    const lonExtent = [
      Math.min(...stationData.map((d) => d.longitude)) - 0.01,
      Math.max(...stationData.map((d) => d.longitude)) + 0.01,
    ];

    // X scale (longitude)
    const xScale = scaleLinear().domain(lonExtent).range([0, innerWidth]);

    // Y scale (latitude)
    const yScale = scaleLinear().domain(latExtent).range([innerHeight, 0]);

    // Size scale based on count
    const maxSize = max(stationData, (d) => d.count) || 1;
    const sizeScale = scaleLinear()
      .domain([1, maxSize])
      .range([5, 25]);

    // X axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Longitude');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Latitude');

    // Circles for stations
    g.selectAll('.station')
      .data(stationData)
      .enter()
      .append('circle')
      .attr('class', 'station')
      .attr('cx', (d: StationData) => xScale(d.longitude))
      .attr('cy', (d: StationData) => yScale(d.latitude))
      .attr('r', (d: StationData) => sizeScale(d.count))
      .attr('fill', (d: StationData) => (isHighlighted(d.name) ? '#2ca02c' : '#d3d3d3'))
      .attr('opacity', (d: StationData) => (isHighlighted(d.name) ? 0.7 : 0.3))
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => handleCircleClick(d.name))
      .on('mouseover', (_event, d) => setHoveredStation(d.name))
      .on('mouseout', () => setHoveredStation(null));

    // Tooltip
    if (hoveredStation) {
      const station = stationData.find((d) => d.name === hoveredStation);
      if (station) {
        g.append('rect')
          .attr('x', xScale(station.longitude) + 10)
          .attr('y', yScale(station.latitude) - 30)
          .attr('width', 150)
          .attr('height', 40)
          .attr('fill', 'white')
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('rx', 5);

        g.append('text')
          .attr('x', xScale(station.longitude) + 15)
          .attr('y', yScale(station.latitude) - 15)
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .text(station.name.length > 20 ? station.name.substring(0, 20) + '...' : station.name);

        g.append('text')
          .attr('x', xScale(station.longitude) + 15)
          .attr('y', yScale(station.latitude))
          .style('font-size', '10px')
          .text(`Count: ${station.count}`);
      }
    }

    // X axis labels
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .selectAll('text')
      .data(xScale.ticks(5))
      .enter()
      .append('text')
      .attr('x', (d: number) => xScale(d))
      .attr('y', 15)
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .text((d: number) => d.toFixed(4));

    // Y axis labels
    g.append('g')
      .selectAll('text')
      .data(yScale.ticks(5))
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', (d: number) => yScale(d))
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .text((d: number) => d.toFixed(4));

  }, [stationData, width, height, filterState.selectedEndStation, hoveredStation, isHighlighted, handleCircleClick]);

  if (stationData.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Popularity of End Station</h3>
      <div style={{ position: 'relative' }}>
        <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
      </div>
      {/* Legend */}
      <div
        ref={legendRef}
        style={{
          position: 'absolute',
          top: '60%',
          left: '75%',
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '11px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Count</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="60" height="60">
            <circle cx="10" cy="50" r="3" fill="#2ca02c" opacity={0.7} />
            <circle cx="10" cy="35" r="8" fill="#2ca02c" opacity={0.7} />
            <circle cx="10" cy="10" r="15" fill="#2ca02c" opacity={0.7} />
          </svg>
          <div>
            <div>Low</div>
            <div>High</div>
          </div>
        </div>
      </div>
    </div>
  );
}
