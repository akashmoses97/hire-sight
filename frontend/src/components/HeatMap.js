/**
 * Role outcome heatmap visualization.
 *
 * This component uses D3 to render selection and rejection rates by job role
 * from the recruitment dataset returned by the backend heatmap endpoint.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

/*
Previous placeholder kept for reference. The intent was to replace this JSON dump
with a real D3 heatmap while keeping the same component name and API-driven data flow.

import React from 'react';

const HeatMap = ({ data }) => {
  if (!data) {
    return <div>Loading role conversion data...</div>;
  }

  return (
    <div className="heatmap-container">
      <div className="placeholder-message">
        <p>Role Conversion Heatmap Placeholder</p>
        <p>Will visualize conversion rates across different roles</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};
*/

const formatPercent = d3.format('.0%');

const HeatMap = ({ data }) => {
  const svgRef = useRef(null);

  const chartData = useMemo(() => {
    if (!data?.data?.length) {
      return null;
    }

    // Flatten each role into one cell per outcome so D3 can bind rectangles
    // directly to role/outcome combinations.
    const outcomes = data.outcomes ?? ['Selected %', 'Rejected %'];
    const roles = data.data.map((item) => item.role);
    const cells = data.data.flatMap((item) => [
      {
        role: item.role,
        outcome: outcomes[0],
        value: item.selected_rate,
        count: item.selected_count,
        total: item.total,
      },
      {
        role: item.role,
        outcome: outcomes[1],
        value: item.rejected_rate,
        count: item.rejected_count,
        total: item.total,
      },
    ]);

    const values = cells.map((item) => item.value);
    const minValue = d3.min(values);
    const maxValue = d3.max(values);
    const extentPadding = Math.max((maxValue - minValue) * 0.2, 0.01);
    const domainMin = Math.max(0, minValue - extentPadding);
    const domainMax = Math.min(1, maxValue + extentPadding);

    return { outcomes, roles, cells, domainMin, domainMax };
  }, [data]);

  useEffect(() => {
    if (!chartData || !svgRef.current) {
      return undefined;
    }

    const svg = d3.select(svgRef.current);
    // Rebuild the SVG contents on each update to avoid leftover marks from a previous render.
    svg.selectAll('*').remove();

    const margin = { top: 132, right: 180, bottom: 52, left: 280 };
    const cellWidth = 196;
    const cellHeight = 46;
    const width = margin.left + margin.right + chartData.outcomes.length * cellWidth;
    const height = margin.top + margin.bottom + chartData.roles.length * cellHeight;

    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.attr('width', '100%');
    svg.attr('height', height);
    svg.style('background', 'transparent');

    const color = d3
      .scaleDiverging(d3.interpolateRgbBasis(['#b42318', '#fef3c7', '#0f4c81']))
      .domain([chartData.domainMin, 0.5, chartData.domainMax]);

    const x = d3
      .scaleBand()
      .domain(chartData.outcomes)
      .range([margin.left, width - margin.right])
      .paddingInner(0.08);

    const y = d3
      .scaleBand()
      .domain(chartData.roles)
      .range([margin.top, height - margin.bottom])
      .paddingInner(0.08);

    const root = svg.append('g');
    const panelX = 26;
    const panelY = margin.top - 44;
    const panelWidth = width - margin.right - panelX + 24;
    const panelHeight = chartData.roles.length * cellHeight + 74;

    const defs = svg.append('defs');
    // Define reusable gradients and shadows up front for the panel, glow, and legend styling.
    const panelGradient = defs
      .append('linearGradient')
      .attr('id', 'heatmap-panel-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    panelGradient.append('stop').attr('offset', '0%').attr('stop-color', '#0f172a');
    panelGradient.append('stop').attr('offset', '45%').attr('stop-color', '#111827');
    panelGradient.append('stop').attr('offset', '100%').attr('stop-color', '#090f1f');

    const bgGlowLeft = defs
      .append('radialGradient')
      .attr('id', 'heatmap-glow-left')
      .attr('cx', '0%')
      .attr('cy', '0%')
      .attr('r', '80%');
    bgGlowLeft.append('stop').attr('offset', '0%').attr('stop-color', '#1d4ed8').attr('stop-opacity', 0.18);
    bgGlowLeft.append('stop').attr('offset', '100%').attr('stop-color', '#1d4ed8').attr('stop-opacity', 0);

    const bgGlowRight = defs
      .append('radialGradient')
      .attr('id', 'heatmap-glow-right')
      .attr('cx', '100%')
      .attr('cy', '100%')
      .attr('r', '85%');
    bgGlowRight.append('stop').attr('offset', '0%').attr('stop-color', '#f97316').attr('stop-opacity', 0.22);
    bgGlowRight.append('stop').attr('offset', '100%').attr('stop-color', '#f97316').attr('stop-opacity', 0);

    const legendCardGradient = defs
      .append('linearGradient')
      .attr('id', 'heatmap-legend-card')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');
    legendCardGradient.append('stop').attr('offset', '0%').attr('stop-color', '#1a2438');
    legendCardGradient.append('stop').attr('offset', '100%').attr('stop-color', '#111827');

    const shadow = defs.append('filter').attr('id', 'heatmap-panel-shadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    shadow.append('feDropShadow').attr('dx', 0).attr('dy', 12).attr('stdDeviation', 18).attr('flood-color', '#000000').attr('flood-opacity', 0.28);

    const softGlow = defs.append('filter').attr('id', 'heatmap-soft-glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    softGlow.append('feDropShadow').attr('dx', 0).attr('dy', 0).attr('stdDeviation', 8).attr('flood-color', '#ffffff').attr('flood-opacity', 0.14);

    root
      .append('rect')
      .attr('x', panelX)
      .attr('y', panelY)
      .attr('width', panelWidth)
      .attr('height', panelHeight)
      .attr('rx', 22)
      .attr('fill', 'url(#heatmap-panel-gradient)')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.1)
      .style('filter', 'url(#heatmap-panel-shadow)');

    root
      .append('rect')
      .attr('x', panelX)
      .attr('y', panelY)
      .attr('width', panelWidth)
      .attr('height', panelHeight)
      .attr('rx', 22)
      .attr('fill', 'url(#heatmap-glow-left)');

    root
      .append('rect')
      .attr('x', panelX)
      .attr('y', panelY)
      .attr('width', panelWidth)
      .attr('height', panelHeight)
      .attr('rx', 22)
      .attr('fill', 'url(#heatmap-glow-right)');

    root
      .append('text')
      .attr('x', width / 2)
      .attr('y', 36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000000')
      .attr('font-size', 30)
      .attr('font-weight', 700)
      .text('Selection and Rejection Rates by Job Role');

    root
      .append('line')
      .attr('x1', panelX + 32)
      .attr('x2', panelWidth + panelX - 32)
      .attr('y1', 66)
      .attr('y2', 66)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1);

    root
      .append('line')
      .attr('x1', width / 2 - 90)
      .attr('x2', width / 2)
      .attr('y1', 66)
      .attr('y2', 66)
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 2.5)
      .style('filter', 'url(#heatmap-soft-glow)');

    root
      .append('line')
      .attr('x1', width / 2)
      .attr('x2', width / 2 + 90)
      .attr('y1', 66)
      .attr('y2', 66)
      .attr('stroke', '#fb923c')
      .attr('stroke-width', 2.5)
      .style('filter', 'url(#heatmap-soft-glow)');

    root
      .append('g')
      .selectAll('text')
      .data(chartData.outcomes)
      .join('text')
      .attr('x', (d) => x(d) + x.bandwidth() / 2)
      .attr('y', margin.top - 26)
      .attr('text-anchor', 'middle')
      .attr('font-size', 16)
      .attr('font-weight', 700)
      .attr('fill', '#f8fafc')
      .text((d) => d);

    root
      .append('g')
      .selectAll('line')
      .data(chartData.outcomes)
      .join('line')
      .attr('x1', (d) => x(d) + 18)
      .attr('x2', (d) => x(d) + x.bandwidth() - 18)
      .attr('y1', margin.top - 18)
      .attr('y2', margin.top - 18)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.3)
      .attr('stroke-linecap', 'round');

    root
      .append('g')
      .selectAll('text')
      .data(chartData.roles)
      .join('text')
      .attr('x', margin.left - 12)
      .attr('y', (d) => y(d) + y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('fill', '#e2e8f0')
      .text((d) => d);

    root
      .append('g')
      .selectAll('line')
      .data(chartData.roles)
      .join('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', (d) => y(d) + y.bandwidth() + 2)
      .attr('y2', (d) => y(d) + y.bandwidth() + 2)
      .attr('stroke', '#1f2b40')
      .attr('stroke-width', 1);

    const cells = root
      .append('g')
      .selectAll('g')
      .data(chartData.cells)
      .join('g')
      .attr('transform', (d) => `translate(${x(d.outcome)},${y(d.role)})`);

    cells
      .append('rect')
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 12)
      .attr('fill', (d) => color(d.value))
      .attr('stroke', '#dbeafe')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 1.6)
      .attr('opacity', 0.98)
      .style('filter', 'drop-shadow(0 10px 22px rgba(2, 6, 23, 0.38))')
      .append('title')
      .text(
        (d) =>
          `${d.role}\n${d.outcome}: ${formatPercent(d.value)}\nCount: ${d.count} of ${d.total}`
      );

    cells
      .append('rect')
      .attr('x', 2)
      .attr('y', 2)
      .attr('width', x.bandwidth() - 4)
      .attr('height', 10)
      .attr('rx', 8)
      .attr('fill', 'rgba(255,255,255,0.12)');

    cells
      .append('text')
      .attr('x', x.bandwidth() / 2)
      .attr('y', y.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 700)
      .attr('letter-spacing', '0.03em')
      .attr('fill', '#f8fafc')
      .style('text-shadow', '0 1px 6px rgba(15, 23, 42, 0.45)')
      .text((d) => formatPercent(d.value));

    const legendWidth = 18;
    const legendHeight = Math.min(280, Math.max(190, chartData.roles.length * 7));
    const legendX = width - margin.right + 58;
    const legendY = margin.top + 18;
    const legendId = 'heatmap-gradient';
    const gradient = defs
      .append('linearGradient')
      .attr('id', legendId)
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '100%')
      .attr('y2', '0%');

    gradient
      .selectAll('stop')
      .data(d3.range(0, 1.01, 0.1))
      .join('stop')
      .attr('offset', (d) => `${d * 100}%`)
      .attr('stop-color', (d) =>
        color(chartData.domainMin + d * (chartData.domainMax - chartData.domainMin))
      );

    svg
      .append('rect')
      .attr('x', legendX - 22)
      .attr('y', legendY - 34)
      .attr('width', 92)
      .attr('height', legendHeight + 54)
      .attr('rx', 22)
      .attr('fill', 'url(#heatmap-legend-card)')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.2)
      .style('filter', 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.28))');

    svg
      .append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('rx', 10)
      .attr('stroke', '#93c5fd')
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', 1.1)
      .attr('fill', `url(#${legendId})`);

    const legendScale = d3
      .scaleLinear()
      .domain([chartData.domainMin, chartData.domainMax])
      .range([legendY + legendHeight, legendY]);

    const legendAxis = d3
      .axisRight(legendScale)
      .tickValues([chartData.domainMax, 0.5, chartData.domainMin])
      .tickFormat(formatPercent)
      .tickSize(0);

    svg
      .append('g')
      .attr('transform', `translate(${legendX + legendWidth + 8},0)`)
      .call(legendAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('text')
          .attr('fill', '#e2e8f0')
          .attr('font-size', 11)
          .attr('font-weight', 700)
      );

    svg
      .append('text')
      .attr('x', legendX - 6)
      .attr('y', legendY - 14)
      .attr('fill', '#f8fafc')
      .attr('font-size', 12)
      .attr('font-weight', 700)
      .text('Rate');

    return undefined;
  }, [chartData]);

  if (!data) {
    return <div>Loading role conversion data...</div>;
  }

  if (!chartData) {
    return <div>No heatmap data available.</div>;
  }

  return (
    <div className="heatmap-container">
      <svg ref={svgRef} role="img" aria-label="Role conversion heatmap" />
    </div>
  );
};

export default HeatMap;
