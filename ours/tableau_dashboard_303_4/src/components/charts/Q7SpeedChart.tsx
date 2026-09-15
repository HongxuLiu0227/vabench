import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../../contexts/DashboardContext';
import type { ParsedAccidentRecord } from '../../types/data';
import { ACCIDENT_SEVERITY_MAP, SPEED_LIMIT_COLORS } from '../../types/constants';
import { DataService } from '../../services/dataService';

interface Q7SpeedChartProps {
  data: ParsedAccidentRecord[];
  width?: number;
  height?: number;
}

export const Q7SpeedChart: React.FC<Q7SpeedChartProps> = ({
  data,
  width = 400,
  height = 300
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setFilter, highlight, setHighlight } = useDashboard();

  // Get filtered data
  const filteredData = React.useMemo(() => {
    return DataService.filterData(data, {
      selectedLightConditions: filters.selectedLightConditions,
      selectedSpeedLimits: filters.selectedSpeedLimits,
      selectedWeatherConditions: filters.selectedWeatherConditions,
      selectedRoadSurfaceConditions: filters.selectedRoadSurfaceConditions,
      selectedAccidentSeverities: filters.selectedAccidentSeverities,
      selectedDayOfWeek: filters.selectedDayOfWeek
    });
  }, [data, filters]);

  // Aggregate data
  const chartData = React.useMemo(() => {
    return DataService.aggregateQ7Speed(filteredData);
  }, [filteredData]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 60, right: 50, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique severities and speed limits
    const severities = ['1', '2', '3']; // Order: Fatal, Serious, Slight
    const speedLimits = Array.from(new Set(chartData.map(d => d.Speed_limit))).sort();

    // Create scales
    const x = d3.scalePoint()
      .domain(severities.map(s => ACCIDENT_SEVERITY_MAP[s]))
      .range([0, chartWidth])
      .padding(0.5);

    const maxY = d3.max(chartData, d => d.casualties) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([chartHeight, 0]);

    // Color scale for speed limits
    const color = d3.scaleOrdinal()
      .domain(speedLimits)
      .range(speedLimits.map(s => SPEED_LIMIT_COLORS[s] || '#999'));

    // Group data by speed limit
    const nestedData = d3.rollup(
      chartData,
      v => {
        const map = new Map<string, number>();
        v.forEach(d => {
          const severityLabel = ACCIDENT_SEVERITY_MAP[d.Accident_Severity];
          map.set(severityLabel, d.casualties);
        });
        return map;
      },
      d => d.Speed_limit
    );

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .style('font-size', '11px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .style('font-size', '11px');

    // Draw lines for each speed limit
    nestedData.forEach((severityMap, speed) => {
      const lineData = severities.map(s => ACCIDENT_SEVERITY_MAP[s]);
      const lineGenerator = d3.line<string>()
        .defined(d => {
          const val = severityMap.get(d);
          return val !== undefined && val > 0;
        })
        .x(d => x(d) || 0)
        .y(d => y(severityMap.get(d) || 0))
        .curve(d3.curveMonotoneX);

      // Draw line
      g.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', (color(speed) as string) || '#999')
        .attr('stroke-width', () => {
          if (highlight.field === 'Speed_limit' && highlight.value !== speed) {
            return 1.5;
          }
          return 2.5;
        })
        .attr('opacity', () => {
          if (highlight.field === 'Speed_limit' && highlight.value !== speed) {
            return 0.3;
          }
          return 1;
        })
        .attr('d', lineGenerator)
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          // Toggle filter on speed limit
          const currentFilters = filters.selectedSpeedLimits || [];
          if (currentFilters.includes(speed)) {
            setFilter('selectedSpeedLimits', currentFilters.filter(f => f !== speed));
          } else {
            setFilter('selectedSpeedLimits', [...currentFilters, speed]);
          }
        })
        .on('mouseover', () => {
          setHighlight('Speed_limit', speed, 'Q7_Speed');
        });

      // Draw points
      lineData.forEach(severity => {
        const casualties = severityMap.get(severity);
        if (casualties && casualties > 0) {
          g.append('circle')
            .attr('cx', x(severity) || 0)
            .attr('cy', y(casualties) || 0)
            .attr('r', 4)
            .attr('fill', (color(speed) as string) || '#999')
            .attr('opacity', () => {
              if (highlight.field === 'Speed_limit' && highlight.value !== speed) {
                return 0.3;
              }
              return 1;
            })
            .style('cursor', 'pointer')
            .on('click', (event) => {
              event.stopPropagation();
              const currentFilters = filters.selectedSpeedLimits || [];
              if (currentFilters.includes(speed)) {
                setFilter('selectedSpeedLimits', currentFilters.filter(f => f !== speed));
              } else {
                setFilter('selectedSpeedLimits', [...currentFilters, speed]);
              }
            });
        }
      });
    });

    // Add title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#0b2255')
      .text('Effect of Speed on Number of Accidents');

    // Add legend (positioned above as per contract)
    const legend = g.append('g')
      .attr('transform', `translate(${chartWidth / 2}, -25)`)
      .attr('text-anchor', 'middle');

    const legendItemWidth = 80;
    const legendSpacing = 10;
    const totalLegendWidth = speedLimits.length * (legendItemWidth + legendSpacing);

    speedLimits.forEach((speed, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * (legendItemWidth + legendSpacing) - totalLegendWidth / 2}, 0)`);

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', (color(speed) as string) || '#999')
        .attr('opacity', () => {
          if (highlight.field === 'Speed_limit' && highlight.value !== speed) {
            return 0.3;
          }
          return 1;
        })
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          const currentFilters = filters.selectedSpeedLimits || [];
          if (currentFilters.includes(speed)) {
            setFilter('selectedSpeedLimits', currentFilters.filter(f => f !== speed));
          } else {
            setFilter('selectedSpeedLimits', [...currentFilters, speed]);
          }
        });

      legendItem.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .style('font-size', '10px')
        .text(speed === '-1' ? 'Unknown' : `${speed} mph`);
    });

  }, [chartData, width, height, filters, highlight, setFilter, setHighlight]);

  return (
    <div className="q7-speed-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};
