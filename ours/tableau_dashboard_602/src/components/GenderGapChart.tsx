import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GenderAgeData } from '../utils/data';

interface GenderGapChartProps {
  data: GenderAgeData[];
  selectedGender?: 'Male' | 'Female' | null;
  onGenderSelect?: (gender: 'Male' | 'Female' | null) => void;
  width?: number;
  height?: number;
}

const GENDER_COLORS: Record<'Male' | 'Female', string> = {
  Male: '#4e79a7',
  Female: '#f28e2b',
};

const GenderGapChart: React.FC<GenderGapChartProps> = ({
  data,
  selectedGender = null,
  onGenderSelect,
  width = 800,
  height = 350,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const groupedData = d3.groups(data, (d) => d.gender);

    const allAges = Array.from(new Set(data.map((d) => d.age))).sort((a, b) => a - b);

    const xScale = d3
      .scaleBand()
      .domain(allAges.map((d) => d.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const maxY = d3.max(data, (d) => d.premium) || 1400;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxY * 1.1])
      .range([innerHeight, 0]);

    const xAxis = d3
      .axisBottom(d3.scaleBand().range([0, innerWidth]).padding(0.2))
      .tickFormat((d) => d.toString());

    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `$${d3.format(',')(d as number)}`);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .style('fill', '#333333');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .style('fill', '#333333');

    g.selectAll('.domain, .tick line')
      .style('stroke', '#cccccc')
      .style('stroke-width', '1');

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    const lineGenerator = d3
      .line<(typeof data)[0]>()
      .x((d) => xScale(d.age.toString())! + xScale.bandwidth() / 2)
      .y((d) => yScale(d.premium))
      .curve(d3.curveMonotoneX);

    groupedData.forEach(([gender, genderData]) => {
      const genderKey = gender as 'Male' | 'Female';
      const isHighlighted =
        !selectedGender || selectedGender === genderKey;
      const opacity = isHighlighted ? 1 : 0.2;

      const linePath = g
        .append('path')
        .datum(genderData.sort((a, b) => a.age - b.age))
        .attr('fill', 'none')
        .attr('stroke', GENDER_COLORS[genderKey])
        .attr('stroke-width', 2)
        .attr('d', lineGenerator)
        .style('opacity', opacity)
        .style('cursor', 'pointer');

      linePath.on('click', (event) => {
        event.stopPropagation();
        if (onGenderSelect) {
          onGenderSelect(selectedGender === genderKey ? null : genderKey);
        }
      });

      g.selectAll(`.point-${genderKey}`)
        .data(genderData)
        .enter()
        .append('circle')
        .attr('class', `point-${genderKey}`)
        .attr('cx', (d) => xScale(d.age.toString())! + xScale.bandwidth() / 2)
        .attr('cy', (d) => yScale(d.premium))
        .attr('r', 4)
        .style('fill', GENDER_COLORS[genderKey])
        .style('opacity', opacity)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('r', 6)
            .style('opacity', 1);

          tooltip
            .style('visibility', 'visible')
            .html(
              `
              <div style="margin-bottom: 4px;">
                <span style="color: #666;">Age:</span>
                <strong>${d.age}</strong>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #666;">Gender:</span>
                <strong>${d.gender}</strong>
              </div>
              <div>
                <span style="color: #666;">Premium:</span>
                <strong>$${d3.format(',.0f')(d.premium)}</strong>
              </div>
            `
            )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mousemove', function (event) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('r', 4)
            .style('opacity', opacity);

          tooltip.style('visibility', 'hidden');
        })
        .on('click', function (event, d) {
          event.stopPropagation();
          if (onGenderSelect) {
            onGenderSelect(selectedGender === d.gender ? null : d.gender);
          }
        });
    });

    const annotationGroup = g
      .append('g')
      .attr('class', 'annotation')
      .style('opacity', 0);

    annotationGroup
      .append('rect')
      .attr('x', innerWidth * 0.7)
      .attr('y', innerHeight * 0.2)
      .attr('width', 120)
      .attr('height', 30)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('rx', 2);

    annotationGroup
      .append('text')
      .attr('x', innerWidth * 0.7 + 60)
      .attr('y', innerHeight * 0.2 + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif')
      .style('font-weight', 'bold')
      .text('Gender Gap Closes');

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-family', 'sans-serif')
      .style('fill', '#333333')
      .text('Age');

    return () => {
      tooltip.remove();
    };
  }, [data, width, height, selectedGender, onGenderSelect]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 'normal',
          fontFamily: 'sans-serif',
          color: '#333333',
        }}
      >
        Disparity in premium cost by gender
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  );
};

export default GenderGapChart;
