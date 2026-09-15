/**
 * Sheet 28: Horizontal ranked bar chart showing speed limits with weather (color) and light conditions (size)
 */
import { useEffect, useRef, useMemo } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { max } from 'd3-array';
import { format } from 'd3-format';
import type { WeatherCondition, LightConditionsGroup } from '../../types/data';
import { WEATHER_COLORS, LIGHT_CONDITION_GROUP_THICKNESS } from '../../types/data';
import { aggregateBySpeedWeatherLight } from '../../services/dataService';
import { useDashboard } from '../../context/DashboardContext';

interface Sheet28Props {
  width?: number;
  height?: number;
}

interface SpeedWeatherData {
  speed_limit: number;
  weather: WeatherCondition;
  light_condition: LightConditionsGroup;
  count: number;
}

export function Sheet28({ width = 600, height = 300 }: Sheet28Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { weatherFilter, setWeatherFilter, filteredData } = useDashboard();

  // Aggregate data when filtered data changes
  const chartData = useMemo(() => {
    const aggregated = aggregateBySpeedWeatherLight(filteredData);
    // Group by speed_limit and sum counts for all weather/light combinations
    const speedMap = new Map<number, SpeedWeatherData[]>();
    aggregated.forEach(d => {
      if (!speedMap.has(d.speed_limit)) {
        speedMap.set(d.speed_limit, []);
      }
      speedMap.get(d.speed_limit)!.push(d);
    });

    // Get top speed limits by total count
    const speedTotals = Array.from(speedMap.entries()).map(([speed, items]) => ({
      speed,
      total: items.reduce((sum, item) => sum + item.count, 0)
    })).sort((a, b) => b.total - a.total).slice(0, 10);

    // Get all data for top speed limits
    const topSpeeds = new Set(speedTotals.map(s => s.speed));
    return aggregated.filter(d => topSpeeds.has(d.speed_limit));
  }, [filteredData]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique speed limits for y-axis
    const speedLimits = Array.from(new Set(chartData.map(d => d.speed_limit))).sort((a, b) => a - b);

    // Group data by speed limit for display
    const groupedData = speedLimits.map(speed => ({
      speed,
      items: chartData.filter(d => d.speed_limit === speed)
    }));

    // Calculate max count for x-axis
    const maxCount = max(chartData, d => d.count) || 0;

    // Create scales
    const yScale = scaleBand()
      .domain(speedLimits.map(s => s.toString()))
      .range([0, innerHeight])
      .padding(0.3);

    const xScale = scaleLinear()
      .domain([0, maxCount])
      .range([0, innerWidth])
      .nice();

    // Create x-axis
    const xAxis = axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Create y-axis
    const yAxis = axisLeft(yScale);
    g.append('g')
      .call(yAxis);

    // Create bars - stack weather conditions for each speed limit
    groupedData.forEach(({ speed, items }) => {
      const y = yScale(speed.toString());
      const barHeight = yScale.bandwidth();

      // Calculate offsets for stacking bars by weather
      let currentOffset = 0;
      items.forEach(item => {
        const barWidth = xScale(item.count);

        g.append('rect')
          .attr('class', 'bar')
          .attr('x', currentOffset)
          .attr('y', y! + (barHeight - LIGHT_CONDITION_GROUP_THICKNESS[item.light_condition]) / 2)
          .attr('width', barWidth)
          .attr('height', LIGHT_CONDITION_GROUP_THICKNESS[item.light_condition])
          .attr('fill', weatherFilter && item.weather !== weatherFilter ? '#cccccc' : WEATHER_COLORS[item.weather])
          .attr('opacity', weatherFilter && item.weather !== weatherFilter ? 0.3 : 1)
          .style('cursor', 'pointer')
          .on('click', (event) => {
            event.stopPropagation();
            if (weatherFilter === item.weather) {
              setWeatherFilter(null);
            } else {
              setWeatherFilter(item.weather);
            }
          })
          .append('title')
          .text(`Speed: ${speed}mph, Weather: ${item.weather}, Light: ${item.light_condition}, Count: ${format(',d')(item.count)}`);

        currentOffset += barWidth;
      });
    });

  }, [chartData, width, height, weatherFilter, setWeatherFilter]);

  // Handle background click to clear filter
  const handleBackgroundClick = () => {
    setWeatherFilter(null);
  };

  // Get unique weather conditions for legend
  const weatherConditions: WeatherCondition[] = [
    'Fine no high winds',
    'Raining no high winds',
    'Snowing no high winds',
    'Fine + high winds',
    'Raining + high winds',
    'Snowing + high winds',
    'Fog or mist',
    'Other',
    'Unknown'
  ];

  return (
    <div onClick={handleBackgroundClick} style={{ cursor: 'pointer' }}>
      <h3 style={{ color: '#0b2255', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
        Effect of Light condition, Speed and Weather on Number of Accidents
      </h3>

      {/* Legend above chart */}
      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Weather Conditions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {weatherConditions.map(weather => (
            <div key={weather} style={{ display: 'flex', alignItems: 'center', fontSize: '10px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: WEATHER_COLORS[weather],
                  marginRight: '4px',
                  border: '1px solid #ccc'
                }}
              />
              <span style={{ color: '#333' }}>{weather}</span>
            </div>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
}
