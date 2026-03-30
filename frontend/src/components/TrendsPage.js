/**
 * Dedicated yearly trends page container.
 *
 * This file fetches yearly market trend data from the backend and renders
 * the surrounding page layout, navigation, and loading/error states.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import YearlyTrendChart from './YearlyTrendChart';
import { fetchYearlyTrends } from '../utils/api';

const TrendsPage = () => {
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Keep the trends page self-contained by fetching its single aggregate
        // dataset on mount.
        const data = await fetchYearlyTrends();
        setYearlyData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">Error: {error}</div>;

  return (
    <div className="container mt-4 page-shell">
      <div className="page-topbar">
        <Link to="/" className="btn btn-outline-future mb-3">← Back to Home</Link>
      </div>
      <h2 className="page-title mb-2">Yearly Trends</h2>
      <p className="page-subtitle">Hiring patterns and trends over the years.</p>
      <YearlyTrendChart data={yearlyData} />
    </div>
  );
};

export default TrendsPage;
