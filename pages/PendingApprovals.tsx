import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { JobPosting } from '../types';
import {
  getPendingApprovalJobs,
  approveJob,
  requestJobChanges,
  canUserApproveJob
} from '../services/approvalService';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  DollarSign,
  MapPin,
  User,
  Calendar,
  ChevronRight,
  Loader2,
  Shield,
  X,
  MessageSquare
} from 'lucide-react';

interface PendingJob extends JobPosting {
  _approvalRole?: 'hiringManager' | 'finance';
}

export default function PendingApprovals() {
  const { user, teamRole } = useAuth();
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Access control check
  const hasAccess = teamRole === 'hiring_manager' || teamRole === 'finance' || teamRole === 'admin';

  // Load pending jobs
  const loadPendingJobs = useCallback(async () => {
    if (!user?.id || !teamRole) {
      setLoading(false);
      return;
    }

    try {
      const pendingJobs = await getPendingApprovalJobs(user.id, teamRole);

      // Annotate jobs with which role the user can approve as
      const annotatedJobs: PendingJob[] = pendingJobs.map(job => {
        const { approvalRole } = canUserApproveJob(job, user.id, teamRole);
        return { ...job, _approvalRole: approvalRole };
      });

      setJobs(annotatedJobs);
    } catch (err) {
      console.error('Error loading pending approvals:', err);
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  }, [user?.id, teamRole]);

  useEffect(() => {
    loadPendingJobs();
  }, [loadPendingJobs]);

  // Handle approve
  const handleApprove = async (job: PendingJob) => {
    if (!user?.id || !job._approvalRole) return;

    setActionLoading(job.id);
    setError(null);

    const result = await approveJob(job.id, job._approvalRole, user.id);

    if (result.success) {
      setSuccess(`Successfully approved "${job.title}"`);
      setTimeout(() => setSuccess(null), 3000);
      loadPendingJobs(); // Refresh list
    } else {
      setError(result.error || 'Failed to approve job');
    }

    setActionLoading(null);
  };

  // Handle request changes
  const handleRequestChanges = async () => {
    if (!user?.id || !selectedJob?._approvalRole || !feedbackText.trim()) return;

    setActionLoading(selectedJob.id);
    setError(null);

    const result = await requestJobChanges(
      selectedJob.id,
      selectedJob._approvalRole,
      user.id,
      feedbackText.trim()
    );

    if (result.success) {
      setSuccess(`Feedback sent for "${selectedJob.title}"`);
      setTimeout(() => setSuccess(null), 3000);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setSelectedJob(null);
      loadPendingJobs();
    } else {
      setError(result.error || 'Failed to submit feedback');
    }

    setActionLoading(null);
  };

  // Format salary display
  const formatSalary = (job: JobPosting) => {
    if (!job.salaryMin && !job.salaryMax) return 'Not specified';
    const currency = job.salaryCurrency || 'USD';
    const min = job.salaryMin?.toLocaleString() || '?';
    const max = job.salaryMax?.toLocaleString() || '?';
    return `${currency} ${min} - ${max}`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Access denied view
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            This page is only available to Hiring Managers, Finance, and Admins.
          </p>
        </div>
      </div>
    );
  }

  // Loading view
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
              <p className="text-gray-500 mt-1">
                {jobs.length === 0
                  ? 'No jobs require your approval'
                  : `${jobs.length} job${jobs.length === 1 ? '' : 's'} awaiting your review`}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">{jobs.length} Pending</span>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up</h3>
            <p className="text-gray-500">
              There are no jobs requiring your approval at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {job.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        job._approvalRole === 'hiringManager'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {job._approvalRole === 'hiringManager' ? 'HM Review' : 'Budget Review'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(job)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Submitted {formatDate(job.created_at || new Date().toISOString())}
                      </span>
                    </div>

                    {/* Skills Preview */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.requiredSkills.slice(0, 4).map((skill: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {job.requiredSkills.length > 4 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{job.requiredSkills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(job)}
                      disabled={actionLoading === job.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === job.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowFeedbackModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Request Changes
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Request Changes</h3>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setSelectedJob(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Provide feedback for <span className="font-bold">{selectedJob.title}</span>.
              The job will be returned to draft status for revisions.
            </p>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Describe what changes are needed..."
              className="w-full p-4 border border-gray-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setSelectedJob(null);
                }}
                className="px-4 py-2 text-gray-600 font-bold text-sm hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={!feedbackText.trim() || actionLoading === selectedJob.id}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === selectedJob.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
