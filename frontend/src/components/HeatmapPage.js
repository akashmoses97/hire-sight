/**
 * Dedicated heatmap page container.
 *
 * This file fetches role heatmap data from the backend and renders the page
 * wrapper, navigation, loading states, and the HeatMap visualization.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeatMap from './HeatMap';
import { fetchRoleHeatmap, fetchReasonHeatmap } from '../utils/api';

const HeatmapPage = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [reasonHeatmapData, setReasonHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load both heatmaps with the same page-level loading flow used by
        // the existing role heatmap.
        const [roleData, reasonData] = await Promise.all([
          fetchRoleHeatmap(),
          fetchReasonHeatmap(),
        ]);
        setHeatmapData(roleData);
        setReasonHeatmapData(reasonData);
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
      <h2 className="page-title mb-2">Role Heatmap</h2>
      <p className="page-subtitle">Selection and rejection rates by role and decision reason.</p>
      <HeatMap data={heatmapData} labelKey="role" title="Selection and Rejection Rates by Job Role" />
      <HeatMap data={reasonHeatmapData} labelKey="reason" title="Selection and Rejection Rates by Decision Reason" />
    </div>
  );
};

export default HeatmapPage;
