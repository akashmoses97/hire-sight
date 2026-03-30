/**
 * Frontend API client helpers.
 *
 * This file centralizes requests to backend endpoints for charts, filters,
 * and analytics views so React components can stay focused on rendering.
 */

import axios from 'axios';

// Base URL for API requests - uses environment variable or defaults to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Fetch data for Sankey diagram showing job application pipeline [1]
export const fetchPipelineData = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    // Skip "All" so the backend interprets the request as unfiltered.
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All') params.append(key, value);
    });
    const endpoint = `${API_URL}/pipeline${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Fetching pipeline data from:', endpoint);
    const response = await axios.get(endpoint);
    console.log('Pipeline data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pipeline data:', error);
    throw error;
  }
};

// Fetch timeline data for application tracking over time
export const fetchTimelineData = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    // Build the query string from the same filter shape used by the pipeline page.
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All') params.append(key, value);
    });
    const endpoint = `${API_URL}/timeline${params.toString() ? '?' + params.toString() : ''}`;
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw error;
  }
};

export const fetchPipelineRoles = async () => {
  // Filter endpoints fall back to empty arrays so the page can still render
  // even if one dropdown source is temporarily unavailable.
  try {
    const response = await axios.get(`${API_URL}/pipeline/roles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pipeline roles:', error);
    return [];
  }
};

export const fetchPipelineCompanies = async () => {
  try {
    const response = await axios.get(`${API_URL}/pipeline/companies`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pipeline companies:', error);
    return [];
  }
};

export const fetchPipelineJobTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/pipeline/job-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pipeline job types:', error);
    return [];
  }
};

export const fetchPipelinePlatforms = async () => {
  try {
    const response = await axios.get(`${API_URL}/pipeline/platforms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pipeline platforms:', error);
    return [];
  }
};

// Fetch yearly trends data for job market visualization [2]
export const fetchYearlyTrends = async () => {
  try {
    const response = await axios.get(`${API_URL}/yearly-trends`);
    return response.data;
  } catch (error) {
    console.error('Error fetching yearly trends:', error);
    throw error;
  }
};

// Fetch role-based heatmap data for conversion rate comparison [1]
export const fetchRoleHeatmap = async () => {
  try {
    const response = await axios.get(`${API_URL}/role-heatmap`);
    return response.data;
  } catch (error) {
    console.error('Error fetching role heatmap data:', error);
    throw error;
  }
};

// Fetch pipeline data filtered by role
export const fetchPipelineByRole = async (role) => {
  try {
    const response = await axios.get(`${API_URL}/pipeline/by-role/${role}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pipeline data for role ${role}:`, error);
    throw error;
  }
};
