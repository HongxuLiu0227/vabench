import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { PieChartProps, AggregatedData } from '../types';

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  colorMap,
  dimension,
  highlights,
  onHighlight,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    category: string;
    count: number;
    percentage: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    category: '',
    count: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<AggregatedData>()
      .value((d: AggregatedData) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<AggregatedData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = pie(data);

    // Draw slices
    g.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arc as unknown as string)
      .attr('fill', (d: d3.PieArcDatum<AggregatedData>) =>
        colorMap[d.data.category] || '#cccccc'
      )
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('opacity', (d: d3.PieArcDatum<AggregatedData>) => {
        if (highlights.field === dimension && highlights.value) {
          return d.data.category === highlights.value ? 1 : 0.3;
        }
        return 1;
      })
      .style('cursor', 'pointer')
      .on('mouseover', (event, d: d3.PieArcDatum<AggregatedData>) => {
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          category: d.data.category,
          count: d.data.value,
          percentage: d.data.percentage,
        });
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 10,
          y: event.pageY - 10,
        }));
      })
      .on('mouseout', () => {
        setTooltip(prev => ({ ...prev, visible: false }));
      })
      .on('click', (_event, d: d3.PieArcDatum<AggregatedData>) => {
        // Toggle highlight on click
        if (highlights.value === d.data.category) {
          onHighlight(String(dimension), null);
        } else {
          onHighlight(String(dimension), d.data.category);
        }
      });

    // Add labels
    g.selectAll('text')
      .data(arcs)
      .enter()
      .append('text')
      .attr(
        'transform',
        (d: d3.PieArcDatum<AggregatedData>) =>
          `translate(${arc.centroid(d as never)})`
      )
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#ffffff')
      .text((d: d3.PieArcDatum<AggregatedData>) => {
        if (d.data.percentage < 5) return ''; // Don't show label for small slices
        return `${d.data.category}\n${d.data.percentage.toFixed(1)}%`;
      })
      .attr('opacity', (d: d3.PieArcDatum<AggregatedData>) => {
        if (highlights.field === dimension && highlights.value) {
          return d.data.category === highlights.value ? 1 : 0.3;
        }
        return 1;
      })
      .each(function (this: SVGTextElement) {
        const text = d3.select(this);
        const lines = text.text().split('\n');
        text.text('');
        lines.forEach((line: string, i: number) => {
          text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? 0 : '1.2em')
            .text(line);
        });
      });
  }, [data, colorMap, dimension, highlights, onHighlight]);

  return (
    <div style={{ position: 'relative' }}>
      <h3
        style={{
          margin: '0 0 10px 0',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {title}
      </h3>
      <svg
        ref={svgRef}
        width={400}
        height={400}
        style={{ display: 'block', margin: '0 auto' }}
      />
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px',
          }}
        >
          <div><strong>{tooltip.category}</strong></div>
          <div>Count: {tooltip.count}</div>
          <div>Percentage: {tooltip.percentage.toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
};

export default PieChart;
