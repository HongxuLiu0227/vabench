import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { HorizontalBarChartProps } from '../types';

const HorizontalRankedBar: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  xAxisTitle,
  width,
  height,
  showLegend = false,
  legendItems = []
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Calculate margins based on longest label
    const maxLength = d3.max(data, d => d.category.length) || 0;
    const estimatedLabelWidth = maxLength * 7; // Approximate pixel width per character
    const leftMargin = Math.max(estimatedLabelWidth + 20, 120);
    const rightMargin = 20;
    const topMargin = title ? 40 : 20;
    const bottomMargin = showLegend ? 80 : 50;

    const chartWidth = width - leftMargin - rightMargin;
    const chartHeight = height - topMargin - bottomMargin;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${leftMargin}, ${topMargin})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([0, chartWidth]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, chartHeight])
      .padding(0.15);

    // Add title
    if (title) {
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Verdana, sans-serif')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#000')
        .text(title);
    }

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => {
        const value = d as number;
        if (value >= 100) {
          return value.toString();
        } else if (value >= 1) {
          return value.toFixed(1);
        } else {
          return (value * 100).toFixed(0) + '%';
        }
      });

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .style('font-family', 'Verdana, sans-serif')
      .style('font-size', '10px');

    // Add X axis title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Verdana, sans-serif')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(xAxisTitle);

    // Add Y axis with county names
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-family', 'Verdana, sans-serif')
      .style('font-size', '10px')
      .style('fill', '#000')
      .each(function() {
        const text = d3.select(this);
        const content = text.text();
        // Wrap long text if needed
        if (content.length > 20) {
          const words = content.split(' ');
          text.text('');
          words.forEach((word, i) => {
            text.append('tspan')
              .text(word + (i < words.length - 1 ? ' ' : ''));
          });
        }
      });

    // Add bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.category) || 0)
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.color)
      .attr('rx', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0.9);

    // Add hover effects
    bars.on('mouseover', function(event, d) {
      d3.select(this)
        .transition()
        .duration(150)
        .style('opacity', 1);

      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        let tooltipContent = `<strong>${d.category}</strong><br/>`;
        if (d.value >= 1) {
          tooltipContent += `${xAxisTitle}: ${d.value.toFixed(1)}`;
        } else {
          tooltipContent += `${xAxisTitle}: ${(d.value * 100).toFixed(1)}%`;
        }
        if (d.series) {
          tooltipContent += `<br/>Category: ${d.series}`;
        }

        setTooltip({
          visible: true,
          x: event.clientX - rect.left + 10,
          y: event.clientY - rect.top - 10,
          content: tooltipContent
        });
      }
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(150)
        .style('opacity', 0.9);
      setTooltip(prev => ({ ...prev, visible: false }));
    });

    // Add legend if required
    if (showLegend && legendItems.length > 0) {
      const legendG = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${leftMargin}, ${height - bottomMargin + 10})`);

      const legendItemSize = 15;
      const legendSpacing = 10;

      legendItems.forEach((item, index) => {
        const itemX = index * (legendItemSize + legendSpacing + 80);

        const legendItem = legendG.append('g')
          .attr('transform', `translate(${itemX}, 0)`);

        legendItem.append('rect')
          .attr('width', legendItemSize)
          .attr('height', legendItemSize)
          .attr('fill', item.color)
          .attr('rx', 2);

        legendItem.append('text')
          .attr('x', legendItemSize + 5)
          .attr('y', legendItemSize - 2)
          .style('font-family', 'Verdana, sans-serif')
          .style('font-size', '10px')
          .style('fill', '#333')
          .text(item.label);
      });
    }

  }, [data, title, xAxisTitle, width, height, showLegend, legendItems]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '11px',
            fontFamily: 'Verdana, sans-serif',
            color: '#333',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default HorizontalRankedBar;
