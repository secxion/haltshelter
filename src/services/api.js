import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Health check
  health: () => api.get('/health'),

  // Public Stats
  stats: {
    getDashboard: () => api.get('/stats/dashboard'),
    getImpact: () => api.get('/stats/impact'),
  },

  // Funding Needs (public)
  fundingNeeds: {
    getAll: (type) => api.get('/funding-needs', { params: type ? { type } : {} }),
    getEmergency: () => api.get('/funding-needs/emergency'),
    getRegular: () => api.get('/funding-needs/regular'),
  },

  // Authentication
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
  },

  // Organization Settings
  orgSettings: {
    get: () => api.get('/org-settings'),
    update: (data) => api.put('/org-settings', data),
  },

  // Notification Settings
  notificationSettings: {
    get: () => api.get('/notification-settings'),
    update: (data) => api.put('/notification-settings', data),
  },

  // Admin Key
  adminKey: {
    get: () => api.get('/admin-key'),
  },

  // Animals
  animals: {
    getAll: (params = {}) => api.get('/animals', { params }),
    getById: (id) => api.get(`/animals/${id}`),
    search: (query, params = {}) => api.get('/animals/search', { 
      params: { q: query, ...params } 
    }),
    create: (animalData) => api.post('/animals', animalData),
    update: (id, animalData) => api.put(`/animals/${id}`, animalData),
    delete: (id) => api.delete(`/animals/${id}`),
  },

  // Stories
  stories: {
    getAll: (params = {}) => api.get('/stories', { params }),
    getById: (id) => api.get(`/stories/${id}`),
    getFeatured: () => api.get('/stories/featured'),
    getBySlug: (slug) => api.get(`/stories/slug/${slug}`),
    create: (storyData) => api.post('/stories', storyData),
    update: (id, storyData) => api.put(`/stories/${id}`, storyData),
    delete: (id) => api.delete(`/stories/${id}`),
  },

  // Sponsors
  sponsors: {
    getAll: (params = {}) => api.get('/sponsors', { params }),
    getById: (id) => api.get(`/sponsors/${id}`),
  },

  // Blogs
  blog: {
    getBySlug: (slug) => api.get(`/blog/${slug}`),
    like: (id) => api.post(`/blog/${id}/like`),
    incrementView: (slug) => api.post(`/blog/${slug}/view`),
  },

  // Donations
  donations: {
    create: (donationData) => api.post('/donations', donationData),
    createPaymentIntent: (amount, currency = 'usd') => 
      api.post('/donations/create-payment-intent', { amount, currency }),
    getAll: (params = {}) => api.get('/donations', { params }),
    getById: (id) => api.get(`/donations/${id}`),
    getStats: () => api.get('/donations/stats'),
  },

  // Newsletter
  newsletter: {
    subscribe: (email, data = {}) => api.post('/newsletter/subscribe', { email, ...data }),
    confirm: (token) => api.get(`/newsletter/confirm/${token}`),
    unsubscribe: (email, reason) => api.post('/newsletter/unsubscribe', { email, reason }),
    updatePreferences: (email, preferences) => api.post('/newsletter/preferences', { email, preferences }),
    getSubscriber: (email) => api.get(`/newsletter/subscriber/${email}`),
    getStats: () => api.get('/newsletter/stats'),
    getSubscribers: (params = {}) => api.get('/newsletter/subscribers', { params }),
  },

  // Volunteers
  volunteers: {
    apply: (volunteerData) => api.post('/volunteers/apply', volunteerData),
    getAll: (params = {}) => api.get('/volunteers', { params }),
    getById: (id) => api.get(`/volunteers/${id}`),
    updateStatus: (id, status) => api.patch(`/volunteers/${id}/status`, { status }),
  },

  // Users
  users: {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  },

  // File uploads
  upload: {
    single: (file, type = 'general') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    multiple: (files, type = 'general') => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      formData.append('type', type);
      return api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },
};

// Helper functions for common operations
export const authHelpers = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  hasRole: (role) => {
    const user = authHelpers.getUser();
    return user && user.role === role;
  },
};

// Error handling helper
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
    return {
      message,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      status: null,
      data: null,
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      status: null,
      data: null,
    };
  }
};

export default api;
