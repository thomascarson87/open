import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Users, Loader2 } from 'lucide-react';
import {
  getTalentPoolSize,
  getSampleCandidates,
  TalentPoolCriteria,
  TalentPoolResult,
  AnonymizedCandidate
} from '../../services/marketIntelligence';
import { JobPosting } from '../../types';

interface TalentPoolAnalysisProps {
  jobs: JobPosting[];
  companyId: string;
  isLoadingJobs: boolean;
}

interface RequirementToggle {
  key: string;
  label: string;
  value: string | string[];
  enabled: boolean;
  impact?: number; // Delta when toggled
}

// Animated number component
const AnimatedNumber: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const duration = 300;
    const steps = 20;
    const increment = (value - displayValue) / steps;
    let current = displayValue;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
};

// Pool visualization bar
const PoolBar: React.FC<{ result: TalentPoolResult }> = ({ result }) => {
  const segments = [
    { key: 'exact', label: 'Exact Match', count: result.exactMatch, color: 'bg-green-600' },
    { key: 'strong', label: 'Strong Match', count: result.strongMatch, color: 'bg-green-400' },
    { key: 'partial', label: 'Partial Match', count: result.partialMatch, color: 'bg-yellow-400' },
    { key: 'potential', label: 'Potential', count: result.potentialMatch, color: 'bg-gray-300' },
  ];

  const total = result.total || 1;

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="h-8 rounded-full overflow-hidden flex bg-gray-100">
        {segments.map(seg => {
          const width = (seg.count / total) * 100;
          if (width === 0) return null;
          return (
            <motion.div
              key={seg.key}
              className={`${seg.color} h-full`}
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {segments.map(seg => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${seg.color}`} />
            <span className="text-gray-600">{seg.label}</span>
            <span className="font-bold text-gray-900">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Candidate preview card
const CandidatePreviewCard: React.FC<{ candidate: AnonymizedCandidate }> = ({ candidate }) => {
  const statusColors: Record<string, string> = {
    actively_looking: 'bg-green-100 text-green-700',
    open_to_offers: 'bg-blue-100 text-blue-700',
    happy_but_listening: 'bg-yellow-100 text-yellow-700',
    not_looking: 'bg-gray-100 text-gray-600'
  };

  const statusLabels: Record<string, string> = {
    actively_looking: 'Actively Looking',
    open_to_offers: 'Open to Offers',
    happy_but_listening: 'Passively Open',
    not_looking: 'Not Looking'
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-bold text-gray-900 text-sm">{candidate.headline}</p>
          <p className="text-xs text-gray-500">{candidate.seniority} · {candidate.location}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[candidate.status] || statusColors.open_to_offers}`}>
          {statusLabels[candidate.status] || 'Open'}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {candidate.topSkills.map((skill, i) => (
          <span key={i} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
            {skill}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {candidate.yearsExperience} years experience
      </p>
    </div>
  );
};

const TalentPoolAnalysis: React.FC<TalentPoolAnalysisProps> = ({
  jobs,
  companyId,
  isLoadingJobs
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [poolResult, setPoolResult] = useState<TalentPoolResult | null>(null);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [requirements, setRequirements] = useState<RequirementToggle[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [sampleCandidates, setSampleCandidates] = useState<AnonymizedCandidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Custom criteria state
  const [customSkills, setCustomSkills] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customSalary, setCustomSalary] = useState('');
  const [customWorkMode, setCustomWorkMode] = useState('');

  // Get selected job
  const selectedJob = useMemo(() => {
    if (!selectedJobId || isCustomMode) return null;
    return jobs.find(j => j.id === selectedJobId) || null;
  }, [selectedJobId, jobs, isCustomMode]);

  // Initialize requirements from selected job
  useEffect(() => {
    if (!selectedJob) {
      setRequirements([]);
      return;
    }

    const reqs: RequirementToggle[] = [];

    // Skills
    if (selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0) {
      selectedJob.requiredSkills.forEach(skill => {
        reqs.push({
          key: `skill-${skill.name}`,
          label: skill.name,
          value: skill.name,
          enabled: true
        });
      });
    }

    // Location
    if (selectedJob.location) {
      reqs.push({
        key: 'location',
        label: 'Location',
        value: selectedJob.location,
        enabled: true
      });
    }

    // Salary
    if (selectedJob.salaryMax) {
      reqs.push({
        key: 'salary',
        label: 'Max Salary',
        value: `$${selectedJob.salaryMax.toLocaleString()}`,
        enabled: true
      });
    }

    // Work Mode
    if (selectedJob.workMode) {
      reqs.push({
        key: 'workMode',
        label: 'Work Mode',
        value: selectedJob.workMode,
        enabled: true
      });
    }

    // Seniority
    if (selectedJob.seniority) {
      reqs.push({
        key: 'seniority',
        label: 'Seniority',
        value: selectedJob.seniority,
        enabled: true
      });
    }

    setRequirements(reqs);
  }, [selectedJob]);

  // Build criteria from requirements
  const buildCriteria = (): TalentPoolCriteria => {
    if (isCustomMode) {
      return {
        requiredSkills: customSkills ? customSkills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        location: customLocation || undefined,
        salaryMax: customSalary ? parseInt(customSalary.replace(/\D/g, '')) : undefined,
        workMode: customWorkMode || undefined,
        isRemoteFriendly: customWorkMode === 'Remote'
      };
    }

    if (!selectedJob) return {};

    const enabledReqs = requirements.filter(r => r.enabled);
    const skillReqs = enabledReqs.filter(r => r.key.startsWith('skill-'));

    return {
      requiredSkills: skillReqs.length > 0 ? skillReqs.map(r => r.value as string) : undefined,
      location: enabledReqs.find(r => r.key === 'location')?.value as string | undefined,
      salaryMax: selectedJob.salaryMax,
      workMode: enabledReqs.find(r => r.key === 'workMode')?.value as string | undefined,
      seniority: enabledReqs.find(r => r.key === 'seniority')?.value as string | undefined,
      isRemoteFriendly: selectedJob.workMode === 'Remote'
    };
  };

  // Fetch pool data
  useEffect(() => {
    const fetchPool = async () => {
      if (!selectedJobId && !isCustomMode) {
        setPoolResult(null);
        return;
      }

      setIsLoadingPool(true);

      try {
        const criteria = buildCriteria();
        const result = await getTalentPoolSize(criteria);
        setPoolResult(result);
      } catch (error) {
        console.error('Error fetching talent pool:', error);
      } finally {
        setIsLoadingPool(false);
      }
    };

    fetchPool();
  }, [selectedJobId, requirements, isCustomMode, customSkills, customLocation, customSalary, customWorkMode]);

  // Fetch sample candidates
  const handleViewCandidates = async () => {
    if (showCandidates) {
      setShowCandidates(false);
      return;
    }

    setIsLoadingCandidates(true);
    setShowCandidates(true);

    try {
      const criteria = buildCriteria();
      const candidates = await getSampleCandidates(criteria, 5);
      setSampleCandidates(candidates);
    } catch (error) {
      console.error('Error fetching sample candidates:', error);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  // Toggle requirement
  const toggleRequirement = (key: string) => {
    setRequirements(prev =>
      prev.map(r => r.key === key ? { ...r, enabled: !r.enabled } : r)
    );
  };

  // Auto-select most recent job
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId && !isCustomMode) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs]);

  // No jobs state
  if (!isLoadingJobs && jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Jobs Yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Post your first job to analyze your talent pool and see how many candidates match your requirements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Talent Pool Analysis</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsCustomMode(false);
                if (jobs.length > 0) setSelectedJobId(jobs[0].id);
              }}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${!isCustomMode ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              From Job
            </button>
            <button
              onClick={() => {
                setIsCustomMode(true);
                setSelectedJobId(null);
              }}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isCustomMode ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Custom
            </button>
          </div>
        </div>

        {!isCustomMode ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-left"
            >
              <span className="font-medium text-gray-900">
                {selectedJob?.title || 'Select a job'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto"
                >
                  {jobs.map(job => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedJobId === job.id ? 'bg-blue-50' : ''}`}
                    >
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.location} · {job.workMode}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={customSkills}
                onChange={(e) => setCustomSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Salary</label>
              <input
                type="text"
                value={customSalary}
                onChange={(e) => setCustomSalary(e.target.value)}
                placeholder="150000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Work Mode</label>
              <select
                value={customWorkMode}
                onChange={(e) => setCustomWorkMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">Any</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-Site">On-Site</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Pool Overview */}
      {(selectedJobId || isCustomMode) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Reachable Candidates</p>
              {isLoadingPool ? (
                <div className="h-10 w-24 bg-gray-100 rounded animate-pulse" />
              ) : (
                <AnimatedNumber
                  value={poolResult?.total || 0}
                  className="text-4xl font-black text-gray-900"
                />
              )}
            </div>
            <button
              onClick={handleViewCandidates}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {showCandidates ? 'Hide samples' : 'View sample candidates'}
            </button>
          </div>

          {isLoadingPool ? (
            <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
          ) : poolResult ? (
            <>
              <PoolBar result={poolResult} />

              {/* Zero exact matches state */}
              {poolResult.exactMatch === 0 && poolResult.total > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-bold">No exact matches.</span> Your requirements are specific.
                    Try removing a skill requirement to expand your pool.
                  </p>
                </div>
              )}
            </>
          ) : null}

          {/* Sample Candidates */}
          <AnimatePresence>
            {showCandidates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-900 mb-3">Sample Candidates</p>
                  {isLoadingCandidates ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : sampleCandidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sampleCandidates.map(candidate => (
                        <CandidatePreviewCard key={candidate.id} candidate={candidate} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No matching candidates found
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Requirements Panel */}
      {!isCustomMode && selectedJob && requirements.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Requirements Impact</h3>
          <p className="text-sm text-gray-500 mb-4">
            Toggle requirements off to see how your talent pool expands
          </p>

          <div className="flex flex-wrap gap-2">
            {requirements.map(req => (
              <button
                key={req.key}
                onClick={() => toggleRequirement(req.key)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  req.enabled
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">
                  {req.key.startsWith('skill-') ? req.value : `${req.label}: ${req.value}`}
                </span>
                {req.enabled && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>

          {requirements.some(r => !r.enabled) && (
            <button
              onClick={() => setRequirements(prev => prev.map(r => ({ ...r, enabled: true })))}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset all requirements
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TalentPoolAnalysis;
