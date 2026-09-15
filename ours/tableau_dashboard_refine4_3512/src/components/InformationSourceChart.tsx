import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { DataPoint } from '../types/data';
import { getInfoSourceColor } from '../utils/colors';
import { aggregateByInfoSource, filterData } from '../services/dataAggregator';
import { useFilter } from '../contexts/FilterContext';

interface InformationSourceChartProps {
  data: DataPoint[];
  width: number;
  height: number;
}

export const InformationSourceChart: React.FC<InformationSourceChartProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filter } = useFilter();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Apply filter and exclude null info sources
    // Per tableau_spec.json lines 238-275, filter excludes %null% info source
    let filteredData = filterData(data, filter);
    filteredData = filteredData.filter(d => {
      const infoSource = d.infoSource || '';
      return infoSource !== '' && infoSource !== 'null' && infoSource !== '%null%' && infoSource !== '(Null)';
    });

    // Aggregate data by breach type and info source
    const aggregated = aggregateByInfoSource(filteredData);

    // Get unique breach types and info sources
    const breachTypes = Array.from(new Set(aggregated.map(d => d.breachType))).sort();
    const infoSources = Array.from(new Set(aggregated.map(d => d.infoSource))).sort();

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup dimensions with dynamic margins for long labels
    const margin = { top: 20, right: 20, bottom: 80, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(breachTypes)
      .range([0, innerWidth])
      .padding(0.2);

    // Calculate stacked data
    const stackData = breachTypes.map(breachType => {
      const stacked: Record<string, number | string> = { breachType };
      let runningTotal = 0;

      infoSources.forEach(infoSource => {
        const found = aggregated.find(d => d.breachType === breachType && d.infoSource === infoSource);
        const value = found ? found.count : 0;
        stacked[infoSource] = runningTotal;
        runningTotal += value;
      });

      stacked.total = runningTotal;
      return stacked;
    });

    const maxY = d3.max(stackData, d => d.total || 0) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([innerHeight, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create x-axis with rotated labels for better visibility
    const xAxis = d3.axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.75em')
      .attr('transform', 'rotate(-30)')
      .style('font-size', '11px');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale);
    g.append('g')
      .call(yAxis);

    // Create tooltip group (hidden by default)
    const tooltip = g.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    tooltip.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(0, 0, 0, 0.8)');

    const tooltipText = tooltip.append('text')
      .attr('fill', '#fff')
      .style('font-size', '12px');

    // Create stacked bars (draw in reverse order to properly stack)
    for (let i = infoSources.length - 1; i >= 0; i--) {
      const infoSource = infoSources[i];

      g.selectAll(`.bar-${i}`)
        .data(stackData)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.breachType as string) || 0)
        .attr('y', d => {
          const y0 = Number(d[infoSource]);
          const value = aggregated.find(item => item.breachType === d.breachType && item.infoSource === infoSource)?.count || 0;
          return yScale(y0 + value);
        })
        .attr('width', xScale.bandwidth())
        .attr('height', d => {
          const y0 = Number(d[infoSource]);
          const value = aggregated.find(item => item.breachType === d.breachType && item.infoSource === infoSource)?.count || 0;
          return yScale(y0) - yScale(y0 + value);
        })
        .attr('fill', getInfoSourceColor(infoSource))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('opacity', 0.8)
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 1);

          // Show tooltip with breakdown
          const value = aggregated.find(item => item.breachType === d.breachType && item.infoSource === infoSource)?.count || 0;
          const tooltipContent = `${d.breachType}\n${infoSource}\n${value} breaches`;

          tooltipText.selectAll('tspan').remove();
          tooltipContent.split('\n').forEach((line, i) => {
            tooltipText.append('tspan')
              .attr('x', 10)
              .attr('dy', i === 0 ? '1.2em' : '1.4em')
              .text(line);
          });

          const bbox = (tooltipText.node() as SVGTextElement)?.getBBox();
          if (bbox) {
            tooltip.select('rect')
              .attr('x', bbox.x - 5)
              .attr('y', bbox.y - 5)
              .attr('width', bbox.width + 10)
              .attr('height', bbox.height + 10);
          }

          tooltip
            .attr('transform', `translate(${event.offsetX + 10},${event.offsetY + 10})`)
            .style('opacity', 1);
        })
        .on('mousemove', function(event) {
          tooltip
            .attr('transform', `translate(${event.offsetX + 10},${event.offsetY + 10})`);
        })
        .on('mouseout', function() {
          d3.select(this).style('opacity', 0.8);
          tooltip.style('opacity', 0);
        });
    }

  }, [data, width, height, filter]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
};
