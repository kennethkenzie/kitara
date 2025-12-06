import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session on mount
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        fetchProfile(parsedSession.access_token);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('session');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If token is invalid, clear session
      localStorage.removeItem('session');
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const response = await axios.post(`${API}/auth/signup`, {
        email,
        password,
        name
      });
      
      const { user: userData, session: sessionData } = response.data;
      setUser(userData);
      setProfile(userData);
      setSession(sessionData);
      localStorage.setItem('session', JSON.stringify(sessionData));
      
      return { data: response.data, error: null };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Signup failed';
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });
      
      const { user: userData, session: sessionData } = response.data;
      setUser(userData);
      setProfile(userData);
      setSession(sessionData);
      localStorage.setItem('session', JSON.stringify(sessionData));
      
      return { data: response.data, error: null };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      if (session?.access_token) {
        await axios.post(`${API}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      localStorage.removeItem('session');
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => session?.access_token && fetchProfile(session.access_token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
