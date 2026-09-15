import React, { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import type { StackedBarData } from '../../types';

interface HorizontalStackedPercentageBarProps {
  data: StackedBarData[];
  width: number;
  height: number;
  title: string;
  selectedCategories?: string[];
  onSegmentClick?: (category: string) => void;
  highlightedSeries?: string[];
  isDimmed?: (category: string) => boolean;
}

export const HorizontalStackedPercentageBar: React.FC<HorizontalStackedPercentageBarProps> = ({
  data,
  width,
  height,
  title,
  selectedCategories = [],
  onSegmentClick,
  highlightedSeries = [],
  isDimmed
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  // Get unique categories and series
  const categories = Array.from(new Set(data.map((d) => d.category)));
  const seriesValues = Array.from(new Set(data.map((d) => d.series))).sort();

  // Pivot data for easier rendering
  const pivotedData = categories.map((category) => {
    const categoryData = data.filter((d) => d.category === category);
    const segments: Record<string, { value: number; percentage: number }> = {};

    seriesValues.forEach((series) => {
      const found = categoryData.find((d) => d.series === series);
      if (found) {
        segments[series] = {
          value: found.value,
          percentage: found.percentage
        };
      }
    });

    return {
      category,
      segments,
      total: categoryData.reduce((sum, d) => sum + d.value, 0)
    };
  });

  // Sort by Diag3 series_order if applicable
  const diagOrder = [
    'Circulatory', 'Diabetes', 'Endocrine, Nutritional, Metabolic, Immunity',
    'Respiratory', 'Genitourinary', 'External causes of injury', 'Digestive',
    'Mental Disorders', 'Skin and Subcutaneous Tissue', 'Blood and Blood-Forming Organs',
    'Other Symptoms', 'Injury and Poisoning', 'Musculoskeletal System and Connective Tissue',
    'Infectious and Parasitic', 'Neoplasms', 'Nervous', 'Not Required',
    'Congenital Anomalies', 'Pregnancy, Childbirth', 'Sense Organs'
  ];

  const sortedCategories = categories.sort((a, b) => {
    const indexA = diagOrder.indexOf(a);
    const indexB = diagOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 120, bottom: 60, left: 280 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = scaleLinear().domain([0, 100]).range([0, innerWidth]);
    const yScale = scaleBand()
      .domain(sortedCategories)
      .range([0, innerHeight])
      .padding(0.15);

    // Color scale
    const colorScale = scaleBand<string>()
      .domain(seriesValues)
      .range(['#1f77b4', '#ff7f0e'])
      .padding(0.1);

    // Draw bars
    sortedCategories.forEach((category) => {
      const categoryData = pivotedData.find((d) => d.category === category);
      if (!categoryData) return;

      const y = yScale(category);
      if (y === undefined) return;

      const barHeight = yScale.bandwidth();
      const isSelected = selectedCategories.includes(category);
      const categoryIsDimmed = isDimmed ? isDimmed(category) : false;
      let currentX = 0;

      seriesValues.forEach((series) => {
        const segment = categoryData.segments[series];
        if (!segment) return;

        const segmentWidth = xScale(segment.percentage);
        const isHighlighted = highlightedSeries.length === 0 || highlightedSeries.includes(series);

        g.append('rect')
          .attr('x', currentX)
          .attr('y', y)
          .attr('width', segmentWidth)
          .attr('height', barHeight)
          .attr('fill', colorScale(series) || '#ccc')
          .attr('opacity', categoryIsDimmed ? 0.2 : (isHighlighted ? (isSelected ? 1 : 0.85) : 0.3))
          .attr('stroke', isSelected ? '#000' : 'none')
          .attr('stroke-width', isSelected ? 2 : 0)
          .style('cursor', 'pointer')
          .on('click', (event) => {
            event.stopPropagation();
            if (onSegmentClick) {
              onSegmentClick(category);
            }
          })
          .on('mouseover', (event) => {
            const [x, y] = [event.offsetX, event.offsetY];
            setTooltip({
              visible: true,
              x: x + margin.left + 10,
              y: y + margin.top,
              content: `${category}\n${series}: ${segment.percentage.toFixed(1)}% (${segment.value.toLocaleString()})`
            });
          })
          .on('mousemove', (event) => {
            const [x, y] = [event.offsetX, event.offsetY];
            setTooltip((prev) => ({ ...prev, x: x + margin.left + 10, y: y + margin.top }));
          })
          .on('mouseout', () => {
            setTooltip((prev) => ({ ...prev, visible: false }));
          });

        // Add percentage label if segment is large enough
        if (segmentWidth > 30) {
          g.append('text')
            .attr('x', currentX + segmentWidth / 2)
            .attr('y', y + barHeight / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '11px')
            .attr('font-weight', '500')
            .text(`${segment.percentage.toFixed(1)}%`);
        }

        currentX += segmentWidth;
      });

      // Category label
      g.append('text')
        .attr('x', -10)
        .attr('y', y + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', '11px')
        .attr('font-weight', isSelected ? 'bold' : 'normal')
        .attr('fill', categoryIsDimmed ? '#ccc' : (isSelected ? '#000' : '#333'))
        .text(category);
    });

    // X-axis
    g.append('line')
      .attr('x1', 0)
      .attr('y1', innerHeight)
      .attr('x2', innerWidth)
      .attr('y2', innerHeight)
      .attr('stroke', '#000')
      .attr('stroke-width', 1);

    // X-axis ticks and labels
    [0, 25, 50, 75, 100].forEach((tick) => {
      const x = xScale(tick);
      g.append('line')
        .attr('x1', x)
        .attr('y1', innerHeight)
        .attr('x2', x)
        .attr('y2', innerHeight + 5)
        .attr('stroke', '#000');

      g.append('text')
        .attr('x', x)
        .attr('y', innerHeight + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .text(`${tick}%`);
    });

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(title);

    // Legend
    const legendX = width - margin.right + 10;
    const legendY = margin.top;

    seriesValues.forEach((series, i) => {
      const y = legendY + i * 20;

      g.append('rect')
        .attr('x', legendX)
        .attr('y', y)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', colorScale(series) || '#ccc');

      g.append('text')
        .attr('x', legendX + 16)
        .attr('y', y + 10)
        .attr('dy', '0.35em')
        .attr('font-size', '11px')
        .text(series);
    });
  }, [data, width, height, sortedCategories, seriesValues, pivotedData, selectedCategories, highlightedSeries, isDimmed, title, onSegmentClick]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            pointerEvents: 'none',
            whiteSpace: 'pre-line',
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

