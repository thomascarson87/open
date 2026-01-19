
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// Dev mode test users (real Supabase IDs)
const DEV_USERS = {
  candidate: {
    id: '05457a07-ae4b-4960-8cfd-9f2b70815f61',
    email: 'thomascarson87@gmail.com',
    role: 'candidate' as const,
  },
  recruiter: {
    id: '5cbc6857-3dce-41f0-8a72-9ccec1a4dbb2',
    email: 'recruiter@testcompany.com',
    role: 'recruiter' as const,
  }
};

const isDevMode = typeof window !== 'undefined' && window.location.hostname === 'localhost';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // Dev mode functions
  isDevMode: boolean;
  devLogin: (role: 'candidate' | 'recruiter') => void;
  devLogout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  isDevMode: false,
  devLogin: () => {},
  devLogout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [devSession, setDevSession] = useState<Session | null>(null);
  const [devUser, setDevUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for persisted dev session on mount
    if (isDevMode) {
      const savedDevUser = localStorage.getItem('dev_user');
      if (savedDevUser) {
        try {
          const parsed = JSON.parse(savedDevUser);
          const mockUser = createMockUser(parsed.id, parsed.email);
          const mockSession = createMockSession(mockUser);
          setDevUser(mockUser);
          setDevSession(mockSession);
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('dev_user');
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createMockUser = (id: string, email: string): User => ({
    id,
    email,
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  });

  const createMockSession = (user: User): Session => ({
    access_token: 'dev-mock-token',
    refresh_token: 'dev-mock-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  });

  const devLogin = (role: 'candidate' | 'recruiter') => {
    if (!isDevMode) return;

    const devUserData = DEV_USERS[role];
    const mockUser = createMockUser(devUserData.id, devUserData.email);
    const mockSession = createMockSession(mockUser);

    // Persist dev session
    localStorage.setItem('dev_user', JSON.stringify({ id: devUserData.id, email: devUserData.email, role }));

    setDevUser(mockUser);
    setDevSession(mockSession);
  };

  const devLogout = () => {
    localStorage.removeItem('dev_user');
    setDevUser(null);
    setDevSession(null);
  };

  const signOut = async () => {
    // Clear dev session if active
    if (devSession) {
      devLogout();
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  // Use dev session if active, otherwise use real session
  const activeSession = devSession || session;
  const activeUser = devUser || user;

  return (
    <AuthContext.Provider value={{
      session: activeSession,
      user: activeUser,
      loading,
      signOut,
      isDevMode,
      devLogin,
      devLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
