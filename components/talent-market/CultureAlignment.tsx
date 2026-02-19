import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  Briefcase,
  ChevronRight,
  AlertCircle,
  Settings,
  User,
  CheckCircle,
  XCircle,
  Minus,
  ChevronDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { supabase } from '../../services/supabaseClient';
import {
  calculateCultureFit,
  CultureFitResult,
} from '../../services/marketIntelligence';
import { HiringManagerPreferences } from '../../types';

interface CultureAlignmentProps {
  companyId: string;
  isLoading?: boolean;
}

interface CompanyProfile {
  id: string;
  company_name: string;
  values: string[];
  desired_traits: string[];
}

interface PipelineCandidate {
  id: string;
  candidate_id: string;
  candidate_name: string;
  status: string;
  job_title: string;
}

interface ValueDistribution {
  value: string;
  count: number;
  percent: number;
  isCompanyValue: boolean;
}

// Culture fit score ring visualization
const CultureScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return { stroke: '#16a34a', text: 'text-green-600' };
    if (score >= 50) return { stroke: 'var(--accent-coral)', text: 'text-accent-coral' };
    if (score >= 30) return { stroke: '#f59e0b', text: 'text-amber-600' };
    return { stroke: '#ef4444', text: 'text-red-500' };
  };

  const colors = getColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black ${colors.text}`}>{score}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">/ 100</span>
      </div>
    </div>
  );
};

// HM Preferences summary display
const PreferencesSummary: React.FC<{ prefs: HiringManagerPreferences }> = ({ prefs }) => {
  const items = [
    { label: 'Leadership', value: prefs.leadership_style },
    { label: 'Feedback', value: prefs.feedback_frequency },
    { label: 'Communication', value: prefs.communication_preference },
    { label: 'Intensity', value: prefs.work_intensity },
    { label: 'Autonomy', value: prefs.autonomy_level },
  ].filter(item => item.value);

  if (items.length === 0) return null;

  const formatValue = (val: string) =>
    val.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, 4).map((item, i) => (
        <span
          key={i}
          className="px-2 py-1 bg-accent-green-bg text-accent-green text-xs font-medium rounded-lg"
        >
          {item.label}: {formatValue(item.value!)}
        </span>
      ))}
      {items.length > 4 && (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-muted text-xs font-medium rounded-lg">
          +{items.length - 4} more
        </span>
      )}
    </div>
  );
};

const CultureAlignment: React.FC<CultureAlignmentProps> = ({
  companyId,
  isLoading = false,
}) => {
  // Section A state
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [hmPreferences, setHmPreferences] = useState<HiringManagerPreferences | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Section B state
  const [valueDistribution, setValueDistribution] = useState<ValueDistribution[]>([]);
  const [isLoadingValues, setIsLoadingValues] = useState(true);

  // Section C state
  const [pipelineCandidates, setPipelineCandidates] = useState<PipelineCandidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [cultureFitResult, setCultureFitResult] = useState<CultureFitResult | null>(null);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [isLoadingFit, setIsLoadingFit] = useState(false);

  // Fetch company profile and HM preferences
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) {
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      try {
        // Fetch company profile
        const { data: profile, error: profileError } = await supabase
          .from('company_profiles')
          .select('id, company_name, values, desired_traits')
          .eq('id', companyId)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching company profile:', profileError);
        } else if (profile) {
          setCompanyProfile(profile);
        }

        // Fetch HM preferences (get default or first)
        const { data: prefs, error: prefsError } = await supabase
          .from('hiring_manager_preferences')
          .select('*')
          .eq('company_id', companyId)
          .order('is_default', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (prefsError) {
          console.error('Error fetching HM preferences:', prefsError);
        } else if (prefs) {
          setHmPreferences(prefs);
        }
      } catch (error) {
        console.error('Error in fetchCompanyData:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Fetch values distribution from talent pool
  useEffect(() => {
    const fetchValueDistribution = async () => {
      if (!companyId) {
        setIsLoadingValues(false);
        return;
      }

      setIsLoadingValues(true);
      try {
        // Get company's active jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, required_skills_with_levels')
          .eq('company_id', companyId)
          .in('status', ['published', 'active', 'draft']);

        if (jobsError || !jobs || jobs.length === 0) {
          setIsLoadingValues(false);
          return;
        }

        // Get all candidates who have applied to these jobs
        const jobIds = jobs.map(j => j.id);
        const { data: applications, error: appsError } = await supabase
          .from('applications')
          .select('candidate_id')
          .in('job_id', jobIds);

        if (appsError) {
          console.error('Error fetching applications:', appsError);
          setIsLoadingValues(false);
          return;
        }

        // Get unique candidate IDs
        const candidateIds = [...new Set(applications?.map(a => a.candidate_id) || [])];

        if (candidateIds.length === 0) {
          // No applications yet - fetch some candidates based on skill overlap
          const { data: candidates, error: candError } = await supabase
            .from('candidate_profiles')
            .select('values_list')
            .limit(50);

          if (candError || !candidates) {
            setIsLoadingValues(false);
            return;
          }

          // Aggregate values
          const valueCounts = new Map<string, number>();
          candidates.forEach(c => {
            const vals = c.values_list as string[] | null;
            vals?.forEach(v => {
              const normalized = v.trim();
              if (normalized) {
                valueCounts.set(normalized, (valueCounts.get(normalized) || 0) + 1);
              }
            });
          });

          const total = candidates.length || 1;
          const companyValues = (companyProfile?.values || []).map(v => v.toLowerCase());

          const distribution: ValueDistribution[] = Array.from(valueCounts.entries())
            .map(([value, count]) => ({
              value,
              count,
              percent: Math.round((count / total) * 100),
              isCompanyValue: companyValues.includes(value.toLowerCase()),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          setValueDistribution(distribution);
          setIsLoadingValues(false);
          return;
        }

        // Fetch candidate values
        const { data: candidates, error: candError } = await supabase
          .from('candidate_profiles')
          .select('values_list')
          .in('id', candidateIds);

        if (candError || !candidates) {
          setIsLoadingValues(false);
          return;
        }

        // Aggregate values
        const valueCounts = new Map<string, number>();
        candidates.forEach(c => {
          const vals = c.values_list as string[] | null;
          vals?.forEach(v => {
            const normalized = v.trim();
            if (normalized) {
              valueCounts.set(normalized, (valueCounts.get(normalized) || 0) + 1);
            }
          });
        });

        const total = candidates.length || 1;
        const companyValues = (companyProfile?.values || []).map(v => v.toLowerCase());

        const distribution: ValueDistribution[] = Array.from(valueCounts.entries())
          .map(([value, count]) => ({
            value,
            count,
            percent: Math.round((count / total) * 100),
            isCompanyValue: companyValues.includes(value.toLowerCase()),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setValueDistribution(distribution);
      } catch (error) {
        console.error('Error in fetchValueDistribution:', error);
      } finally {
        setIsLoadingValues(false);
      }
    };

    fetchValueDistribution();
  }, [companyId, companyProfile]);

  // Fetch pipeline candidates
  useEffect(() => {
    const fetchPipelineCandidates = async () => {
      if (!companyId) {
        setIsLoadingCandidates(false);
        return;
      }

      setIsLoadingCandidates(true);
      try {
        // Get applications for this company's jobs
        const { data: applications, error } = await supabase
          .from('applications')
          .select(`
            id,
            candidate_id,
            status,
            jobs!inner (
              company_id,
              title
            ),
            candidate_profiles!inner (
              name
            )
          `)
          .eq('jobs.company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching pipeline candidates:', error);
          setIsLoadingCandidates(false);
          return;
        }

        const candidates: PipelineCandidate[] = (applications || []).map((app: any) => ({
          id: app.id,
          candidate_id: app.candidate_id,
          candidate_name: app.candidate_profiles?.name || 'Unknown',
          status: app.status,
          job_title: app.jobs?.title || 'Unknown Job',
        }));

        setPipelineCandidates(candidates);
      } catch (error) {
        console.error('Error in fetchPipelineCandidates:', error);
      } finally {
        setIsLoadingCandidates(false);
      }
    };

    fetchPipelineCandidates();
  }, [companyId]);

  // Calculate culture fit when candidate is selected
  useEffect(() => {
    const calculateFit = async () => {
      if (!selectedCandidateId || !companyId) {
        setCultureFitResult(null);
        return;
      }

      setIsLoadingFit(true);
      try {
        const result = await calculateCultureFit(selectedCandidateId, companyId);
        setCultureFitResult(result);
      } catch (error) {
        console.error('Error calculating culture fit:', error);
      } finally {
        setIsLoadingFit(false);
      }
    };

    calculateFit();
  }, [selectedCandidateId, companyId]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview':
      case 'interviewing':
        return 'text-accent-coral bg-accent-coral-bg';
      case 'offer':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'applied':
      case 'new':
        return 'text-muted bg-gray-100 dark:bg-gray-800';
      default:
        return 'text-muted bg-gray-100 dark:bg-gray-800';
    }
  };

  const hasCompanyValues = companyProfile?.values && companyProfile.values.length > 0;
  const hasHmPrefs = hmPreferences !== null;

  // Navigate helpers
  const handleEditCompanyProfile = () => {
    window.history.pushState({}, '', '?view=settings&tab=company');
    window.dispatchEvent(new Event('popstate'));
  };

  const handleSetHmPreferences = () => {
    window.history.pushState({}, '', '?view=settings&tab=preferences');
    window.dispatchEvent(new Event('popstate'));
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface rounded-2xl border border-border p-6 animate-pulse">
          <div className="h-5 bg-border rounded w-40 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section A: Your Culture Profile */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-primary">Your Culture Profile</h3>
            </div>
            {hasCompanyValues && (
              <button
                onClick={handleEditCompanyProfile}
                className="text-sm text-accent-coral font-medium hover:text-accent-coral flex items-center gap-1"
              >
                Edit
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {isLoadingProfile ? (
            <div className="animate-pulse space-y-4">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-24" />
                ))}
              </div>
            </div>
          ) : !hasCompanyValues ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center">
              <Heart className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-1">No company values set</p>
              <p className="text-xs text-muted mb-4">Add company values to see culture insights</p>
              <button
                onClick={handleEditCompanyProfile}
                className="px-4 py-2 bg-accent-coral text-white text-sm font-bold rounded-lg hover:bg-accent-coral transition-colors"
              >
                Add Values
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Company Values */}
              <div>
                <div className="flex flex-wrap gap-2">
                  {companyProfile.values.slice(0, 8).map((value, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-3 py-1.5 bg-accent-coral text-white text-sm font-medium rounded-full"
                    >
                      {value}
                    </motion.span>
                  ))}
                  {companyProfile.values.length > 8 && (
                    <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-muted text-sm font-medium rounded-full">
                      +{companyProfile.values.length - 8} more
                    </span>
                  )}
                </div>
              </div>

              {/* Desired Traits */}
              {companyProfile.desired_traits && companyProfile.desired_traits.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Desired Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {companyProfile.desired_traits.slice(0, 6).map((trait, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 border border-border text-muted text-sm font-medium rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                    {companyProfile.desired_traits.length > 6 && (
                      <span className="px-3 py-1 border border-border text-gray-400 dark:text-gray-500 text-sm font-medium rounded-full">
                        +{companyProfile.desired_traits.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* HM Preferences */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Team Preferences</p>
                  {hasHmPrefs && (
                    <button
                      onClick={handleSetHmPreferences}
                      className="text-xs text-accent-coral font-medium hover:text-accent-coral"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {hasHmPrefs ? (
                  <PreferencesSummary prefs={hmPreferences} />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Settings className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700">Set team preferences for better matching</p>
                    <button
                      onClick={handleSetHmPreferences}
                      className="ml-auto text-xs font-bold text-amber-600 hover:text-amber-700"
                    >
                      Set Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section B: Candidate Values Distribution */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-accent-green" />
            <h3 className="text-lg font-bold text-primary">Values in Your Talent Pool</h3>
          </div>
          <p className="text-sm text-muted mb-4">How candidates matching your jobs align with your values</p>

          {isLoadingValues ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded" />
                  <div className="w-10 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : valueDistribution.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center">
              <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-1">No candidate data yet</p>
              <p className="text-xs text-muted">Post jobs to start building your talent pool</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={valueDistribution}
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="value"
                      tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                      tickLine={false}
                      axisLine={false}
                      width={95}
                    />
                    <Bar dataKey="percent" radius={[0, 4, 4, 0]} maxBarSize={24}>
                      {valueDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isCompanyValue ? 'var(--accent-coral)' : 'var(--border)'}
                        />
                      ))}
                      <LabelList
                        dataKey="percent"
                        position="right"
                        formatter={(value: number) => `${value}%`}
                        style={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-accent-coral" />
                  <span>Matches your values</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-300" />
                  <span>Other values</span>
                </div>
              </div>

              {/* Low representation warning */}
              {hasCompanyValues && (() => {
                const matchingValues = valueDistribution.filter(v => v.isCompanyValue);
                const lowRepValues = companyProfile!.values.filter(
                  cv => !valueDistribution.some(v => v.value.toLowerCase() === cv.toLowerCase())
                );
                if (lowRepValues.length > 0) {
                  return (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-700">Low representation</p>
                        <p className="text-xs text-amber-600">
                          Few candidates share: {lowRepValues.slice(0, 3).join(', ')}
                          {lowRepValues.length > 3 && ` +${lowRepValues.length - 3} more`}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Section C: Team Fit Analyzer */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-primary">Candidate Culture Fit</h3>
          </div>
          <p className="text-sm text-muted mb-4">Select a candidate to see detailed culture alignment</p>

          {isLoadingCandidates ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg w-full mb-4" />
              <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded-xl" />
            </div>
          ) : pipelineCandidates.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center">
              <User className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-1">Your talent pool is empty</p>
              <p className="text-xs text-muted">Post a job to start building your pipeline</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Candidate Selector */}
              <div className="relative">
                <select
                  value={selectedCandidateId || ''}
                  onChange={(e) => setSelectedCandidateId(e.target.value || null)}
                  className="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900 border border-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-transparent"
                >
                  <option value="">Select a candidate...</option>
                  {pipelineCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.candidate_id}>
                      {candidate.candidate_name} — {candidate.job_title} ({candidate.status})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>

              {/* Culture Fit Display */}
              {!selectedCandidateId ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-border rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-muted">Select a candidate above to analyze culture fit</p>
                </div>
              ) : isLoadingFit ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-accent-coral border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted">Analyzing culture fit...</span>
                  </div>
                </div>
              ) : cultureFitResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Overall Score */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <CultureScoreRing score={cultureFitResult.overallScore} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted mb-1">Overall Culture Fit</p>
                      <p className={`text-lg font-bold ${
                        cultureFitResult.overallScore >= 70 ? 'text-green-600' :
                        cultureFitResult.overallScore >= 50 ? 'text-accent-coral' :
                        cultureFitResult.overallScore >= 30 ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {cultureFitResult.overallScore >= 70 ? 'Strong Alignment' :
                         cultureFitResult.overallScore >= 50 ? 'Good Alignment' :
                         cultureFitResult.overallScore >= 30 ? 'Moderate Alignment' : 'Limited Alignment'}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Values Alignment */}
                    <div className="p-4 bg-accent-coral-bg rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-accent-coral">Values Alignment</span>
                        <span className="text-lg font-bold text-accent-coral">
                          {cultureFitResult.valuesAlignment.score ?? 0}%
                        </span>
                      </div>
                      {cultureFitResult.valuesAlignment.shared.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cultureFitResult.valuesAlignment.shared.slice(0, 3).map((val, i) => (
                            <span key={i} className="px-2 py-0.5 bg-accent-coral-bg text-accent-coral text-xs rounded-full">
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Work Style Match */}
                    <div className="p-4 bg-accent-green-bg rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-accent-green">Work Style Match</span>
                        <span className="text-lg font-bold text-accent-green">
                          {cultureFitResult.workStyleCompatibility.overallScore}%
                        </span>
                      </div>
                      <p className="text-xs text-accent-green">
                        {cultureFitResult.workStyleCompatibility.alignedCount} of {cultureFitResult.workStyleCompatibility.totalDimensions} dimensions aligned
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Watch Outs */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Strengths */}
                    {cultureFitResult.summary.strengths.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Strengths</span>
                        </div>
                        <ul className="space-y-1">
                          {cultureFitResult.summary.strengths.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-xs text-green-700">{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Watch Outs */}
                    {cultureFitResult.summary.watchOuts.length > 0 && (
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-900">Watch Outs</span>
                        </div>
                        <ul className="space-y-1">
                          {cultureFitResult.summary.watchOuts.slice(0, 3).map((w, i) => (
                            <li key={i} className="text-xs text-amber-700">{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Dimension Details (collapsible) */}
                  {cultureFitResult.workStyleCompatibility.dimensions.length > 0 && (
                    <details className="group">
                      <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted hover:text-gray-700 dark:text-gray-300 dark:text-gray-600">
                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                        View dimension breakdown
                      </summary>
                      <div className="mt-3 space-y-2 pl-6">
                        {cultureFitResult.workStyleCompatibility.dimensions.map((dim, i) => {
                          const StatusIcon = dim.status === 'aligned' ? CheckCircle :
                                            dim.status === 'misaligned' ? XCircle : Minus;
                          const statusColor = dim.status === 'aligned' ? 'text-green-500' :
                                              dim.status === 'misaligned' ? 'text-red-500' : 'text-gray-400 dark:text-gray-500';
                          return (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                              <span className="w-32 text-muted">{dim.name}</span>
                              <span className="text-gray-400 dark:text-gray-500">
                                {dim.candidatePreference || '—'} vs {dim.companyExpectation || '—'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </motion.div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-muted">Unable to calculate culture fit</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CultureAlignment;
