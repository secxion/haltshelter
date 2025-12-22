import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    // Use adminToken for admin panel
    const token = localStorage.getItem('adminToken');
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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Health check
  health: () => api.get('/health'),

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

  // Admin-specific endpoints
  stats: {
    get: () => api.get('/admin/stats'),
    update: (stats) => api.put('/admin/stats', stats),
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
    subscribe: (email) => api.post('/newsletter/subscribe', { email }),
    unsubscribe: (email) => api.post('/newsletter/unsubscribe', { email }),
    getSubscribers: (params = {}) => api.get('/newsletter/subscribers', { params }),
    deleteSubscriber: (id) => api.delete(`/newsletter/subscribers/${id}`),
    sendBroadcast: (data) => api.post('/newsletter/broadcast', data),
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
  // Sponsors
  sponsors: {
    getAll: (params = {}) => api.get('/sponsors', { params }),
    getById: (id) => api.get(`/sponsors/${id}`),
    create: (data) => api.post('/sponsors', data),
    update: (id, data) => api.put(`/sponsors/${id}`, data),
    delete: (id) => api.delete(`/sponsors/${id}`)
  },

  // Admin-specific endpoints for funding needs and impact stats
  admin: {
    // Funding Needs
    getFundingNeeds: () => api.get('/admin/funding-needs'),
    createFundingNeed: (data) => api.post('/admin/funding-needs', data),
    updateFundingNeed: (id, data) => api.put(`/admin/funding-needs/${id}`, data),
    deleteFundingNeed: (id) => api.delete(`/admin/funding-needs/${id}`),
    
    // Impact Stats (for donate page)
    getImpactStats: () => api.get('/admin/impact-stats'),
    updateImpactStats: (data) => api.put('/admin/impact-stats', data),
  },
};

// Helper functions for common operations
export const authHelpers = {
  setToken: (token) => {
    localStorage.setItem('adminToken', token);
  },
  
  getToken: () => {
    return localStorage.getItem('adminToken');
  },
  
  removeToken: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  
  setUser: (user) => {
    localStorage.setItem('adminUser', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
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
