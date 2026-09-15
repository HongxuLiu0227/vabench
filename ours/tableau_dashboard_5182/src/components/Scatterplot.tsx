import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { FightSongData, SelectedSchool } from '../types';
import './Scatterplot.css';

interface ScatterplotProps {
  data: FightSongData[];
  selectedSchool: SelectedSchool;
  onSchoolSelect: (school: string | null) => void;
  width?: number;
  height?: number;
}

const Scatterplot: React.FC<ScatterplotProps> = ({
  data,
  selectedSchool,
  onSchoolSelect,
  width = 950,
  height = 700,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; school: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Dimensions and margins
    const margin = { top: 20, right: 20, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate averages for reference lines
    const avgBPM = d3.mean(data, (d) => d.bpm) || 0;
    const avgDuration = d3.mean(data, (d) => d.sec_duration) || 0;

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sec_duration)! * 1.1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([60, 200])
      .range([innerHeight, 0]);

    // Color scale for conferences
    const conferences = Array.from(new Set(data.map((d) => d.conference)));
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(conferences);

    // Add gridlines
    const makeXGrid = () => d3.axisBottom(xScale).ticks(10);
    const makeYGrid = () => d3.axisLeft(yScale).ticks(10);

    g.append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(makeXGrid().tickSize(-innerHeight).tickFormat(() => ''));

    g.append('g')
      .attr('class', 'grid y-grid')
      .call(makeYGrid().tickSize(-innerWidth).tickFormat(() => ''));

    // Add reference lines (averages)
    // Vertical reference line (average duration)
    g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', xScale(avgDuration))
      .attr('y1', 0)
      .attr('x2', xScale(avgDuration))
      .attr('y2', innerHeight)
      .style('stroke-dasharray', '5,5');

    // Horizontal reference line (average BPM)
    g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', 0)
      .attr('y1', yScale(avgBPM))
      .attr('x2', innerWidth)
      .attr('y2', yScale(avgBPM))
      .style('stroke-dasharray', '5,5');

    // Add quadrant annotations
    const fontConfig = {
      family: 'Courier New, monospace',
      size: '12px',
    };

    // Top-Right (High BPM, High Dur): "Fast and Long" (Bold)
    g.append('text')
      .attr('x', xScale(avgDuration) + 20)
      .attr('y', yScale(avgBPM) + 20)
      .attr('text-anchor', 'start')
      .style('font-family', fontConfig.family)
      .style('font-size', fontConfig.size)
      .style('font-weight', 'bold')
      .text('Fast and Long');

    // Bottom-Right (Low BPM, High Dur): "Slow and long"
    g.append('text')
      .attr('x', xScale(avgDuration) + 20)
      .attr('y', yScale(avgBPM) - 10)
      .attr('text-anchor', 'start')
      .style('font-family', fontConfig.family)
      .style('font-size', fontConfig.size)
      .text('Slow and long');

    // Top-Left (High BPM, Low Dur): "Fast and short" (Bold)
    g.append('text')
      .attr('x', xScale(avgDuration) - 20)
      .attr('y', yScale(avgBPM) + 20)
      .attr('text-anchor', 'end')
      .style('font-family', fontConfig.family)
      .style('font-size', fontConfig.size)
      .style('font-weight', 'bold')
      .text('Fast and short');

    // Bottom-Left (Low BPM, Low Dur): "Slow and short"
    g.append('text')
      .attr('x', xScale(avgDuration) - 20)
      .attr('y', yScale(avgBPM) - 10)
      .attr('text-anchor', 'end')
      .style('font-family', fontConfig.family)
      .style('font-size', fontConfig.size)
      .text('Slow and short');

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // X axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .attr('text-anchor', 'middle')
      .text('Duration (in seconds)');

    // Y axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .text('Beats per minute');

    // Add circles
    const circles = g
      .selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.sec_duration))
      .attr('cy', (d) => yScale(d.bpm))
      .attr('r', 5)
      .attr('fill', (d) => colorScale(d.conference) || '#1f77b4')
      .attr('opacity', (d) => {
        if (selectedSchool === null) return 0.55;
        return d.school === selectedSchool ? 0.9 : 0.15;
      })
      .attr('stroke', (d) => {
        if (selectedSchool !== null && d.school === selectedSchool) {
          return '#000';
        }
        return 'none';
      })
      .attr('stroke-width', (d) => {
        if (selectedSchool !== null && d.school === selectedSchool) {
          return 2;
        }
        return 0;
      })
      .style('cursor', 'pointer');

    // Add hover effects
    circles
      .on('mouseenter', (event, d) => {
        setTooltip({ x: event.pageX, y: event.pageY, school: d.school });
        d3.select(event.currentTarget as d3.BaseType)
          .transition()
          .duration(100)
          .attr('r', 7)
          .attr('opacity', 1);
      })
      .on('mouseleave', () => {
        setTooltip(null);
        circles
          .transition()
          .duration(100)
          .attr('r', 5)
          .attr('opacity', (d: FightSongData) => {
            if (selectedSchool === null) return 0.55;
            return d.school === selectedSchool ? 0.9 : 0.15;
          });
      })
      .on('click', (_, d) => {
        if (selectedSchool === d.school) {
          onSchoolSelect(null);
        } else {
          onSchoolSelect(d.school);
        }
      });

    // Click on background to clear selection
    svg.on('click', (event) => {
      if (event.target === svg.node()) {
        onSchoolSelect(null);
      }
    });
  }, [data, selectedSchool, onSchoolSelect, width, height]);

  return (
    <div className="scatterplot-container">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="scatterplot-svg"
      />
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
          }}
        >
          {tooltip.school}
        </div>
      )}
    </div>
  );
};

export default Scatterplot;
