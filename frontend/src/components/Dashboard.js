/**
 * Legacy combined dashboard page.
 *
 * This component fetches data for all major visualizations in one place and
 * renders a single dashboard view with shared loading and error handling.
 */

import React, { useState, useEffect } from 'react';
import SankeyDiagram from './SankeyDiagram';
import HeatMap from './HeatMap';
import TimelineChart from './TimelineChart';
import YearlyTrendChart from './YearlyTrendChart';
import { fetchPipelineData, fetchTimelineData, fetchYearlyTrends, fetchRoleHeatmap } from '../utils/api';

const Dashboard = () => {
  const [pipelineData, setPipelineData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedYear, setSelectedYear] = useState(2023);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const pipelineResponse = await fetchPipelineData();
        setPipelineData(pipelineResponse);

        const timelineResponse = await fetchTimelineData();
        setTimelineData(timelineResponse);

        const yearlyResponse = await fetchYearlyTrends();
        setYearlyData(yearlyResponse);

        const heatmapResponse = await fetchRoleHeatmap();
        setHeatmapData(heatmapResponse);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };
  
  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="dashboard">
      <div className="filters">
        <div className="filter-group">
          <label>Role: </label>
          <select value={selectedRole} onChange={handleRoleChange}>
            <option value="All">All Roles</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Product Manager">Product Manager</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Year: </label>
          <select value={selectedYear} onChange={handleYearChange}>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
      </div>
      
      <div className="section pipeline-section">
        <h2>Job Search Pipeline</h2>
        <p>Applications → Callbacks → Interviews → Offers</p>
        <SankeyDiagram data={pipelineData} />
      </div>

      <div className="section grid-section">
        <div className="row">
          <div className="col">
            <h2>Role Conversion Rates</h2>
            <HeatMap data={heatmapData} />
          </div>
          <div className="col">
            <h2>Application Timeline</h2>
            <TimelineChart data={timelineData} />
          </div>
        </div>
      </div>

      <div className="section trends-section">
        <h2>Yearly Hiring Trends</h2>
        <YearlyTrendChart data={yearlyData} />
      </div>
    </div>
  );
};

export default Dashboard;
