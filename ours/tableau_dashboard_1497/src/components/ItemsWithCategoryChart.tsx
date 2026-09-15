import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ItemsWithCategoryData, ChartProps } from '../types';
import { useHighlight } from '../context/HighlightContext';

interface ItemsWithCategoryChartProps extends ChartProps {
  data: ItemsWithCategoryData[];
}

const PAY_TYPE_COLORS: Record<string, string> = {
  Debit: '#5c6068',
  Cheque: '#a2ceaa',
  Cash: '#bab0ac',
  DHL: '#eec9e5',
  Credit: '#f47942',
  FedeX: '#f4d166',
};

export const ItemsWithCategoryChart: React.FC<ItemsWithCategoryChartProps> = ({
  data,
  width = 400,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlightState, setPayTypeHighlight, clearHighlights } = useHighlight();
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!data || data.length === 0) return;

    const margin = { top: 40, right: 120, bottom: 80, left: 60 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Aggregate by Item Name (sum across Pay Types)
    const aggregatedByName = new Map<string, number>();
    data.forEach((d) => {
      const existing = aggregatedByName.get(d.itemName) || 0;
      aggregatedByName.set(d.itemName, existing + d.salesQty);
    });

    // Sort by total quantity and get top items
    const sortedItems = Array.from(aggregatedByName.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map((d) => d[0]);

    // Filter data to only include top items
    const filteredData = data.filter((d) => sortedItems.includes(d.itemName));

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(sortedItems)
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.salesQty)! * 1.1])
      .range([chartHeight, 0]);

    // Get unique pay types
    const payTypes = Array.from(new Set(filteredData.map((d) => d.payType)));
    const colorScale = d3.scaleOrdinal().domain(payTypes).range(
      payTypes.map(p => PAY_TYPE_COLORS[p] || '#ccc')
    );

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '9px');

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

    // Group bars by item name
    const groupedData = d3.group(filteredData, (d) => d.itemName);

    // Draw stacked bars
    groupedData.forEach((values, itemName) => {
      const x = xScale(itemName)!;
      let currentY = chartHeight;

      values.forEach((d) => {
        const barHeight = currentY - yScale(d.salesQty);

        g.append('rect')
          .attr('x', x)
          .attr('y', currentY)
          .attr('width', xScale.bandwidth())
          .attr('height', 0)
          .attr('fill', colorScale(d.payType) as string)
          .attr('opacity', () => {
            if (highlightState.payType && highlightState.payType !== d.payType) {
              return 0.2;
            }
            return 0.9;
          })
          .attr('stroke', '#000')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .on('click', () => {
            if (highlightState.payType === d.payType) {
              clearHighlights();
            } else {
              setPayTypeHighlight(d.payType);
            }
          })
          .on('mouseover', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', 1);
          })
          .on('mouseout', function () {
            if (highlightState.payType && highlightState.payType !== d.payType) {
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
          .attr('y', yScale(d.salesQty))
          .attr('height', barHeight);

        currentY = yScale(d.salesQty);
      });
    });

    // Add legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${dimensions.width - 110}, ${margin.top + 20})`);

    payTypes.forEach((payType, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(payType) as string)
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5);

      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '11px')
        .text(payType);
    });

    // Title
    svg
      .append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Items with Category');

  }, [data, dimensions, highlightState, setPayTypeHighlight, clearHighlights]);

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
