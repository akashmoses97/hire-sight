import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SankeyDiagram from './SankeyDiagram';
import TimelineChart from './TimelineChart';
import { fetchPipelineData, fetchTimelineData, fetchPipelineRoles, fetchPipelineCompanies, fetchPipelineJobTypes, fetchPipelinePlatforms } from '../utils/api';

const PipelinePage = () => {
  const [pipelineData, setPipelineData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [filters, setFilters] = useState({
    job_role: 'All',
    company_name: 'All',
    job_type: 'All',
    platform: 'All'
  });

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        console.log('Loading filter options...');
        const [rolesData, companiesData, jobTypesData, platformsData] = await Promise.all([
          fetchPipelineRoles(),
          fetchPipelineCompanies(),
          fetchPipelineJobTypes(),
          fetchPipelinePlatforms()
        ]);
        console.log('Filter options loaded:', { rolesData, companiesData, jobTypesData, platformsData });
        setRoles(rolesData || []);
        setCompanies(companiesData || []);
        setJobTypes(jobTypesData || []);
        setPlatforms(platformsData || []);
      } catch (err) {
        console.error('Could not load filter options', err);
        // Set empty arrays so dropdowns still work
        setRoles([]);
        setCompanies([]);
        setJobTypes([]);
        setPlatforms([]);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data with filters:', filters);
      setLoading(true);
      setError(null);
      try {
        console.log('Making API calls...');
        
        console.log('Fetching pipeline data...');
        const pipeline = await fetchPipelineData(filters);
        console.log('Pipeline data received');
        
        console.log('Fetching timeline data...');
        const timeline = await fetchTimelineData(filters);
        console.log('Timeline data received');
        
        console.log('Data loaded successfully');
        setPipelineData(pipeline);
        setTimelineData(timeline);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">Error: {error}</div>;

  return (
    <div className="container-fluid mt-4 page-shell">
      <div className="page-topbar">
        <Link to="/" className="btn btn-outline-future mb-3">← Back to Home</Link>
      </div>
      <h2 className="mb-2 page-title">Job Search Pipeline Analytics</h2>
      <p className="page-subtitle">Track conversion flow and filter outcomes across roles, companies, and platforms.</p>

      {/* Filters Section */}
      <div className="card mb-4 futuristic-card">
        <div className="card-header">
          <h5 className="mb-0">Filters</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="roleSelect" className="form-label fw-bold">Job Role</label>
              <select
                id="roleSelect"
                className="form-select"
                value={filters.job_role}
                onChange={(e) => setFilters(prev => ({ ...prev, job_role: e.target.value }))}
              >
                <option value="All">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="companySelect" className="form-label fw-bold">Company</label>
              <select
                id="companySelect"
                className="form-select"
                value={filters.company_name}
                onChange={(e) => setFilters(prev => ({ ...prev, company_name: e.target.value }))}
              >
                <option value="All">All Companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="jobTypeSelect" className="form-label fw-bold">Job Type</label>
              <select
                id="jobTypeSelect"
                className="form-select"
                value={filters.job_type}
                onChange={(e) => setFilters(prev => ({ ...prev, job_type: e.target.value }))}
              >
                <option value="All">All Types</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="platformSelect" className="form-label fw-bold">Platform</label>
              <select
                id="platformSelect"
                className="form-select"
                value={filters.platform}
                onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
              >
                <option value="All">All Platforms</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button 
              className="btn btn-outline-future btn-sm"
              onClick={() => setFilters({
                job_role: 'All',
                company_name: 'All',
                job_type: 'All',
                platform: 'All'
              })}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {pipelineData && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center futuristic-card stat-card">
              <div className="card-body">
                <h5 className="card-title text-primary">{pipelineData.applications || 0}</h5>
                <p className="card-text">Total Applications</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center futuristic-card stat-card">
              <div className="card-body">
                <h5 className="card-title text-success">{pipelineData.callbacks || 0}</h5>
                <p className="card-text">Callbacks</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center futuristic-card stat-card">
              <div className="card-body">
                <h5 className="card-title text-warning">{pipelineData.interviews || 0}</h5>
                <p className="card-text">Interviews</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center futuristic-card stat-card">
              <div className="card-body">
                <h5 className="card-title text-danger">{pipelineData.offers || 0}</h5>
                <p className="card-text">Offers</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card futuristic-card">
            <div className="card-header">
              <h5 className="mb-0">Application Flow</h5>
            </div>
            <div className="card-body chart-shell">
              <SankeyDiagram data={pipelineData} />
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card futuristic-card">
            <div className="card-header">
              <h5 className="mb-0">Timeline</h5>
            </div>
            <div className="card-body chart-shell">
              <TimelineChart data={timelineData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;