import React, { useState } from 'react';
import { JobPosting, MemberRole, TeamMember } from '../types';
import {
  Check,
  Clock,
  AlertCircle,
  ChevronRight,
  User,
  DollarSign,
  MessageSquare,
  X,
  Send
} from 'lucide-react';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';

interface ApprovalInfo {
  status: ApprovalStatus;
  assignedTo?: string;
  date?: string;
  feedback?: string;
}

interface JobApprovalPanelProps {
  job: Partial<JobPosting>;
  teamRole: MemberRole | null;
  currentUserId?: string;
  teamMembers: TeamMember[];
  teamMembersLoading?: boolean;
  onApprove: (role: 'hiringManager' | 'finance') => void;
  onRequestChanges: (role: 'hiringManager' | 'finance', feedback: string) => void;
  onAssignApprover: (role: 'hiringManager' | 'finance', userId: string) => void;
  className?: string;
}

const getStatusIcon = (status: ApprovalStatus) => {
  switch (status) {
    case 'approved':
      return <Check className="w-4 h-4 text-green-600" />;
    case 'rejected':
      return <X className="w-4 h-4 text-red-600" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
  }
};

const getStatusColor = (status: ApprovalStatus) => {
  switch (status) {
    case 'approved':
      return 'border-green-200 bg-green-50';
    case 'rejected':
      return 'border-red-200 bg-red-50';
    case 'pending':
      return 'border-amber-200 bg-amber-50';
    default:
      return 'border-border bg-gray-50 dark:bg-gray-900';
  }
};

const getStatusLabel = (status: ApprovalStatus) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Changes Requested';
    case 'pending':
      return 'Pending';
    default:
      return 'Not Required';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const JobApprovalPanel: React.FC<JobApprovalPanelProps> = ({
  job,
  teamRole,
  currentUserId,
  teamMembers,
  teamMembersLoading = false,
  onApprove,
  onRequestChanges,
  onAssignApprover,
  className = ''
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackFor, setShowFeedbackFor] = useState<'hiringManager' | 'finance' | null>(null);

  const hmApproval: ApprovalInfo = job.approvals?.hiringManager || { status: 'pending' };
  const financeApproval: ApprovalInfo = job.approvals?.finance || { status: 'pending' };

  // Find assigned team member names
  const hmAssignee = teamMembers.find(m => m.id === hmApproval.assignedTo || m.user_id === hmApproval.assignedTo);
  const financeAssignee = teamMembers.find(m => m.id === financeApproval.assignedTo || m.user_id === financeApproval.assignedTo);

  // Check if current user can approve
  const canApproveAsHM = teamRole === 'admin' ||
    (teamRole === 'hiring_manager' && (hmApproval.assignedTo === currentUserId || !hmApproval.assignedTo));
  const canApproveAsFinance = teamRole === 'admin' ||
    (teamRole === 'finance' && (financeApproval.assignedTo === currentUserId || !financeApproval.assignedTo));

  // Check if current user can assign approvers
  const canAssignApprovers = teamRole === 'admin';

  // Filter team members by role for assignment dropdowns
  const hmCandidates = teamMembers.filter(m => m.role === 'hiring_manager' || m.role === 'admin');
  const financeCandidates = teamMembers.filter(m => m.role === 'finance' || m.role === 'admin');

  // Check if all approvals are complete
  const allApproved = hmApproval.status === 'approved' && financeApproval.status === 'approved';

  const handleSubmitFeedback = (role: 'hiringManager' | 'finance') => {
    if (feedbackText.trim()) {
      onRequestChanges(role, feedbackText.trim());
      setFeedbackText('');
      setShowFeedbackFor(null);
    }
  };

  return (
    <div className={`bg-surface rounded-2xl border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-border">
        <h3 className="text-sm font-black text-primary uppercase tracking-wider">
          Approval Status
        </h3>
      </div>

      {/* Approval Chain Visualization */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Hiring Manager Approval */}
          <div className={`flex-1 p-4 rounded-xl border-2 transition-all ${getStatusColor(hmApproval.status)}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white dark:bg-surface rounded-lg shadow-sm">
                <User className="w-5 h-5 text-accent-coral" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-primary">Hiring Manager</p>
                {canAssignApprovers && hmApproval.status === 'pending' ? (
                  teamMembersLoading ? (
                    <div className="mt-1 animate-pulse h-8 bg-border rounded w-full" />
                  ) : hmCandidates.length === 0 ? (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">No hiring managers available</p>
                  ) : (
                    <select
                      value={hmApproval.assignedTo || ''}
                      onChange={(e) => onAssignApprover('hiringManager', e.target.value)}
                      className="mt-1 text-sm p-1 border rounded bg-white dark:bg-surface w-full"
                    >
                      <option value="">Unassigned</option>
                      {hmCandidates.map(m => (
                        <option key={m.id} value={m.user_id || m.id}>{m.name || m.email}</option>
                      ))}
                    </select>
                  )
                ) : (
                  <p className="text-sm text-muted">
                    {hmAssignee?.name || 'Unassigned'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(hmApproval.status)}
              <span className={`text-sm font-bold ${
                hmApproval.status === 'approved' ? 'text-green-700' :
                hmApproval.status === 'rejected' ? 'text-red-700' :
                'text-amber-700'
              }`}>
                {getStatusLabel(hmApproval.status)}
              </span>
            </div>
            {hmApproval.date && (
              <p className="text-xs text-muted mt-1">{formatDate(hmApproval.date)}</p>
            )}
            {hmApproval.feedback && (
              <div className="mt-2 p-2 bg-white dark:bg-surface rounded-lg text-sm text-muted border">
                {hmApproval.feedback}
              </div>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight className={`w-6 h-6 flex-shrink-0 ${
            hmApproval.status === 'approved' ? 'text-green-400' : 'text-gray-300 dark:text-gray-600'
          }`} />

          {/* Finance Approval */}
          <div className={`flex-1 p-4 rounded-xl border-2 transition-all ${getStatusColor(financeApproval.status)}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white dark:bg-surface rounded-lg shadow-sm">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-primary">Budget Approval</p>
                {canAssignApprovers && financeApproval.status === 'pending' ? (
                  teamMembersLoading ? (
                    <div className="mt-1 animate-pulse h-8 bg-border rounded w-full" />
                  ) : financeCandidates.length === 0 ? (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">No finance approvers available</p>
                  ) : (
                    <select
                      value={financeApproval.assignedTo || ''}
                      onChange={(e) => onAssignApprover('finance', e.target.value)}
                      className="mt-1 text-sm p-1 border rounded bg-white dark:bg-surface w-full"
                    >
                      <option value="">Unassigned</option>
                      {financeCandidates.map(m => (
                        <option key={m.id} value={m.user_id || m.id}>{m.name || m.email}</option>
                      ))}
                    </select>
                  )
                ) : (
                  <p className="text-sm text-muted">
                    {financeAssignee?.name || 'Unassigned'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(financeApproval.status)}
              <span className={`text-sm font-bold ${
                financeApproval.status === 'approved' ? 'text-green-700' :
                financeApproval.status === 'rejected' ? 'text-red-700' :
                'text-amber-700'
              }`}>
                {getStatusLabel(financeApproval.status)}
              </span>
            </div>
            {financeApproval.date && (
              <p className="text-xs text-muted mt-1">{formatDate(financeApproval.date)}</p>
            )}
            {financeApproval.feedback && (
              <div className="mt-2 p-2 bg-white dark:bg-surface rounded-lg text-sm text-muted border">
                {financeApproval.feedback}
              </div>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight className={`w-6 h-6 flex-shrink-0 ${
            allApproved ? 'text-green-400' : 'text-gray-300 dark:text-gray-600'
          }`} />

          {/* Publish Status */}
          <div className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center ${
            allApproved ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100 dark:bg-gray-800 border-2 border-border'
          }`}>
            {allApproved ? (
              <>
                <Check className="w-8 h-8 text-green-600 mb-1" />
                <span className="text-xs font-black text-green-700 uppercase">Ready</span>
              </>
            ) : (
              <>
                <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-1" />
                <span className="text-xs font-black text-muted uppercase">Pending</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons for Current User */}
        {((canApproveAsHM && hmApproval.status === 'pending') ||
          (canApproveAsFinance && financeApproval.status === 'pending')) && (
          <div className="mt-6 p-4 bg-accent-coral-bg rounded-xl border border-accent-coral-light">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-accent-coral" />
              <p className="font-bold text-accent-coral">Your approval is required</p>
            </div>

            {/* HM Approval Actions */}
            {canApproveAsHM && hmApproval.status === 'pending' && (
              <div className="mb-4">
                <p className="text-sm text-muted mb-3">As Hiring Manager:</p>
                {showFeedbackFor === 'hiringManager' ? (
                  <div className="space-y-2">
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Describe what changes are needed..."
                      className="w-full p-3 border rounded-xl text-sm resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitFeedback('hiringManager')}
                        disabled={!feedbackText.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => { setShowFeedbackFor(null); setFeedbackText(''); }}
                        className="px-4 py-2 text-muted font-bold text-sm hover:text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove('hiringManager')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowFeedbackFor('hiringManager')}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Request Changes
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Finance Approval Actions */}
            {canApproveAsFinance && financeApproval.status === 'pending' && (
              <div>
                <p className="text-sm text-muted mb-3">As Budget Approver:</p>
                {showFeedbackFor === 'finance' ? (
                  <div className="space-y-2">
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Describe what changes are needed..."
                      className="w-full p-3 border rounded-xl text-sm resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitFeedback('finance')}
                        disabled={!feedbackText.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => { setShowFeedbackFor(null); setFeedbackText(''); }}
                        className="px-4 py-2 text-muted font-bold text-sm hover:text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove('finance')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Approve Budget
                    </button>
                    <button
                      onClick={() => setShowFeedbackFor('finance')}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Request Changes
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApprovalPanel;

/**
 * Compact approval status badge for use on job cards
 */
interface ApprovalBadgeProps {
  job: Partial<JobPosting>;
  onClick?: () => void;
}

export const ApprovalBadge: React.FC<ApprovalBadgeProps> = ({ job, onClick }) => {
  const hmStatus = job.approvals?.hiringManager?.status || 'pending';
  const financeStatus = job.approvals?.finance?.status || 'pending';

  const allApproved = hmStatus === 'approved' && financeStatus === 'approved';
  const anyRejected = hmStatus === 'rejected' || financeStatus === 'rejected';

  let bgColor = 'bg-amber-100 text-amber-700 border-amber-200';
  let label = 'Awaiting Approval';

  if (allApproved) {
    bgColor = 'bg-green-100 text-green-700 border-green-200';
    label = 'Approved';
  } else if (anyRejected) {
    bgColor = 'bg-red-100 text-red-700 border-red-200';
    label = 'Changes Requested';
  } else if (hmStatus === 'approved') {
    label = 'Awaiting Budget';
  } else {
    label = 'Awaiting HM';
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-opacity hover:opacity-80 ${bgColor}`}
    >
      {allApproved ? <Check className="w-3 h-3" /> : anyRejected ? <X className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {label}
    </button>
  );
};
