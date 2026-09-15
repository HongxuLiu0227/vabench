import { useEffect, useRef, useMemo } from 'react';
import { scaleLinear, scaleSqrt, scaleSequential } from 'd3-scale';
import { select } from 'd3-selection';
import { interpolateOranges } from 'd3-scale-chromatic';
import type { StationData } from '../types';

interface CitymapScatterProps {
  data: StationData[];
  title: string;
  width: number;
  height: number;
  highlightedStation?: string | null;
  showLegend?: boolean;
}

export function CitymapScatter({
  data,
  title,
  width,
  height,
  highlightedStation,
  showLegend = false,
}: CitymapScatterProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const margin = useMemo(() => ({ top: 40, right: showLegend ? 120 : 20, bottom: 40, left: 60 }), [showLegend]);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Filter out invalid coordinates
  const validData = useMemo(() => {
    return data.filter(d => d.latitude !== undefined && d.longitude !== undefined);
  }, [data]);

  // Create projection
  const projection = useMemo(() => {
    if (validData.length === 0) return null;

    const lons = validData.map(d => d.longitude!);
    const lats = validData.map(d => d.latitude!);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const lonRange = maxLon - minLon || 1;
    const latRange = maxLat - minLat || 1;

    // Add padding
    const lonPadding = lonRange * 0.1;
    const latPadding = latRange * 0.1;

    return {
      minLon: minLon - lonPadding,
      maxLon: maxLon + lonPadding,
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
    };
  }, [validData]);

  // Scale functions
  const xScale = useMemo(() => {
    if (!projection) return null;
    return scaleLinear()
      .domain([projection.minLon, projection.maxLon])
      .range([0, innerWidth]);
  }, [projection, innerWidth]);

  const yScale = useMemo(() => {
    if (!projection) return null;
    return scaleLinear()
      .domain([projection.minLat, projection.maxLat])
      .range([innerHeight, 0]); // Flip Y axis
  }, [projection, innerHeight]);

  // Size scale
  const sizeScale = useMemo(() => {
    const maxCount = Math.max(...validData.map(d => d.count), 1);
    return scaleSqrt()
      .domain([1, maxCount])
      .range([4, 20]);
  }, [validData]);

  // Color scale (orange gradient based on count)
  const colorScale = useMemo(() => {
    const maxCount = Math.max(...validData.map(d => d.count), 1);
    return scaleSequential()
      .domain([1, maxCount])
      .interpolator(interpolateOranges);
  }, [validData]);

  // Legend scale for continuous color bar
  const legendScale = useMemo(() => {
    if (!showLegend) return null;
    const maxCount = Math.max(...validData.map(d => d.count), 1);
    return scaleLinear()
      .domain([0, 100])  // Height of legend in pixels
      .range([1, maxCount]);
  }, [validData, showLegend]);

  useEffect(() => {
    if (!svgRef.current || !xScale || !yScale || validData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Background (light gray to represent map)
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', '#f5f5f5');

    // Grid lines
    g.append('g')
      .attr('class', 'grid-x')
      .selectAll('line')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#ddd')
      .attr('stroke-dasharray', '3,3');

    g.append('g')
      .attr('class', 'grid-y')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('stroke', '#ddd')
      .attr('stroke-dasharray', '3,3');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Add X axis labels manually
    xScale.ticks(5).forEach((tick) => {
      g.append('text')
        .attr('x', xScale(tick))
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .attr('font-size', '10px')
        .text(tick.toFixed(4));
    });

    // Add Y axis labels manually
    yScale.ticks(5).forEach((tick) => {
      g.append('text')
        .attr('x', -5)
        .attr('y', yScale(tick) + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#666')
        .attr('font-size', '10px')
        .text(tick.toFixed(4));
    });

    // Axis titles
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Longitude');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Latitude');

    // Circles (stations)
    g.selectAll('.station')
      .data(validData)
      .enter()
      .append('circle')
      .attr('class', 'station')
      .attr('cx', d => xScale(d.longitude!))
      .attr('cy', d => yScale(d.latitude!))
      .attr('r', 0)
      .attr('fill', d => {
        if (highlightedStation && d.stationName !== highlightedStation) {
          return '#d0d0d0';
        }
        return colorScale(d.count);
      })
      .attr('fill-opacity', 0.8)
      .attr('stroke', d => {
        if (highlightedStation && d.stationName === highlightedStation) {
          return '#333';
        }
        return 'none';
      })
      .attr('stroke-width', d => {
        if (highlightedStation && d.stationName === highlightedStation) {
          return 2;
        }
        return 0;
      })
      .on('mouseover', function(_event, d) {
        select(this)
          .transition().duration(100)
          .attr('fill-opacity', 1)
          .attr('r', sizeScale(d.count) * 1.3);
      })
      .on('mouseout', function(_event, d) {
        select(this)
          .transition().duration(100)
          .attr('fill-opacity', 0.8)
          .attr('r', sizeScale(d.count));
      })
      .transition()
      .duration(500)
      .attr('r', d => sizeScale(d.count));

    // Tooltip
    const tooltip = g.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .attr('pointer-events', 'none');

    tooltip.append('rect')
      .attr('class', 'tooltip-bg')
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
      .attr('rx', 4);

    tooltip.append('text')
      .attr('class', 'tooltip-text')
      .attr('fill', 'white')
      .attr('font-size', '11px');

    // Show tooltip on hover
    g.selectAll('.station')
      .on('mouseenter', function(_event, d) {
        const stationData = d as StationData;
        const lines = [
          `${stationData.stationName}`,
          `Lat: ${stationData.latitude?.toFixed(4)}`,
          `Lon: ${stationData.longitude?.toFixed(4)}`,
          `Trips: ${stationData.count.toLocaleString()}`
        ];

        tooltip.select('.tooltip-text')
          .attr('y', 14)
          .selectAll('tspan')
          .data(lines)
          .enter()
          .append('tspan')
          .attr('x', 10)
          .attr('dy', (_d, i) => i * 14)
          .text(d => d);

        const maxLineLength = Math.max(...lines.map(l => l.length));
        tooltip.select('.tooltip-bg')
          .attr('width', maxLineLength * 7 + 20)
          .attr('height', lines.length * 14 + 10);

        const [x, y] = [xScale(stationData.longitude!) + 10, yScale(stationData.latitude!)];
        tooltip.attr('transform', `translate(${x}, ${y})`)
          .style('opacity', 1);
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      });

    // Draw legend (color scale) on the right side
    if (showLegend && legendScale) {
      const legendWidth = 15;
      const legendHeight = 100;
      const legendX = innerWidth + 10;
      const legendY = 20;

      // Legend title
      g.append('text')
        .attr('x', legendX + legendWidth / 2)
        .attr('y', legendY - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('Number of Trips');

      // Create gradient definition for legend
      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');

      // Add gradient stops
      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        const value = i / numStops;
        const color = interpolateOranges(value);
        linearGradient.append('stop')
          .attr('offset', `${value * 100}%`)
          .attr('stop-color', color);
      }

      // Draw legend rectangle
      g.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)')
        .style('stroke', '#ccc')
        .style('stroke-width', '0.5');

      // Add legend ticks
      const maxCount = Math.max(...validData.map(d => d.count), 1);
      const legendTicks = 5;
      for (let i = 0; i <= legendTicks; i++) {
        const value = i / legendTicks;
        const count = Math.round(value * (maxCount - 1) + 1);
        const yPos = legendY + legendHeight * (1 - value);

        // Tick mark
        g.append('line')
          .attr('x1', legendX + legendWidth)
          .attr('x2', legendX + legendWidth + 5)
          .attr('y1', yPos)
          .attr('y2', yPos)
          .attr('stroke', '#666')
          .attr('stroke-width', '1');

        // Tick label
        g.append('text')
          .attr('x', legendX + legendWidth + 8)
          .attr('y', yPos + 4)
          .attr('text-anchor', 'start')
          .attr('fill', '#333')
          .attr('font-size', '10px')
          .text(count.toLocaleString());
      }
    }

  }, [validData, xScale, yScale, sizeScale, colorScale, innerWidth, innerHeight, margin, highlightedStation, showLegend, legendScale]);

  return (
    <div className="chart-container">
      <h3 className="chart-title" style={{ textAlign: 'center', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
        {title}
      </h3>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}
