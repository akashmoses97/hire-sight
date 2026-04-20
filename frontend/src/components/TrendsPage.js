/**
 * Dedicated yearly trends page container.
 *
 * This file fetches yearly market trend data, renders the trends filter bar,
 * and passes the filtered analytics payload into the trends dashboard view.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import YearlyTrendChart from './YearlyTrendChart';
import { fetchYearlyTrends, fetchYearlyTrendFilterOptions } from '../utils/api';

const DEFAULT_FILTERS = {
  job_title: 'All',
  company: 'All',
  location: 'All',
  job_type: 'All',
  experience_bucket: 'All',
  salary_bucket: 'All',
  remote_only: false,
  top_n: '8',
};

const FILTER_CONFIG = [
  { key: 'job_title', label: 'Job Title', optionKey: 'job_titles', allLabel: 'All Roles' },
  { key: 'company', label: 'Company', optionKey: 'companies', allLabel: 'All Companies' },
  { key: 'location', label: 'Location', optionKey: 'locations', allLabel: 'All Locations' },
  { key: 'job_type', label: 'Job Type', optionKey: 'job_types', allLabel: 'All Types' },
  { key: 'experience_bucket', label: 'Experience', optionKey: 'experience_buckets', allLabel: 'All Levels' },
  { key: 'salary_bucket', label: 'Salary Band', optionKey: 'salary_buckets', allLabel: 'All Bands' },
];

const TrendsPage = () => {
  const [yearlyData, setYearlyData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    job_titles: [],
    companies: [],
    locations: [],
    job_types: [],
    experience_buckets: [],
    salary_buckets: [],
    top_n_options: [5, 8, 10, 12],
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOptions = async () => {
      const options = await fetchYearlyTrendFilterOptions();
      setFilterOptions(options);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchYearlyTrends(filters);
        setYearlyData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };
    loadData();
  }, [filters]);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'top_n') return false;
    if (typeof value === 'boolean') return value;
    return value !== 'All';
  }).length;

  if (!hasLoaded && loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">Error: {error}</div>;

  return (
    <div className="container mt-4 page-shell">
      <div className="page-topbar">
        <Link to="/" className="btn btn-outline-future mb-3">← Back to Home</Link>
      </div>
      <h2 className="page-title mb-2">Yearly Trends</h2>
      <p className="page-subtitle">
        Market-level hiring patterns, role concentration, work-mode mix, and time coverage from the backend software jobs dataset.
      </p>

      <section className="futuristic-card trend-filter-panel">
        <div className="trend-panel-header">
          <div>
            <h3>Refine The Market Slice</h3>
            <p>
              Filter by role, company, location, job type, experience, salary band, and remote-only postings.
            </p>
          </div>
          <div className="trend-filter-actions">
            {loading && hasLoaded ? <span className="trend-filter-badge">Updating…</span> : null}
            {activeFiltersCount > 0 ? (
              <button
                type="button"
                className="btn btn-outline-future"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Clear {activeFiltersCount} filter{activeFiltersCount === 1 ? '' : 's'}
              </button>
            ) : null}
          </div>
        </div>

        <div className="trend-filter-grid">
          {FILTER_CONFIG.map(({ key, label, optionKey, allLabel }) => (
            <div key={key} className={`trend-filter-item${filters[key] !== 'All' ? ' is-active' : ''}`}>
              <label className="trend-filter-label" htmlFor={`trend-filter-${key}`}>{label}</label>
              <select
                id={`trend-filter-${key}`}
                className="trend-filter-select"
                value={filters[key]}
                onChange={(event) => setFilters((previous) => ({ ...previous, [key]: event.target.value }))}
              >
                <option value="All">{allLabel}</option>
                {(filterOptions[optionKey] || []).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="trend-filter-item">
            <label className="trend-filter-label" htmlFor="trend-filter-top-n">Leaderboard Size</label>
            <select
              id="trend-filter-top-n"
              className="trend-filter-select"
              value={filters.top_n}
              onChange={(event) => setFilters((previous) => ({ ...previous, top_n: event.target.value }))}
            >
              {(filterOptions.top_n_options || [5, 8, 10, 12]).map((option) => (
                <option key={option} value={String(option)}>Top {option}</option>
              ))}
            </select>
          </div>

          <div className="trend-filter-item trend-filter-item-toggle">
            <span className="trend-filter-label">Remote Only</span>
            <label className={`trend-toggle${filters.remote_only ? ' is-on' : ''}`}>
              <input
                type="checkbox"
                checked={filters.remote_only}
                onChange={(event) =>
                  setFilters((previous) => ({ ...previous, remote_only: event.target.checked }))
                }
              />
              <span className="trend-toggle-track">
                <span className="trend-toggle-thumb" />
              </span>
              <span className="trend-toggle-text">
                {filters.remote_only ? 'Showing remote-compatible roles only' : 'Include all posting formats'}
              </span>
            </label>
          </div>
        </div>
      </section>

      <YearlyTrendChart data={yearlyData} filters={filters} />
    </div>
  );
};

export default TrendsPage;
