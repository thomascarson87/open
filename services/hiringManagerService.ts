/**
 * Hiring Manager Service
 * Handles all operations related to Hiring Manager preferences and team management
 */

import { supabase } from './supabaseClient';
import { HiringManagerPreferences, HiringManagerPreferencesForm, JobPosting } from '../types';
import { formToDbHMPreferences, dbToFormHMPreferences } from '../utils/hiringManagerUtils';

/**
 * Fetch HM's default preferences
 */
export async function fetchHMDefaultPreferences(
  userId: string
): Promise<HiringManagerPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('hiring_manager_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching HM default preferences:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching HM preferences:', err);
    return null;
  }
}

/**
 * Fetch all preferences for an HM (including non-default)
 */
export async function fetchAllHMPreferences(
  userId: string
): Promise<HiringManagerPreferences[]> {
  try {
    const { data, error } = await supabase
      .from('hiring_manager_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HM preferences:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching HM preferences:', err);
    return [];
  }
}

/**
 * Save HM preferences (create or update)
 */
export async function saveHMPreferences(
  userId: string,
  companyId: string,
  prefs: HiringManagerPreferencesForm
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const dbData = formToDbHMPreferences(prefs, userId, companyId);

    // If setting as default, unset other defaults first
    if (prefs.isDefault) {
      await supabase
        .from('hiring_manager_preferences')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('company_id', companyId);
    }

    if (prefs.id) {
      // Update existing
      const { error } = await supabase
        .from('hiring_manager_preferences')
        .update(dbData)
        .eq('id', prefs.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: prefs.id };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('hiring_manager_preferences')
        .insert(dbData)
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    }
  } catch (err) {
    console.error('Exception saving HM preferences:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete HM preferences
 */
export async function deleteHMPreferences(
  prefsId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('hiring_manager_preferences')
      .delete()
      .eq('id', prefsId)
      .eq('user_id', userId); // Ensure user owns this record

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception deleting HM preferences:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Apply HM preferences to job data
 * Returns merged job data with HM preferences applied
 */
export async function applyHMPreferencesToJob(
  job: Partial<JobPosting>,
  hmUserId: string
): Promise<Partial<JobPosting> | null> {
  const hmPrefs = await fetchHMDefaultPreferences(hmUserId);

  if (!hmPrefs) {
    console.log('[HM Service] No default preferences found for HM:', hmUserId);
    return null;
  }

  // Map HM preferences to job fields
  return {
    ...job,
    workStyleRequirements: {
      ...job.workStyleRequirements,
      workIntensity: hmPrefs.work_intensity || job.workStyleRequirements?.workIntensity,
      autonomyLevel: hmPrefs.autonomy_level || job.workStyleRequirements?.autonomyLevel,
      decisionMaking: hmPrefs.decision_making || job.workStyleRequirements?.decisionMaking,
      ambiguityTolerance: hmPrefs.ambiguity_tolerance || job.workStyleRequirements?.ambiguityTolerance,
      changeFrequency: hmPrefs.change_frequency || job.workStyleRequirements?.changeFrequency,
      riskTolerance: hmPrefs.risk_tolerance || job.workStyleRequirements?.riskTolerance
    },
    workStyleDealbreakers: hmPrefs.work_style_dealbreakers?.length
      ? hmPrefs.work_style_dealbreakers
      : job.workStyleDealbreakers,
    teamRequirements: {
      ...job.teamRequirements,
      teamSizePreference: hmPrefs.team_size || job.teamRequirements?.teamSizePreference,
      reportingStructure: hmPrefs.reporting_structure || job.teamRequirements?.reportingStructure,
      collaborationFrequency: hmPrefs.collaboration_frequency || job.teamRequirements?.collaborationFrequency,
      pairProgramming: hmPrefs.pair_programming || job.teamRequirements?.pairProgramming,
      crossFunctional: hmPrefs.cross_functional || job.teamRequirements?.crossFunctional
    },
    teamDealbreakers: hmPrefs.team_dealbreakers?.length
      ? hmPrefs.team_dealbreakers
      : job.teamDealbreakers,
    requiredTraits: hmPrefs.required_traits?.length
      ? hmPrefs.required_traits
      : job.requiredTraits,
    desiredTraits: hmPrefs.preferred_traits?.length
      ? hmPrefs.preferred_traits
      : job.desiredTraits
  };
}

/**
 * Check if a job has HM preferences applied
 */
export function hasHMPreferencesApplied(job: Partial<JobPosting>): boolean {
  // Check for metadata flag if we added one
  const jobWithMeta = job as any;
  if (jobWithMeta._hmPrefsApplied) return true;

  // Otherwise check if work style fields are set
  const wsReqs = job.workStyleRequirements || {};
  return !!(
    wsReqs.workIntensity ||
    wsReqs.autonomyLevel ||
    wsReqs.decisionMaking ||
    wsReqs.ambiguityTolerance
  );
}

/**
 * Get HM name from user ID
 */
export async function getHMName(userId: string): Promise<string | null> {
  try {
    // Try team_members first
    const { data: member } = await supabase
      .from('team_members')
      .select('name')
      .eq('user_id', userId)
      .maybeSingle();

    if (member?.name) return member.name;

    // Fallback to profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.email) return profile.email.split('@')[0];

    return null;
  } catch {
    return null;
  }
}

/**
 * Get jobs where user is assigned as HM
 */
export async function getJobsForHM(userId: string): Promise<JobPosting[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('approvals->hiringManager->>assignedTo', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HM jobs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching HM jobs:', err);
    return [];
  }
}

/**
 * Get statistics for HM dashboard
 */
export async function getHMStats(userId: string): Promise<{
  totalJobs: number;
  pendingApproval: number;
  published: number;
  draft: number;
}> {
  try {
    const jobs = await getJobsForHM(userId);

    return {
      totalJobs: jobs.length,
      pendingApproval: jobs.filter(j => j.status === 'pending_approval').length,
      published: jobs.filter(j => j.status === 'published').length,
      draft: jobs.filter(j => j.status === 'draft').length
    };
  } catch {
    return { totalJobs: 0, pendingApproval: 0, published: 0, draft: 0 };
  }
}
