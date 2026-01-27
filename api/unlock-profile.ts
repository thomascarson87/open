import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// --- Supabase clients (inline to avoid path alias issues in Vercel serverless) ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

// Public client — used only to verify auth tokens
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client — bypasses RLS, used for all database operations
const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// --- Types ---

type ErrorCode =
  | 'INSUFFICIENT_CREDITS'
  | 'ALREADY_UNLOCKED'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'INVALID_REQUEST';

interface UnlockRecord {
  id: string;
  candidateId: string;
  companyId: string;
  unlockedAt: string;
  cost: number;
}

interface SuccessResponse {
  success: true;
  candidate: Record<string, unknown>;
  creditsRemaining: number;
  unlock: UnlockRecord;
}

interface ErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// --- Handler ---

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1. Verify request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
      code: 'INVALID_REQUEST',
    } satisfies ErrorResponse);
  }

  // 2. Parse candidateId from request body
  const { candidateId } = req.body;

  if (!candidateId || typeof candidateId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid candidateId in request body.',
      code: 'INVALID_REQUEST',
    } satisfies ErrorResponse);
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(candidateId)) {
    return res.status(400).json({
      success: false,
      error: 'candidateId must be a valid UUID.',
      code: 'INVALID_REQUEST',
    } satisfies ErrorResponse);
  }

  try {
    // 3. Get authenticated user from Supabase Auth
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header.',
        code: 'UNAUTHORIZED',
      } satisfies ErrorResponse);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token.',
        code: 'UNAUTHORIZED',
      } satisfies ErrorResponse);
    }

    // 4. Get user profile — profiles.id IS the user ID (FK to auth.users)
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('id, role, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      await logAuditEvent({
        action: 'unlock_profile_attempt',
        userId: user.id,
        companyId: null,
        candidateId,
        metadata: { error: 'Profile not found' },
        success: false,
      });
      return res.status(401).json({
        success: false,
        error: 'User profile not found.',
        code: 'UNAUTHORIZED',
      } satisfies ErrorResponse);
    }

    // 5. Check if user role is 'recruiter'
    if (profile.role !== 'recruiter') {
      await logAuditEvent({
        action: 'unlock_profile_attempt',
        userId: user.id,
        companyId: null,
        candidateId,
        metadata: { error: 'Not a recruiter', role: profile.role },
        success: false,
      });
      return res.status(403).json({
        success: false,
        error: 'Only recruiters can unlock candidate profiles.',
        code: 'UNAUTHORIZED',
      } satisfies ErrorResponse);
    }

    // 6. Get company profile — for recruiters, company_profiles.id = profiles.id
    const { data: company, error: companyError } = await supabaseServer
      .from('company_profiles')
      .select('id, credits')
      .eq('id', profile.id)
      .single();

    if (companyError || !company) {
      await logAuditEvent({
        action: 'unlock_profile_attempt',
        userId: user.id,
        companyId: null,
        candidateId,
        metadata: { error: 'Company profile not found for this recruiter' },
        success: false,
      });
      return res.status(403).json({
        success: false,
        error: 'No company profile found for this user.',
        code: 'UNAUTHORIZED',
      } satisfies ErrorResponse);
    }

    const companyId = company.id;

    // 7. Check if candidate already unlocked
    const { data: existingUnlock, error: unlockCheckError } = await supabaseServer
      .from('candidate_unlocks')
      .select('id, candidate_id, company_id, created_at, cost_credits')
      .eq('candidate_id', candidateId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (unlockCheckError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to check unlock status.',
        code: 'INVALID_REQUEST',
      } satisfies ErrorResponse);
    }

    // 8. If already unlocked: return success with existing data (no charge)
    if (existingUnlock) {
      const candidate = await fetchFullCandidateProfile(candidateId);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          error: 'Candidate profile not found.',
          code: 'NOT_FOUND',
        } satisfies ErrorResponse);
      }

      return res.status(200).json({
        success: true,
        candidate: { ...candidate, isUnlocked: true },
        creditsRemaining: company.credits ?? 0,
        unlock: {
          id: existingUnlock.id,
          candidateId: existingUnlock.candidate_id,
          companyId: existingUnlock.company_id,
          unlockedAt: existingUnlock.created_at,
          cost: existingUnlock.cost_credits ?? 0,
        },
      } satisfies SuccessResponse);
    }

    // 9. If credits < 1: return INSUFFICIENT_CREDITS error
    const currentCredits = company.credits ?? 0;
    if (currentCredits < 1) {
      await logAuditEvent({
        action: 'unlock_profile_attempt',
        userId: user.id,
        companyId,
        candidateId,
        metadata: { error: 'Insufficient credits', credits: currentCredits },
        success: false,
      });
      return res.status(403).json({
        success: false,
        error: `Insufficient credits. You have ${currentCredits} credits, but 1 is required.`,
        code: 'INSUFFICIENT_CREDITS',
      } satisfies ErrorResponse);
    }

    // Verify candidate exists before proceeding
    const candidateExists = await fetchFullCandidateProfile(candidateId);
    if (!candidateExists) {
      await logAuditEvent({
        action: 'unlock_profile_attempt',
        userId: user.id,
        companyId,
        candidateId,
        metadata: { error: 'Candidate not found' },
        success: false,
      });
      return res.status(404).json({
        success: false,
        error: 'Candidate profile not found.',
        code: 'NOT_FOUND',
      } satisfies ErrorResponse);
    }

    // 10. Perform unlock operations using supabaseServer
    // Use atomic credit deduction with check to prevent race conditions
    const { data: updatedCompany, error: creditError } = await supabaseServer
      .from('company_profiles')
      .update({ credits: currentCredits - 1 })
      .eq('id', companyId)
      .gte('credits', 1)
      .select('credits')
      .single();

    if (creditError || !updatedCompany) {
      await logAuditEvent({
        action: 'unlock_profile_attempt',
        userId: user.id,
        companyId,
        candidateId,
        metadata: { error: 'Credit deduction failed - possible race condition' },
        success: false,
      });
      return res.status(403).json({
        success: false,
        error: 'Failed to deduct credits. Please try again.',
        code: 'INSUFFICIENT_CREDITS',
      } satisfies ErrorResponse);
    }

    // Insert unlock record
    const { data: unlockRecord, error: insertUnlockError } = await supabaseServer
      .from('candidate_unlocks')
      .insert({
        candidate_id: candidateId,
        company_id: companyId,
        unlocked_by: user.id,
        cost_credits: 1,
      })
      .select('id, candidate_id, company_id, created_at, cost_credits')
      .single();

    if (insertUnlockError || !unlockRecord) {
      // Attempt to refund credits on failure
      await supabaseServer
        .from('company_profiles')
        .update({ credits: currentCredits })
        .eq('id', companyId);

      await logAuditEvent({
        action: 'unlock_profile_attempt',
        userId: user.id,
        companyId,
        candidateId,
        metadata: { error: 'Failed to insert unlock record', dbError: insertUnlockError?.message },
        success: false,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to create unlock record. Credits have been refunded.',
        code: 'INVALID_REQUEST',
      } satisfies ErrorResponse);
    }

    // Log successful unlock
    await logAuditEvent({
      action: 'unlock_profile_success',
      userId: user.id,
      companyId,
      candidateId,
      metadata: {
        unlockId: unlockRecord.id,
        creditsCost: 1,
        creditsRemaining: updatedCompany.credits,
      },
      success: true,
    });

    // 11. Return success response
    return res.status(200).json({
      success: true,
      candidate: { ...candidateExists, isUnlocked: true },
      creditsRemaining: updatedCompany.credits ?? 0,
      unlock: {
        id: unlockRecord.id,
        candidateId: unlockRecord.candidate_id,
        companyId: unlockRecord.company_id,
        unlockedAt: unlockRecord.created_at,
        cost: unlockRecord.cost_credits ?? 1,
      },
    } satisfies SuccessResponse);

  } catch (error) {
    console.error('Unlock profile error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred.',
      code: 'INVALID_REQUEST',
    } satisfies ErrorResponse);
  }
}

// --- Helper functions ---

async function fetchFullCandidateProfile(candidateId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabaseServer
    .from('candidate_profiles')
    .select('*')
    .eq('id', candidateId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    avatarUrls: data.avatar_urls,
    videoIntroUrl: data.video_intro_url,
    totalYearsExperience: data.total_years_experience,
    educationHistory: data.education_history,
    characterTraits: data.character_traits ?? [],
    personalityAssessments: data.personality_assessments,
    salaryMin: data.salary_min ?? 0,
    salaryMax: data.salary_max,
    salaryExpectation: data.salary_expectation,
    salaryCurrency: data.salary_currency ?? 'USD',
    openToEquity: data.open_to_equity,
    currentBonuses: data.current_bonuses,
    legalStatus: data.legal_status,
    preferredWorkMode: data.preferred_work_mode ?? [],
    willingToRelocate: data.willing_to_relocate,
    preferredTimezone: data.preferred_timezone,
    desiredPerks: data.desired_perks ?? [],
    interestedIndustries: data.interested_industries ?? [],
    preferredCompanySize: data.preferred_company_size,
    currentImpactScope: data.current_impact_scope,
    desiredImpactScopes: data.desired_impact_scopes ?? [],
    contractTypes: data.contract_types ?? [],
    noticePeriod: data.notice_period ?? '',
    nonNegotiables: data.non_negotiables ?? [],
    desiredSeniority: data.desired_seniority,
    currentSeniority: data.current_seniority,
    primaryRoleId: data.primary_role_id,
    primaryRoleName: data.primary_role_name,
    secondaryRoles: data.secondary_roles,
    interestedRoles: data.interested_roles,
    onboarding_completed: data.onboarding_completed ?? false,
    workStylePreferences: data.work_style_preferences,
    teamCollaborationPreferences: data.team_collaboration_preferences,
    callReady: data.call_ready,
    callLink: data.call_link,
    preferredLeadershipStyle: data.preferred_leadership_style,
    preferredFeedbackFrequency: data.preferred_feedback_frequency,
    preferredCommunicationStyle: data.preferred_communication_style,
    preferredMeetingCulture: data.preferred_meeting_culture,
    preferredConflictResolution: data.preferred_conflict_resolution,
    preferredMentorshipStyle: data.preferred_mentorship_style,
    growthGoals: data.growth_goals,
  };
}

async function logAuditEvent(params: {
  action: string;
  userId: string;
  companyId: string | null;
  candidateId: string;
  metadata: Record<string, unknown>;
  success: boolean;
}): Promise<void> {
  try {
    await supabaseServer
      .from('api_audit_logs')
      .insert({
        action: params.action,
        user_id: params.userId,
        company_id: params.companyId,
        candidate_id: params.candidateId,
        metadata: params.metadata,
        success: params.success,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
