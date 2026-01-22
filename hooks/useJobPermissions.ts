import { useMemo } from 'react';
import { JobPosting, MemberRole } from '../types';

export interface JobPermissions {
  canEditBasics: boolean;
  canEditCompensation: boolean;
  canApproveCompensation: boolean; // New: Only finance/admin can approve salary
  canEditRequirements: boolean;
  canEditEnvironment: boolean;
  canEditCulture: boolean;
  canAssignApprovers: boolean;
  canApproveAsHM: boolean;
  canApproveAsFinance: boolean;
  isReadOnly: boolean;
  // Which sections are view-only for this user
  viewOnlySections: ('basics' | 'compensation' | 'requirements' | 'environment' | 'culture' | 'approvals')[];
}

/**
 * Hook to determine what permissions a user has for editing a job posting
 * based on their team role.
 *
 * Permission Matrix:
 * | Section         | Admin       | Hiring Manager    | Finance/CFO    |
 * |-----------------|-------------|-------------------|----------------|
 * | Basic Info      | Edit        | Edit              | View           |
 * | Compensation    | Edit+Approve| Edit (propose)    | Edit+Approve   |
 * | Requirements    | Edit        | Edit              | View           |
 * | Work Environment| Edit        | Edit (auto-pop)   | View           |
 * | Team Culture    | Edit        | Edit (auto-pop)   | View           |
 * | Approvals       | Assign      | View+Self-Approve | View+Self-Approve|
 *
 * Note: HM can input salary values (as a proposal), but Finance must approve
 */
export function useJobPermissions(
  job: Partial<JobPosting> | null,
  teamRole: MemberRole | null,
  userId?: string
): JobPermissions {
  return useMemo(() => {
    // Default permissions (no access)
    const noAccess: JobPermissions = {
      canEditBasics: false,
      canEditCompensation: false,
      canApproveCompensation: false,
      canEditRequirements: false,
      canEditEnvironment: false,
      canEditCulture: false,
      canAssignApprovers: false,
      canApproveAsHM: false,
      canApproveAsFinance: false,
      isReadOnly: true,
      viewOnlySections: ['basics', 'compensation', 'requirements', 'environment', 'culture', 'approvals']
    };

    if (!teamRole) return noAccess;

    // Check if user is the assigned approver for this job
    const isAssignedHM = userId && job?.approvals?.hiringManager?.assignedTo === userId;
    const isAssignedFinance = userId && job?.approvals?.finance?.assignedTo === userId;

    switch (teamRole) {
      case 'admin':
        return {
          canEditBasics: true,
          canEditCompensation: true,
          canApproveCompensation: true,
          canEditRequirements: true,
          canEditEnvironment: true,
          canEditCulture: true,
          canAssignApprovers: true,
          canApproveAsHM: true,
          canApproveAsFinance: true,
          isReadOnly: false,
          viewOnlySections: []
        };

      case 'hiring_manager':
        return {
          canEditBasics: true,
          canEditCompensation: true, // HM can propose salary values
          canApproveCompensation: false, // But cannot approve them
          canEditRequirements: true,
          canEditEnvironment: true,
          canEditCulture: true,
          canAssignApprovers: false,
          canApproveAsHM: isAssignedHM || teamRole === 'hiring_manager',
          canApproveAsFinance: false,
          isReadOnly: false,
          viewOnlySections: [] // No view-only sections - HM can edit all including compensation
        };

      case 'finance':
        return {
          canEditBasics: false,
          canEditCompensation: true,
          canApproveCompensation: true, // Finance can approve salary
          canEditRequirements: false,
          canEditEnvironment: false,
          canEditCulture: false,
          canAssignApprovers: false,
          canApproveAsHM: false,
          canApproveAsFinance: isAssignedFinance || teamRole === 'finance',
          isReadOnly: false,
          viewOnlySections: ['basics', 'requirements', 'environment', 'culture']
        };

      case 'interviewer':
        // Interviewers have view-only access
        return {
          canEditBasics: false,
          canEditCompensation: false,
          canApproveCompensation: false,
          canEditRequirements: false,
          canEditEnvironment: false,
          canEditCulture: false,
          canAssignApprovers: false,
          canApproveAsHM: false,
          canApproveAsFinance: false,
          isReadOnly: true,
          viewOnlySections: ['basics', 'compensation', 'requirements', 'environment', 'culture', 'approvals']
        };

      default:
        return noAccess;
    }
  }, [job, teamRole, userId]);
}

/**
 * Helper to check if a specific step in the job wizard should be skipped
 * based on user permissions.
 */
export function shouldSkipStep(
  stepId: number,
  permissions: JobPermissions
): boolean {
  // Map step IDs to permission checks
  const stepPermissionMap: Record<number, keyof JobPermissions> = {
    1: 'canEditBasics',       // Basics
    2: 'canEditRequirements', // Requirements
    3: 'canEditCompensation', // Environment (includes compensation)
    4: 'canEditCulture',      // Culture Fit
    5: 'canAssignApprovers'   // Finalize
  };

  const permKey = stepPermissionMap[stepId];
  if (!permKey) return false;

  // Step 3 is special - it has both environment and compensation
  // Finance can edit compensation but not environment
  if (stepId === 3) {
    return !permissions.canEditCompensation && !permissions.canEditEnvironment;
  }

  return !permissions[permKey];
}

/**
 * Get the label to show for who set a value
 */
export function getValueSourceLabel(
  source: 'admin' | 'hiring_manager' | 'finance' | 'company_default' | 'hm_preferences' | undefined,
  sourceName?: string
): string {
  if (!source) return '';

  switch (source) {
    case 'admin':
      return sourceName ? `Set by ${sourceName}` : 'Set by Admin';
    case 'hiring_manager':
      return sourceName ? `From ${sourceName}'s preferences` : 'From HM preferences';
    case 'hm_preferences':
      return sourceName ? `From ${sourceName}'s preferences` : 'From HM preferences';
    case 'finance':
      return sourceName ? `Set by ${sourceName}` : 'Set by Finance';
    case 'company_default':
      return 'Company default';
    default:
      return '';
  }
}
