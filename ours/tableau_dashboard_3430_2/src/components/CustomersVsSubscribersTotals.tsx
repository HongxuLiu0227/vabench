import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TripData } from '../types';
import { useFilters } from '../contexts/FilterContext';
import { filterData } from '../services/dataLoader';
import './Worksheet.css';

interface CustomersVsSubscribersTotalsProps {
  data: TripData[];
}

// Color mapping from Tableau spec
const COLORS = {
  'Customer': '#4e79a7',
  'Subscriber': '#f28e2b'
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function CustomersVsSubscribersTotals({ data }: CustomersVsSubscribersTotalsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setFilter } = useFilters();
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.clientWidth - 40,
            height: Math.max(300, parent.clientHeight - 80)
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Filter data based on current filters
    const filteredData = filterData(data, filters);

    // Aggregate by month and usertype
    const aggregated = d3.rollup(
      filteredData,
      v => v.length,
      d => d.month,
      d => d.usertype
    );

    // Convert to array structure with cumulative sum
    const lineData: { month: number; usertype: 'Customer' | 'Subscriber'; count: number; cumulative: number }[] = [];
    const usertypes: Array<'Customer' | 'Subscriber'> = ['Customer', 'Subscriber'];

    usertypes.forEach(usertype => {
      let cumulative = 0;
      for (let month = 0; month < 12; month++) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = aggregated.get(month)?.get(usertype as any) || 0;
        cumulative += count;
        lineData.push({ month, usertype, count, cumulative });
      }
    });

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scalePoint()
      .domain(Array.from({ length: 12 }, (_, i) => i.toString()))
      .range([0, chartWidth]);

    const maxY = d3.max(lineData, d => d.cumulative) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([chartHeight, 0])
      .nice();

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d) => MONTH_LABELS[parseInt(d as string, 10)] || d);

    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
      .tickFormat(d3.format('~s'));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add axis title
    g.append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .text('Number of Trips');

    // Create line generator
    const line = d3.line<{ month: number; cumulative: number }>()
      .x((d) => xScale(d.month.toString()) || 0)
      .y(d => yScale(d.cumulative))
      .curve(d3.curveMonotoneX);

    // Draw lines
    usertypes.forEach(usertype => {
      const usertypeData = lineData.filter(d => d.usertype === usertype);

      // Add line
      g.append('path')
        .datum(usertypeData)
        .attr('class', 'line')
        .attr('d', line)
        .attr('stroke', COLORS[usertype as keyof typeof COLORS])
        .style('opacity', () => {
          if (filters.usertype && filters.usertype !== usertype) {
            return 0.3;
          }
          return 1;
        })
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          if (filters.usertype === usertype) {
            setFilter('usertype', undefined);
          } else {
            setFilter('usertype', usertype);
          }
        });

      // Add data points
      g.selectAll(`.point-${usertype}`)
        .data(usertypeData)
        .enter()
        .append('circle')
        .attr('class', `data-point point-${usertype}`)
        .attr('cx', (d) => xScale(d.month.toString()) || 0)
        .attr('cy', d => yScale(d.cumulative))
        .attr('r', 4)
        .attr('stroke', COLORS[usertype as keyof typeof COLORS])
        .style('opacity', d => {
          if (filters.usertype && filters.usertype !== usertype) {
            return 0.3;
          }
          if (filters.month !== undefined && filters.month !== d.month) {
            return 0.3;
          }
          return 1;
        })
        .on('click', (event, d) => {
          event.stopPropagation();
          const newUsertype = (filters.usertype === usertype) ? undefined : usertype;
          const newMonth = (filters.month === d.month) ? undefined : d.month;

          setFilter('usertype', newUsertype);
          if (newUsertype === usertype) {
            setFilter('month', newMonth);
          }
        })
        .append('title')
        .text(d => `${MONTH_LABELS[d.month]} ${usertype}: ${d.cumulative.toLocaleString()} cumulative trips`);
    });

  }, [data, filters, dimensions, setFilter]);

  return (
    <div className="worksheet">
      <h2 className="worksheet-title">Customers vs Subscribers Totals</h2>
      <div className="worksheet-content">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  );
}

export default CustomersVsSubscribersTotals;
