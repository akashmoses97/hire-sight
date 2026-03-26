import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const TimelineChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !Array.isArray(data.timeline) || data.timeline.length === 0) return;

    const records = data.timeline.map((d) => ({
      ...d,
      date: d3.timeParse('%Y-%m')(d.date)
    })).filter((d) => d.date != null);

    if (records.length === 0) return;

    const width = 760;
    const height = 320;
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3.scaleTime()
      .domain(d3.extent(records, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const maxValue = d3.max(records, (d) => Math.max(d.applications, d.callbacks, d.interviews, d.offers));
    const y = d3.scaleLinear()
      .domain([0, maxValue || 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = (key) => d3.line()
      .x((d) => x(d.date))
      .y((d) => y(d[key] || 0));

    const color = d3.scaleOrdinal()
      .domain(['applications', 'callbacks', 'interviews', 'offers'])
      .range(['#4f8bff', '#6bcf70', '#f7b731', '#ff6b6b']);

    // axes
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(Math.min(records.length, 8)).tickFormat(d3.timeFormat('%b %Y')))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    ['applications', 'callbacks', 'interviews', 'offers'].forEach((key) => {
      svg.append('path')
        .datum(records)
        .attr('fill', 'none')
        .attr('stroke', color(key))
        .attr('stroke-width', 2)
        .attr('d', line(key));
    });

    const legend = svg.append('g').attr('transform', `translate(${width - margin.right + 5}, ${margin.top})`);
    ['applications', 'callbacks', 'interviews', 'offers'].forEach((key, i) => {
      const g = legend.append('g').attr('transform', `translate(0, ${i * 20})`);
      g.append('rect').attr('width', 12).attr('height', 12).attr('fill', color(key));
      g.append('text').attr('x', 16).attr('y', 10).text(key.charAt(0).toUpperCase() + key.slice(1));
    });

  }, [data]);

  if (!data) {
    return <div>Loading timeline data...</div>;
  }

  return (
    <div className="timeline-container" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '360px' }} />
      {!data.timeline || data.timeline.length === 0 ? (
        <div className="text-center mt-2">No timeline data available for selected role.</div>
      ) : null}
    </div>
  );
};

export default TimelineChart;