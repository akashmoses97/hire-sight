/**
 * RecommendationCards.js
 *
 * Displays LLM-generated insights as styled cards.
 * Each card represents a recommendation category with supporting data.
 */

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/RecommendationCards.css';

const RecommendationCards = ({ insights, userProfile }) => {
  if (!insights) {
    return (
      <div className="alert alert-warning" role="alert">
        Unable to load recommendations. Please try again.
      </div>
    );
  }

  const cards = [
    {
      title: '🎯 Role Selection',
      description: insights.role_selection_advice || 'No advice available',
      icon: '🎯',
      color: 'primary',
    },
    {
      title: '📅 Timing Strategy',
      description: insights.timing_strategy || 'No timing data available',
      icon: '📅',
      color: 'success',
    },
    {
      title: '📊 Application Volume',
      description: insights.volume_optimization || 'No volume recommendation available',
      icon: '📊',
      color: 'info',
    },
    {
      title: '📈 Experience Matching',
      description: insights.experience_matching || 'No experience data available',
      icon: '📈',
      color: 'warning',
    },
    {
      title: '🏢 Industry Insights',
      description: insights.industry_focus || 'No industry data available',
      icon: '🏢',
      color: 'danger',
    },
  ];

  return (
    <div className="recommendations-cards-section">
      <div className="section-header">
        <h3>📋 Your Personalized Recommendations</h3>
        <div className="confidence-badge">
          Confidence: {Math.round((insights.confidence_score || 0.75) * 100)}%
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className={`recommendation-card card-${card.color}`}>
            <div className="card-icon">{card.icon}</div>
            <h5 className="card-title">{card.title}</h5>
            <p className="card-description">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="improvement-highlight">
        <h4>💡 Key Takeaway</h4>
        <p>{insights.improvement_summary || 'Focus on refining your job search strategy.'}</p>
      </div>
    </div>
  );
};

export default RecommendationCards;
