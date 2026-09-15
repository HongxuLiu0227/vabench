import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scaleSqrt, scaleSequential } from 'd3-scale';
import { max, min } from 'd3-array';
import { interpolateOranges } from 'd3-scale-chromatic';
import type { NumberValue } from 'd3';
import type { TripData } from '../types/tripData';
import type { StationAggregation } from '../types/tripData';
import { aggregateEndStations } from '../services/dataAggregator';
import './EndStationMap.css';

interface EndStationMapProps {
  data: TripData[];
  selectedStation: string | null;
  onStationClick: (stationName: string) => void;
}

const EndStationMap: React.FC<EndStationMapProps> = ({
  data,
  selectedStation,
  onStationClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [aggregatedData, setAggregatedData] = useState<StationAggregation[]>([]);

  useEffect(() => {
    const aggregated = aggregateEndStations(data);
    setAggregatedData(aggregated);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || aggregatedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get data bounds
    const lonExtent = [
      min(aggregatedData, d => d.longitude) || -74.1,
      max(aggregatedData, d => d.longitude) || -74.0,
    ] as [number, number];
    const latExtent = [
      min(aggregatedData, d => d.latitude) || 40.7,
      max(aggregatedData, d => d.latitude) || 40.75,
    ] as [number, number];
    const countExtent = [
      0,
      max(aggregatedData, d => d.count) || 100,
    ] as [number, number];

    // Add padding to lon/lat extents
    const lonPadding = (lonExtent[1] - lonExtent[0]) * 0.05;
    const latPadding = (latExtent[1] - latExtent[0]) * 0.05;

    // Create scales
    const xScale = scaleLinear()
      .domain([lonExtent[0] - lonPadding, lonExtent[1] + lonPadding])
      .range([0, width]);

    const yScale = scaleLinear()
      .domain([latExtent[0] - latPadding, latExtent[1] + latPadding])
      .range([height, 0]);

    const sizeScale = scaleSqrt()
      .domain(countExtent)
      .range([4, 30]);

    // Color scale (orange palette)
    const colorScale = scaleSequential(t => interpolateOranges(t / 0.8 + 0.2))
      .domain(countExtent);

    // Add axes
    const xAxis = axisBottom(xScale)
      .ticks(5)
      .tickFormat((d: NumberValue) => d.valueOf().toFixed(4));

    const yAxis = axisLeft(yScale)
      .ticks(5)
      .tickFormat((d: NumberValue) => d.valueOf().toFixed(4));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add circles for each station
    const circles = g
      .selectAll('.station-circle')
      .data(aggregatedData)
      .enter()
      .append('g')
      .attr('class', 'station-group');

    circles
      .append('circle')
      .attr('class', 'station-circle')
      .attr('cx', d => xScale(d.longitude))
      .attr('cy', d => yScale(d.latitude))
      .attr('r', d => sizeScale(d.count))
      .attr('fill', d => colorScale(d.count))
      .attr('fill-opacity', 0.7)
      .attr('stroke', d =>
        selectedStation && d.stationName === selectedStation ? '#000' : 'none'
      )
      .attr('stroke-width', selectedStation ? 2 : 0)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onStationClick(d.stationName);
      })
      .on('mouseover', function() {
        d3.select(this)
          .attr('fill-opacity', 0.9);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('fill-opacity', 0.7);
      });

    // Add labels for stations (only for larger stations to avoid clutter)
    const labelThreshold = max(aggregatedData, d => d.count)! * 0.3;
    circles
      .filter(d => d.count > labelThreshold)
      .append('text')
      .attr('x', d => xScale(d.longitude))
      .attr('y', d => yScale(d.latitude))
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('class', 'station-label')
      .style('font-size', '10px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => d.stationName);

    // Click on background to clear selection
    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        onStationClick('');
      }
    });

  }, [aggregatedData, selectedStation, onStationClick]);

  return (
    <div className="end-station-map">
      <h3 className="chart-title">End Station Map</h3>
      <svg ref={svgRef} className="map-svg"></svg>
    </div>
  );
};

export default EndStationMap;
