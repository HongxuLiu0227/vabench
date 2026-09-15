import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-selection';
import { axisBottom } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import type { NumberValue } from 'd3';
import type { TripData } from '../types/tripData';
import { aggregateByStation, getTopNStations, getBottomNStations, filterDataByStation } from '../services/dataAggregator';
import type { StationCount } from '../services/dataAggregator';
import './StationBarChart.css';

interface StationBarChartProps {
  data: TripData[];
  selectedStation: string | null;
  variant: 'top' | 'bottom';
}

const StationBarChart: React.FC<StationBarChartProps> = ({
  data,
  selectedStation,
  variant,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartData, setChartData] = useState<StationCount[]>([]);
  const [maxLabelWidth, setMaxLabelWidth] = useState(100);

  useEffect(() => {
    // First filter by selected station if provided
    const filteredData = filterDataByStation(data, selectedStation, 'end');
    
    // Aggregate by station
    const aggregated = aggregateByStation(filteredData, 'endStationName');
    
    // Get top or bottom 10
    const sortedData = variant === 'top' 
      ? getTopNStations(aggregated, 10)
      : getBottomNStations(aggregated, 10);
    
    setChartData(sortedData);
  }, [data, selectedStation, variant]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Measure label width
    const tempText = svg.append('text')
      .style('font', '11px Arial, sans-serif')
      .style('visibility', 'hidden');
    
    let maxWidth = 0;
    chartData.forEach(d => {
      tempText.text(d.stationName);
      const width = tempText.node()?.getComputedTextLength() || 0;
      if (width > maxWidth) maxWidth = width;
    });
    tempText.remove();
    
    setMaxLabelWidth(maxWidth + 10);

    const margin = { top: 20, right: 30, bottom: 20, left: maxWidth + 10 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxValue = max(chartData, d => d.count) || 0;

    // Create scales
    const xScale = scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([0, width]);

    const yScale = scaleBand()
      .domain(chartData.map(d => d.stationName))
      .range([0, height])
      .padding(0.2);

    // Color based on variant
    const barColor = variant === 'top' ? '#f28e2b' : '#ffbe7d';
    const bgColor = variant === 'top' ? '#f5ead7' : '#faf5f0';

    // Add background
    g.append('rect')
      .attr('class', 'chart-bg')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', bgColor);

    // Add x-axis
    const xAxis = axisBottom(xScale)
      .ticks(5)
      .tickFormat((d: NumberValue) => d.valueOf().toString());

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    // Add bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.stationName) || 0)
      .attr('width', d => xScale(d.count))
      .attr('height', yScale.bandwidth())
      .attr('fill', barColor)
      .attr('stroke', d =>
        selectedStation && d.stationName === selectedStation ? '#000' : 'none'
      )
      .attr('stroke-width', selectedStation ? 2 : 0)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this)
          .attr('fill-opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('fill-opacity', 1);
      });

    // Add y-axis labels
    g.selectAll('.y-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -5)
      .attr('y', d => (yScale(d.stationName) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-family', 'Arial, Helvetica, sans-serif')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text(d => d.stationName);

  }, [chartData, selectedStation, maxLabelWidth, variant]);

  const title = variant === 'top' 
    ? 'Trips by End Station-Top 10' 
    : 'Trips by End Station-Bottom 10';

  return (
    <div className="station-bar-chart">
      <h3 className="chart-title">{title}</h3>
      <svg ref={svgRef} className="chart-svg"></svg>
    </div>
  );
};

export default StationBarChart;
