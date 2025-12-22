/**
 * Admin Panel Configuration
 * Centralized config for API URLs and settings
 */

// API Base URL - uses environment variable in production
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Server Base URL (without /api) - for uploads and static files
export const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

// Helper function to get full URL for uploads
export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${SERVER_BASE_URL}/uploads/${path}`;
};

// Helper function to get image URL
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${SERVER_BASE_URL}/uploads/images/${path}`;
};

// Export config object
const config = {
  API_BASE_URL,
  SERVER_BASE_URL,
  getUploadUrl,
  getImageUrl,
};

export default config;
