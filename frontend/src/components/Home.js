import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  return (
    <div className="container mt-5 page-shell">
      <h2 className="text-center page-title">Choose a Visualization</h2>
      <p className="text-center page-subtitle">Explore insights across your hiring pipeline with interactive charts.</p>
      <div className="row home-grid">
        <div className="col-md-4 mb-4">
          <div className="card h-100 futuristic-card">
            <div className="card-body text-center">
              <h5 className="card-title">Job Search Pipeline</h5>
              <p className="card-text">View the job application flow through different stages.</p>
              <Link to="/pipeline" className="btn btn-future">View Pipeline</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 futuristic-card">
            <div className="card-body text-center">
              <h5 className="card-title">Role Heatmap</h5>
              <p className="card-text">Explore conversion rates by role.</p>
              <Link to="/heatmap" className="btn btn-future">View Heatmap</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 futuristic-card">
            <div className="card-body text-center">
              <h5 className="card-title">Yearly Trends</h5>
              <p className="card-text">Analyze hiring patterns over the years.</p>
              <Link to="/trends" className="btn btn-future">View Trends</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;