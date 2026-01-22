/**
 * Approval Service
 * Handles job approval workflow operations including:
 * - Approving jobs as HM or Finance
 * - Requesting changes (rejection with feedback)
 * - Fetching pending approvals for a user
 * - Assigning approvers to jobs
 */

import { supabase } from './supabaseClient';
import { JobPosting, MemberRole } from '../types';

export interface JobApprovals {
  hiringManager?: {
    status: 'pending' | 'approved' | 'rejected';
    assignedTo?: string;
    date?: string;
    feedback?: string;
  };
  finance?: {
    status: 'pending' | 'approved' | 'rejected';
    assignedTo?: string;
    date?: string;
    feedback?: string;
  };
}

/**
 * Check if all approvals are complete
 */
export function areAllApprovalsComplete(approvals: JobApprovals | undefined): boolean {
  if (!approvals) return false;

  const hmApproved = approvals.hiringManager?.status === 'approved';
  const financeApproved = approvals.finance?.status === 'approved';

  // Both must be approved (if assigned) or not required
  const hmOk = hmApproved || !approvals.hiringManager?.assignedTo;
  const financeOk = financeApproved || !approvals.finance?.assignedTo;

  return hmOk && financeOk;
}

/**
 * Get the next required approval step
 */
export function getNextApprovalStep(approvals: JobApprovals | undefined): 'hiringManager' | 'finance' | 'complete' | null {
  if (!approvals) return null;

  // Check HM first
  if (approvals.hiringManager?.assignedTo && approvals.hiringManager.status === 'pending') {
    return 'hiringManager';
  }

  // Then Finance
  if (approvals.finance?.assignedTo && approvals.finance.status === 'pending') {
    return 'finance';
  }

  // Check if all complete
  if (areAllApprovalsComplete(approvals)) {
    return 'complete';
  }

  return null;
}

/**
 * Approve a job as the specified role
 */
export async function approveJob(
  jobId: string,
  role: 'hiringManager' | 'finance',
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First fetch the current job to get existing approvals
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('approvals, status')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: 'Job not found' };
    }

    const currentApprovals: JobApprovals = job.approvals || {};

    // Verify user is the assigned approver
    if (currentApprovals[role]?.assignedTo !== userId) {
      return { success: false, error: 'You are not assigned to approve this job' };
    }

    // Update the approval
    const updatedApprovals: JobApprovals = {
      ...currentApprovals,
      [role]: {
        ...currentApprovals[role],
        status: 'approved',
        date: new Date().toISOString()
      }
    };

    // Determine new job status
    const allApproved = areAllApprovalsComplete(updatedApprovals);
    const newStatus = allApproved ? 'published' : 'pending_approval';

    // Update the job
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        approvals: updatedApprovals,
        status: newStatus
      })
      .eq('id', jobId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // TODO: Send notification to job creator
    // TODO: If all approved, send notification to all stakeholders

    return { success: true };
  } catch (err) {
    console.error('Error approving job:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Request changes on a job (rejection with feedback)
 */
export async function requestJobChanges(
  jobId: string,
  role: 'hiringManager' | 'finance',
  userId: string,
  feedback: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First fetch the current job
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('approvals')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: 'Job not found' };
    }

    const currentApprovals: JobApprovals = job.approvals || {};

    // Verify user is the assigned approver
    if (currentApprovals[role]?.assignedTo !== userId) {
      return { success: false, error: 'You are not assigned to review this job' };
    }

    // Update the approval with rejection
    const updatedApprovals: JobApprovals = {
      ...currentApprovals,
      [role]: {
        ...currentApprovals[role],
        status: 'rejected',
        feedback,
        date: new Date().toISOString()
      }
    };

    // Update job - set back to draft so creator can make changes
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        approvals: updatedApprovals,
        status: 'draft'
      })
      .eq('id', jobId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // TODO: Send notification to job creator with feedback

    return { success: true };
  } catch (err) {
    console.error('Error requesting changes:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Assign an approver to a job
 */
export async function assignApprover(
  jobId: string,
  role: 'hiringManager' | 'finance',
  assigneeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First fetch current approvals
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('approvals')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: 'Job not found' };
    }

    const currentApprovals: JobApprovals = job.approvals || {};

    // Update the assignment
    const updatedApprovals: JobApprovals = {
      ...currentApprovals,
      [role]: {
        status: 'pending',
        assignedTo: assigneeId
      }
    };

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ approvals: updatedApprovals })
      .eq('id', jobId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // TODO: Send notification to assigned approver

    return { success: true };
  } catch (err) {
    console.error('Error assigning approver:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get jobs pending approval for a specific user
 */
export async function getPendingApprovalJobs(
  userId: string,
  role: MemberRole
): Promise<JobPosting[]> {
  try {
    let query = supabase.from('jobs').select('*');

    // Build query based on role
    if (role === 'hiring_manager') {
      // Jobs where user is assigned as HM and status is pending
      query = query
        .eq('approvals->hiringManager->>assignedTo', userId)
        .eq('approvals->hiringManager->>status', 'pending');
    } else if (role === 'finance') {
      // Jobs where user is assigned as finance and status is pending
      query = query
        .eq('approvals->finance->>assignedTo', userId)
        .eq('approvals->finance->>status', 'pending');
    } else if (role === 'admin') {
      // Admins see all pending jobs
      query = query.eq('status', 'pending_approval');
    } else {
      return [];
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching pending approvals:', err);
    return [];
  }
}

/**
 * Get approval summary for dashboard display
 */
export async function getApprovalSummary(userId: string, role: MemberRole): Promise<{
  pendingHM: number;
  pendingFinance: number;
  recentlyApproved: number;
}> {
  try {
    const summary = { pendingHM: 0, pendingFinance: 0, recentlyApproved: 0 };

    if (role === 'hiring_manager' || role === 'admin') {
      const { count: hmCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('approvals->hiringManager->>assignedTo', userId)
        .eq('approvals->hiringManager->>status', 'pending');

      summary.pendingHM = hmCount || 0;
    }

    if (role === 'finance' || role === 'admin') {
      const { count: financeCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('approvals->finance->>assignedTo', userId)
        .eq('approvals->finance->>status', 'pending');

      summary.pendingFinance = financeCount || 0;
    }

    // Get recently approved (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: approvedCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('updated_at', weekAgo.toISOString());

    summary.recentlyApproved = approvedCount || 0;

    return summary;
  } catch (err) {
    console.error('Error fetching approval summary:', err);
    return { pendingHM: 0, pendingFinance: 0, recentlyApproved: 0 };
  }
}

/**
 * Check if user can approve a specific job
 */
export function canUserApproveJob(
  job: Partial<JobPosting>,
  userId: string,
  role: MemberRole
): { canApprove: boolean; approvalRole?: 'hiringManager' | 'finance' } {
  const approvals = job.approvals as JobApprovals | undefined;

  if (!approvals) return { canApprove: false };

  // Check HM approval
  if (
    (role === 'hiring_manager' || role === 'admin') &&
    approvals.hiringManager?.assignedTo === userId &&
    approvals.hiringManager?.status === 'pending'
  ) {
    return { canApprove: true, approvalRole: 'hiringManager' };
  }

  // Check Finance approval
  if (
    (role === 'finance' || role === 'admin') &&
    approvals.finance?.assignedTo === userId &&
    approvals.finance?.status === 'pending'
  ) {
    return { canApprove: true, approvalRole: 'finance' };
  }

  return { canApprove: false };
}
