import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TripData } from '../types';
import { useFilters } from '../contexts/FilterContext';
import { filterData } from '../services/dataLoader';
import './Worksheet.css';

interface MaleVsFemaleTotalsProps {
  data: TripData[];
}

// Color mapping from Tableau spec
const COLORS = {
  'Customer': '#4e79a7',
  'Subscriber': '#f28e2b'
};

function MaleVsFemaleTotals({ data }: MaleVsFemaleTotalsProps) {
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

    // Filter data based on current filters and exclude Unknown gender
    const filteredData = filterData(data, filters).filter(d => d.gender !== 'Unknown');

    // Aggregate by gender and usertype
    const aggregated = d3.rollup(
      filteredData,
      v => v.length,
      d => d.gender,
      d => d.usertype
    );

    // Convert to nested array structure
    const chartData: Array<{ gender: string; usertype: string; count: number }> = [];
    aggregated.forEach((usertypeMap, gender) => {
      usertypeMap.forEach((count, usertype) => {
        chartData.push({ gender, usertype, count });
      });
    });

    // Sort by count descending for ranking
    chartData.sort((a, b) => b.count - a.count);

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    // Nested categories: Gender > Usertype
    const categories = chartData.map(d => `${d.gender} - ${d.usertype}`);
    const xScale = d3.scaleBand()
      .domain(categories)
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
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-35)');

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
      .text('Number of People');

    // Create bars
    const bars = g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(`${d.gender} - ${d.usertype}`) || 0)
      .attr('y', chartHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', d => COLORS[d.usertype as keyof typeof COLORS])
      .style('cursor', 'pointer')
      .style('opacity', d => {
        // Highlight based on filters
        if (filters.gender && filters.gender !== d.gender) {
          return 0.3;
        }
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

      // Set both gender and usertype filters
      const newGender = (filters.gender === d.gender) ? undefined : d.gender;
      const newUsertype = (filters.usertype === d.usertype) ? undefined : d.usertype;

      setFilter('gender', newGender);
      setFilter('usertype', newUsertype);
    });

    // Add tooltips
    bars.append('title')
      .text(d => `${d.gender} - ${d.usertype}: ${d.count.toLocaleString()} people`);

  }, [data, filters, dimensions, setFilter]);

  return (
    <div className="worksheet">
      <h2 className="worksheet-title">Male vs Female Rider Totals</h2>
      <div className="worksheet-content">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  );
}

export default MaleVsFemaleTotals;
