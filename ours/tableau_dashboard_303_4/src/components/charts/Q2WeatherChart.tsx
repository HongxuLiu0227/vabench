import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../../contexts/DashboardContext';
import type { ParsedAccidentRecord } from '../../types/data';
import { LIGHT_CONDITIONS_MAP, LIGHT_CONDITIONS_COLORS } from '../../types/constants';
import { DataService } from '../../services/dataService';

interface Q2WeatherChartProps {
  data: ParsedAccidentRecord[];
  width?: number;
  height?: number;
}

export const Q2WeatherChart: React.FC<Q2WeatherChartProps> = ({
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
    return DataService.aggregateQ2Weather(filteredData);
  }, [filteredData]);

  // Get top weather conditions by total count
  const topWeatherConditions = React.useMemo(() => {
    const totals = d3.rollup(
      chartData,
      v => d3.sum(v, d => d.count),
      d => d.Weather_Conditions
    );
    return Array.from(totals, ([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map(d => d.key);
  }, [chartData]);

  // Filter chart data to top weather conditions
  const filteredChartData = React.useMemo(() => {
    return chartData.filter(d => topWeatherConditions.includes(d.Weather_Conditions));
  }, [chartData, topWeatherConditions]);

  useEffect(() => {
    if (!svgRef.current || filteredChartData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 60, right: 80, bottom: 80, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Group by weather condition and light conditions
    const nestedData = d3.rollup(
      filteredChartData,
      v => d3.sum(v, d => d.count),
      d => d.Weather_Conditions,
      d => d.Light_Conditions
    );

    // Get unique light conditions
    const lightConditions = Array.from(
      new Set(filteredChartData.map(d => d.Light_Conditions))
    ).sort();

    // Create scales
    const x0 = d3.scaleBand()
      .domain(topWeatherConditions)
      .range([0, chartWidth])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(lightConditions)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const maxY = d3.max(filteredChartData, d => d.count) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([chartHeight, 0]);

    // Create color scale
    const color = d3.scaleOrdinal()
      .domain(lightConditions)
      .range(lightConditions.map(l => LIGHT_CONDITIONS_COLORS[LIGHT_CONDITIONS_MAP[l] || l] || '#999'));

    // X Axis
    const xAxis = d3.axisBottom(x0);
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '10px');

    // Y Axis
    const yAxis = d3.axisLeft(y);
    g.append('g')
      .call(yAxis)
      .style('font-size', '11px');

    // Create grouped bars
    const groups = g.selectAll('.weather-group')
      .data(topWeatherConditions)
      .enter()
      .append('g')
      .attr('class', 'weather-group')
      .attr('transform', d => `translate(${x0(d)},0)`);

    // Draw bars
    groups.selectAll('.bar')
      .data(d => {
        const lightMap = nestedData.get(d);
        return lightConditions.map(light => ({
          light,
          weather: d,
          count: lightMap?.get(light) || 0
        }));
      })
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x1(d.light) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x1.bandwidth())
      .attr('height', d => chartHeight - y(d.count))
      .attr('fill', d => {
        const lightLabel = LIGHT_CONDITIONS_MAP[d.light] || d.light;
        const c = color(lightLabel);
        return (c as string) || '#999';
      })
      .attr('opacity', d => {
        if (highlight.field === 'Weather_Conditions' && highlight.value !== d.weather) {
          return 0.3;
        }
        if (highlight.field === 'Light_Conditions' && highlight.value !== d.light) {
          return 0.3;
        }
        return 1;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // Toggle filter on weather condition
        const currentFilters = filters.selectedWeatherConditions || [];
        if (currentFilters.includes(d.weather)) {
          setFilter('selectedWeatherConditions', currentFilters.filter(f => f !== d.weather));
        } else {
          setFilter('selectedWeatherConditions', [...currentFilters, d.weather]);
        }
      })
      .on('mouseover', (_event, d) => {
        setHighlight('Weather_Conditions', d.weather, 'Q2_Weather');
      });

    // Add title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#0b2255')
      .text('No. of Accidents in different Weather conditions');

    // Add legend for light conditions (positioned above as per contract)
    const legend = g.append('g')
      .attr('transform', `translate(${chartWidth / 2}, -25)`)
      .attr('text-anchor', 'middle');

    const legendItemWidth = 120;
    const legendSpacing = 10;
    const totalLegendWidth = lightConditions.length * (legendItemWidth + legendSpacing);

    lightConditions.forEach((light, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * (legendItemWidth + legendSpacing) - totalLegendWidth / 2}, 0)`);

      const lightLabel = LIGHT_CONDITIONS_MAP[light] || light;

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', String(color(lightLabel) || '#999'))
        .attr('opacity', () => {
          if (highlight.field === 'Light_Conditions' && highlight.value !== light) {
            return 0.3;
          }
          return 1;
        })
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          // Toggle filter on light condition
          const currentFilters = filters.selectedLightConditions || [];
          if (currentFilters.includes(light)) {
            setFilter('selectedLightConditions', currentFilters.filter(f => f !== light));
          } else {
            setFilter('selectedLightConditions', [...currentFilters, light]);
          }
        });

      legendItem.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .style('font-size', '10px')
        .text(lightLabel.length > 15 ? lightLabel.substring(0, 15) + '...' : lightLabel);
    });

  }, [filteredChartData, topWeatherConditions, width, height, filters, highlight, setFilter, setHighlight]);

  return (
    <div className="q2-weather-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};
