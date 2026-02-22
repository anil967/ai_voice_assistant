import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || '';
const baseURL = apiBase ? `${apiBase.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
    baseURL
});

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);

// College Info
export const getCollegeInfo = () => api.get('/college');
export const updateCollegeInfo = (data, token) => api.put('/college', data, {
    headers: { Authorization: `Bearer ${token}` }
});

// Agent Config
export const getAgentConfig = (token) => api.get('/agent', {
    headers: { Authorization: `Bearer ${token}` }
});
export const updateAgentConfig = (data, token) => api.put('/agent', data, {
    headers: { Authorization: `Bearer ${token}` }
});

// Calls
export const getCallHistory = (token, params = '') => api.get(`/calls/history${params ? `?${params}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const logCall = (data) => api.post('/calls/log', data);
export const getAnalytics = (token) => api.get('/calls/analytics', {
    headers: { Authorization: `Bearer ${token}` }
});

// AI
export const getLocalAIResponse = (text) => api.post('/ai/query', { text });

// Templates (Automation)
export const getTemplates = (token) => api.get('/templates', {
    headers: { Authorization: `Bearer ${token}` }
});
export const updateTemplate = (id, data, token) => api.put(`/templates/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
});
export const createTemplate = (data, token) => api.post('/templates', data, {
    headers: { Authorization: `Bearer ${token}` }
});
export const toggleTemplate = (id, token) => api.patch(`/templates/${id}/toggle`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});

// Auth - profile & password
export const updatePassword = (data, token) => api.put('/auth/password', data, {
    headers: { Authorization: `Bearer ${token}` }
});
export const updateProfile = (data, token) => api.put('/auth/profile', data, {
    headers: { Authorization: `Bearer ${token}` }
});

// Register
export const register = (data) => api.post('/auth/register', data);

// Admission leads (admin)
export const getLeads = (token, params = '') => api.get(`/leads${params ? `?${params}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
});

export default api;
