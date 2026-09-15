import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../../contexts/DashboardContext';
import type { ParsedAccidentRecord } from '../../types/data';
import { WEATHER_CONDITIONS_MAP, WEATHER_CONDITIONS_COLORS } from '../../types/constants';
import { DataService } from '../../services/dataService';

interface Sheet28ChartProps {
  data: ParsedAccidentRecord[];
  width?: number;
  height?: number;
}

interface AggregatedData {
  Speed_limit: string;
  Weather_Conditions: string;
  Light_Conditions: string;
  count: number;
}

export const Sheet28Chart: React.FC<Sheet28ChartProps> = ({
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

  // Aggregate data by speed limit and weather condition
  const chartData = React.useMemo(() => {
    const grouped = d3.rollup(
      filteredData,
      v => v.length,
      d => d.Speed_limit,
      d => d.Weather_Conditions
    );

    const result: AggregatedData[] = [];
    grouped.forEach((weatherMap, speed) => {
      weatherMap.forEach((count, weather) => {
        result.push({
          Speed_limit: speed,
          Weather_Conditions: weather,
          Light_Conditions: '',
          count
        });
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }, [filteredData]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 100, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique values
    const speedLimits = Array.from(new Set(chartData.map(d => d.Speed_limit))).sort();
    const weatherConditions = Array.from(new Set(chartData.map(d => d.Weather_Conditions)));

    // For each speed limit, show top weather condition
    const topWeatherBySpeed = new Map<string, AggregatedData>();
    speedLimits.forEach(speed => {
      const speedData = chartData.filter(d => d.Speed_limit === speed);
      speedData.sort((a, b) => b.count - a.count);
      if (speedData.length > 0) {
        topWeatherBySpeed.set(speed, speedData[0]);
      }
    });

    const plotData = Array.from(topWeatherBySpeed.values()).sort((a, b) => b.count - a.count);

    // Create scales
    const y = d3.scaleBand()
      .domain(plotData.map(d => d.Speed_limit === '-1' ? 'Unknown' : d.Speed_limit))
      .range([0, chartHeight])
      .padding(0.2);

    const maxX = d3.max(plotData, d => d.count) || 0;
    const x = d3.scaleLinear()
      .domain([0, maxX * 1.1])
      .range([0, chartWidth]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(weatherConditions)
      .range(weatherConditions.map(w => {
        const label = WEATHER_CONDITIONS_MAP[w] || w;
        return WEATHER_CONDITIONS_COLORS[label] || '#999';
      }));

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .style('font-size', '11px');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .style('font-size', '11px');

    // Draw bars
    g.selectAll('.bar')
      .data(plotData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => {
        const label = d.Speed_limit === '-1' ? 'Unknown' : d.Speed_limit;
        return y(label) || 0;
      })
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.count))
      .attr('fill', d => {
        const label = WEATHER_CONDITIONS_MAP[d.Weather_Conditions] || d.Weather_Conditions;
        const c = color(label);
        return (c as string) || '#999';
      })
      .attr('opacity', d => {
        if (highlight.field === 'Weather_Conditions' && highlight.value !== d.Weather_Conditions) {
          return 0.3;
        }
        if (highlight.field === 'Speed_limit' && highlight.value !== d.Speed_limit) {
          return 0.3;
        }
        return 1;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // Toggle filter on speed limit
        const currentFilters = filters.selectedSpeedLimits || [];
        if (currentFilters.includes(d.Speed_limit)) {
          setFilter('selectedSpeedLimits', currentFilters.filter(f => f !== d.Speed_limit));
        } else {
          setFilter('selectedSpeedLimits', [...currentFilters, d.Speed_limit]);
        }
      })
      .on('mouseover', (_event, d) => {
        setHighlight('Weather_Conditions', d.Weather_Conditions, 'Sheet 28');
        setHighlight('Speed_limit', d.Speed_limit, 'Sheet 28');
      });

    // Add value labels
    g.selectAll('.label')
      .data(plotData)
      .enter()
      .append('text')
      .attr('x', d => x(d.count) + 5)
      .attr('y', d => {
        const label = d.Speed_limit === '-1' ? 'Unknown' : d.Speed_limit;
        return (y(label) || 0) + y.bandwidth() / 2;
      })
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => d.count.toLocaleString());

    // Add title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#0b2255')
      .text('Effect of Light condition, Speed and Weather on Number of Accidents');

    // Add legend for weather conditions
    const legend = g.append('g')
      .attr('transform', `translate(${chartWidth + 10}, 20)`);

    const uniqueWeatherInData = Array.from(new Set(plotData.map(d => d.Weather_Conditions)));
    uniqueWeatherInData.forEach((weather, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      const label = WEATHER_CONDITIONS_MAP[weather] || weather;

      legendRow.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', (color(label) as string) || '#999')
        .attr('opacity', () => {
          if (highlight.field === 'Weather_Conditions' && highlight.value !== weather) {
            return 0.3;
          }
          return 1;
        });

      legendRow.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .style('font-size', '9px')
        .text(label.length > 15 ? label.substring(0, 15) + '...' : label);
    });

  }, [chartData, width, height, filters, highlight, setFilter, setHighlight]);

  return (
    <div className="sheet-28-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};
