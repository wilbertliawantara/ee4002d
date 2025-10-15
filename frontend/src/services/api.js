/**
 * API Service - Handles all backend communication
 * Backend: Flask REST API at http://localhost:5000
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';  // Change for production
// For Android emulator: http://10.0.2.2:5000/api
// For iOS simulator: http://localhost:5000/api
// For physical device: http://YOUR_COMPUTER_IP:5000/api

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { access_token } = response.data;
        await AsyncStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.access_token) {
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/me', data);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  },
};

// Workouts API
export const workoutsAPI = {
  getRoutines: async () => {
    const response = await api.get('/workouts/routines');
    return response.data.routines;
  },

  createRoutine: async (data) => {
    const response = await api.post('/workouts/routines', data);
    return response.data.routine;
  },

  getRoutine: async (id) => {
    const response = await api.get(`/workouts/routines/${id}`);
    return response.data.routine;
  },

  updateRoutine: async (id, data) => {
    const response = await api.put(`/workouts/routines/${id}`, data);
    return response.data.routine;
  },

  deleteRoutine: async (id) => {
    const response = await api.delete(`/workouts/routines/${id}`);
    return response.data;
  },

  getSessions: async (limit = 20) => {
    const response = await api.get('/workouts/sessions', { params: { limit } });
    return response.data.sessions;
  },

  createSession: async (data) => {
    const response = await api.post('/workouts/sessions', data);
    return response.data.session;
  },

  updateSession: async (id, data) => {
    const response = await api.put(`/workouts/sessions/${id}`, data);
    return response.data.session;
  },

  getStats: async () => {
    const response = await api.get('/workouts/stats');
    return response.data;
  },
};

// LLM Chat API
export const llmAPI = {
  chat: async (message, sessionId = null) => {
    const response = await api.post('/llm/chat', { message, session_id: sessionId });
    return response.data;
  },

  getMotivation: async () => {
    const response = await api.get('/llm/motivation');
    return response.data.message;
  },

  getHistory: async (sessionId = 'default', limit = 50) => {
    const response = await api.get('/llm/history', {
      params: { session_id: sessionId, limit },
    });
    return response.data.messages;
  },

  getSessions: async () => {
    const response = await api.get('/llm/sessions');
    return response.data.sessions;
  },
};

// Pose Detection API
export const poseAPI = {
  analyze: async (data) => {
    const response = await api.post('/pose/analyze', data);
    return response.data;
  },

  getSessionAnalyses: async (sessionId) => {
    const response = await api.get(`/pose/session/${sessionId}/analyses`);
    return response.data.analyses;
  },

  getFeedback: async (data) => {
    const response = await api.post('/pose/feedback', data);
    return response.data.feedback;
  },
};

// Habits API
export const habitsAPI = {
  getHabits: async (activeOnly = false) => {
    const response = await api.get('/habits/', { params: { active_only: activeOnly } });
    return response.data.habits;
  },

  createHabit: async (data) => {
    const response = await api.post('/habits/', data);
    return response.data.habit;
  },

  updateHabit: async (id, data) => {
    const response = await api.put(`/habits/${id}`, data);
    return response.data.habit;
  },

  completeHabit: async (id) => {
    const response = await api.post(`/habits/${id}/complete`);
    return response.data;
  },

  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },

  getUpcomingReminders: async (hours = 24) => {
    const response = await api.get('/habits/reminders/upcoming', { params: { hours } });
    return response.data.reminders;
  },
};

export default api;
