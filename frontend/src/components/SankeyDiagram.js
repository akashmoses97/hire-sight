/**
 * Sankey diagram for application flow.
 *
 * This component transforms pipeline counts into a D3 Sankey chart that shows
 * movement through hiring stages and updates its styling with theme changes.
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';

const SankeyDiagram = ({ data }) => {
  const svgRef = useRef();
  const [themeMode, setThemeMode] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  useEffect(() => {
    // Theme changes happen at the document level, so watch the root attribute
    // and trigger a chart redraw when it changes.
    const observer = new MutationObserver(() => {
      setThemeMode(document.documentElement.getAttribute('data-theme') || 'dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const vizText = rootStyles.getPropertyValue('--viz-text').trim() || '#0f172a';
    const vizAxis = rootStyles.getPropertyValue('--viz-axis').trim() || '#64748b';

    const sourceLabel = 'Applications';
    const callbackLabel = 'Callbacks';
    const interviewLabel = 'Interviews';
    const offerLabel = 'Offers';
    const rejectedLabel = 'Rejected';

    const applications = Math.max(0, Number(data.applications || 0));
    const callbacks = Math.max(0, Math.min(Number(data.callbacks || 0), applications));
    const interviews = Math.max(0, Math.min(Number(data.interviews || 0), callbacks));
    const offers = Math.max(0, Math.min(Number(data.offers || 0), interviews));

    const rejectedAfterApplication = Math.max(0, applications - callbacks);
    const rejectedAfterCallback = Math.max(0, callbacks - interviews);
    const rejectedAfterInterview = Math.max(0, interviews - offers);

    // Convert cumulative stage totals into explicit flows so the Sankey shows
    // both successful progression and drop-off at each step.
    const links = [
      { source: sourceLabel, target: callbackLabel, value: callbacks, linkType: 'progress' },
      { source: sourceLabel, target: rejectedLabel, value: rejectedAfterApplication, linkType: 'reject' },
      { source: callbackLabel, target: interviewLabel, value: interviews, linkType: 'progress' },
      { source: callbackLabel, target: rejectedLabel, value: rejectedAfterCallback, linkType: 'reject' },
      { source: interviewLabel, target: offerLabel, value: offers, linkType: 'progress' },
      { source: interviewLabel, target: rejectedLabel, value: rejectedAfterInterview, linkType: 'reject' },
    ].filter((link) => link.value > 0);

    const nodes = [
      { id: sourceLabel },
      { id: callbackLabel },
      { id: interviewLabel },
      { id: offerLabel },
      { id: rejectedLabel },
    ];

    const width = 980;
    const height = 430;

    const svg = d3.select(svgRef.current);
    // Rebuild the chart from scratch to avoid stale nodes after filter/theme updates.
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    const sankeyGenerator = d3Sankey()
      .nodeId(d => d.id)
      .nodeWidth(22)
      .nodePadding(22)
      .nodeAlign(sankeyJustify)
      .extent([[28, 28], [width - 28, height - 28]]);

    const graph = sankeyGenerator({ nodes: nodes.map(d => ({ ...d })), links: links.map(d => ({ ...d })) });

    const nodeColor = (nodeId) => {
      if (nodeId === sourceLabel) return '#3b82f6';
      if (nodeId === callbackLabel) return '#22c55e';
      if (nodeId === interviewLabel) return '#f59e0b';
      if (nodeId === offerLabel) return '#10b981';
      if (nodeId === rejectedLabel) return '#ef4444';
      return '#64748b';
    };

    const root = svg.append('g');

    root.append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => Math.max(1, d.x1 - d.x0))
      .attr('height', d => Math.max(1, d.y1 - d.y0))
      .attr('fill', d => nodeColor(d.id))
      .attr('fill-opacity', 0.95)
      .attr('stroke', themeMode === 'dark' ? '#0f172a' : '#1e293b')
      .attr('stroke-width', 1.2)
      .attr('rx', 2);

    root.append('g')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => (d.linkType === 'reject' ? '#ef4444' : nodeColor(d.source.id)))
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', d => (d.linkType === 'reject' ? 0.45 : 0.42));

    root.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 < width / 2 ? 'start' : 'end'))
      .style('font-size', '12px')
        .style('font-weight', 600)
        .attr('paint-order', 'stroke')
        .attr('stroke', themeMode === 'dark' ? 'rgba(2, 6, 23, 0.9)' : 'rgba(248, 250, 252, 0.95)')
        .attr('stroke-width', 3)
        .attr('stroke-linejoin', 'round')
      .style('fill', vizText)
      .text(d => `${d.id} (${Math.round(d.value)})`);

    root.append('g')
      .selectAll('text')
      .data(graph.links)
      .join('text')
      .attr('x', (d) => (d.source.x1 + d.target.x0) / 2)
      .attr('y', (d) => (d.y0 + d.y1) / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 600)
      .style('fill', vizAxis)
      // Hide labels on very small links so the diagram stays legible.
      .text((d) => d.value >= 25 ? d.value : '');

      }, [data, themeMode]);

  if (!data) {
    return <div>Loading pipeline data...</div>;
  }

  return (
    <div className="sankey-container" style={{ border: '1px solid var(--border-soft)', padding: '12px', borderRadius: '12px', background: 'var(--viz-surface)' }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default SankeyDiagram;
