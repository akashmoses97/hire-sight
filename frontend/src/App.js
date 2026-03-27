import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PipelinePage from './components/PipelinePage';
import HeatmapPage from './components/HeatmapPage';
import TrendsPage from './components/TrendsPage';

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('hire-sight-theme');
    const initialTheme = storedTheme || 'dark';
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
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
            <div>
              <h1>Hire Sight</h1>
              <p>Visual Analytics for Tech Job Search Pipeline</p>
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