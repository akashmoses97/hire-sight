/**
 * React application bootstrap file.
 *
 * This file mounts the root App component into the browser DOM and applies
 * the global styles that initialize the frontend experience.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
