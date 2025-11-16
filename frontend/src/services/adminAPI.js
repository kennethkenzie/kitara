import axios from 'axios';
import { supabase } from '../lib/supabase';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/admin`;

// Get auth token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Create axios instance with auth
const createAuthenticatedRequest = async () => {
  const token = await getAuthToken();
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

// Admin Stats API
export const adminStatsAPI = {
  getStats: async () => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.get(`${API}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  getActivity: async (limit = 20) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.get(`${API}/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  },
};

// Admin Shows API
export const adminShowsAPI = {
  create: async (showData) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.post(`${API}/shows`, showData);
      return response.data;
    } catch (error) {
      console.error('Error creating show:', error);
      throw error;
    }
  },

  update: async (showId, showData) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.put(`${API}/shows/${showId}`, showData);
      return response.data;
    } catch (error) {
      console.error('Error updating show:', error);
      throw error;
    }
  },

  delete: async (showId) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.delete(`${API}/shows/${showId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting show:', error);
      throw error;
    }
  },
};

// Admin Episodes API
export const adminEpisodesAPI = {
  create: async (episodeData) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.post(`${API}/episodes`, episodeData);
      return response.data;
    } catch (error) {
      console.error('Error creating episode:', error);
      throw error;
    }
  },

  update: async (episodeId, episodeData) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.put(`${API}/episodes/${episodeId}`, episodeData);
      return response.data;
    } catch (error) {
      console.error('Error updating episode:', error);
      throw error;
    }
  },

  delete: async (episodeId) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.delete(`${API}/episodes/${episodeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting episode:', error);
      throw error;
    }
  },
};

// Admin Users API
export const adminUsersAPI = {
  getAll: async () => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.get(`${API}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  update: async (userId, userData) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.put(`${API}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  getDetails: async (userId) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.get(`${API}/users/${userId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },
};
