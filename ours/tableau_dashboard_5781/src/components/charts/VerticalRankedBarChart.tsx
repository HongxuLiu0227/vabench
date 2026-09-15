import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3'
import type { BarChartData } from '../../types'

import { formatNumber, formatCurrency, getClusterColor } from '../../utils/calculatedFields';

interface VerticalRankedBarChartProps {
  data: BarChartData[]
  title: string
  axisTitle?: string
  width?: number
  height?: number
  showLegend?: boolean
  highlightCluster?: string | null
  onBarClick?: (category: string) => void
  valueFormat?: 'number' | 'currency' | 'none'
}

export function VerticalRankedBarChart({
  data,
  title,
  axisTitle,
  width = 400,
  height = 300,
  showLegend = false,
  highlightCluster = null,
  onBarClick,
  valueFormat = 'number',
}: VerticalRankedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 20, bottom: axisTitle ? 60 : 50, left: 60 }
    const chartWidth = dimensions.width - margin.left - margin.right
    const chartHeight = dimensions.height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Sort data by value descending
    const sortedData = [...data].sort((a, b) => b.value - a.value)

    // Create scales
    const x = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.category))
      .range([0, chartWidth])
      .padding(0.3)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.value) || 0])
      .nice()
      .range([chartHeight, 0])

    // Create color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(sortedData.map((d) => d.category))
      .range(sortedData.map((d) => (d.cluster !== undefined ? getClusterColor(d.cluster) : '#4e79a7')))

    // Add bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.category) || 0)
      .attr('width', x.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('fill', (d) => colorScale(d.category) as string)
      .attr('opacity', function(d): number {
        if (highlightCluster && d.category !== highlightCluster) {
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
        const opacity = highlightCluster && d.category !== highlightCluster ? 0.3 : 1
        d3.select(this).attr('opacity', opacity)
      })
      .transition()
      .duration(750)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => chartHeight - y(d.value))

    // Add x-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')

    // Add y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')

    // Add x-axis label
    if (axisTitle) {
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 45)
        .style('font-size', '13px')
        .style('font-family', 'sans-serif')
        .style('font-weight', '500')
        .text(axisTitle)
    }

    // Add title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('text-anchor', 'middle')
      .attr('x', dimensions.width / 2)
      .attr('y', 20)
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
      .attr('x', (d) => (x(d.category) || 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif')
      .style('fill', '#333')
      .style('opacity', 0)
      .text((d) => {
        if (valueFormat === 'currency') {
          return formatCurrency(d.value)
        } else if (valueFormat === 'number') {
          return formatNumber(d.value)
        }
        return String(d.value)
      })
      .transition()
      .delay(500)
      .duration(500)
      .style('opacity', 1)

    // Add legend
    if (showLegend) {
      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${dimensions.width - 120}, 20)`)

      sortedData.forEach((d, i) => {
        const legendRow = legend
          .append('g')
          .attr('transform', `translate(0, ${i * 20})`)

        legendRow
          .append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', colorScale(d.category) as string)
          .attr('rx', 2)

        legendRow
          .append('text')
          .attr('x', 18)
          .attr('y', 10)
          .style('font-size', '11px')
          .style('font-family', 'sans-serif')
          .text(d.category)
      })
    }
  }, [data, dimensions, title, axisTitle, showLegend, highlightCluster, onBarClick, valueFormat])

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
