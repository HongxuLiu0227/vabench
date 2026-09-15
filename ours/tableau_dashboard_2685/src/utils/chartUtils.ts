import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { max } from 'd3-array';

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const TABLEAU_BLUE = '#4e79a7';

export function createVerticalBarChart(
  svgElement: SVGSVGElement,
  data: Array<{ category: string; value: number }>,
  width: number,
  height: number,
  margins: ChartMargins,
  selectedCategory: string | null,
  onBarClick: (category: string) => void
): void {
  select(svgElement).selectAll('*').remove();

  const svg = select(svgElement);
  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

  const g = svg
    .append('g')
    .attr('transform', `translate(${margins.left},${margins.top})`);

  const x = scaleBand()
    .domain(data.map((d) => d.category))
    .range([0, innerWidth])
    .padding(0.2);

  const y = scaleLinear()
    .domain([0, max(data, (d) => d.value) || 0])
    .range([innerHeight, 0])
    .nice();

  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(axisBottom(x))
    .selectAll('text')
    .style('text-anchor', 'middle');

  g.append('g')
    .call(axisLeft(y))
    .selectAll('text')
    .style('text-anchor', 'end');

  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d: { category: string; value: number }) => x(d.category) || 0)
    .attr('y', (d: { category: string; value: number }) => y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', (d: { category: string; value: number }) => innerHeight - y(d.value))
    .attr('fill', (d: { category: string; value: number }) =>
      d.category === selectedCategory ? adjustColor(TABLEAU_BLUE, -20) : TABLEAU_BLUE
    )
    .attr('stroke', (d: { category: string; value: number }) =>
      d.category === selectedCategory ? '#1f4787' : 'none'
    )
    .attr('stroke-width', (d: { category: string; value: number }) => (d.category === selectedCategory ? 2 : 0))
    .style('cursor', 'pointer')
    .on('click', (event: MouseEvent, d: { category: string; value: number }) => {
      event.stopPropagation();
      onBarClick(d.category);
    });
}

export function createHorizontalBarChart(
  svgElement: SVGSVGElement,
  data: Array<{ name: string; profit: number }>,
  width: number,
  height: number,
  margins: ChartMargins
): void {
  select(svgElement).selectAll('*').remove();

  const svg = select(svgElement);
  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

  const g = svg
    .append('g')
    .attr('transform', `translate(${margins.left},${margins.top})`);

  const y = scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, innerHeight])
    .padding(0.2);

  const x = scaleLinear()
    .domain([0, max(data, (d) => d.profit) || 0])
    .range([0, innerWidth])
    .nice();

  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(axisBottom(x))
    .selectAll('text')
    .style('text-anchor', 'middle');

  g.append('g')
    .call(axisLeft(y))
    .selectAll('text')
    .style('text-anchor', 'end');

  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('y', (d: { name: string; profit: number }) => y(d.name) || 0)
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('width', (d: { name: string; profit: number }) => x(d.profit))
    .attr('fill', TABLEAU_BLUE);
}

function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function calculateDynamicMargins(
  data: Array<{ category?: string; name?: string }>,
  orientation: 'vertical' | 'horizontal',
  defaultMargins: ChartMargins,
  minLabelWidth: number = 100
): ChartMargins {
  if (orientation === 'horizontal') {
    const maxLabelLength = max(data, (d) => (d.name || d.category || '').length) || 0;
    const estimatedWidth = maxLabelLength * 7;
    return {
      ...defaultMargins,
      left: Math.max(minLabelWidth, estimatedWidth + 10),
    };
  }

  return defaultMargins;
}
