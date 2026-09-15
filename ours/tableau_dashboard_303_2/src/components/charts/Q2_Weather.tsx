/**
 * Q2_Weather: Vertical ranked bar chart showing accidents by weather conditions
 */
import { useEffect, useRef, useMemo } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { max } from 'd3-array';
import { format } from 'd3-format';
import { aggregateByWeather } from '../../services/dataService';
import { useDashboard } from '../../context/DashboardContext';

interface Q2WeatherProps {
  width?: number;
  height?: number;
}

export function Q2_Weather({ width = 400, height = 300 }: Q2WeatherProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { weatherFilter, setWeatherFilter, filteredData } = useDashboard();

  // Aggregate data when filtered data changes
  const chartData = useMemo(() => {
    return aggregateByWeather(filteredData);
  }, [filteredData]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = scaleBand()
      .domain(chartData.map(d => d.weather))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = scaleLinear()
      .domain([0, max(chartData, d => d.count) || 0])
      .range([innerHeight, 0])
      .nice();

    // Create x-axis
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

    // Create bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.weather) || 0)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', d => weatherFilter && d.weather !== weatherFilter ? '#cccccc' : '#1f77b4')
      .attr('opacity', d => weatherFilter && d.weather !== weatherFilter ? 0.3 : 1)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // Toggle filter
        if (weatherFilter === d.weather) {
          setWeatherFilter(null);
        } else {
          setWeatherFilter(d.weather);
        }
      })
      .append('title')
      .text(d => `${d.weather}: ${format(',d')(d.count)} accidents`);

    // Add value labels on bars
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.weather) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => format(',d')(d.count));

  }, [chartData, width, height, weatherFilter, setWeatherFilter]);

  // Handle background click to clear filter
  const handleBackgroundClick = () => {
    setWeatherFilter(null);
  };

  return (
    <div onClick={handleBackgroundClick} style={{ cursor: 'pointer' }}>
      <h3 style={{ color: '#0b2255', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
        No. of Accidents in different Weather conditions
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
      {chartData.length > 0 && (
        <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
          Most accidents occured in Fine no high wind condition
        </div>
      )}
    </div>
  );
}
