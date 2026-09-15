import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesTypeData, ChartProps } from '../types';
import { useHighlight } from '../context/HighlightContext';

interface SalesTypesChartProps extends ChartProps {
  data: SalesTypeData[];
}

export const SalesTypesChart: React.FC<SalesTypesChartProps> = ({
  data,
  width = 400,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlightState, setSalesTypeHighlight, clearHighlights } = useHighlight();
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!data || data.length === 0) return;

    const margin = { top: 40, right: 20, bottom: 20, left: 20 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color scale for Sales Type
    const salesTypes = Array.from(new Set(data.map((d) => d.salesType)));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(salesTypes);

    // Create hierarchy for packed bubbles
    const root = d3
      .hierarchy({ children: data.map((d) => ({ ...d })) })
      .sum((d: unknown) => (d as SalesTypeData).salesAmt);

    const pack = d3
      .pack()
      .size([chartWidth, chartHeight])
      .padding(3);

    const nodes = pack(root as d3.HierarchyNode<unknown>).leaves();

    // Draw bubbles
    const bubbles = g
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.x!)
      .attr('cy', (d) => d.y!)
      .attr('r', 0)
      .attr('fill', (d) => colorScale((d.data as SalesTypeData).salesType) as string)
      .attr('opacity', (d) => {
        if (highlightState.salesType && highlightState.salesType !== (d.data as SalesTypeData).salesType) {
          return 0.2;
        }
        return 0.8;
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        const salesType = (d.data as SalesTypeData).salesType;
        if (highlightState.salesType === salesType) {
          clearHighlights();
        } else {
          setSalesTypeHighlight(salesType);
        }
      })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      })
      .on('mouseout', function (_event, d) {
        const salesType = (d.data as SalesTypeData).salesType;
        if (highlightState.salesType && highlightState.salesType !== salesType) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.2);
        } else {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8);
        }
      });

    // Animate bubbles
    bubbles
      .transition()
      .duration(800)
      .attr('r', (d) => d.r!);

    // Add labels inside bubbles
    g.selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('x', (d) => d.x!)
      .attr('y', (d) => d.y!)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('font-size', (d) => Math.max(8, d.r! / 3) + 'px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .style('pointer-events', 'none')
      .text((d) => (d.data as SalesTypeData).salesType);

    // Add overlay legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${dimensions.width - 120}, ${margin.top + 10})`)
      .attr('class', 'legend')
      .style('background-color', 'rgba(255, 255, 255, 0.8)');

    // Add white background for legend
    legend
      .append('rect')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', 110)
      .attr('height', salesTypes.length * 20 + 10)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5)
      .attr('rx', 4);

    salesTypes.forEach((salesType, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 5)
        .attr('r', 6)
        .attr('fill', colorScale(salesType) as string)
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5);

      legendRow
        .append('text')
        .attr('x', 12)
        .attr('y', 9)
        .style('font-size', '11px')
        .style('font-weight', '500')
        .text(salesType);
    });

    // Title
    svg
      .append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Sales types');

  }, [data, dimensions, highlightState, setSalesTypeHighlight, clearHighlights]);

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: dimensions.height,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [dimensions.height]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
    </div>
  );
};
