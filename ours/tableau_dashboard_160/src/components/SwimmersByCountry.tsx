/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { SwimmerData } from '../types/swimming';
import './SwimmersByCountry.css';

interface SwimmersByCountryProps {
  data: SwimmerData[];
  filters?: {
    selectedRankSwimmer?: string | null;
    selectedRankTrainer?: string | null;
  };
  onCountryClick?: (country: string | null) => void;
  selectedCountry?: string | null;
  width?: number;
  height?: number;
}

export const SwimmersByCountry: React.FC<SwimmersByCountryProps> = ({
  data,
  filters = {},
  onCountryClick,
  selectedCountry,
  width = 400,
  height = 550
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Aggregate data when filters change using useMemo
  const aggregatedData = useMemo(() => {
    let filteredData = data;

    // Apply rank filters from interaction
    if (filters.selectedRankSwimmer) {
      filteredData = filteredData.filter(row => row.RankSwimmers === filters.selectedRankSwimmer);
    }
    if (filters.selectedRankTrainer) {
      filteredData = filteredData.filter(row => row.RankTrainer === filters.selectedRankTrainer);
    }

    // Aggregate by country
    const aggregation = new Map<string, number>();

    filteredData.forEach(row => {
      const country = row.Сountry || 'Unknown';
      aggregation.set(country, (aggregation.get(country) || 0) + 1);
    });

    return Array.from(aggregation.entries())
      .map(([Сountry, count]) => ({ Сountry, count }))
      .sort((a, b) => b.count - a.count);
  }, [data, filters.selectedRankSwimmer, filters.selectedRankTrainer]);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || aggregatedData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create color scale (sequential blue)
    const maxCount = d3.max(aggregatedData, d => d.count) || 0;
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxCount]);

    // Create hierarchy
    const root: any = d3.hierarchy({ children: aggregatedData })
      .sum((d: any) => d.count || 0);

    // Create pack layout
    const pack = d3.pack()
      .size([chartWidth, chartHeight])
      .padding(3);

    const nodes = pack(root).leaves();

    // Create group for chart
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw bubbles
    const bubble = g.selectAll('.bubble')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    bubble.append('circle')
      .attr('r', d => d.r)
      .attr('fill', (d: any) => colorScale(d.data.count))
      .attr('opacity', (d: any) => {
        const isHighlighted = selectedCountry === null || selectedCountry === d.data.Сountry;
        return selectedCountry !== null ? (isHighlighted ? 1 : 0.3) : 1;
      })
      .attr('class', 'bubble-circle')
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        event.stopPropagation();
        if (onCountryClick) {
          onCountryClick(selectedCountry === d.data.Сountry ? null : d.data.Сountry);
        }
      })
      .on('mouseover', (event, d: any) => {
        const content = `${d.data.Сountry}<br/>Swimmers: ${d.data.count}`;
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY - 10,
          content
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // Add labels (only for bubbles large enough)
    bubble.filter((d: any) => d.r > 20)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', '#333')
      .attr('font-size', (d: any) => Math.min(d.r / 3, 14))
      .attr('pointer-events', 'none')
      .text((d: any) => {
        // Truncate long country names if needed
        const maxChars = Math.floor(d.r / 2);
        if (d.data.Сountry.length > maxChars && maxChars > 3) {
          return d.data.Сountry.substring(0, maxChars - 2) + '..';
        }
        return d.data.Сountry;
      });

    // Add count for very large bubbles
    bubble.filter((d: any) => d.r > 35)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('fill', '#666')
      .attr('font-size', (d: any) => Math.min(d.r / 4, 10))
      .attr('pointer-events', 'none')
      .text((d: any) => d.data.count);

  }, [aggregatedData, width, height, selectedCountry, onCountryClick]);

  // Handle click on background to clear selection
  const handleSvgClick = () => {
    if (onCountryClick) {
      onCountryClick(null);
    }
  };

  return (
    <div className="swimmers-by-country-container">
      <h3 className="chart-title">Amount of swimmers by Country</h3>
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

export default SwimmersByCountry;
