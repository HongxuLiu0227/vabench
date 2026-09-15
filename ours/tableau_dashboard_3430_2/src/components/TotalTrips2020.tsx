import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TripData } from '../types';
import { useFilters } from '../contexts/FilterContext';
import { filterData } from '../services/dataLoader';
import './Worksheet.css';

interface TotalTrips2020Props {
  data: TripData[];
}

// Color mapping from Tableau spec
const COLORS = {
  'Customer': '#4e79a7',
  'Subscriber': '#f28e2b'
};

function TotalTrips2020({ data }: TotalTrips2020Props) {
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

    // Aggregate by usertype
    const aggregated = d3.rollup(
      filteredData,
      v => v.length,
      d => d.usertype
    );

    // Convert to array and sort by count descending
    const chartData = Array.from(aggregated, ([usertype, count]) => ({
      usertype: usertype as 'Customer' | 'Subscriber',
      count
    })).sort((a, b) => b.count - a.count);

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.usertype))
      .range([0, chartWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.count) || 0])
      .range([chartHeight, 0])
      .nice();

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

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

    // Create bars
    const bars = g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.usertype) || 0)
      .attr('y', chartHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', d => COLORS[d.usertype])
      .style('cursor', 'pointer')
      .style('opacity', d => {
        // Highlight if filtered by this usertype
        if (filters.usertype && filters.usertype !== d.usertype) {
          return 0.3;
        }
        return 1;
      });

    // Animate bars
    bars.transition()
      .duration(750)
      .attr('y', d => yScale(d.count))
      .attr('height', d => chartHeight - yScale(d.count));

    // Add click handler for filtering
    bars.on('click', (event, d) => {
      event.stopPropagation();
      // Toggle filter
      if (filters.usertype === d.usertype) {
        setFilter('usertype', undefined);
      } else {
        setFilter('usertype', d.usertype);
      }
    });

    // Add tooltips
    bars.append('title')
      .text(d => `${d.usertype}: ${d.count.toLocaleString()} trips`);

  }, [data, filters, dimensions, setFilter]);

  return (
    <div className="worksheet">
      <h2 className="worksheet-title">Amount of trips total during 2020</h2>
      <div className="worksheet-content">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  );
}

export default TotalTrips2020;
