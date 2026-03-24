import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeatMap from './HeatMap';
import { fetchRoleHeatmap } from '../utils/api';

const HeatmapPage = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchRoleHeatmap();
        setHeatmapData(data);
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
    <div className="container mt-4">
      <Link to="/" className="btn btn-secondary mb-3">Back to Home</Link>
      <h2>Role Heatmap</h2>
      <p>Conversion rates by role across different stages.</p>
      <HeatMap data={heatmapData} />
    </div>
  );
};

export default HeatmapPage;