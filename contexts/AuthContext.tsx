
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { TeamMember, MemberRole } from '../types';

// Dev mode test accounts (real Supabase IDs)
export interface DevAccount {
  id: string;
  name: string;
  email: string;
  profileRole: 'candidate' | 'recruiter';
  teamRole: MemberRole | null;  // null for candidates
  badgeColor: string;
  label: string;
}

export const DEV_ACCOUNTS: DevAccount[] = [
  // Candidate
  {
    id: '05457a07-ae4b-4960-8cfd-9f2b70815f61',
    name: 'Alex Rivera',
    email: 'thomascarson87@gmail.com',
    profileRole: 'candidate',
    teamRole: null,
    badgeColor: 'bg-gray-100 text-gray-700',
    label: 'Candidate',
  },
  // Company Accounts
  {
    id: '5cbc6857-3dce-41f0-8a72-9ccec1a4dbb2',
    name: 'Thomas Carson',
    email: 'thomas.carson@heuristik.tech',
    profileRole: 'recruiter',
    teamRole: 'admin',
    badgeColor: 'bg-purple-100 text-purple-700',
    label: 'Admin',
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Sarah Chen',
    email: 'hm@test.com',
    profileRole: 'recruiter',
    teamRole: 'hiring_manager',
    badgeColor: 'bg-blue-100 text-blue-700',
    label: 'Hiring Manager',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Michael Torres',
    email: 'finance@test.com',
    profileRole: 'recruiter',
    teamRole: 'finance',
    badgeColor: 'bg-green-100 text-green-700',
    label: 'CFO/Approver',
  },
];

// Company ID for all dev accounts
const DEV_COMPANY_ID = '5cbc6857-3dce-41f0-8a72-9ccec1a4dbb2';

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
  // New: Team member context
  teamMember: TeamMember | null;
  teamRole: MemberRole | null;
  companyId: string | null;
  // New: Account switcher
  switchDevAccount: (accountId: string) => void;
  refreshTeamMember: () => Promise<void>;
  // Profile role for dev mode (candidate vs recruiter)
  devProfileRole: 'candidate' | 'recruiter' | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  isDevMode: false,
  devLogin: () => {},
  devLogout: () => {},
  teamMember: null,
  teamRole: null,
  companyId: null,
  switchDevAccount: () => {},
  refreshTeamMember: async () => {},
  devProfileRole: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [devSession, setDevSession] = useState<Session | null>(null);
  const [devUser, setDevUser] = useState<User | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [teamRole, setTeamRole] = useState<MemberRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [devProfileRole, setDevProfileRole] = useState<'candidate' | 'recruiter' | null>(null);

  const createMockUser = useCallback((id: string, email: string): User => ({
    id,
    email,
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  }), []);

  const createMockSession = useCallback((user: User): Session => ({
    access_token: 'dev-mock-token',
    refresh_token: 'dev-mock-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  }), []);

  // Fetch team member data for the current user
  const fetchTeamMember = useCallback(async (userId: string, profileRole?: 'candidate' | 'recruiter') => {
    try {
      // In dev mode, check if this is a candidate account first
      if (isDevMode) {
        const devAccount = DEV_ACCOUNTS.find(a => a.id === userId);
        if (devAccount) {
          setDevProfileRole(devAccount.profileRole);

          // If candidate, don't fetch team member data
          if (devAccount.profileRole === 'candidate') {
            setTeamMember(null);
            setTeamRole(null);
            setCompanyId(null);
            return;
          }

          // For recruiters, set up mock team member
          if (devAccount.teamRole) {
            const mockTeamMember: TeamMember = {
              id: `mock-${userId}`,
              user_id: userId,
              company_id: DEV_COMPANY_ID,
              email: devAccount.email,
              name: devAccount.name,
              role: devAccount.teamRole,
            };
            setTeamMember(mockTeamMember);
            setTeamRole(devAccount.teamRole);
            setCompanyId(DEV_COMPANY_ID);
            return;
          }
        }
      }

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team member:', error);
        setTeamMember(null);
        setTeamRole(null);
        setCompanyId(null);
        return;
      }

      if (data) {
        setTeamMember(data);
        setTeamRole(data.role);
        setCompanyId(data.company_id);
      } else {
        // No team member record - might be company owner
        // Check if user owns a company profile
        const { data: companyData } = await supabase
          .from('company_profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (companyData) {
          // User is company owner - treat as admin
          setTeamMember(null);
          setTeamRole('admin');
          setCompanyId(userId);
        } else {
          setTeamMember(null);
          setTeamRole(null);
          setCompanyId(null);
        }
      }
    } catch (err) {
      console.error('Error in fetchTeamMember:', err);
      setTeamMember(null);
      setTeamRole(null);
      setCompanyId(null);
    }
  }, []);

  const refreshTeamMember = useCallback(async () => {
    const activeUser = devUser || user;
    if (activeUser) {
      await fetchTeamMember(activeUser.id);
    }
  }, [devUser, user, fetchTeamMember]);

  // Initialize auth state
  useEffect(() => {
    // Check for persisted dev session on mount
    if (isDevMode) {
      const savedDevAccount = localStorage.getItem('dev_selected_account');
      if (savedDevAccount) {
        try {
          const accountId = savedDevAccount;
          const devAccount = DEV_ACCOUNTS.find(a => a.id === accountId);
          if (devAccount) {
            const mockUser = createMockUser(devAccount.id, devAccount.email);
            const mockSession = createMockSession(mockUser);
            setDevUser(mockUser);
            setDevSession(mockSession);
            fetchTeamMember(devAccount.id);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem('dev_selected_account');
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTeamMember(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTeamMember(session.user.id);
      } else {
        setTeamMember(null);
        setTeamRole(null);
        setCompanyId(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [createMockUser, createMockSession, fetchTeamMember]);

  const devLogin = useCallback((role: 'candidate' | 'recruiter') => {
    if (!isDevMode) return;

    // Find the first account matching the requested role
    const devAccount = DEV_ACCOUNTS.find(a => a.profileRole === role) || DEV_ACCOUNTS[0];
    const mockUser = createMockUser(devAccount.id, devAccount.email);
    const mockSession = createMockSession(mockUser);

    localStorage.setItem('dev_selected_account', devAccount.id);
    setDevUser(mockUser);
    setDevSession(mockSession);
    setDevProfileRole(devAccount.profileRole);
    fetchTeamMember(devAccount.id, devAccount.profileRole);

    // Reload to apply changes
    window.location.reload();
  }, [createMockUser, createMockSession, fetchTeamMember]);

  const switchDevAccount = useCallback((accountId: string) => {
    if (!isDevMode) return;

    const devAccount = DEV_ACCOUNTS.find(a => a.id === accountId);
    if (!devAccount) {
      console.error('Dev account not found:', accountId);
      return;
    }

    const mockUser = createMockUser(devAccount.id, devAccount.email);
    const mockSession = createMockSession(mockUser);

    localStorage.setItem('dev_selected_account', accountId);
    setDevUser(mockUser);
    setDevSession(mockSession);
    fetchTeamMember(devAccount.id);

    // Trigger page reload to refresh all data
    // This ensures components re-fetch with the new user context
    window.location.reload();
  }, [createMockUser, createMockSession, fetchTeamMember]);

  const devLogout = useCallback(() => {
    localStorage.removeItem('dev_selected_account');
    setDevUser(null);
    setDevSession(null);
    setTeamMember(null);
    setTeamRole(null);
    setCompanyId(null);
    setDevProfileRole(null);
  }, []);

  const signOut = useCallback(async () => {
    // Clear dev session if active
    if (devSession) {
      devLogout();
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setTeamMember(null);
    setTeamRole(null);
    setCompanyId(null);
    setDevProfileRole(null);
  }, [devSession, devLogout]);

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
      teamMember,
      teamRole,
      companyId,
      switchDevAccount,
      refreshTeamMember,
      devProfileRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
