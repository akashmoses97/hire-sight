/**
 * ImprovementSummary.js
 *
 * Displays top 3 action items and quick wins for improving job search strategy.
 */

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ImprovementSummary.css';

const ImprovementSummary = ({ insights, userProfile }) => {
  if (!insights || !insights.improvement_summary) {
    return null;
  }

  // Parse the improvement summary to extract action items
  // Format: "3 key actions: (1) ..., (2) ..., (3) ..."
  const parseActions = (summary) => {
    const match = summary.match(/\(1\)(.*?)\(2\)(.*?)\(3\)(.*?)(?:\(4\)|$)/);
    if (match) {
      return [
        match[1].trim().replace(/,\s*$/, ''),
        match[2].trim().replace(/,\s*$/, ''),
        match[3].trim().replace(/,\s*$/, ''),
      ];
    }
    // Fallback: split by common delimiters
    const parts = summary.split(/[,;]/);
    return parts.slice(0, 3).map((p) => p.trim());
  };

  const actions = parseActions(insights.improvement_summary);

  const quickWins = [
    '✓ Set calendar reminders for peak hiring months',
    '✓ Optimize LinkedIn profile for target role keywords',
    '✓ Create a template for faster applications',
  ];

  return (
    <div className="improvement-summary-section">
      <h3 className="summary-title">🚀 Action Plan</h3>

      <div className="actions-container">
        <div className="actions-card">
          <h4 className="actions-subtitle">Key Actions (This Week)</h4>
          <ol className="actions-list">
            {actions.map((action, index) => (
              <li key={index} className="action-item">
                <span className="action-number">{index + 1}</span>
                <span className="action-text">{action}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="quick-wins-card">
          <h4 className="quick-wins-subtitle">💡 Quick Wins</h4>
          <ul className="quick-wins-list">
            {quickWins.map((win, index) => (
              <li key={index} className="quick-win-item">
                {win}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="call-to-action">
        <p>
          Start with <strong>Action #1</strong> this week. You should see improvements in your conversion
          rate within 2-4 weeks.
        </p>
      </div>
    </div>
  );
};

export default ImprovementSummary;
