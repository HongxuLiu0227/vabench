import { useEffect, useRef, useMemo, useState } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line, type Line as D3Line } from 'd3-shape';
import { select } from 'd3-selection';
import type { LineChartProps, LineChartData } from '../types';
import './LineChart.css';

export default function LineChart({
  data,
  title,
  width,
  height,
  colorScale,
  selectedYear,
  onYearClick,
  isPercentage = false,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartId] = useState(() => `chart-${Math.random().toString(36).substr(2, 9)}`);

  // Chart margins - wrap in useMemo to avoid dependency issues
  const margin = useMemo(() => ({ top: 40, right: 30, bottom: 60, left: 80 }), []);
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create scales
  const xScale = useMemo(
    () =>
      scaleBand()
        .domain(data.map((d) => d.year.toString()))
        .range([0, chartWidth])
        .padding(0.2),
    [data, chartWidth]
  );

  const yScale = useMemo(() => {
    const minValue = Math.min(...data.map((d) => d.value));
    const maxValue = Math.max(...data.map((d) => d.value));
    const padding = (maxValue - minValue) * 0.1;

    return scaleLinear()
      .domain([
        isPercentage && minValue < 0 ? minValue - padding : Math.max(0, minValue - padding),
        maxValue + padding,
      ])
      .range([chartHeight, 0])
      .nice();
  }, [data, chartHeight, isPercentage]);

  // Create line generator
  const lineGenerator = useMemo<D3Line<LineChartData>>(
    () =>
      line<LineChartData>()
        .x((d) => xScale(d.year.toString())! + xScale.bandwidth() / 2)
        .y((d) => yScale(d.value))
        .defined((d) => d.year !== (selectedYear ?? null)),
    [xScale, yScale, selectedYear]
  );

  // Draw chart
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    const xAxisGroup = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`);

    const xAxis = axisBottom(xScale);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xAxisGroup.call(xAxis as any);
    xAxisGroup
      .selectAll('.tick text')
      .attr('transform', 'rotate(-30)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    // Y axis
    const yAxisGroup = g.append('g').attr('class', 'y-axis');
    const yAxis = axisLeft(yScale);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yAxisGroup.call(yAxis as any);

    // Y axis label
    yAxisGroup
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .text(isPercentage ? 'Percent Growth (%)' : 'Total Trips');

    // Add title
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', chartWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(title);

    // Draw area/line
    if (!selectedYear) {
      // Draw full line when no selection
      g.append('path')
        .datum(data)
        .attr('class', 'line-path')
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', '#4477AA')
        .attr('stroke-width', 2.5);
    }

    // Draw points
    g.selectAll<SVGCircleElement, LineChartData>('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d: LineChartData) => xScale(d.year.toString())! + xScale.bandwidth() / 2)
      .attr('cy', (d: LineChartData) => yScale(d.value))
      .attr('r', 6)
      .attr('fill', (d: LineChartData) => {
        if (selectedYear !== undefined && selectedYear !== null) {
          return d.year === selectedYear ? '#4477AA' : '#cccccc';
        }
        return String(colorScale(d.value));
      })
      .attr('opacity', (d: LineChartData) => {
        if (selectedYear !== undefined && selectedYear !== null) {
          return d.year === selectedYear ? 1 : 0.3;
        }
        return 1;
      })
      .attr('cursor', 'pointer')
      .on('click', (_event: MouseEvent, d: LineChartData) => {
        if (onYearClick) {
          onYearClick(d.year);
        }
      })
      .on('mouseover', function(this: SVGCircleElement) {
        select(this).attr('r', 8);
      })
      .on('mouseout', function(this: SVGCircleElement) {
        select(this).attr('r', 6);
      });

    // Add value labels
    g.selectAll<SVGTextElement, LineChartData>('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d: LineChartData) => xScale(d.year.toString())! + xScale.bandwidth() / 2)
      .attr('y', (d: LineChartData) => yScale(d.value) - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('opacity', (d: LineChartData) => {
        if (selectedYear !== undefined && selectedYear !== null) {
          return d.year === selectedYear ? 1 : 0.3;
        }
        return 1;
      })
      .text((d: LineChartData) => {
        if (isPercentage) {
          return `${d.value >= 0 ? '+' : ''}${d.value.toFixed(1)}%`;
        }
        return d.value.toLocaleString();
      });
  }, [
    data,
    xScale,
    yScale,
    chartWidth,
    chartHeight,
    margin,
    title,
    colorScale,
    selectedYear,
    onYearClick,
    isPercentage,
    lineGenerator,
  ]);

  return (
    <div className="line-chart-container">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="line-chart"
        id={chartId}
      />
    </div>
  );
}
