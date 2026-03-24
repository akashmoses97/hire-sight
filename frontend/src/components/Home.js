import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Choose a Visualization</h2>
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Job Search Pipeline</h5>
              <p className="card-text">View the job application flow through different stages.</p>
              <Link to="/pipeline" className="btn btn-primary">View Pipeline</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Role Heatmap</h5>
              <p className="card-text">Explore conversion rates by role.</p>
              <Link to="/heatmap" className="btn btn-primary">View Heatmap</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Yearly Trends</h5>
              <p className="card-text">Analyze hiring patterns over the years.</p>
              <Link to="/trends" className="btn btn-primary">View Trends</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;