import React, { useState, useEffect } from 'react';
import SankeyDiagram from './SankeyDiagram';
import HeatMap from './HeatMap';
import TimelineChart from './TimelineChart';
import YearlyTrendChart from './YearlyTrendChart';
import { fetchPipelineData, fetchTimelineData, fetchYearlyTrends, fetchRoleHeatmap } from '../utils/api';

const Dashboard = () => {
  // State for storing visualization data
  const [pipelineData, setPipelineData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states following the project's requirements [1]
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedYear, setSelectedYear] = useState(2023);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data for all four core visualizations identified in the proposal [1][2]
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
  
  // Role filter handler - key filtering feature from project design [1]
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    // Additional filtering logic would go here
  };
  
  // Year filter handler - for temporal analysis described in proposal [2]
  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
    // Additional filtering logic would go here
  };
  
  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="dashboard">
      {/* Filters section - matching design sketch from proposal [2] */}
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
      
      {/* Pipeline visualization - core component showing Applications → Callbacks → Interviews → Offers [1] */}
      <div className="section pipeline-section">
        <h2>Job Search Pipeline</h2>
        <p>Applications → Callbacks → Interviews → Offers</p>
        <SankeyDiagram data={pipelineData} />
      </div>
      
      {/* Role-based and timeline visualizations - addressing research questions 2 and 3 [2] */}
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
      
      {/* Yearly trends visualization - addressing research question 4 [2] */}
      <div className="section trends-section">
        <h2>Yearly Hiring Trends</h2>
        <YearlyTrendChart data={yearlyData} />
      </div>
    </div>
  );
};

export default Dashboard;