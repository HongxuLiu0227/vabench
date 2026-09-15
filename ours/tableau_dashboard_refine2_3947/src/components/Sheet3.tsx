import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { PrecedentData } from '../types';
import { VOTE_DIRECTION_COLORS, ISSUE_AREA_LABELS } from '../types';
import type { VoteDirection } from '../types';
import { useFilters } from '../contexts/FilterContext';

interface Sheet3Props {
  data: PrecedentData[];
  width?: number;
  height?: number;
}

export const Sheet3: React.FC<Sheet3Props> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlight, setHighlight, clearHighlight } = useFilters();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Group data by issueArea and vote_direction for line chart
    const groupedData = d3.groups(data, (d) => d.issueArea);

    // Get unique issue areas and sort them
    const issueAreas = groupedData.map((d) => d[0]).sort((a, b) => a - b);

    // Get unique vote directions
    const voteDirections = Array.from(new Set(data.map((d) => d.vote_direction))) as VoteDirection[];

    // Calculate max Y value
    const maxY = d3.max(data, (d) => d.sum) || 0;

    // Create scales
    const x = d3.scalePoint()
      .domain(issueAreas.map(String))
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, maxY])
      .range([chartHeight, 0])
      .nice();

    const color = d3.scaleOrdinal<VoteDirection, string>()
      .domain(voteDirections)
      .range(voteDirections.map(d => VOTE_DIRECTION_COLORS[d]));

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-chartWidth)
        .tickFormat(() => '')
      )
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .lower();

    // Draw lines for each vote direction
    voteDirections.forEach((voteDirection) => {
      // Create array of data points for this direction
      const lineData = issueAreas.map((issueArea) => {
        const found = data.find((d) => d.issueArea === issueArea && d.vote_direction === voteDirection);
        return {
          issueArea,
          sum: found?.sum || 0,
        };
      });

      // Only draw line if there's data
      if (lineData.some(d => d.sum > 0)) {
        const line = d3.line<typeof lineData[number]>()
          .x((d) => x(String(d.issueArea))!)
          .y((d) => y(d.sum))
          .curve(d3.curveMonotoneX)
          .defined((d) => d.sum > 0);

        // Draw line
        g.append('path')
          .datum(lineData)
          .attr('fill', 'none')
          .attr('stroke', color(voteDirection)!)
          .attr('stroke-width', 2.5)
          .attr('d', line)
          .style('opacity', () => {
            if (highlight.voteDirection !== null) {
              return highlight.voteDirection === voteDirection ? 1 : 0.2;
            }
            return 1;
          })
          .on('click', () => {
            if (highlight.voteDirection === voteDirection) {
              clearHighlight();
            } else {
              setHighlight({
                justiceName: null,
                voteDirection: voteDirection,
                issueArea: null,
                caseId: null,
                term: null,
              });
            }
          })
          .on('mouseover', function() {
            d3.select(this).attr('stroke-width', 4).attr('cursor', 'pointer');
          })
          .on('mouseout', function() {
            d3.select(this).attr('stroke-width', 2.5);
          });

        // Draw dots
        g.selectAll(`.dot-${voteDirection}`)
          .data(lineData)
          .join('circle')
          .attr('class', `dot-${voteDirection}`)
          .attr('cx', (d) => x(String(d.issueArea))!)
          .attr('cy', (d) => y(d.sum))
          .attr('r', 4)
          .attr('fill', color(voteDirection)!)
          .attr('stroke', 'white')
          .attr('stroke-width', 1.5)
          .style('opacity', (d) => {
            if (d.sum === 0) return 0;
            if (highlight.voteDirection !== null) {
              return highlight.voteDirection === voteDirection ? 1 : 0.2;
            }
            return 1;
          })
          .style('display', (d) => d.sum > 0 ? 'block' : 'none')
          .on('click', () => {
            if (highlight.voteDirection === voteDirection) {
              clearHighlight();
            } else {
              setHighlight({
                justiceName: null,
                voteDirection: voteDirection,
                issueArea: null,
                caseId: null,
                term: null,
              });
            }
          })
          .on('mouseover', function() {
            d3.select(this).attr('r', 6).attr('cursor', 'pointer');
          })
          .on('mouseout', function() {
            d3.select(this).attr('r', 4);
          });
      }
    });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat((d) => {
        const num = Number(d);
        return ISSUE_AREA_LABELS[num as keyof typeof ISSUE_AREA_LABELS] || d;
      }))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .attr('dy', '0.35em')
      .attr('transform', 'rotate(-25)')
      .attr('dx', '-0.5em');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(8))
      .selectAll('text')
      .style('font-size', '11px');

    // Title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Precedent Changing Votes (1949 - 2018)');

  }, [data, width, height, highlight, setHighlight, clearHighlight]);

  return (
    <div className="sheet3">
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
    </div>
  );
};
