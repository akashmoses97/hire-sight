import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hire Sight</h1>
        <p>Visual Analytics for Tech Job Search Pipeline</p>
      </header>
      <main>
        <Dashboard />
      </main>
      <footer>
        <p>CSCE 679 Project - Team 3</p>
      </footer>
    </div>
  );
}

export default App;