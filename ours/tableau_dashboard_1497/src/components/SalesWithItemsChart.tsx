import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SalesWithItemsData, ChartProps } from '../types';
import { useHighlight } from '../context/HighlightContext';

interface SalesWithItemsChartProps extends ChartProps {
  data: SalesWithItemsData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: '#59a14f',
  Cosmetics: '#9c755f',
  Cellular: '#edc948',
};

export const SalesWithItemsChart: React.FC<SalesWithItemsChartProps> = ({
  data,
  width = 400,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlightState, setItemCategoryHighlight, clearHighlights } = useHighlight();
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!data || data.length === 0) return;

    const margin = { top: 40, right: 110, bottom: 60, left: 60 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique categories and create color scale
    const categories = Array.from(new Set(data.map((d) => d.itemCategory)));
    const colorScale = d3.scaleOrdinal().domain(categories).range(categories.map(c => CATEGORY_COLORS[c] || '#ccc'));

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => `${d.itemCategory}-${d.department}`))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.salesQty)! * 1.1])
      .range([chartHeight, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '10px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-size', '11px');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Sum(Sales_Qty)');

    // Draw bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(`${d.itemCategory}-${d.department}`)!)
      .attr('width', xScale.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('fill', (d) => colorScale(d.itemCategory) as string)
      .attr('opacity', (d) => {
        if (highlightState.itemCategory && highlightState.itemCategory !== d.itemCategory) {
          return 0.2;
        }
        return 0.9;
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (highlightState.itemCategory === d.itemCategory) {
          clearHighlights();
        } else {
          setItemCategoryHighlight(d.itemCategory);
        }
      })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      })
      .on('mouseout', function (_event, d) {
        if (highlightState.itemCategory && highlightState.itemCategory !== d.itemCategory) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.2);
        } else {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.9);
        }
      })
      .transition()
      .duration(800)
      .attr('y', (d) => yScale(d.salesQty))
      .attr('height', (d) => chartHeight - yScale(d.salesQty));

    // Add value labels on bars
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => (xScale(`${d.itemCategory}-${d.department}`) || 0) + xScale.bandwidth()! / 2)
      .attr('y', (d) => yScale(d.salesQty) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text((d) => d.salesQty.toString())
      .style('opacity', 0)
      .transition()
      .delay(500)
      .duration(500)
      .style('opacity', 1);

    // Add legend on the right
    const legend = svg
      .append('g')
      .attr('transform', `translate(${dimensions.width - 100}, ${margin.top + 20})`);

    categories.forEach((category, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(category) as string)
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5);

      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '11px')
        .text(category);
    });

    // Title
    svg
      .append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Products Sales');

  }, [data, dimensions, highlightState, setItemCategoryHighlight, clearHighlights]);

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
