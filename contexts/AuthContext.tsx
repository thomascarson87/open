
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { TeamMember, MemberRole, TestSignupAccount } from '../types';

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
    badgeColor: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-600',
    label: 'Candidate',
  },
  // Company Accounts
  {
    id: '5cbc6857-3dce-41f0-8a72-9ccec1a4dbb2',
    name: 'Thomas Carson',
    email: 'thomas.carson@heuristik.tech',
    profileRole: 'recruiter',
    teamRole: 'admin',
    badgeColor: 'bg-accent-green-bg text-accent-green',
    label: 'Admin',
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Sarah Chen',
    email: 'hm@test.com',
    profileRole: 'recruiter',
    teamRole: 'hiring_manager',
    badgeColor: 'bg-accent-coral-bg text-accent-coral',
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

// localStorage keys for test signups
const TEST_SIGNUPS_KEY = 'dev_test_signups';
const ACTIVE_TEST_SIGNUP_KEY = 'dev_active_test_signup';

// Generate a UUID v4 for test accounts (no real auth needed)
function generateTestUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
  // Test signup functions (no real auth - uses mock session like dev accounts)
  testSignupAccounts: TestSignupAccount[];
  activeTestSignupId: string | null;
  isTestSignupActive: boolean;
  startTestSignup: () => Promise<TestSignupAccount | null>;
  switchToTestSignup: (id: string) => void;
  deleteTestSignup: (id: string) => Promise<void>;
  clearAllTestSignups: () => Promise<void>;
  testSignupError: string | null;
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
  // Test signup defaults
  testSignupAccounts: [],
  activeTestSignupId: null,
  isTestSignupActive: false,
  startTestSignup: async () => null,
  switchToTestSignup: () => {},
  deleteTestSignup: async () => {},
  clearAllTestSignups: async () => {},
  testSignupError: null,
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

  // Test signup state
  const [testSignupAccounts, setTestSignupAccounts] = useState<TestSignupAccount[]>([]);
  const [activeTestSignupId, setActiveTestSignupId] = useState<string | null>(null);
  const [testSignupError, setTestSignupError] = useState<string | null>(null);

  // Check if current user is an active test signup
  const isTestSignupActive = !!(activeTestSignupId && devUser?.id === activeTestSignupId);

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
      // Load cached test signups
      const cachedTestSignups = localStorage.getItem(TEST_SIGNUPS_KEY);
      let testAccounts: TestSignupAccount[] = [];
      if (cachedTestSignups) {
        try {
          testAccounts = JSON.parse(cachedTestSignups);
          setTestSignupAccounts(testAccounts);
        } catch {
          // Ignore parse errors
        }
      }

      // Check for active test signup first (takes priority over dev accounts)
      const savedActiveTestSignup = localStorage.getItem(ACTIVE_TEST_SIGNUP_KEY);
      if (savedActiveTestSignup) {
        const testAccount = testAccounts.find(a => a.id === savedActiveTestSignup);
        if (testAccount) {
          // Restore test signup session
          setActiveTestSignupId(savedActiveTestSignup);
          const mockUser = createMockUser(testAccount.id, testAccount.email);
          const mockSession = createMockSession(mockUser);
          setDevUser(mockUser);
          setDevSession(mockSession);
          setDevProfileRole('candidate');
          setTeamMember(null);
          setTeamRole(null);
          setCompanyId(null);
          setLoading(false);
          return;
        } else {
          // Test account no longer exists, clear the reference
          localStorage.removeItem(ACTIVE_TEST_SIGNUP_KEY);
        }
      }

      // Check for saved dev account
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
    localStorage.removeItem(ACTIVE_TEST_SIGNUP_KEY);
    setDevUser(null);
    setDevSession(null);
    setTeamMember(null);
    setTeamRole(null);
    setCompanyId(null);
    setDevProfileRole(null);
    setActiveTestSignupId(null);
  }, []);

  // --- Test Signup Functions (NO REAL AUTH - uses mock sessions like dev accounts) ---

  // Load test signups from localStorage on init
  const loadTestSignupsFromStorage = useCallback(() => {
    const cached = localStorage.getItem(TEST_SIGNUPS_KEY);
    if (cached) {
      try {
        const accounts = JSON.parse(cached) as TestSignupAccount[];
        setTestSignupAccounts(accounts);
        return accounts;
      } catch {
        // Ignore parse errors
      }
    }
    return [];
  }, []);

  // Save test signups to localStorage
  const saveTestSignupsToStorage = useCallback((accounts: TestSignupAccount[]) => {
    localStorage.setItem(TEST_SIGNUPS_KEY, JSON.stringify(accounts));
    setTestSignupAccounts(accounts);
  }, []);

  // Create a new test signup account - NO REAL AUTH, just mock session + DB profile
  const startTestSignup = useCallback(async (): Promise<TestSignupAccount | null> => {
    if (!isDevMode) return null;

    setTestSignupError(null);
    const timestamp = Date.now();
    const testId = generateTestUUID();
    const email = `test-signup-${timestamp}@dev.local`;
    const createdAt = new Date().toISOString();

    try {
      // Create candidate profile directly in database (no auth user needed)
      const candidateData = {
        id: testId,
        email,
        name: '',
        headline: '',
        bio: '',
        location: '',
        status: 'actively_looking',
        skills: [],
        salary_min: 0,
        salary_currency: 'USD',
        preferred_work_mode: [],
        desired_perks: [],
        interested_industries: [],
        contract_types: [],
        onboarding_completed: false,
      };

      // Try to create profile - this may fail due to RLS but we can work around it
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: testId,
          email,
          role: 'candidate',
        });

      // Profile creation might fail due to RLS - that's OK for dev testing
      if (profileError) {
        console.warn('Could not create profiles entry (RLS may block it):', profileError.message);
        // Continue anyway - we'll track it locally
      }

      const { error: candidateError } = await supabase
        .from('candidate_profiles')
        .insert(candidateData);

      if (candidateError) {
        console.warn('Could not create candidate_profiles entry:', candidateError.message);
        // Continue anyway - we'll track it locally for testing
      }

      // Create the test signup account record
      const newAccount: TestSignupAccount = {
        id: testId,
        email,
        name: '',
        createdAt,
        onboardingStage: 0,
      };

      // Add to local list
      const currentAccounts = loadTestSignupsFromStorage();
      const updatedAccounts = [newAccount, ...currentAccounts];
      saveTestSignupsToStorage(updatedAccounts);

      // Set as active and create mock session
      localStorage.setItem(ACTIVE_TEST_SIGNUP_KEY, testId);
      setActiveTestSignupId(testId);

      // Create mock user/session (same as dev accounts)
      const mockUser = createMockUser(testId, email);
      const mockSession = createMockSession(mockUser);

      // Clear any existing dev account selection
      localStorage.removeItem('dev_selected_account');

      setDevUser(mockUser);
      setDevSession(mockSession);
      setDevProfileRole('candidate');
      setTeamMember(null);
      setTeamRole(null);
      setCompanyId(null);

      return newAccount;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to start test signup:', err);
      setTestSignupError(errorMsg);
      return null;
    }
  }, [createMockUser, createMockSession, loadTestSignupsFromStorage, saveTestSignupsToStorage]);

  // Switch to an existing test signup account
  const switchToTestSignup = useCallback((id: string) => {
    if (!isDevMode) return;

    const accounts = loadTestSignupsFromStorage();
    const account = accounts.find(a => a.id === id);

    if (!account) {
      console.error('Test signup account not found:', id);
      return;
    }

    // Set as active
    localStorage.setItem(ACTIVE_TEST_SIGNUP_KEY, id);
    localStorage.removeItem('dev_selected_account');
    setActiveTestSignupId(id);

    // Create mock session
    const mockUser = createMockUser(id, account.email);
    const mockSession = createMockSession(mockUser);

    setDevUser(mockUser);
    setDevSession(mockSession);
    setDevProfileRole('candidate');
    setTeamMember(null);
    setTeamRole(null);
    setCompanyId(null);

    // Reload to refresh data
    window.location.reload();
  }, [createMockUser, createMockSession, loadTestSignupsFromStorage]);

  // Delete a single test signup account
  const deleteTestSignup = useCallback(async (id: string) => {
    if (!isDevMode) return;

    try {
      // Try to delete from database (may fail due to RLS)
      await supabase.from('candidate_profiles').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id);
    } catch (err) {
      console.warn('Could not delete from database:', err);
    }

    // Always remove from local storage
    const accounts = loadTestSignupsFromStorage();
    const updatedAccounts = accounts.filter(a => a.id !== id);
    saveTestSignupsToStorage(updatedAccounts);

    // If deleting the active test signup, clear session
    if (activeTestSignupId === id) {
      localStorage.removeItem(ACTIVE_TEST_SIGNUP_KEY);
      setActiveTestSignupId(null);
      setDevUser(null);
      setDevSession(null);
      setDevProfileRole(null);
    }
  }, [activeTestSignupId, loadTestSignupsFromStorage, saveTestSignupsToStorage]);

  // Clear all test signup accounts
  const clearAllTestSignups = useCallback(async () => {
    if (!isDevMode) return;

    const accounts = loadTestSignupsFromStorage();

    // Try to delete from database
    for (const account of accounts) {
      try {
        await supabase.from('candidate_profiles').delete().eq('id', account.id);
        await supabase.from('profiles').delete().eq('id', account.id);
      } catch {
        // Ignore errors
      }
    }

    // Clear local storage
    localStorage.removeItem(ACTIVE_TEST_SIGNUP_KEY);
    localStorage.removeItem(TEST_SIGNUPS_KEY);
    setActiveTestSignupId(null);
    setTestSignupAccounts([]);

    // Clear dev session if it was a test signup
    if (activeTestSignupId && accounts.some(a => a.id === activeTestSignupId)) {
      setDevUser(null);
      setDevSession(null);
      setDevProfileRole(null);
    }
  }, [activeTestSignupId, loadTestSignupsFromStorage]);

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
      // Test signup values (no real auth - uses mock sessions)
      testSignupAccounts,
      activeTestSignupId,
      isTestSignupActive,
      startTestSignup,
      switchToTestSignup,
      deleteTestSignup,
      clearAllTestSignups,
      testSignupError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
