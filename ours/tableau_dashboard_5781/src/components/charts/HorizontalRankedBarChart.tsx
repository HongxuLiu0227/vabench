import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3'
import type { BarChartData, MAECategory } from '../../types'

import { formatNumber } from '../../utils/calculatedFields';

interface HorizontalRankedBarChartProps {
  data: BarChartData[]
  title: string
  xAxisTitle?: string
  yAxisTitle?: string
  width?: number
  height?: number
  highlightCategory?: MAECategory | null
  onBarClick?: (category: string) => void
  seriesOrder?: string[]
}

export function HorizontalRankedBarChart({
  data,
  title,
  xAxisTitle,
  yAxisTitle,
  width = 600,
  height = 400,
  highlightCategory = null,
  onBarClick,
  seriesOrder,
}: HorizontalRankedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 50, right: xAxisTitle ? 70 : 30, bottom: 40, left: yAxisTitle ? 80 : 60 }
    const chartWidth = dimensions.width - margin.left - margin.right
    const chartHeight = dimensions.height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Sort data by series_order if provided, otherwise by value descending
    const sortedData = [...data]
    if (seriesOrder && seriesOrder.length > 0) {
      const validOrder = seriesOrder.filter(cat => cat !== '%all%')
      sortedData.sort((a, b) => {
        const indexA = validOrder.indexOf(a.category)
        const indexB = validOrder.indexOf(b.category)
        if (indexA === -1 && indexB === -1) return b.value - a.value
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })
    } else {
      sortedData.sort((a, b) => b.value - a.value)
    }

    // Create scales
    const y = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.category))
      .range([0, chartHeight])
      .padding(0.3)

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.value) || 0])
      .nice()
      .range([0, chartWidth])

    // Create color scale based on MAE category
    const colorScale = (category: string): string => {
      if (category === 'Low Variance' || category === 'LOW Varaince') return '#59a14f'
      if (category === 'Medium Variance') return '#f28e2b'
      if (category === 'High Variance') return '#e15759'
      return '#bab0ac'
    }

    // Add bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.category) || 0)
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', (d) => colorScale(d.category))
      .attr('opacity', (d) => {
        if (highlightCategory && d.category !== highlightCategory) {
          return 0.3
        }
        return 1
      })
      .attr('rx', 2)
      .on('click', (_event, d) => {
        if (onBarClick) {
          onBarClick(d.category)
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8)
      })
      .on('mouseout', function(_event, d) {
        const opacity = highlightCategory && d.category !== highlightCategory ? 0.3 : 1
        d3.select(this).attr('opacity', opacity)
      })
      .transition()
      .duration(750)
      .attr('width', (d) => x(d.value))

    // Add y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')

    // Add x-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')

    // Add y-axis label
    if (yAxisTitle) {
      g.append('text')
        .attr('class', 'y-axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -55)
        .style('font-size', '13px')
        .style('font-family', 'sans-serif')
        .style('font-weight', '500')
        .text(yAxisTitle)
    }

    // Add x-axis label
    if (xAxisTitle) {
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 35)
        .style('font-size', '13px')
        .style('font-family', 'sans-serif')
        .style('font-weight', '500')
        .text(xAxisTitle)
    }

    // Add title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('text-anchor', 'middle')
      .attr('x', dimensions.width / 2)
      .attr('y', 25)
      .style('font-size', '14px')
      .style('font-family', 'sans-serif')
      .style('font-weight', '600')
      .text(title)

    // Add value labels on bars
    g.selectAll('.bar-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('y', (d) => (y(d.category) || 0) + y.bandwidth() / 2)
      .attr('x', (d) => x(d.value) + 5)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif')
      .style('fill', '#333')
      .style('opacity', 0)
      .text((d) => formatNumber(Math.round(d.value)))
      .transition()
      .delay(500)
      .duration(500)
      .style('opacity', 1)

  }, [data, dimensions, title, xAxisTitle, yAxisTitle, highlightCategory, onBarClick, seriesOrder])

  useEffect(() => {
    const updateDimensions = () => {
      const parent = svgRef.current?.parentElement
      if (parent) {
        const newWidth = Math.min(parent.clientWidth, width)
        setDimensions({ width: newWidth, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [width, height])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  )
}
