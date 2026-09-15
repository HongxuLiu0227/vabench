import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AgeGroupData } from '../utils/data';

interface PremiumsFallChartProps {
  data: AgeGroupData[];
  selectedGender?: 'Male' | 'Female' | null;
  width?: number;
  height?: number;
}

const PremiumsFallChart: React.FC<PremiumsFallChartProps> = ({
  data,
  selectedGender = null,
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

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.age.toString()))
      .range([0, innerWidth])
      .padding(0.5);

    const maxY = d3.max(data, (d) => d.avgPremium) || 1400;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxY * 1.1])
      .range([innerHeight, 0]);

    const xAxis = d3
      .axisBottom(d3.scaleBand().range([0, innerWidth]).padding(0.5))
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

    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.age.toString())! + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.avgPremium))
      .attr('r', 6)
      .style('fill', '#55557f')
      .style('opacity', selectedGender ? 0.3 : 1)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 8)
          .style('opacity', 1);

        tooltip
          .style('visibility', 'visible')
          .html(
            `
            <div style="margin-bottom: 4px;">
              <span style="color: #666;">Age:</span>
              <strong>${d.age}</strong>
            </div>
            <div>
              <span style="color: #666;">Premium:</span>
              <strong>$${d3.format(',.0f')(d.avgPremium)}</strong>
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
          .attr('r', 6)
          .style('opacity', selectedGender ? 0.3 : 1);

        tooltip.style('visibility', 'hidden');
      })
      .on('click', function (event) {
        event.stopPropagation();
      });

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
  }, [data, width, height, selectedGender]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 'normal',
          fontFamily: 'sans-serif',
          color: '#333333',
        }}
      >
        Premiums fall as age increases
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

export default PremiumsFallChart;
