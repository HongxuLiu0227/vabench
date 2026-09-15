import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { UsertypeGenderData } from '../types';

interface UsertypeByGenderChartProps {
  data: UsertypeGenderData[];
  width?: number;
  height?: number;
  selectedUsertype?: 'Subscriber' | 'Customer' | null;
}

// Color mapping from requirements for gender
const GENDER_COLORS: Record<string, string> = {
  Unknown: '#59a14f',
  Male: '#f28e2b',
  Female: '#b07aa1',
};

const UsertypeByGenderChart: React.FC<UsertypeByGenderChartProps> = ({
  data,
  width = 400,
  height = 300,
  selectedUsertype = null,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Calculate margins
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Group data by usertype for side-by-side bars
    const usertypes = ['Subscriber', 'Customer'];
    const genders = ['Unknown', 'Male', 'Female'];

    // Create scales
    const maxCount = d3.max(data, (d) => d.count) || 0;
    const xScale = d3
      .scaleBand()
      .domain(usertypes)
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([innerHeight, 0])
      .nice();

    // Nested scale for grouped bars
    const xSubgroupScale = d3
      .scaleBand()
      .domain(genders)
      .range([0, xScale.bandwidth()])
      .padding(0.1);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale).ticks(6);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Add y-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#666')
      .text('Count of Trips');

    // Create grouped bars
    usertypes.forEach((usertype) => {
      const usertypeData = data.filter((d) => d.usertype === usertype);

      const subgroup = g
        .append('g')
        .attr('transform', `translate(${xScale(usertype)},0)`);

      subgroup
        .selectAll('.bar')
        .data(usertypeData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xSubgroupScale(d.genderName) || 0)
        .attr('y', (d) => yScale(d.count))
        .attr('width', xSubgroupScale.bandwidth())
        .attr('height', (d) => innerHeight - yScale(d.count))
        .attr('fill', (d) => GENDER_COLORS[d.genderName])
        .attr('opacity', () => {
          // Dim bars when a usertype is selected
          if (selectedUsertype && selectedUsertype !== usertype) {
            return 0.3;
          }
          return 1;
        })
        .attr('cursor', 'pointer')
        .attr('rx', 2)
        .on('mousemove', (event, d) => {
          const [x, y] = d3.pointer(event, svgRef.current);
          setTooltip({
            x: x + margin.left + 15,
            y: y + margin.top,
            content: `${d.usertype} - ${d.genderName}: ${d.count.toLocaleString()} trips`,
          });
          setHoveredBar(`${d.usertype}-${d.genderName}`);
        })
        .on('mouseleave', () => {
          setTooltip(null);
          setHoveredBar(null);
        });
    });

    // Add legend
    const legendGroup = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left}, 10)`);

    genders.forEach((gender, i) => {
      const legendItem = legendGroup
        .append('g')
        .attr('transform', `translate(${i * 100}, 0)`);

      legendItem
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', GENDER_COLORS[gender])
        .attr('rx', 2);

      legendItem
        .append('text')
        .attr('x', 18)
        .attr('y', 10)
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(gender);
    });

  }, [data, width, height, selectedUsertype, hoveredBar]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default UsertypeByGenderChart;
