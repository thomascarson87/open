/**
 * Service for fetching and applying Hiring Manager Preferences to Job Postings
 *
 * This service handles the auto-population of job fields from a hiring manager's
 * saved preferences. The flow is:
 * 1. HM is assigned to a job (during creation or on a draft)
 * 2. Fetch HM's default preferences from hiring_manager_preferences table
 * 3. Map preferences to job fields (if job doesn't already have values)
 */

import { supabase } from './supabaseClient';
import { JobPosting, HiringManagerPreferences } from '../types';

/**
 * Fetch the default HM preferences for a user
 */
export async function fetchHMPreferences(userId: string): Promise<HiringManagerPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('hiring_manager_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching HM preferences:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching HM preferences:', err);
    return null;
  }
}

/**
 * Check if a job already has work style/team values set
 * (to avoid overwriting existing values)
 */
export function hasExistingWorkStyleValues(job: Partial<JobPosting>): boolean {
  const wsReqs = job.workStyleRequirements || {};
  const teamReqs = job.teamRequirements || {};

  // Check if any work style values are set
  const hasWorkStyle = !!(
    wsReqs.workIntensity ||
    wsReqs.autonomyLevel ||
    wsReqs.decisionMaking ||
    wsReqs.ambiguityTolerance ||
    wsReqs.changeFrequency ||
    wsReqs.riskTolerance
  );

  // Check if any team values are set
  const hasTeam = !!(
    teamReqs.teamSizePreference ||
    teamReqs.collaborationFrequency ||
    teamReqs.pairProgramming ||
    teamReqs.crossFunctional
  );

  // Check if traits are set
  const hasTraits = !!(
    (job.requiredTraits && job.requiredTraits.length > 0) ||
    (job.desiredTraits && job.desiredTraits.length > 0)
  );

  return hasWorkStyle || hasTeam || hasTraits;
}

/**
 * Map HM preferences to job posting fields
 * Returns partial JobPosting with populated values
 */
export function mapHMPreferencesToJob(
  hmPrefs: HiringManagerPreferences
): Partial<JobPosting> & { _hmPrefsApplied?: boolean; _hmPrefsFrom?: string; _hmPrefsName?: string } {
  return {
    workStyleRequirements: {
      workIntensity: hmPrefs.work_intensity,
      autonomyLevel: hmPrefs.autonomy_level,
      decisionMaking: hmPrefs.decision_making,
      ambiguityTolerance: hmPrefs.ambiguity_tolerance,
      changeFrequency: hmPrefs.change_frequency,
      riskTolerance: hmPrefs.risk_tolerance
    },
    workStyleDealbreakers: hmPrefs.work_style_dealbreakers || [],
    teamRequirements: {
      teamSizePreference: hmPrefs.team_size,
      reportingStructure: hmPrefs.reporting_structure,
      collaborationFrequency: hmPrefs.collaboration_frequency,
      pairProgramming: hmPrefs.pair_programming,
      crossFunctional: hmPrefs.cross_functional
    },
    teamDealbreakers: hmPrefs.team_dealbreakers || [],
    requiredTraits: hmPrefs.required_traits || [],
    desiredTraits: hmPrefs.preferred_traits || [],
    // Metadata to track the source
    _hmPrefsApplied: true,
    _hmPrefsFrom: hmPrefs.user_id,
    _hmPrefsName: hmPrefs.name
  };
}

/**
 * Apply HM preferences to a job if:
 * 1. The job has an assigned HM
 * 2. The job doesn't already have work style values
 *
 * Returns updated job data or null if no changes needed
 */
export async function applyHMPreferencesToJob(
  job: Partial<JobPosting>,
  assignedHMId?: string
): Promise<(Partial<JobPosting> & { _hmPrefsApplied?: boolean; _hmPrefsFrom?: string; _hmPrefsName?: string }) | null> {
  const hmId = assignedHMId || job.approvals?.hiringManager?.assignedTo;

  if (!hmId) {
    console.log('[HM Prefs] No HM assigned, skipping auto-population');
    return null;
  }

  if (hasExistingWorkStyleValues(job)) {
    console.log('[HM Prefs] Job already has work style values, skipping auto-population');
    return null;
  }

  const hmPrefs = await fetchHMPreferences(hmId);

  if (!hmPrefs) {
    console.log('[HM Prefs] No preferences found for HM:', hmId);
    return null;
  }

  console.log('[HM Prefs] Applying preferences from:', hmPrefs.name);
  const mappedValues = mapHMPreferencesToJob(hmPrefs);

  return {
    ...job,
    ...mappedValues
  };
}

/**
 * Hook-friendly version that returns a callback for applying preferences
 */
export function createHMPreferencesApplier(
  setJobData: React.Dispatch<React.SetStateAction<Partial<JobPosting>>>
) {
  return async (hmId: string) => {
    const hmPrefs = await fetchHMPreferences(hmId);

    if (!hmPrefs) {
      console.log('[HM Prefs] No preferences found for HM:', hmId);
      return false;
    }

    const mappedValues = mapHMPreferencesToJob(hmPrefs);

    setJobData(prev => {
      // Don't overwrite if values already exist
      if (hasExistingWorkStyleValues(prev)) {
        console.log('[HM Prefs] Job already has values, skipping');
        return prev;
      }

      console.log('[HM Prefs] Applying preferences from:', hmPrefs.name);
      return {
        ...prev,
        ...mappedValues
      };
    });

    return true;
  };
}

/**
 * Get the display name for an HM preferences source
 */
export async function getHMPreferencesSourceName(userId: string): Promise<string | null> {
  try {
    // First try team_members table
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('name')
      .eq('user_id', userId)
      .maybeSingle();

    if (teamMember?.name) return teamMember.name;

    // Fallback to profiles table
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
 * Type extension for JobPosting with HM preferences metadata
 */
export interface JobWithHMMetadata extends Partial<JobPosting> {
  _hmPrefsApplied?: boolean;
  _hmPrefsFrom?: string;
  _hmPrefsName?: string;
}

/**
 * Check if a job field was populated from HM preferences
 */
export function isFromHMPreferences(
  job: JobWithHMMetadata,
  field: keyof JobPosting
): boolean {
  if (!job._hmPrefsApplied) return false;

  // Fields that come from HM preferences
  const hmFields: (keyof JobPosting)[] = [
    'workStyleRequirements',
    'workStyleDealbreakers',
    'teamRequirements',
    'teamDealbreakers',
    'requiredTraits',
    'desiredTraits'
  ];

  return hmFields.includes(field);
}
