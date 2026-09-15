import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { CustomerData } from '../services/dataLoader';
import { getProfitRatioColor, formatCurrency, calculateRank } from '../utils/chartUtils';
import { useDashboard } from '../contexts/DashboardContext';

interface CustomerRankProps {
  data: CustomerData[];
  width?: number;
  height?: number;
  maxBars?: number;
}

export function CustomerRank({ data, width = 400, height = 600, maxBars = 20 }: CustomerRankProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state, setHoveredCustomer } = useDashboard();

  // Sort by sales descending and take top N
  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, maxBars);
  }, [data, maxBars]);

  // Calculate max sales for scale
  const maxSales = useMemo(() => {
    return Math.max(...chartData.map((d) => d.sales));
  }, [chartData]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 20, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const barHeight = innerHeight / chartData.length;
    const barGap = 2;

    // Create scale for bar width
    const xScale = d3
      .scaleLinear()
      .domain([0, maxSales])
      .range([0, innerWidth]);

    // Create bar groups
    const bars = g
      .selectAll('.bar-group')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (d, i) => `translate(0,${i * barHeight})`);

    // Bar background
    bars
      .append('rect')
      .attr('class', 'bar-bg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', barHeight - barGap)
      .attr('fill', '#f5f5f5')
      .attr('rx', 2);

    // Bar foreground
    bars
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', (d) => xScale(d.sales))
      .attr('height', barHeight - barGap)
      .attr('fill', (d) => getProfitRatioColor(d.profitRatio))
      .attr('fill-opacity', 0.8)
      .attr('rx', 2)
      .attr('stroke', (d) =>
        state.hoveredCustomer && state.hoveredCustomer !== d.customerName ? '#ccc' : getProfitRatioColor(d.profitRatio)
      )
      .attr('stroke-width', (d) =>
        state.hoveredCustomer && state.hoveredCustomer !== d.customerName ? 1 : 2
      )
      .attr('opacity', (d) =>
        state.hoveredCustomer && state.hoveredCustomer !== d.customerName ? 0.3 : 1
      )
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        setHoveredCustomer(d.customerName);
        d3.select(this).attr('fill-opacity', 1);
      })
      .on('mouseout', function(event, d) {
        setHoveredCustomer(null);
        d3.select(this).attr('fill-opacity', 0.8);
      });

    // Customer name text (inside bar if wide enough, otherwise outside)
    bars
      .append('text')
      .attr('class', 'customer-name')
      .attr('x', 5)
      .attr('y', (barHeight - barGap) / 2)
      .attr('dominant-baseline', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('pointer-events', 'none')
      .style('fill', (d) => {
        const barWidth = xScale(d.sales);
        return barWidth > 100 ? '#fff' : '#000';
      })
      .text((d) => {
        const maxWidth = xScale(d.sales) - 10;
        const text = d.customerName;
        if (maxWidth < 50) return '';
        if (text.length > 20 && maxWidth < 150) return text.substring(0, 17) + '...';
        return text;
      });

    // Sales value text
    bars
      .append('text')
      .attr('class', 'sales-value')
      .attr('x', (d) => Math.max(xScale(d.sales) + 5, 100))
      .attr('y', (barHeight - barGap) / 2)
      .attr('dominant-baseline', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('fill', '#333')
      .text((d) => formatCurrency(d.sales));

    // X-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d: any) => {
        const value = Number(d);
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return String(value);
      }))
      .selectAll('text')
      .style('font-size', '10px');

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('font-size', '12px')
      .style('z-index', '1000');

    bars.on('mouseover', function(event, d) {
      const rank = calculateRank(
        chartData.map((c) => c.sales),
        d.sales
      );
      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="font-weight: bold; margin-bottom: 4px;">${d.customerName}</div>
          <div>Rank: #${rank}</div>
          <div>Sales: ${formatCurrency(d.sales)}</div>
          <div>Profit: ${formatCurrency(d.profit)}</div>
          <div>Profit Ratio: ${((d.profitRatio) * 100).toFixed(1)}%</div>
          <div>Region: ${d.region}</div>
          <div>Segment: ${d.segment}</div>
        `);
    }).on('mousemove', function(event) {
      tooltip
        .style('top', (event.pageY + 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    }).on('mouseout', function() {
      tooltip.style('visibility', 'hidden');
    });

    return () => {
      tooltip.remove();
    };
  }, [chartData, maxSales, width, height, state.hoveredCustomer, setHoveredCustomer]);

  return (
    <div className="customer-rank" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
}
