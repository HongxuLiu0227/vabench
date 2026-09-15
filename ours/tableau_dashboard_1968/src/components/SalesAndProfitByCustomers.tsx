import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { CustomerData } from '../services/dataLoader';
import { getProfitRatioColor, formatCurrency } from '../utils/chartUtils';
import { useDashboard } from '../contexts/DashboardContext';

interface SalesAndProfitByCustomersProps {
  data: CustomerData[];
  width?: number;
  height?: number;
}

export function SalesAndProfitByCustomers({
  data,
  width = 500,
  height = 600
}: SalesAndProfitByCustomersProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state, setSelectedCustomer, setHoveredCustomer } = useDashboard();

  // Filter data based on selected region
  const filteredData = useMemo(() => {
    if (!state.selectedRegion) return data;
    return data.filter((d) => d.region === state.selectedRegion);
  }, [data, state.selectedRegion]);

  // Calculate domains
  const xDomain = useMemo(() => {
    const sales = filteredData.map((d) => d.sales);
    return [0, Math.max(...sales) * 1.1];
  }, [filteredData]);

  const yDomain = useMemo(() => {
    const profits = filteredData.map((d) => d.profit);
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);
    return [minProfit * 1.1, maxProfit * 1.1];
  }, [filteredData]);

  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid-x')
      .attr('opacity', 0.1)
      .call(d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat(() => ''));

    g.append('g')
      .attr('class', 'grid-y')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''));

    // Add zero line for profit
    const zeroY = yScale(0);
    if (zeroY >= 0 && zeroY <= innerHeight) {
      g.append('line')
        .attr('class', 'zero-line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', zeroY)
        .attr('y2', zeroY)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5');
    }

    // Create circles
    const circles = g
      .selectAll('.circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', 6)
      .attr('fill', (d) => getProfitRatioColor(d.profitRatio))
      .attr('fill-opacity', 0.7)
      .attr('stroke', (d) => getProfitRatioColor(d.profitRatio))
      .attr('stroke-width', (d) =>
        state.hoveredCustomer && state.hoveredCustomer === d.customerName ? 3 : 1
      )
      .attr('opacity', (d) =>
        state.hoveredCustomer && state.hoveredCustomer !== d.customerName ? 0.3 : 1
      )
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // Toggle selection
        if (state.selectedCustomer === d.customerName) {
          setSelectedCustomer(null);
        } else {
          setSelectedCustomer(d.customerName);
        }
      })
      .on('mouseover', function(event, d) {
        setHoveredCustomer(d.customerName);
        d3.select(this).attr('r', 8).attr('fill-opacity', 1);
      })
      .on('mouseout', function(event, d) {
        setHoveredCustomer(null);
        d3.select(this).attr('r', 6).attr('fill-opacity', 0.7);
      });

    // X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((d: any) => {
        const value = Number(d);
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return String(value);
      }))
      .selectAll('text')
      .style('font-size', '11px');

    // X axis label
    g.append('text')
      .attr('class', 'x-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Sales');

    // Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickFormat((d: any) => {
        const value = Number(d);
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return String(value);
      }))
      .selectAll('text')
      .style('font-size', '11px');

    // Y axis label
    g.append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Profit');

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

    circles.on('mousemove', function(event, d) {
      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="font-weight: bold; margin-bottom: 4px;">${d.customerName}</div>
          <div>Region: ${d.region}</div>
          <div>Segment: ${d.segment}</div>
          <div>Sales: ${formatCurrency(d.sales)}</div>
          <div>Profit: ${formatCurrency(d.profit)}</div>
          <div>Profit Ratio: ${(d.profitRatio * 100).toFixed(1)}%</div>
        `)
        .style('top', (event.pageY - 60) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    }).on('mouseout', function() {
      tooltip.style('visibility', 'hidden');
    });

    return () => {
      tooltip.remove();
    };
  }, [filteredData, xDomain, yDomain, width, height, state.hoveredCustomer, state.selectedCustomer, setHoveredCustomer, setSelectedCustomer]);

  return (
    <div className="sales-and-profit-by-customers" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
}
