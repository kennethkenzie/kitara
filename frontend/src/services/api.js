import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Get auth token from localStorage
const getAuthToken = () => {
  const storedSession = localStorage.getItem('session');
  if (storedSession) {
    try {
      const session = JSON.parse(storedSession);
      return session.access_token;
    } catch (error) {
      console.error('Error parsing session:', error);
      return null;
    }
  }
  return null;
};

// Create axios instance with auth
const createAuthenticatedRequest = () => {
  const token = getAuthToken();
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

// Shows API
export const showsAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API}/shows`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shows:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API}/shows/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching show:', error);
      throw error;
    }
  },

  getEpisodes: async (showId) => {
    try {
      const response = await axios.get(`${API}/shows/${showId}/episodes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching episodes:', error);
      throw error;
    }
  },
};

// Watchlist API
export const watchlistAPI = {
  get: async () => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.get(`${API}/watchlist`);
      return response.data;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },

  add: async (showId) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.post(`${API}/watchlist/${showId}`);
      return response.data;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },

  remove: async (showId) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.delete(`${API}/watchlist/${showId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },
};

// Watch History API
export const historyAPI = {
  get: async () => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.get(`${API}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  add: async (showId, episodeNumber) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.post(`${API}/history`, {
        show_id: showId,
        episode_number: episodeNumber,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to history:', error);
      throw error;
    }
  },

  clear: async () => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.delete(`${API}/history`);
      return response.data;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.get(`${API}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  update: async (name) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.put(`${API}/profile?name=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  purchaseCoins: async (amount) => {
    try {
      const api = await createAuthenticatedRequest();
      const response = await api.post(`${API}/profile/coins?amount=${amount}`);
      return response.data;
    } catch (error) {
      console.error('Error purchasing coins:', error);
      throw error;
    }
  },
};
