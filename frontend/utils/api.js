import axios from 'axios';

// Base URL for API requests
const API_URL = 'http://localhost:8000/api';

// Fetch data for Sankey diagram showing job application pipeline [1]
export const fetchPipelineData = async () => {
  try {
    const response = await axios.get(`${API_URL}/pipeline`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pipeline data:', error);
    throw error;
  }
};

// Fetch timeline data for application tracking over time
export const fetchTimelineData = async () => {
  try {
    const response = await axios.get(`${API_URL}/timeline`);
    return response.data;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw error;
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