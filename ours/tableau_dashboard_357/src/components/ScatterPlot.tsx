/**
 * ScatterPlot Component
 * Renders scatter plots for Sheet 1 and Sheet 2
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterPlotProps } from '../types';

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  width,
  height,
  title,
  xField,
  yField,
  colorField,
  colorScale,
  filterState,
  onSelectionChange,
  disabled = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Calculate margins
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get numeric values for scales
    const xValues = data.map(d => d[xField] as number);
    const yValues = data.map(d => d[yField] as number);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(xValues) ?? 0, d3.max(xValues) ?? 1])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([d3.min(yValues) ?? 0, d3.max(yValues) ?? 1])
      .range([innerHeight, 0])
      .nice();

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', '#666');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#666');

    // Check if filtered
    const isFiltered = filterState.selectedIndices.size > 0;
    const filteredData = isFiltered
      ? data.filter((_, i) => filterState.selectedIndices.has(i))
      : data;

    // Get original indices for filtered data
    const filteredIndices = isFiltered
      ? data.map((_, i) => i).filter(i => filterState.selectedIndices.has(i))
      : data.map((_, i) => i);

    // Draw circles
    g.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[xField] as number))
      .attr('cy', d => yScale(d[yField] as number))
      .attr('r', 4)
      .attr('fill', d => {
        const colorKey = String(d[colorField]);
        return colorScale.get(colorKey) || '#666';
      })
      .attr('opacity', disabled ? 0.3 : 0.8)
      .attr('stroke', d => {
        if (selectedIndices.size > 0) {
          const originalIndex = filteredIndices[filteredData.indexOf(d)];
          return selectedIndices.has(originalIndex) ? '#000' : 'none';
        }
        return 'none';
      })
      .attr('stroke-width', d => {
        if (selectedIndices.size > 0) {
          const originalIndex = filteredIndices[filteredData.indexOf(d)];
          return selectedIndices.has(originalIndex) ? 2 : 0;
        }
        return 0;
      })
      .style('cursor', disabled ? 'not-allowed' : 'pointer')
      .on('click', (_event, d) => {
        if (disabled) return;

        const originalIndex = filteredIndices[filteredData.indexOf(d)];
        const newSelection = new Set(selectedIndices);

        if (newSelection.has(originalIndex)) {
          newSelection.delete(originalIndex);
        } else {
          newSelection.add(originalIndex);
        }

        setSelectedIndices(newSelection);
        onSelectionChange(newSelection);
      })
      .on('mouseover', function() {
        if (disabled) return;
        d3.select(this)
          .attr('r', 6)
          .attr('opacity', 1);
      })
      .on('mouseout', function() {
        if (disabled) return;
        d3.select(this)
          .attr('r', 4)
          .attr('opacity', disabled ? 0.3 : 0.8);
      });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(title);

  }, [data, width, height, xField, yField, colorField, colorScale, filterState, onSelectionChange, disabled, selectedIndices, title]);

  // Clear selection when filter changes from external source
  useEffect(() => {
    if (filterState.sourceSheet && filterState.sourceSheet !== title) {
      setSelectedIndices(new Set());
    }
  }, [filterState.sourceSheet, title]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
};

export default ScatterPlot;
