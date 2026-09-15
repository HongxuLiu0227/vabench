import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3'
import type { ScatterPlotData, MAECategory } from '../../types'

import { getMAEColor } from '../../utils/calculatedFields';

interface ScatterPlotProps {
  data: ScatterPlotData[]
  title: string
  xAxisTitle: string
  yAxisTitle: string
  width?: number
  height?: number
  highlightCategory?: MAECategory | null
  onPointClick?: (point: ScatterPlotData) => void
}

export function ScatterPlot({
  data,
  title,
  xAxisTitle,
  yAxisTitle,
  width = 600,
  height = 500,
  highlightCategory = null,
  onPointClick,
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 60, right: 30, bottom: 70, left: 80 }
    const chartWidth = dimensions.width - margin.left - margin.right
    const chartHeight = dimensions.height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.x) || 0,
        d3.max(data, (d) => d.x) || 0,
      ])
      .nice()
      .range([0, chartWidth])

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.y) || 0,
        d3.max(data, (d) => d.y) || 0,
      ])
      .nice()
      .range([chartHeight, 0])

    // Add diagonal reference line (y = x)
    g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', 0)
      .attr('y1', chartHeight)
      .attr('x2', chartWidth)
      .attr('y2', 0)
      .style('stroke', '#ccc')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '5,5')

    // Add x-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')

    // Add y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(6))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')

    // Add x-axis label
    g.append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 45)
      .style('font-size', '13px')
      .style('font-family', 'sans-serif')
      .style('font-weight', '500')
      .text(xAxisTitle)

    // Add y-axis label
    g.append('text')
      .attr('class', 'y-axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -60)
      .style('font-size', '13px')
      .style('font-family', 'sans-serif')
      .style('font-weight', '500')
      .text(yAxisTitle)

    // Add title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('text-anchor', 'middle')
      .attr('x', dimensions.width / 2)
      .attr('y', 30)
      .style('font-size', '14px')
      .style('font-family', 'sans-serif')
      .style('font-weight', '600')
      .text(title)

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(255, 255, 255, 0.95)')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')

    // Add points
    g.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d) => x(d.x))
      .attr('cy', (d) => y(d.y))
      .attr('r', 0)
      .attr('fill', (d) => getMAEColor(d.maeCategory))
      .attr('opacity', (d) => {
        if (highlightCategory && d.maeCategory !== highlightCategory) {
          return 0.2
        }
        return 0.7
      })
      .attr('stroke', (d) => getMAEColor(d.maeCategory))
      .attr('stroke-width', 1)
      .on('click', (_event, d) => {
        if (onPointClick) {
          onPointClick(d)
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 8)
          .attr('opacity', 1)

        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="margin-bottom: 5px; font-weight: 600;">${d.colorId}</div>
            <div>Observed: ${d.x.toFixed(2)}</div>
            <div>Predicted: ${d.y.toFixed(2)}</div>
            <div>MAE: ${d.mae.toFixed(2)}</div>
            <div style="margin-top: 5px; color: ${getMAEColor(d.maeCategory)}; font-weight: 500;">
              ${d.maeCategory}
            </div>
            <div style="margin-top: 5px; font-size: 11px; color: #666;">
              Merchant: ${d.merchantId}<br/>
              Cluster: ${d.cluster}<br/>
              Season: ${d.season}<br/>
              Month: ${d.month}
            </div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px')
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px')
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .attr('r', 5)
          .attr('opacity', highlightCategory && d.maeCategory !== highlightCategory ? 0.2 : 0.7)

        tooltip.style('visibility', 'hidden')
      })
      .transition()
      .duration(500)
      .attr('r', 5)

    // Add legend
    const legendData = [
      { category: 'Low Variance', color: getMAEColor('Low Variance') },
      { category: 'Medium Variance', color: getMAEColor('Medium Variance') },
      { category: 'High Variance', color: getMAEColor('High Variance') },
    ]

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${dimensions.width - 140}, 50)`)

    legendData.forEach((d, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 25})`)

      legendRow
        .append('circle')
        .attr('r', 6)
        .attr('fill', d.color)
        .attr('opacity', 0.7)
        .attr('stroke', d.color)
        .attr('stroke-width', 1)

      legendRow
        .append('text')
        .attr('x', 15)
        .attr('y', 4)
        .style('font-size', '12px')
        .style('font-family', 'sans-serif')
        .text(d.category)
    })

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove()
    }
  }, [data, dimensions, title, xAxisTitle, yAxisTitle, highlightCategory, onPointClick])

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
