/**
 * BeforeAfterComparison.js
 *
 * D3-powered visualization comparing user's current pipeline metrics vs. predicted outcomes.
 * Uses dual Sankey/funnel format for clear before/after contrast.
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../styles/BeforeAfterComparison.css';

const BeforeAfterComparison = ({ beforeMetrics, afterMetrics, baselineLabel = 'Dataset Baseline (Before)' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!beforeMetrics || !afterMetrics) return;

    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const isDark = theme === 'dark';

    const colorScheme = {
      text: isDark ? '#e0e0e0' : '#333',
      axis: isDark ? '#a0a0a0' : '#666',
      surface: isDark ? '#1a1a1a' : '#fff',
      border: isDark ? '#444' : '#ddd',
      before: '#ff8787',
      after: '#51cf66',
      stage: ['#64c8ff', '#9c7ee8', '#ff94c2', '#ffa94d'],
    };

    const width = 1000;
    const height = 300;

    // Funnel data preparation
    const stages = ['Applications', 'Callbacks', 'Interviews', 'Offers'];
    const funnelBefore = [
      beforeMetrics.applications || 0,
      beforeMetrics.callbacks || 0,
      beforeMetrics.interviews || 0,
      beforeMetrics.offers || 0,
    ];

    const funnelAfter = [
      afterMetrics.applications || beforeMetrics.applications || 0,
      afterMetrics.callbacks || beforeMetrics.callbacks || 0,
      afterMetrics.interviews || beforeMetrics.interviews || 0,
      afterMetrics.offers || beforeMetrics.offers || 0,
    ];

    const maxValue = Math.max(...funnelBefore, ...funnelAfter, 1);

    // Clear previous renders
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background-color', colorScheme.surface);

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 600)
      .attr('fill', colorScheme.text)
      .text('Baseline Scenario vs. Predicted Outcomes');

    // Before section (left)
    const beforeGroup = svg.append('g').attr('transform', `translate(50, 60)`);

    beforeGroup
      .append('text')
      .attr('x', 150)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('font-weight', 600)
      .attr('fill', colorScheme.before)
      .text(baselineLabel);

    // Before funnel bars
    stages.forEach((stage, i) => {
      const barWidth = (funnelBefore[i] / maxValue) * 250;
      const x = i * 80;
      const y = 50;

      // Bar
      beforeGroup
        .append('rect')
        .attr('x', x - barWidth / 2)
        .attr('y', y)
        .attr('width', barWidth)
        .attr('height', 30)
        .attr('fill', colorScheme.before)
        .attr('opacity', 0.6)
        .attr('rx', 4);

      // Value label
      beforeGroup
        .append('text')
        .attr('x', x)
        .attr('y', y + 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .attr('fill', colorScheme.text)
        .text(`${funnelBefore[i]}`);

      // Stage label
      beforeGroup
        .append('text')
        .attr('x', x)
        .attr('y', y + 70)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('fill', colorScheme.axis)
        .text(stage);
    });

    // After section (right)
    const afterGroup = svg.append('g').attr('transform', `translate(550, 60)`);

    afterGroup
      .append('text')
      .attr('x', 150)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('font-weight', 600)
      .attr('fill', colorScheme.after)
      .text('Predicted (After)');

    // After funnel bars
    stages.forEach((stage, i) => {
      const barWidth = (funnelAfter[i] / maxValue) * 250;
      const x = i * 80;
      const y = 50;

      // Bar
      afterGroup
        .append('rect')
        .attr('x', x - barWidth / 2)
        .attr('y', y)
        .attr('width', barWidth)
        .attr('height', 30)
        .attr('fill', colorScheme.after)
        .attr('opacity', 0.7)
        .attr('rx', 4);

      // Value label
      afterGroup
        .append('text')
        .attr('x', x)
        .attr('y', y + 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .attr('fill', colorScheme.text)
        .text(`${funnelAfter[i]}`);

      // Stage label
      afterGroup
        .append('text')
        .attr('x', x)
        .attr('y', y + 70)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('fill', colorScheme.axis)
        .text(stage);

      // Improvement percentage
      if (funnelBefore[i] > 0) {
        const improvement = ((funnelAfter[i] - funnelBefore[i]) / funnelBefore[i]) * 100;
        const color = improvement > 0 ? '#51cf66' : '#ff8787';
        const arrow = improvement > 0 ? '↑' : '↓';

        afterGroup
          .append('text')
          .attr('x', x)
          .attr('y', y - 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', 10)
          .attr('font-weight', 600)
          .attr('fill', color)
          .text(`${arrow} ${Math.abs(improvement).toFixed(0)}%`);
      }
    });

    const legendBeforeLabel = baselineLabel.replace(' (Before)', '');

    // Legend
    const legend = svg.append('g').attr('transform', `translate(150, ${height - 40})`);

    legend
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', colorScheme.before)
      .attr('opacity', 0.6);

    legend
      .append('text')
      .attr('x', 30)
      .attr('y', 15)
      .attr('font-size', 12)
      .attr('fill', colorScheme.text)
      .text(legendBeforeLabel);

    legend
      .append('rect')
      .attr('x', 200)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', colorScheme.after)
      .attr('opacity', 0.7);

    legend
      .append('text')
      .attr('x', 230)
      .attr('y', 15)
      .attr('font-size', 12)
      .attr('fill', colorScheme.text)
      .text('Predicted Outcome');
  }, [beforeMetrics, afterMetrics, baselineLabel]);

  return (
    <div className="before-after-container">
      <svg ref={svgRef} className="before-after-svg" />
    </div>
  );
};

export default BeforeAfterComparison;
