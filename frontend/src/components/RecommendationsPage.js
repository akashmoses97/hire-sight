/**
 * RecommendationsPage.js
 *
 * Main page for personalized recommendations (F5).
 * Orchestrates profile form, LLM insights generation, and visualization display.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalizationModal from './PersonalizationModal';
import RecommendationCards from './RecommendationCards';
import BeforeAfterComparison from './BeforeAfterComparison';
import ImprovementSummary from './ImprovementSummary';
import PersonalizationVisuals from './PersonalizationVisuals';
import { fetchRecommendations, fetchPipelineRoles, fetchPipelineJobTypes } from '../utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/RecommendationsPage.css';

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);

  const safePercent = (numerator, denominator) => {
    if (!denominator || denominator <= 0) return '0.0';
    return ((numerator / denominator) * 100).toFixed(1);
  };

  const normalizeProfile = useCallback((profile) => ({
    targetRole: profile?.targetRole || '',
    experienceLevel: profile?.experienceLevel || 'mid',
    jobType: profile?.jobType || '',
    goals: Array.isArray(profile?.goals) ? profile.goals : [],
    industryFocus: profile?.industryFocus || '',
    expectedSalaryMin: profile?.expectedSalaryMin || '',
    currentApplications: profile?.currentApplications ?? '',
    currentCallbacks: profile?.currentCallbacks ?? '',
    currentInterviews: profile?.currentInterviews ?? '',
    currentOffers: profile?.currentOffers ?? '',
    // Persisted profiles should not try to upload a file object from storage.
    resumeFile: null,
  }), []);

  // Check if user has already personalized in this session
  useEffect(() => {
    const hasPersonalized = sessionStorage.getItem('_personalizeOpened');
    const savedProfile = sessionStorage.getItem('user_profile_current_session');

    if (!hasPersonalized && !savedProfile) {
      setIsModalOpen(true);
    } else if (savedProfile) {
      // Auto-load previous profile
      try {
        const profile = normalizeProfile(JSON.parse(savedProfile));
        if (!profile.targetRole || !profile.jobType) {
          setIsModalOpen(true);
          return;
        }
        setUserProfile(profile);
        handleRecommendationGeneration(profile);
      } catch (e) {
        console.error('Error loading saved profile:', e);
        setIsModalOpen(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch available roles and job types on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [rolesData, jobTypesData] = await Promise.all([
          fetchPipelineRoles(),
          fetchPipelineJobTypes(),
        ]);
        setRoles(rolesData || []);
        setJobTypes(jobTypesData || []);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };

    loadFilterOptions();
  }, []);

  const handleRecommendationGeneration = useCallback(async (profile) => {
    setLoading(true);
    setError(null);
    try {
      const safeProfile = normalizeProfile(profile);
      const formData = new FormData();
      formData.append('profile_json', JSON.stringify(safeProfile));

      if (profile.resumeFile instanceof File) {
        formData.append('resume', profile.resumeFile);
      }

      const response = await fetchRecommendations(formData);
      setRecommendations(response);
      setUserProfile(safeProfile);
      sessionStorage.setItem('_personalizeOpened', 'true');
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err?.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizeProfile]);

  const handleModalSubmit = async (formData) => {
    setIsModalOpen(false);
    await handleRecommendationGeneration(formData);
  };

  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="recommendations-page page-shell">
      <PersonalizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        roles={roles}
        jobTypes={jobTypes}
      />

      <div className="container-lg recommendations-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Your Personalized Job Search Strategy</h1>
            <p className="page-subtitle">
              Based on your profile and market data, here's how to optimize your job search.
            </p>
            {recommendations && (
              <p className="page-subtitle" style={{ marginTop: '0.35rem' }}>
                Note: baseline source is {recommendations?.user_metrics?.source === 'self_reported'
                  ? 'your self-reported counts from the form'
                  : 'historical dataset patterns for your selected role/job type'}.
              </p>
            )}
            {recommendations?.metadata && (
              <div className="mode-row">
                <span
                  className={`mode-badge ${recommendations.metadata.source === 'huggingface' ? 'mode-live' : 'mode-fallback'}`}
                >
                  {recommendations.metadata.source === 'huggingface' ? 'Live LLM' : 'Fallback Mode'}
                </span>
                <span className="mode-text">
                  {recommendations.metadata.source} ({recommendations.metadata.model})
                </span>
              </div>
            )}
          </div>
          <button
            className="btn btn-outline-secondary btn-edit-profile"
            onClick={handleEditProfile}
            type="button"
          >
            ✏️ Edit Profile
          </button>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Generating personalized recommendations...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error:</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError(null)} />
          </div>
        )}

        {!loading && recommendations && userProfile && (
          <>
            {(() => {
              const baselineSource = recommendations?.user_metrics?.source === 'self_reported'
                ? 'self_reported'
                : 'dataset_baseline';

              return (
                <>
            {/* User Profile Summary */}
            <div className="profile-summary">
              <div className="summary-item">
                <strong>Target Role:</strong> {userProfile.targetRole}
              </div>
              <div className="summary-item">
                <strong>Experience:</strong> {userProfile.experienceLevel}
              </div>
              <div className="summary-item">
                <strong>Job Type:</strong> {userProfile.jobType}
              </div>
              {userProfile.goals && userProfile.goals.length > 0 && (
                <div className="summary-item">
                  <strong>Goals:</strong> {userProfile.goals.join(', ')}
                </div>
              )}
              <div className="summary-item">
                <strong>Baseline Source:</strong> {baselineSource === 'self_reported' ? 'Your self-reported counts' : 'Historical dataset baseline'}
              </div>
            </div>

            {/* Before/After Visualization */}
            <BeforeAfterComparison
              beforeMetrics={recommendations.user_metrics}
              afterMetrics={recommendations.predicted_outcomes}
              baselineLabel={baselineSource === 'self_reported' ? 'Your Current Pipeline (Before)' : 'Dataset Baseline (Before)'}
            />

            <PersonalizationVisuals
              userMetrics={recommendations.user_metrics}
              predictedOutcomes={recommendations.predicted_outcomes}
              benchmarkMetrics={recommendations.benchmark_metrics}
              roleAnalysis={recommendations.role_analysis}
              timingAnalysis={recommendations.timing_analysis}
              targetRole={userProfile.targetRole}
            />

            {/* LLM Insights Cards */}
            <RecommendationCards
              insights={recommendations.llm_insights}
              userProfile={userProfile}
            />

            {/* Action Plan */}
            <ImprovementSummary
              insights={recommendations.llm_insights}
              userProfile={userProfile}
            />

            {/* Benchmark Comparison */}
            {/* <div className="benchmark-section">
              <h3>📊 Baseline vs. Market Benchmarks</h3>
              <div className="benchmark-grid">
                <div className="benchmark-card">
                  <div className="benchmark-label">{baselineSource === 'self_reported' ? 'Your Current Offer Rate (offers/applications)' : 'Dataset Baseline Offer Rate (offers/applications)'}</div>
                  <div className="benchmark-value your-value">
                    {safePercent(recommendations.user_metrics.offers, recommendations.user_metrics.applications)}
                    %
                  </div>
                </div>
                <div className="benchmark-card">
                  <div className="benchmark-label">Market Average</div>
                  <div className="benchmark-value market-value">
                    {(recommendations.benchmark_metrics?.avg_offer_rate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="benchmark-card highlight">
                  <div className="benchmark-label">Predicted Offer Rate (offers/applications)</div>
                  <div className="benchmark-value target-value">
                    {safePercent(recommendations.predicted_outcomes.offers, recommendations.predicted_outcomes.applications)}
                    %
                  </div>
                </div>
              </div>
            </div> */}

            {/* CTA */}
            <div className="cta-section">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/pipeline')}
                type="button"
              >
                View Your Pipeline 📈
              </button>
              <button
                className="btn btn-outline-primary btn-lg"
                onClick={() => setIsModalOpen(true)}
                type="button"
              >
                Update Profile
              </button>
            </div>
                </>
              );
            })()}
          </>
        )}

        {!loading && !recommendations && !error && (
          <div className="empty-state">
            <p>👋 Welcome! Fill out your profile to get personalized recommendations.</p>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleEditProfile}
              type="button"
            >
              Start Personalization
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
