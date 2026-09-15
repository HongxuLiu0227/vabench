import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { PlotOfSalesData } from '../types';

interface PlotOfSalesChartProps {
  data: PlotOfSalesData[];
  selectedSegment: string | null;
  onCategoryHighlight?: (category: string | null) => void;
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

export const PlotOfSalesChart: React.FC<PlotOfSalesChartProps> = ({
  data,
  selectedSegment,
  onCategoryHighlight,
  onSegmentHighlight,
  highlightState,
  width = 600,
  height = 350,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: PlotOfSalesData } | null>(null);

  // Use highlightState from other worksheets if available
  const effectiveHighlight = React.useMemo(() => {
    if (highlightState?.segment || highlightState?.category) {
      return { segment: highlightState.segment, category: highlightState.category };
    }
    return null;
  }, [highlightState?.segment, highlightState?.category]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Sales)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([0, chartWidth])
      .nice();

    // Y scale (Profit)
    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, d => d.profit) || 0,
        d3.max(data, d => d.profit) || 0
      ])
      .range([chartHeight, 0])
      .nice();

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '11px');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px');

    // X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 40)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text('SUM(Sales)');

    // Y axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -45)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text('SUM(Profit)');

    // Draw circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.sales))
      .attr('cy', d => yScale(d.profit))
      .attr('r', 7)
      .attr('fill', d => SEGMENT_COLORS[d.customerSegment] || DEFAULT_COLOR)
      .attr('opacity', d => {
        // Highlight behavior - check both segment and category
        const isHighlighted = effectiveHighlight &&
          ((effectiveHighlight.segment && effectiveHighlight.segment === d.customerSegment) ||
           (effectiveHighlight.category && effectiveHighlight.category === d.category));

        if (effectiveHighlight && !isHighlighted) {
          return 0.2;
        }
        if (selectedSegment && selectedSegment !== d.customerSegment) {
          return 0.3;
        }
        return 0.7;
      })
      .attr('stroke', d => {
        const isHighlighted = effectiveHighlight &&
          ((effectiveHighlight.segment && effectiveHighlight.segment === d.customerSegment) ||
           (effectiveHighlight.category && effectiveHighlight.category === d.category));
        return isHighlighted ? '#000' : 'none';
      })
      .attr('stroke-width', d => {
        const isHighlighted = effectiveHighlight &&
          ((effectiveHighlight.segment && effectiveHighlight.segment === d.customerSegment) ||
           (effectiveHighlight.category && effectiveHighlight.category === d.category));
        return isHighlighted ? 2 : 0;
      })
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        onCategoryHighlight?.(d.category);
        onSegmentHighlight?.(d.customerSegment);
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          data: d
        });
      })
      .on('mouseout', () => {
        onCategoryHighlight?.(null);
        onSegmentHighlight?.(null);
        setTooltip(null);
      });

  }, [data, width, height, selectedSegment, effectiveHighlight, onCategoryHighlight, onSegmentHighlight]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            pointerEvents: 'none',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <div><strong>Category:</strong> {tooltip.data.category}</div>
          <div><strong>Customer Segment:</strong> {tooltip.data.customerSegment}</div>
          <div><strong>Sales:</strong> ${tooltip.data.sales.toFixed(2)}</div>
          <div><strong>Profit:</strong> ${tooltip.data.profit.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};
