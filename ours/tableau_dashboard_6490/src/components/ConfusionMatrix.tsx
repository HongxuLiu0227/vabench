import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { DataRow, FilterState, ConfusionMatrixCell } from '../types';

interface ConfusionMatrixProps {
  data: DataRow[];
  filter: FilterState | null;
  onFilterChange: (filter: FilterState | null) => void;
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ data, filter, onFilterChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.clientWidth,
            height: Math.max(400, parent.clientWidth * 0.5),
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const margin = { top: 60, right: 120, bottom: 60, left: 120 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Group data by True Label and Predicted Label
    const groupedData = d3.rollup(
      data,
      (v) => v.length,
      (d) => d['True Label'],
      (d) => d['Predicted Label']
    );

    // Get all unique labels
    const trueLabels = Array.from(new Set(data.map((d) => d['True Label']))).sort();
    const predictedLabels = Array.from(new Set(data.map((d) => d['Predicted Label']))).sort();

    // Calculate row totals for percentages
    const rowTotals = new Map<string, number>();
    trueLabels.forEach((tl) => {
      let total = 0;
      predictedLabels.forEach((pl) => {
        total += groupedData.get(tl)?.get(pl) || 0;
      });
      rowTotals.set(tl, total);
    });

    // Create cells array
    const cells: ConfusionMatrixCell[] = [];
    trueLabels.forEach((tl) => {
      predictedLabels.forEach((pl) => {
        const count = groupedData.get(tl)?.get(pl) || 0;
        const total = rowTotals.get(tl) || 1;
        cells.push({
          trueLabel: tl,
          predictedLabel: pl,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        });
      });
    });

    // Create scales
    const xScale = d3.scaleBand().domain(predictedLabels).range([0, width]).padding(0.05);
    const yScale = d3.scaleBand().domain(trueLabels).range([0, height]).padding(0.05);

    // Color scale based on percentage
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, 100])
      .range(['#f0f0f0', '#72b966']);

    // Add X axis
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '11px');

    // Add X axis label
    svg
      .append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Predicted Label');

    // Add Y axis
    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis label
    svg
      .append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -80)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('True Label');

    // Add cells
    const cellGroups = svg
      .selectAll('.cell')
      .data(cells)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d) => `translate(${xScale(d.predictedLabel) || 0},${yScale(d.trueLabel) || 0})`);

    cellGroups
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => {
        if (filter && filter.trueLabel === d.trueLabel && filter.predictedLabel === d.predictedLabel) {
          return '#ff6b6b';
        }
        return colorScale(d.percentage);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', (d) => {
        if (filter && (filter.trueLabel !== d.trueLabel || filter.predictedLabel !== d.predictedLabel)) {
          return 0.3;
        }
        return 0.85;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (filter && filter.trueLabel === d.trueLabel && filter.predictedLabel === d.predictedLabel) {
          onFilterChange(null);
        } else {
          onFilterChange({ trueLabel: d.trueLabel, predictedLabel: d.predictedLabel });
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('stroke-width', 3).attr('opacity', 1);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('opacity', () => {
            if (filter && (filter.trueLabel !== d.trueLabel || filter.predictedLabel !== d.predictedLabel)) {
              return 0.3;
            }
            return 0.85;
          });
      });

    // Add text labels
    cellGroups
      .append('text')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '10px')
      .style('fill', (d) => (d.percentage > 50 ? '#fff' : '#000'))
      .text((d) => (d.count > 0 ? `${d.percentage.toFixed(1)}%` : ''));
  }, [data, dimensions, filter, onFilterChange]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ width: '100%', overflow: 'auto' }}>
        <svg ref={svgRef}></svg>
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
        Click on a cell to filter the View Posts scatter plot. Click again to clear filter.
      </p>
    </div>
  );
};

export default ConfusionMatrix;
