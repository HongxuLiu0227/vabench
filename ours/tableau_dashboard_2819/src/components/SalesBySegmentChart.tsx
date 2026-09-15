import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { SalesBySegmentData } from '../types';

interface SalesBySegmentChartProps {
  data: SalesBySegmentData[];
  selectedSegment: string | null;
  onSegmentClick: (segment: string | null) => void;
  onSegmentHighlight?: (segment: string | null) => void;
  highlightState?: {
    segment: string | null;
    region: string | null;
    category: string | null;
    country: string | null;
  };
  width?: number;
  height?: number;
}

// Tableau color palette for Customer Segment
const SEGMENT_COLORS: Record<string, string> = {
  'Consumer': '#1f77b4',
  'Home Office': '#2ca02c',
  'Corporate': '#ff7f0e',
  'Small Business': '#d62728',
};

const DEFAULT_COLOR = '#7f7f7f';

export const SalesBySegmentChart: React.FC<SalesBySegmentChartProps> = ({
  data,
  selectedSegment,
  onSegmentClick,
  onSegmentHighlight,
  highlightState,
  width = 400,
  height = 350,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [localHoveredSegment, setLocalHoveredSegment] = useState<string | null>(null);

  // Use highlightState from other worksheets if available, otherwise use local hover state
  const effectiveHighlight = highlightState?.segment ?? localHoveredSegment;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const radius = Math.min(chartWidth, chartHeight) / 2;

    const pie = d3
      .pie<SalesBySegmentData>()
      .value(d => d.sales)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<SalesBySegmentData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = pie(data);

    // Draw slices
    g.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => SEGMENT_COLORS[d.data.segment] || DEFAULT_COLOR)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', d => {
        if (selectedSegment && selectedSegment !== d.data.segment) {
          return 0.3;
        }
        if (effectiveHighlight && effectiveHighlight !== d.data.segment) {
          return 0.5;
        }
        return 1;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // Toggle: if clicking the same segment, deselect; otherwise select
        const newSelection = selectedSegment === d.data.segment ? null : d.data.segment;
        onSegmentClick(newSelection);
      })
      .on('mouseover', (_event, d) => {
        setLocalHoveredSegment(d.data.segment);
        onSegmentHighlight?.(d.data.segment);
      })
      .on('mouseout', () => {
        setLocalHoveredSegment(null);
        onSegmentHighlight?.(null);
      });

    // Add labels
    g.selectAll('text')
      .data(arcs)
      .enter()
      .append('text')
      .attr('transform', d => {
        const centroid = arc.centroid(d);
        // Adjust label position based on angle
        const labelRadius = radius * 0.7;
        const labelX = labelRadius * Math.cos(centroid[1] / radius);
        const labelY = labelRadius * Math.sin(centroid[1] / radius);
        return `translate(${labelX},${labelY})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => {
        const percent = (d.data.sales / d3.sum(data, x => x.sales) * 100).toFixed(1);
        return `${d.data.segment}\n${percent}%`;
      })
      .each(function() {
        const el = d3.select(this);
        const lines = el.text().split('\n');
        el.text('');
        lines.forEach((line, i) => {
          const tspan = el.append('tspan').text(line);
          if (i === 0) {
            tspan.attr('dy', '-0.3em');
          } else {
            tspan.attr('x', 0).attr('dy', '1.2em');
          }
        });
      });

    // Center the pie
    g.attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`);

  }, [data, width, height, selectedSegment, effectiveHighlight, onSegmentClick, onSegmentHighlight]);

  return (
    <div style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onClick={() => onSegmentClick(null)} // Click outside to deselect
      />
    </div>
  );
};
