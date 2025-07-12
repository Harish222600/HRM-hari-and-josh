import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  verifyToken: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

// User API calls
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  getRoles: () => api.get('/users/roles'),
};

// Department API calls
export const departmentAPI = {
  getAllDepartments: (params) => api.get('/departments', { params }),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  createDepartment: (departmentData) => api.post('/departments', departmentData),
  updateDepartment: (id, departmentData) => api.put(`/departments/${id}`, departmentData),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
  toggleDepartmentStatus: (id, isActive) => api.put(`/departments/${id}`, { isActive }),
  getDepartmentStats: () => api.get('/departments/stats'),
};

// Leave API calls
export const leaveAPI = {
  // Employee endpoints
  submitLeaveRequest: (data) => api.post('/leaves/submit', data),
  getMyLeaveRequests: (params) => api.get('/leaves/my-requests', { params }),
  getMyLeaveBalance: (params) => api.get('/leaves/my-balance', { params }),
  cancelLeaveRequest: (id) => api.patch(`/leaves/cancel/${id}`),
  updateLeaveRequest: (id, data) => api.patch(`/leaves/${id}`, data),
  
  // Team Leader endpoints
  getTeamLeaveRequests: (params) => api.get('/leaves/team-requests', { params }),
  approveRejectLeaveByTL: (id, action, comments) => 
    api.patch(`/leaves/team-approve/${id}`, { action, comments }),
  
  // HR endpoints
  getHRLeaveRequests: (params) => api.get('/leaves/hr-requests', { params }),
  finalApproveRejectLeave: (id, action, comments) => 
    api.patch(`/leaves/hr-approve/${id}`, { action, comments }),
  
  // Common endpoints
  getAllLeaveRequests: (params) => api.get('/leaves/all-requests', { params }),
  getLeaveRequestById: (id) => api.get(`/leaves/${id}`),
  getLeaveTypes: () => api.get('/leaves/types'),
  getLeaveStats: (params) => api.get('/leaves/stats', { params }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
