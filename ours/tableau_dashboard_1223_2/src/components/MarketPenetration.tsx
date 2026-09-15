/**
 * Market Penetration Chart Component
 * Renders a vertical ranked bar chart using D3
 *
 * Features:
 * - Vertical bars sorted by penetration ratio (descending)
 * - Color encoding by penetration ratio (sequential blues)
 * - Reference line at 0.0015 (0.15%)
 * - Data labels showing percentage and customer count
 * - Highlight interactions on geography
 * - Tooltip on hover
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { MarketPenetrationData } from '../services/dataService';

interface MarketPenetrationProps {
  data: MarketPenetrationData[];
  width?: number;
  height?: number;
}

interface TooltipData {
  geography: string;
  penetrationRatio: number;
  customerCount: number;
  population: number;
  x: number;
  y: number;
}

export default function MarketPenetration({ data, width = 600, height = 400 }: MarketPenetrationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [highlightedGeography, setHighlightedGeography] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Reference line value
  const REFERENCE_LINE = 0.0015;

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Calculate dimensions with margins
    const margin = {
      top: 20,
      right: 30,
      bottom: 120, // Extra space for rotated labels
      left: 80,
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.geography))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.penetrationRatio) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Color scale (sequential blues - Tableau style)
    const maxRatio = d3.max(data, (d) => d.penetrationRatio) || 0;
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxRatio])
      .interpolator(d3.interpolateBlues);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // X axis with rotated labels
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.3em')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '11px')
      .style('fill', '#374151');

    g.selectAll('.domain, .tick line')
      .style('stroke', '#9CA3AF');

    // Y axis
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#374151');

    g.selectAll('.domain, .tick line')
      .style('stroke', '#9CA3AF');

    // Reference line at 0.0015
    const refLineY = yScale(REFERENCE_LINE);
    if (refLineY !== undefined && refLineY >= 0 && refLineY <= innerHeight) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', refLineY)
        .attr('y2', refLineY)
        .attr('stroke', '#EF4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      // Reference line label
      g.append('text')
        .attr('x', innerWidth - 10)
        .attr('y', refLineY - 5)
        .attr('text-anchor', 'end')
        .style('font-size', '11px')
        .style('fill', '#EF4444')
        .style('font-weight', 'bold')
        .text('Benchmark: 0.15%');
    }

    // Format for percentages
    const formatPercent = d3.format('.2%');

    // Draw bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    bars
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.geography) || 0)
      .attr('y', (d) => yScale(d.penetrationRatio))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.penetrationRatio))
      .attr('fill', (d) => colorScale(d.penetrationRatio))
      .attr('stroke', (d) =>
        highlightedGeography === d.geography ? '#1F2937' : 'none'
      )
      .attr('stroke-width', (d) => highlightedGeography === d.geography ? 2 : 0)
      .attr('opacity', (d) =>
        highlightedGeography === null ? 0.9 : highlightedGeography === d.geography ? 1 : 0.3
      )
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        // Toggle highlight on click
        setHighlightedGeography((prev) => (prev === d.geography ? null : d.geography));
      })
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event);
        setTooltip({
          geography: d.geography,
          penetrationRatio: d.penetrationRatio,
          customerCount: d.customerCount,
          population: d.population,
          x: x + margin.left,
          y: y + margin.top,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // Data labels on bars
    bars
      .append('text')
      .attr('x', (d) => (xScale(d.geography) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.penetrationRatio) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#374151')
      .style('font-weight', '500')
      .text((d) => formatPercent(d.penetrationRatio));

    // Clear highlight when clicking outside
    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        setHighlightedGeography(null);
      }
    });
  }, [data, width, height, highlightedGeography]);

  // Auto-clear highlight after 3 seconds
  useEffect(() => {
    if (highlightedGeography) {
      const timer = setTimeout(() => {
        setHighlightedGeography(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedGeography]);

  return (
    <div className="market-penetration-container" style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', margin: '0 auto' }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tooltip.geography}</div>
          <div>Penetration: {d3.format('.2%')(tooltip.penetrationRatio)}</div>
          <div>Customers: {d3.format(',')(tooltip.customerCount)}</div>
          <div>Population: {d3.format(',')(tooltip.population)}</div>
        </div>
      )}

      {/* Highlight indicator */}
      {highlightedGeography && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#DBEAFE',
            color: '#1E40AF',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          Selected: {highlightedGeography}
        </div>
      )}
    </div>
  );
}
