import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { UserTypeGenderYearData } from '../types';
import type { GenderText } from '../types';
import { GENDER_COLORS } from '../types';

interface UserTypeGenderYOYChartProps {
  data: UserTypeGenderYearData[];
  selectedGender: GenderText | null;
  onGenderClick: (gender: GenderText | null) => void;
}

const UserTypeGenderYOYChart = ({ data, selectedGender, onGenderClick }: UserTypeGenderYOYChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = 300;

    const margin = { top: 20, right: 20, bottom: 80, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const groupedData = data.map(d => ({
      ...d,
      label: `${d.usertype} - ${d.gender} - ${d.year}`
    }));

    groupedData.sort((a, b) => b.count - a.count);

    const x = d3.scaleBand()
      .domain(groupedData.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(groupedData, d => d.count) || 0])
      .nice()
      .range([chartHeight, 0]);

    const yAxis = d3.axisLeft(y).ticks(6);

    g.append('g')
      .call(yAxis)
      .attr('class', 'y-axis')
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-family', 'Segoe UI, Roboto, Helvetica, Arial, sans-serif');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 10)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-family', 'Segoe UI, Roboto, Helvetica, Arial, sans-serif')
      .text('Count of Trips');

    const bars = g.selectAll('.bar')
      .data(groupedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label)!)
      .attr('y', chartHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', d => GENDER_COLORS[d.gender])
      .attr('opacity', d => selectedGender && selectedGender !== d.gender ? 0.3 : 1)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onGenderClick(selectedGender === d.gender ? null : d.gender);
      });

    bars.transition()
      .duration(750)
      .attr('y', d => y(d.count)!)
      .attr('height', d => chartHeight - y(d.count)!);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('class', 'x-axis')
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('font-size', '10px')
      .attr('font-family', 'Segoe UI, Roboto, Helvetica, Arial, sans-serif');

  }, [data, selectedGender, onGenderClick]);

  return (
    <div className="chart-container">
      <h3 className="chart-title">UserType and Gender YOY</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default UserTypeGenderYOYChart;
