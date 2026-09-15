import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { CitiBikeRecord, StationType, RankType, HighlightState } from '../types';
import { aggregateStationData } from '../services/dataService';
import { getStationColor } from '../utils/colorPalette';
import type { StationData } from '../types';

interface StationBarChartProps {
  data: CitiBikeRecord[];
  title: string;
  stationType: StationType;
  rankType: RankType;
  highlightState?: HighlightState;
  onStationClick?: (stationName: string) => void;
  worksheetName?: string;
}

export function StationBarChart({
  data,
  title,
  stationType,
  rankType,
  highlightState,
  onStationClick,
}: StationBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    return aggregateStationData(data, stationType, rankType);
  }, [data, stationType, rankType]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || chartData.length === 0) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = 380;

    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (band scale for station names)
    const xScale = d3
      .scaleBand()
      .domain(chartData.map((d: StationData) => d.stationName))
      .range([0, width])
      .padding(0.2);

    // Y scale (linear for counts)
    const maxYValue = d3.max(chartData, (d: StationData) => d.count) || 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxYValue * 1.1])
      .range([height, 0]);

    // X axis
    const xAxis = d3.axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '10px')
      .style('font-family', 'Arial, sans-serif');

    // Y axis
    const yAxis = d3.axisLeft(yScale);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Arial, sans-serif');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1);

    // Bars
    const bars = g
      .selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: StationData) => xScale(d.stationName) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', (d: StationData) => getStationColor(d.stationName, stationType))
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .attr('rx', 2)
      .attr('ry', 2);

    // Highlight effect
    if (highlightState?.stationName) {
      bars
        .attr('opacity', (d: StationData) =>
          d.stationName === highlightState.stationName ? 1 : 0.3
        )
        .attr('stroke', (d: StationData) =>
          d.stationName === highlightState.stationName ? '#000' : 'none'
        )
        .attr('stroke-width', (d: StationData) =>
          d.stationName === highlightState.stationName ? 2 : 0
        );
    } else {
      bars.attr('opacity', 1).attr('stroke', 'none');
    }

    // Animation
    bars
      .transition()
      .duration(750)
      .attr('y', (d: StationData) => yScale(d.count))
      .attr('height', (d: StationData) => height - yScale(d.count));

    // Click handlers
    bars.on('click', (event: MouseEvent, d: StationData) => {
      event.stopPropagation();
      if (onStationClick) {
        onStationClick(d.stationName);
      }
    });

    // Labels on bars
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d: StationData) => (xScale(d.stationName) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d: StationData) => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text((d: StationData) => d.count.toLocaleString())
      .style('opacity', 0)
      .transition()
      .delay(500)
      .duration(500)
      .style('opacity', 1);

    // Title
    svg
      .append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .text(title);
  }, [chartData, stationType, highlightState, onStationClick, title]);

  return (
    <div ref={containerRef} className="station-bar-chart" style={{ width: '100%' }}>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '380px',
          display: 'block',
        }}
      />
    </div>
  );
}
