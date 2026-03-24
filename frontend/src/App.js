import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PipelinePage from './components/PipelinePage';
import HeatmapPage from './components/HeatmapPage';
import TrendsPage from './components/TrendsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Hire Sight</h1>
          <p>Visual Analytics for Tech Job Search Pipeline</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/trends" element={<TrendsPage />} />
          </Routes>
        </main>
        <footer>
          <p>CSCE 679 Project - Team 3</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;