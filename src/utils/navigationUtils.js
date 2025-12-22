/**
 * Centralized navigation utilities for masking URLs
 * All redirects will show only the base domain/path without query parameters
 * Data is passed via sessionStorage for client-side navigation
 */

/**
 * Navigate to a route with optional data (no query params in URL)
 * @param {string} path - The path to navigate to (e.g., '/donate/success', '/blog')
 * @param {object} data - Optional data object to pass to the destination page
 * @param {string} dataKey - Optional key to store data under (default: pageName from path)
 */
export const navigateTo = (path, data = null, dataKey = null) => {
  if (data) {
    const key = dataKey || `${path.replace(/\//g, '_')}_data`;
    sessionStorage.setItem(key, JSON.stringify(data));
  }
  window.location.href = path;
};

/**
 * Retrieve data passed to current page via sessionStorage
 * @param {string} path - The path/page identifier to retrieve data for
 * @param {string} dataKey - Optional custom key (if not using default)
 * @param {boolean} clearAfter - Whether to clear data after reading (default: true)
 * @returns {object|null} The stored data object or null if not found
 */
export const getPageData = (path, dataKey = null, clearAfter = true) => {
  const key = dataKey || `${path.replace(/\//g, '_')}_data`;
  const stored = sessionStorage.getItem(key);
  
  if (stored) {
    if (clearAfter) {
      sessionStorage.removeItem(key);
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Error parsing page data for ${key}:`, error);
      return null;
    }
  }
  return null;
};

/**
 * Get the origin (protocol + domain) for building absolute URLs
 * @returns {string} The origin (e.g., 'http://localhost:3001')
 */
export const getOrigin = () => {
  return window.location.origin;
};

/**
 * Build an absolute URL for sharing (without query params)
 * @param {string} path - The path (e.g., '/donate')
 * @returns {string} The full URL
 */
export const buildAbsoluteUrl = (path) => {
  return `${getOrigin()}${path}`;
};

export default {
  navigateTo,
  getPageData,
  getOrigin,
  buildAbsoluteUrl
};
