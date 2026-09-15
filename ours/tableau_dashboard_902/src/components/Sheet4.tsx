import { useMemo, useRef, useEffect } from 'react';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { max } from 'd3-array';
import * as d3 from 'd3';
import type { ControlGroupData } from '../types/data';
import { useFilters } from '../hooks/useFilters';

interface Sheet4Props {
  data: ControlGroupData[];
}

/**
 * Sheet 4: "Группы" (Groups)
 * Bubble chart showing control groups (Target vs Control)
 * - Size: users_count (distinct users)
 * - Color: users_count (sequential color scale)
 * - Labels: control group name and record count
 */
export function Sheet4({ data }: Sheet4Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setControlFilter } = useFilters();
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dimensions based on zone aspect ratio
  const width = 600;
  const height = 368; // Maintaining ~1.63 aspect ratio from spec

  // Create scales
  const sizeScale = useMemo(() => {
    const maxUsers = max(data, (d: ControlGroupData) => d.users_count) || 1;
    return scaleLinear()
      .domain([0, maxUsers])
      .range([30, Math.min(width, height) / 2 - 20]);
  }, [data, width, height]);

  const colorScale = useMemo(() => {
    const maxUsers = max(data, (d: ControlGroupData) => d.users_count) || 1;
    return scaleSequential((t: number) => d3.interpolateBlues(0.3 + t * 0.7))
      .domain([0, maxUsers]);
  }, [data]);

  // Calculate bubble positions (simple layout with 2 bubbles)
  const bubblePositions = useMemo(() => {
    if (data.length === 0) return [];

    const centerY = height / 2;

    // For 2 bubbles, place them side by side
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
      const color = colorScale(d.users_count);
      const isSelected = filters.control === d.control;

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
          if (filters.control === d.control) {
            setControlFilter(null);
          } else {
            setControlFilter(d.control);
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
        .text(d.controlLabel);

      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y + 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#fff')
        .text(d.record_count.toLocaleString());
    });
  }, [data, bubblePositions, sizeScale, colorScale, filters.control, setControlFilter]);

  if (data.length === 0) {
    return (
      <div className="worksheet-container" style={{ width, height }}>
        <h3 className="worksheet-title">Группы</h3>
        <div className="worksheet-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: height - 40 }}>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="worksheet-container" style={{ width, height }}>
      <h3 className="worksheet-title">Группы</h3>
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
