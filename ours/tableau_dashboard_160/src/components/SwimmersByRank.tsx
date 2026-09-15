/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { SwimmerData, AggregatedByRank } from '../types/swimming';
import './SwimmersByRank.css';

interface SwimmersByRankProps {
  data: SwimmerData[];
  filters?: {
    selectedCountrySwimmers?: string[];
  };
  onCellClick?: (rankSwimmer: string | null, rankTrainer: string | null) => void;
  selectedRankSwimmer?: string | null;
  selectedRankTrainer?: string | null;
  width?: number;
  height?: number;
}

// Base color from spec
const BASE_COLOR = '#86bcb6';

export const SwimmersByRank: React.FC<SwimmersByRankProps> = ({
  data,
  filters = {},
  onCellClick,
  selectedRankSwimmer,
  selectedRankTrainer,
  width = 750,
  height = 280
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Aggregate data when filters change using useMemo
  const aggregatedData = useMemo(() => {
    let filteredData = data;

    // Apply CountrySwimmers filter
    if (filters.selectedCountrySwimmers && filters.selectedCountrySwimmers.length > 0) {
      filteredData = filteredData.filter(row =>
        filters.selectedCountrySwimmers!.includes(row.CountrySwimmers)
      );
    }

    // Aggregate by RankSwimmers and RankTrainer
    const aggregation = new Map<string, AggregatedByRank>();

    filteredData.forEach(row => {
      const key = `${row.RankSwimmers}|${row.RankTrainer}`;
      const existing = aggregation.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        aggregation.set(key, {
          RankSwimmers: row.RankSwimmers || 'Unknown',
          RankTrainer: row.RankTrainer || 'Unknown',
          count: 1
        });
      }
    });

    return Array.from(aggregation.values());
  }, [data, filters.selectedCountrySwimmers]);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || aggregatedData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 30, right: 80, bottom: 60, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique values for rows and columns
    const rankSwimmers = Array.from(new Set(aggregatedData.map(d => d.RankSwimmers))).sort();
    const rankTrainers = Array.from(new Set(aggregatedData.map(d => d.RankTrainer))).sort();

    // Create matrix for heatmap
    const matrix: { row: string; col: string; count: number }[] = [];
    rankSwimmers.forEach(row => {
      rankTrainers.forEach(col => {
        const entry = aggregatedData.find(
          d => d.RankSwimmers === row && d.RankTrainer === col
        );
        matrix.push({
          row,
          col,
          count: entry ? entry.count : 0
        });
      });
    });

    // Calculate cell sizes
    const cellWidth = chartWidth / rankTrainers.length;
    const cellHeight = chartHeight / rankSwimmers.length;

    // Create color scale
    const maxCount = d3.max(aggregatedData, d => d.count) || 1;
    const colorScale = d3.scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolateRgb(BASE_COLOR, '#1a5c52'));

    // X scale (RankTrainer)
    const xScale = d3.scaleBand()
      .domain(rankTrainers)
      .range([0, chartWidth])
      .padding(0.05);

    // Y scale (RankSwimmers) - reversed for horizontal layout
    const yScale = d3.scaleBand()
      .domain(rankSwimmers)
      .range([0, chartHeight])
      .padding(0.05);

    // Draw cells
    g.selectAll('.cell')
      .data(matrix)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.col) || 0)
      .attr('y', d => yScale(d.row) || 0)
      .attr('width', cellWidth - 2)
      .attr('height', cellHeight - 2)
      .attr('fill', d => d.count > 0 ? colorScale(d.count) : '#f0f0f0')
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onCellClick) {
          const newRankSwimmer = selectedRankSwimmer === d.row && selectedRankTrainer === d.col
            ? null
            : d.row;
          const newRankTrainer = selectedRankSwimmer === d.row && selectedRankTrainer === d.col
            ? null
            : d.col;
          onCellClick(newRankSwimmer, newRankTrainer);
        }
      })
      .on('mouseover', (event, d) => {
        const content = `Swimmer Rank: ${d.row}<br/>Trainer Rank: ${d.col}<br/>Count: ${d.count}`;
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // Highlight selected cell
    if (selectedRankSwimmer && selectedRankTrainer) {
      g.selectAll('.cell')
        .filter((d: any) => d.row === selectedRankSwimmer && d.col === selectedRankTrainer)
        .attr('stroke', '#333')
        .attr('stroke-width', 3);
    }

    // Add labels to cells (if large enough)
    const minCellSizeForLabel = Math.min(cellWidth, cellHeight);
    if (minCellSizeForLabel > 25) {
      g.selectAll('.cell-label')
        .data(matrix.filter(d => d.count > 0))
        .enter()
        .append('text')
        .attr('class', 'cell-label')
        .attr('x', d => (xScale(d.col) || 0) + cellWidth / 2)
        .attr('y', d => (yScale(d.row) || 0) + cellHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#555555')
        .attr('font-size', '8px')
        .attr('pointer-events', 'none')
        .text(d => d.count);
    }

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .attr('font-size', '10px');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px');

    // X axis label
    g.append('text')
      .attr('transform', `translate(${chartWidth / 2},${chartHeight + margin.bottom - 5})`)
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Trainer Rank');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -chartHeight / 2)
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Swimmer Rank');

  }, [aggregatedData, width, height, selectedRankSwimmer, selectedRankTrainer, onCellClick]);

  // Handle click on background to clear selection
  const handleSvgClick = () => {
    if (onCellClick) {
      onCellClick(null, null);
    }
  };

  return (
    <div className="swimmers-by-rank-container">
      <h3 className="chart-title">Rank by Swimmers by Trainers Rank</h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onClick={handleSvgClick}
        style={{ cursor: 'pointer' }}
      />
      {tooltip && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default SwimmersByRank;
