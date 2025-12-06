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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
    refreshProfile: () => user && fetchProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
