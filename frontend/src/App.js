/**
 * Main frontend application shell.
 *
 * This file wires together the top-level routes, shared layout, header/footer,
 * and the persisted theme toggle used across the Hire Sight interface.
 */

import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PipelinePage from './components/PipelinePage';
import HeatmapPage from './components/HeatmapPage';
import TrendsPage from './components/TrendsPage';
import RecommendationsPage from './components/RecommendationsPage';

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Restore the last selected theme so reloads keep the user's preference.
    const storedTheme = localStorage.getItem('hire-sight-theme');
    const initialTheme = storedTheme || 'dark';
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    // Expose the theme on the root element because CSS and D3 components both
    // read from the shared data-theme attribute.
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hire-sight-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previousTheme) => (previousTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <div className="brand-lockup">
              <div className="brand-mark" aria-hidden="true">
                <span className="brand-mark-core" />
                <span className="brand-mark-ring brand-mark-ring-1" />
                <span className="brand-mark-ring brand-mark-ring-2" />
              </div>
              <div className="brand-copy">
                <h1>Hire Sight</h1>
                <div className="brand-meta" aria-label="Product capabilities">
                  <span>Pipeline analytics</span>
                  <span>Role heatmaps</span>
                  <span>Strategy guidance</span>
                </div>
              </div>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle light and dark mode" title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <span className="theme-toggle-icon" aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/trends" element={<TrendsPage />} />
             <Route path="/recommendations" element={<RecommendationsPage />} />
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
