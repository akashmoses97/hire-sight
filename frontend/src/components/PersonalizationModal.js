/**
 * PersonalizationModal.js
 *
 * Modal form that captures user profile information for personalized recommendations.
 * Opens automatically on first visit to recommendations page.
 * Persists profile data to sessionStorage for the current session.
 */

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/PersonalizationModal.css';

const PersonalizationModal = ({ isOpen, onClose, onSubmit, roles, jobTypes }) => {
  const [formData, setFormData] = useState({
    targetRole: '',
    experienceLevel: 'mid',
    jobType: '',
    goals: [],
    industryFocus: '',
    expectedSalaryMin: '',
    currentApplications: '',
    currentCallbacks: '',
    currentInterviews: '',
    currentOffers: '',
    resumeFile: null,
  });

  const [errors, setErrors] = useState({});

  // Load saved profile from sessionStorage if available
  useEffect(() => {
    const savedProfile = sessionStorage.getItem('user_profile_current_session');
    if (savedProfile) {
      try {
        setFormData(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error parsing saved profile:', e);
      }
    }
  }, []);

  const goalOptions = [
    { id: 'visa_sponsorship', label: 'Visa Sponsorship' },
    { id: 'learning', label: 'Learning & Growth' },
    { id: 'salary_growth', label: 'Salary Growth' },
    { id: 'quick_placement', label: 'Quick Placement' },
    { id: 'remote_work', label: 'Remote Work' },
  ];

  const industryOptions = [
    'Tech',
    'Fintech',
    'Healthcare',
    'E-commerce',
    'Consulting',
    'Enterprise Software',
    'Other',
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior (5-10 years)' },
    { value: 'lead', label: 'Lead/Director (10+ years)' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => {
        const updatedGoals = checked
          ? [...prev.goals, value]
          : prev.goals.filter((goal) => goal !== value);
        return { ...prev, goals: updatedGoals };
      });
    } else if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        resumeFile: e.target.files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.targetRole.trim()) {
      newErrors.targetRole = 'Target role is required';
    }
    if (!formData.jobType.trim()) {
      newErrors.jobType = 'Job type is required';
    }

    const applications = Number(formData.currentApplications);
    const callbacks = Number(formData.currentCallbacks);
    const interviews = Number(formData.currentInterviews);
    const offers = Number(formData.currentOffers);

    if (formData.currentApplications === '' || Number.isNaN(applications)) {
      newErrors.currentApplications = 'Applications count is required';
    }
    if (formData.currentCallbacks === '' || Number.isNaN(callbacks)) {
      newErrors.currentCallbacks = 'Callbacks count is required';
    }
    if (formData.currentInterviews === '' || Number.isNaN(interviews)) {
      newErrors.currentInterviews = 'Interviews count is required';
    }
    if (formData.currentOffers === '' || Number.isNaN(offers)) {
      newErrors.currentOffers = 'Offers count is required';
    }

    if (!newErrors.currentApplications && !newErrors.currentCallbacks && callbacks > applications) {
      newErrors.currentCallbacks = 'Callbacks cannot exceed applications';
    }
    if (!newErrors.currentCallbacks && !newErrors.currentInterviews && interviews > callbacks) {
      newErrors.currentInterviews = 'Interviews cannot exceed callbacks';
    }
    if (!newErrors.currentInterviews && !newErrors.currentOffers && offers > interviews) {
      newErrors.currentOffers = 'Offers cannot exceed interviews';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Save only serializable profile fields to sessionStorage.
      const persistedProfile = {
        ...formData,
        resumeFile: null,
      };
      sessionStorage.setItem('user_profile_current_session', JSON.stringify(persistedProfile));
      onSubmit(formData);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('_personalizeOpened', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-dialog-centered modal-lg personalization-dialog">
        <div className="modal-content personalization-modal">
          <div className="modal-header">
            <h5 className="modal-title">🎯 Personalize Your Strategy</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleSkip}
              aria-label="Close"
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="intro-text">
                Help us understand your job search goals so we can provide tailored recommendations.
              </p>

              {/* Target Role */}
              <div className="mb-3">
                <label htmlFor="targetRole" className="form-label">
                  Target Role <span className="required">*</span>
                </label>
                <select
                  id="targetRole"
                  name="targetRole"
                  className="form-select"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select a role --</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {errors.targetRole && <small className="text-danger">{errors.targetRole}</small>}
              </div>

              {/* Experience Level */}
              <div className="mb-3">
                <label htmlFor="experienceLevel" className="form-label">
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  className="form-select"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                >
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Type */}
              <div className="mb-3">
                <label htmlFor="jobType" className="form-label">
                  Job Type <span className="required">*</span>
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  className="form-select"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select job type --</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.jobType && <small className="text-danger">{errors.jobType}</small>}
              </div>

              {/* Goals (Checkboxes) */}
              <div className="mb-3">
                <label className="form-label">What are your goals?</label>
                <small className="text-muted d-block mb-2">Pick all that apply.</small>
                <div className="goals-container" role="group" aria-label="Job search goals">
                  {goalOptions.map((goal) => (
                    <div key={goal.id} className="goal-pill-item">
                      <input
                        type="checkbox"
                        className="goal-checkbox"
                        id={goal.id}
                        value={goal.id}
                        checked={formData.goals.includes(goal.id)}
                        onChange={handleInputChange}
                      />
                      <label className="goal-pill" htmlFor={goal.id}>
                        {goal.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry Focus */}
              <div className="mb-3">
                <label htmlFor="industryFocus" className="form-label">
                  Industry Focus
                </label>
                <select
                  id="industryFocus"
                  name="industryFocus"
                  className="form-select"
                  value={formData.industryFocus}
                  onChange={handleInputChange}
                >
                  <option value="">-- Any industry --</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expected Salary */}
              <div className="mb-3">
                <label htmlFor="expectedSalaryMin" className="form-label">
                  Expected Salary ($)
                </label>
                <input
                  type="number"
                  id="expectedSalaryMin"
                  name="expectedSalaryMin"
                  className="form-control"
                  placeholder="e.g., 80000"
                  value={formData.expectedSalaryMin}
                  onChange={handleInputChange}
                />
              </div>

              {/* Self-Reported Current Pipeline */}
              <div className="mb-3">
                <label className="form-label">
                  Your Current Pipeline Counts <span className="required">*</span>
                </label>
                <small className="text-muted d-block mb-2">
                  Enter your own latest numbers. These will be used as your baseline.
                </small>
                <div className="row g-2">
                  <div className="col-md-3 col-6">
                    <label htmlFor="currentApplications" className="form-label">Applications</label>
                    <input
                      type="number"
                      min="0"
                      id="currentApplications"
                      name="currentApplications"
                      className="form-control"
                      value={formData.currentApplications}
                      onChange={handleInputChange}
                    />
                    {errors.currentApplications && <small className="text-danger">{errors.currentApplications}</small>}
                  </div>
                  <div className="col-md-3 col-6">
                    <label htmlFor="currentCallbacks" className="form-label">Callbacks</label>
                    <input
                      type="number"
                      min="0"
                      id="currentCallbacks"
                      name="currentCallbacks"
                      className="form-control"
                      value={formData.currentCallbacks}
                      onChange={handleInputChange}
                    />
                    {errors.currentCallbacks && <small className="text-danger">{errors.currentCallbacks}</small>}
                  </div>
                  <div className="col-md-3 col-6">
                    <label htmlFor="currentInterviews" className="form-label">Interviews</label>
                    <input
                      type="number"
                      min="0"
                      id="currentInterviews"
                      name="currentInterviews"
                      className="form-control"
                      value={formData.currentInterviews}
                      onChange={handleInputChange}
                    />
                    {errors.currentInterviews && <small className="text-danger">{errors.currentInterviews}</small>}
                  </div>
                  <div className="col-md-3 col-6">
                    <label htmlFor="currentOffers" className="form-label">Offers</label>
                    <input
                      type="number"
                      min="0"
                      id="currentOffers"
                      name="currentOffers"
                      className="form-control"
                      value={formData.currentOffers}
                      onChange={handleInputChange}
                    />
                    {errors.currentOffers && <small className="text-danger">{errors.currentOffers}</small>}
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="mb-3">
                <label htmlFor="resumeFile" className="form-label">
                  Upload Resume (Optional, PDF)
                </label>
                <input
                  type="file"
                  id="resumeFile"
                  name="resumeFile"
                  className="form-control"
                  accept=".pdf"
                  onChange={handleInputChange}
                />
                <small className="text-muted">
                  We'll extract your experience and skills to enhance recommendations.
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSkip}
              >
                Skip for Now
              </button>
              <button type="submit" className="btn btn-primary">
                Get Recommendations
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationModal;
