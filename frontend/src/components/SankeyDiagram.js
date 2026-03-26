import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';

const SankeyDiagram = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const sourceLabel = 'Applications';
    const callbackLabel = 'Callbacks';
    const interviewLabel = 'Interviews';
    const offerLabel = 'Offers';

    const links = [
      { source: sourceLabel, target: callbackLabel, value: Math.max(0, data.callbacks || 0) },
      { source: callbackLabel, target: interviewLabel, value: Math.max(0, data.interviews || 0) },
      { source: interviewLabel, target: offerLabel, value: Math.max(0, data.offers || 0) },
    ];

    const nodes = [
      { id: sourceLabel },
      { id: callbackLabel },
      { id: interviewLabel },
      { id: offerLabel },
    ];

    const width = 760;
    const height = 350;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const sankeyGenerator = d3Sankey()
      .nodeId(d => d.id)
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[1, 1], [width - 1, height - 1]]);

    const graph = sankeyGenerator({ nodes: nodes.map(d => ({ ...d })), links: links.map(d => ({ ...d })) });

    svg.append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => Math.max(1, d.x1 - d.x0))
      .attr('height', d => Math.max(1, d.y1 - d.y0))
      .attr('fill', d => {
        if (d.id === sourceLabel) return '#4f8bff';
        if (d.id === callbackLabel) return '#6bcf70';
        if (d.id === interviewLabel) return '#f7b731';
        if (d.id === offerLabel) return '#ff6b6b';
        return '#888';
      })
      .attr('stroke', '#000');

    svg.append('g')
      .style('mix-blend-mode', 'multiply')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', '#888')
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.7);

    svg.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 < width / 2 ? 'start' : 'end'))
      .style('font-size', '12px')
      .text(d => `${d.id} (${Math.round(d.value)})`);

  }, [data]);

  if (!data) {
    return <div>Loading pipeline data...</div>;
  }

  return (
    <div className="sankey-container" style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '8px', background: '#f8f9fa' }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default SankeyDiagram;