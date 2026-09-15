import { useMemo, useRef, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import * as d3 from 'd3';
import type { ChannelData } from '../types/data';
import { CHANNEL_COLORS } from '../types/data';
import { useFilters } from '../hooks/useFilters';

interface Sheet3Props {
  data: ChannelData[];
}

/**
 * Sheet 3: "Каналы" (Channels)
 * Bubble chart showing communication channels
 * - Size: users_count (distinct users)
 * - Color: channel (categorical: chat, sms, email)
 * - Labels: channel name and users_count
 */
export function Sheet3({ data }: Sheet3Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setChannelFilter } = useFilters();

  // Calculate dimensions based on zone aspect ratio (0.998 ~ 1:1)
  const width = 370;
  const height = 369;

  // Create size scale
  const sizeScale = useMemo(() => {
    const maxUsers = max(data, (d: ChannelData) => d.users_count) || 1;
    return scaleLinear()
      .domain([0, maxUsers])
      .range([30, Math.min(width, height) / 2 - 20]);
  }, [data, width, height]);

  // Calculate bubble positions (simple layout)
  const bubblePositions = useMemo(() => {
    if (data.length === 0) return [];

    const centerY = height / 2;

    // For 3 bubbles (chat, sms, email), arrange in triangle
    if (data.length === 3) {
      return [
        { x: width / 2, y: centerY - 60 },
        { x: width / 2 - 70, y: centerY + 40 },
        { x: width / 2 + 70, y: centerY + 40 },
      ];
    }

    // For 2 bubbles, place side by side
    if (data.length === 2) {
      return [
        { x: width * 0.3, y: centerY },
        { x: width * 0.7, y: centerY },
      ];
    }

    // Fallback: place in a line
    const step = width / (data.length + 1);
    return data.map((_, i) => ({
      x: step * (i + 1),
      y: centerY,
    }));
  }, [data, width, height]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    data.forEach((d, i) => {
      const pos = bubblePositions[i];
      const radius = sizeScale(d.users_count);
      const color = CHANNEL_COLORS[d.channel] || '#888';
      const isSelected = filters.channel === d.channel;

      // Add bubble circle
      g.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', radius)
        .attr('fill', color)
        .attr('fill-opacity', isSelected ? 1 : 0.8)
        .attr('stroke', isSelected ? '#333' : '#fff')
        .attr('stroke-width', isSelected ? 3 : 2)
        .attr('cursor', 'pointer')
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          // Toggle filter: if already selected, clear; otherwise select
          if (filters.channel === d.channel) {
            setChannelFilter(null);
          } else {
            setChannelFilter(d.channel);
          }
        })
        .on('mouseover', function() {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('fill-opacity', 1);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('fill-opacity', isSelected ? 1 : 0.8);
        });

      // Add text labels
      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .attr('fill', '#fff')
        .text(d.channel);

      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y + 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#fff')
        .text(d.users_count.toLocaleString());
    });
  }, [data, bubblePositions, sizeScale, filters.channel, setChannelFilter]);

  if (data.length === 0) {
    return (
      <div className="worksheet-container" style={{ width, height }}>
        <h3 className="worksheet-title">Каналы</h3>
        <div className="worksheet-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: height - 40 }}>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worksheet-container" style={{ width, height }}>
      <h3 className="worksheet-title">Каналы</h3>
      <svg
        ref={svgRef}
        width={width}
        height={height - 40}
        style={{ overflow: 'visible' }}
      />
      <style>{`
        .worksheet-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 8px;
          box-sizing: border-box;
        }
        .worksheet-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
      `}</style>
    </div>
  );
}
