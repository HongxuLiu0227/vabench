import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ParsedGameData, TimeSeriesPoint } from '../types';
import { aggregateByMonth, filterData } from '../utils/dataTransformations';
import { useFilter } from '../contexts/FilterContext';

interface GameMetaChartProps {
  data: ParsedGameData[];
  width?: number;
  height?: number;
}

export function GameMetaChart({ data, width = 800, height = 350 }: GameMetaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { selection, toggleGame } = useFilter();
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);

  // Prepare time series data
  useEffect(() => {
    const filtered = filterData(data, selection.games, selection.platforms);
    const aggregated = aggregateByMonth(filtered);
    setTimeSeriesData(aggregated);
  }, [data, selection]);

  // Render the chart
  useEffect(() => {
    if (!svgRef.current || timeSeriesData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scalePoint()
      .domain(timeSeriesData.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(timeSeriesData, (d) => d.avgMetascore) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Create line generator
    const line = d3
      .line<TimeSeriesPoint>()
      .x((d) => xScale(d.month) ?? 0)
      .y((d) => yScale(d.avgMetascore))
      .curve(d3.curveMonotoneX);

    // Create area generator
    const area = d3
      .area<TimeSeriesPoint>()
      .x((d) => xScale(d.month) ?? 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.avgMetascore))
      .curve(d3.curveMonotoneX);

    // Add gradient for area
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4e79a7')
      .attr('stop-opacity', 0.3);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4e79a7')
      .attr('stop-opacity', 0.05);

    // Draw area
    g.append('path')
      .datum(timeSeriesData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Draw line
    g.append('path')
      .datum(timeSeriesData)
      .attr('fill', 'none')
      .attr('stroke', '#4e79a7')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Draw points
    g.selectAll('.point')
      .data(timeSeriesData)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d) => xScale(d.month) ?? 0)
      .attr('cy', (d) => yScale(d.avgMetascore))
      .attr('r', 4)
      .attr('fill', '#4e79a7')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        // Select all games for this month
        d.games.forEach((game) => toggleGame(game));
      })
      .on('mouseover', function() {
        d3.select(this).attr('r', 6);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4);
      });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '11px')
      .style('fill', '#666');

    // Remove x-axis line
    g.select('.domain').remove();

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(8))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#666');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Average Metascore');

    // X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Month of release');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Games');

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(255, 255, 255, 0.95)')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('z-index', '1000');

    g.selectAll('.point')
      .on('mouseover', function(_event, d) {
        const data = d as TimeSeriesPoint;
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="font-weight: bold; margin-bottom: 4px;">${data.monthLabel}</div>
            <div>Avg Metascore: ${data.avgMetascore.toFixed(1)}</div>
            <div>Games: ${data.games.length}</div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
      });

    return () => {
      tooltip.remove();
    };
  }, [timeSeriesData, width, height, toggleGame]);

  return (
    <div className="game-meta-chart">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
