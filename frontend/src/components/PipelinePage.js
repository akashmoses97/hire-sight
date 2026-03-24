import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SankeyDiagram from './SankeyDiagram';
import TimelineChart from './TimelineChart';
import { fetchPipelineData, fetchTimelineData } from '../utils/api';

const PipelinePage = () => {
  const [pipelineData, setPipelineData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pipeline, timeline] = await Promise.all([
          fetchPipelineData(selectedRole),
          fetchTimelineData(selectedRole)
        ]);
        setPipelineData(pipeline);
        setTimelineData(timeline);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedRole]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <Link to="/" className="btn btn-secondary mb-3">Back to Home</Link>
      <h2>Job Search Pipeline</h2>
      <div className="mb-3">
        <label htmlFor="roleSelect" className="form-label">Filter by Role:</label>
        <select
          id="roleSelect"
          className="form-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="Product Manager">Product Manager</option>
        </select>
      </div>
      <div className="row">
        <div className="col-12 mb-4">
          <h3>Application Flow</h3>
          <SankeyDiagram data={pipelineData} />
        </div>
        <div className="col-12">
          <h3>Timeline</h3>
          <TimelineChart data={timelineData} />
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;