import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// --- Supabase clients ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

// Service role client — bypasses RLS, used for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// --- Types ---

interface CreateTestSignupResponse {
  success: true;
  account: {
    id: string;
    email: string;
    password: string;
    createdAt: string;
  };
}

interface DeleteTestSignupResponse {
  success: true;
  deletedCount: number;
}

interface ErrorResponse {
  success: false;
  error: string;
}

// Protected account IDs that should never be deleted
const PROTECTED_ACCOUNT_IDS = [
  '05457a07-ae4b-4960-8cfd-9f2b70815f61', // Alex Rivera (Candidate)
  '5cbc6857-3dce-41f0-8a72-9ccec1a4dbb2', // Thomas Carson (Admin)
  '11111111-1111-1111-1111-111111111111', // Sarah Chen (Hiring Manager)
  '22222222-2222-2222-2222-222222222222', // Michael Torres (CFO)
];

// --- Helper Functions ---

function isDevMode(req: VercelRequest): boolean {
  const origin = req.headers.origin || req.headers.referer || '';
  return origin.includes('localhost') || origin.includes('127.0.0.1');
}

function generateTestEmail(): string {
  return `test-signup-${Date.now()}@dev.local`;
}

function generateTestPassword(): string {
  return `TestPass${Date.now()}!`;
}

// --- Handler ---

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Dev mode check - CRITICAL for security
  if (!isDevMode(req)) {
    return res.status(403).json({
      success: false,
      error: 'This endpoint is only available in development mode.',
    } satisfies ErrorResponse);
  }

  try {
    switch (req.method) {
      case 'POST':
        return handleCreateTestSignup(req, res);
      case 'DELETE':
        return handleDeleteTestSignup(req, res);
      case 'GET':
        return handleListTestSignups(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed. Use POST, GET, or DELETE.',
        } satisfies ErrorResponse);
    }
  } catch (error) {
    console.error('Test signup API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred.',
    } satisfies ErrorResponse);
  }
}

// POST - Create a new test signup account
async function handleCreateTestSignup(
  req: VercelRequest,
  res: VercelResponse
) {
  const email = generateTestEmail();
  const password = generateTestPassword();

  // 1. Create Supabase auth user with email pre-verified
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email verification
    user_metadata: {
      is_test_signup: true,
    },
  });

  if (authError || !authData.user) {
    console.error('Failed to create auth user:', authError);
    return res.status(500).json({
      success: false,
      error: `Failed to create auth user: ${authError?.message || 'Unknown error'}`,
    } satisfies ErrorResponse);
  }

  const userId = authData.user.id;
  const createdAt = new Date().toISOString();

  // 2. Create profiles entry
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email,
      role: 'candidate',
      is_test_signup: true,
      test_signup_created_at: createdAt,
    });

  if (profileError) {
    // Rollback: delete auth user
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.error('Failed to create profile:', profileError);
    return res.status(500).json({
      success: false,
      error: `Failed to create profile: ${profileError.message}`,
    } satisfies ErrorResponse);
  }

  // 3. Create candidate_profiles entry
  const { error: candidateError } = await supabaseAdmin
    .from('candidate_profiles')
    .insert({
      id: userId,
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
      is_test_signup: true,
      test_signup_created_at: createdAt,
      onboarding_stage: 0,
    });

  if (candidateError) {
    // Rollback: delete profile and auth user
    await supabaseAdmin.from('profiles').delete().eq('id', userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.error('Failed to create candidate profile:', candidateError);
    return res.status(500).json({
      success: false,
      error: `Failed to create candidate profile: ${candidateError.message}`,
    } satisfies ErrorResponse);
  }

  return res.status(201).json({
    success: true,
    account: {
      id: userId,
      email,
      password,
      createdAt,
    },
  } satisfies CreateTestSignupResponse);
}

// DELETE - Delete test signup account(s)
async function handleDeleteTestSignup(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id, all } = req.query;

  // Delete all test signups
  if (all === 'true') {
    // Get all test signup accounts
    const { data: testAccounts, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('is_test_signup', true);

    if (fetchError) {
      return res.status(500).json({
        success: false,
        error: `Failed to fetch test accounts: ${fetchError.message}`,
      } satisfies ErrorResponse);
    }

    let deletedCount = 0;
    for (const account of testAccounts || []) {
      // Skip protected accounts (extra safety)
      if (PROTECTED_ACCOUNT_IDS.includes(account.id)) continue;

      // Delete in order: candidate_profiles -> profiles -> auth
      await supabaseAdmin.from('candidate_profiles').delete().eq('id', account.id);
      await supabaseAdmin.from('profiles').delete().eq('id', account.id);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(account.id);

      if (!deleteError) deletedCount++;
    }

    return res.status(200).json({
      success: true,
      deletedCount,
    } satisfies DeleteTestSignupResponse);
  }

  // Delete single test signup
  if (typeof id === 'string') {
    // Verify it's not a protected account
    if (PROTECTED_ACCOUNT_IDS.includes(id)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete protected test accounts.',
      } satisfies ErrorResponse);
    }

    // Verify it's a test signup account
    const { data: profile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('is_test_signup')
      .eq('id', id)
      .single();

    if (verifyError || !profile?.is_test_signup) {
      return res.status(400).json({
        success: false,
        error: 'Account is not a test signup or does not exist.',
      } satisfies ErrorResponse);
    }

    // Delete in order
    await supabaseAdmin.from('candidate_profiles').delete().eq('id', id);
    await supabaseAdmin.from('profiles').delete().eq('id', id);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        error: `Failed to delete auth user: ${deleteError.message}`,
      } satisfies ErrorResponse);
    }

    return res.status(200).json({
      success: true,
      deletedCount: 1,
    } satisfies DeleteTestSignupResponse);
  }

  return res.status(400).json({
    success: false,
    error: 'Missing id parameter or all=true query.',
  } satisfies ErrorResponse);
}

// GET - List all test signup accounts
async function handleListTestSignups(
  req: VercelRequest,
  res: VercelResponse
) {
  const { data: testAccounts, error } = await supabaseAdmin
    .from('candidate_profiles')
    .select('id, email, name, created_at, onboarding_stage')
    .eq('is_test_signup', true)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({
      success: false,
      error: `Failed to fetch test accounts: ${error.message}`,
    } satisfies ErrorResponse);
  }

  return res.status(200).json({
    success: true,
    accounts: (testAccounts || []).map(a => ({
      id: a.id,
      email: a.email,
      name: a.name || 'Unnamed',
      createdAt: a.created_at,
      onboardingStage: a.onboarding_stage || 0,
    })),
  });
}
