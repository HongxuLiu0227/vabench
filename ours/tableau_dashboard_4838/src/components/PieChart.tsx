import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3-selection';
import * as d3shape from 'd3-shape';
import type { TelcoRecord, PieChartData } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface PieChartProps {
  data: TelcoRecord[];
  dimension: keyof TelcoRecord;
  centerText?: {
    label: string;
    value?: string;
  };
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  dimension,
  centerText,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlightState, setHighlight, clearHighlight } = useDashboard();

  // Aggregate and prepare data
  const chartData = useMemo(() => {
    const grouped = data.reduce((acc, record) => {
      const key = String(record[dimension]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = data.length;
    const entries = Object.entries(grouped).map(([category, value]) => ({
      category,
      value,
      percentage: (value / total) * 100,
    }));

    return entries;
  }, [data, dimension]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = width; // Square aspect ratio
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;

    svg
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3shape
      .pie<PieChartData>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3shape
      .arc<PieChartData>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Color palette
    const colors = ['#75a1c7', '#989ca3'];

    // Check if this slice should be highlighted
    const isHighlighted = (category: string) => {
      if (!highlightState.dimension || !highlightState.value) return true;
      if (highlightState.dimension !== dimension) return true;
      return category === highlightState.value;
    };

    // Slices
    const slices = g
      .selectAll('.slice')
      .data(pie(chartData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices
      .append('path')
      .attr('d', (d: any) => arc(d) || '')
      .attr('fill', (_d: any, i: number) => colors[i % colors.length])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', (d: any) => (isHighlighted(d.data.category) ? 1 : 0.3))
      .on('click', (_event: any, d: any) => {
        if (highlightState.dimension === dimension && highlightState.value === d.data.category) {
          clearHighlight();
        } else {
          setHighlight(dimension, d.data.category);
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function(_event: any, d: any) {
        d3.select(this).attr('opacity', isHighlighted(d.data.category) ? 1 : 0.3);
      });

    // Percentage labels
    slices
      .append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .text((d: any) => `${d.data.percentage.toFixed(1)}%`);

    // Center text
    if (centerText) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(centerText.label);

      if (centerText.value) {
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '1em')
          .attr('font-size', '15px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text(centerText.value);
      }
    }
  }, [chartData, dimension, highlightState, centerText, setHighlight, clearHighlight]);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
};
