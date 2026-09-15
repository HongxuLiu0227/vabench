import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { SwimmerData, AggregatedByAge } from '../types/swimming';
import './SwimmersByAge.css';

interface SwimmersByAgeProps {
  data: SwimmerData[];
  filters?: {
    selectedCompCountry?: string[];
    selectedRankSwimmer?: string | null;
    selectedRankTrainer?: string | null;
  };
  onGenderClick?: (gender: string | null) => void;
  selectedGender?: string | null;
  width?: number;
  height?: number;
}

const GENDER_COLORS: Record<string, string> = {
  'M': '#aec7e8',
  'F': '#ff9da7',
  '': '#4e79a7',
  'Unknown': '#4e79a7'
};

export const SwimmersByAge: React.FC<SwimmersByAgeProps> = ({
  data,
  filters = {},
  onGenderClick,
  selectedGender,
  width = 500,
  height = 400
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Aggregate data when filters change using useMemo
  const aggregatedData = useMemo(() => {
    let filteredData = data;

    // Apply Competition Country filter
    if (filters.selectedCompCountry && filters.selectedCompCountry.length > 0) {
      filteredData = filteredData.filter(row =>
        filters.selectedCompCountry!.includes(row.Сountry)
      );
    }

    // Apply rank filters from interaction
    if (filters.selectedRankSwimmer) {
      filteredData = filteredData.filter(row => row.RankSwimmers === filters.selectedRankSwimmer);
    }
    if (filters.selectedRankTrainer) {
      filteredData = filteredData.filter(row => row.RankTrainer === filters.selectedRankTrainer);
    }

    // Aggregate by age and gender
    const aggregation = new Map<string, AggregatedByAge>();

    filteredData.forEach(row => {
      if (row.Age === undefined) return;

      const gender = row.GenderSwimmer || 'Unknown';
      const key = `${row.Age}|${gender}`;
      const existing = aggregation.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        aggregation.set(key, {
          Age: row.Age,
          GenderSwimmer: gender,
          count: 1
        });
      }
    });

    return Array.from(aggregation.values());
  }, [data, filters.selectedCompCountry, filters.selectedRankSwimmer, filters.selectedRankTrainer]);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || aggregatedData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Group data by age
    const ageGroups = d3.group(aggregatedData, d => d.Age);
    const ages = Array.from(ageGroups.keys()).sort((a, b) => a - b);

    // Get unique genders
    const genders = Array.from(new Set(aggregatedData.map(d => d.GenderSwimmer)));

    // Calculate total counts per age for sorting (descending)
    const ageTotals = new Map(
      Array.from(ageGroups.entries()).map(([age, data]) => [
        age,
        d3.sum(data, d => d.count)
      ])
    );
    ages.sort((a, b) => (ageTotals.get(b) || 0) - (ageTotals.get(a) || 0));

    // Create scales
    const xScale = d3.scaleBand()
      .domain(ages.map(String))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(Array.from(ageTotals.values())) || 0])
      .nice()
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(genders)
      .range(genders.map(g => GENDER_COLORS[g] || GENDER_COLORS['Unknown']));

    // Create stacked data
    const stackedData = ages.map(age => {
      const ageData = ageGroups.get(age);
      if (!ageData) return { age, values: [] };

      return {
        age,
        values: genders.map(gender => {
          const entry = ageData.find(d => d.GenderSwimmer === gender);
          return {
            gender,
            count: entry ? entry.count : 0
          };
        })
      };
    });

    // Draw bars
    const barWidth = xScale.bandwidth();

    stackedData.forEach(({ age, values }) => {
      const x = xScale(String(age));
      if (!x) return;

      values.forEach(({ gender, count }) => {
        if (count === 0) return;

        const isHighlighted = selectedGender === null || selectedGender === gender;
        const opacity = selectedGender !== null ? (isHighlighted ? 1 : 0.3) : 1;

        g.append('rect')
          .attr('x', x)
          .attr('y', chartHeight - yScale(count))
          .attr('width', barWidth)
          .attr('height', yScale(count))
          .attr('fill', colorScale(gender) as string)
          .attr('opacity', opacity)
          .attr('class', 'bar-segment')
          .attr('data-age', age)
          .attr('data-gender', gender)
          .on('click', (event) => {
            event.stopPropagation();
            if (onGenderClick) {
              onGenderClick(selectedGender === gender ? null : gender);
            }
          })
          .on('mouseover', (event) => {
            const content = `Age: ${age}<br/>Gender: ${gender}<br/>Count: ${count}`;
            setTooltip({
              x: event.pageX + 10,
              y: event.pageY - 10,
              content
            });
          })
          .on('mouseout', () => {
            setTooltip(null);
          });

        // Add label if bar is tall enough
        const barHeight = yScale(0) - yScale(count);
        if (barHeight > 15) {
          g.append('text')
            .attr('x', x + barWidth / 2)
            .attr('y', chartHeight - yScale(count) + barHeight / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#555555')
            .attr('font-size', '8px')
            .attr('pointer-events', 'none')
            .text(count);
        }
      });
    });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // X axis label
    g.append('text')
      .attr('transform', `translate(${chartWidth / 2},${chartHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Age');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -chartHeight / 2)
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Count of Swimmers');

  }, [aggregatedData, width, height, selectedGender, onGenderClick]);

  // Handle click on background to clear selection
  const handleSvgClick = () => {
    if (onGenderClick) {
      onGenderClick(null);
    }
  };

  return (
    <div className="swimmers-by-age-container">
      <h3 className="chart-title">Amount of swimmers by Age</h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onClick={handleSvgClick}
        style={{ cursor: 'pointer' }}
      />
      {tooltip && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default SwimmersByAge;
