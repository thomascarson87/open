
import React from 'react';
import { JobPosting, CompanyProfile, MatchBreakdown } from '../types';
import { MapPin, DollarSign, Clock, X, Zap, Building2, ChevronRight } from 'lucide-react';
import SkillIcon from './SkillIcon';
import SaveJobButton from './SaveJobButton';

interface Props {
  job: JobPosting;
  companyProfile?: CompanyProfile | null;
  matchResult?: MatchBreakdown;
  weightedScore?: number;
  onApply: (jobId: string) => void;
  onViewDetails: (job: JobPosting) => void;
  isPreview?: boolean;
}

const EnrichedJobCard: React.FC<Props> = ({
  job,
  companyProfile,
  matchResult,
  weightedScore = 0,
  onApply,
  onViewDetails,
  isPreview = false
}) => {
  const getMatchColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-accent-coral';
    return 'text-orange-600';
  };

  const formatSalaryRange = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Competitive';
    const sym = currency === 'USD' ? '$' : currency;
    const kMin = min ? `${Math.round(min/1000)}K` : '';
    const kMax = max ? `${Math.round(max/1000)}K` : '';
    if (min && max) return `${sym}${kMin} - ${kMax}`;
    return min ? `${sym}${kMin}+` : `${sym}${kMax} limit`;
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'recently';
    
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div 
      onClick={() => onViewDetails(job)}
      className="bg-white dark:bg-surface rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full group"
    >
      {/* Header: Match Score & Actions */}
      {!isPreview && matchResult && (
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-black flex items-center gap-1.5 ${getMatchColorClass(weightedScore)}`}>
              <Zap className="w-6 h-6 fill-current" /> {weightedScore}% Match
            </div>
            {weightedScore !== matchResult.overallScore && (
              <div className="bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                Adjusted Feed
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <SaveJobButton
              jobId={job.id}
              jobTitle={job.title}
              variant="icon"
            />
            <button onClick={(e) => { e.stopPropagation(); }} className="p-2 text-gray-300 dark:text-gray-600 hover:text-muted hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {isPreview && <div className="pt-6" />}

      {/* Job Info */}
      <div className="px-6 mb-4">
        <h3 className="text-xl font-black text-primary group-hover:text-accent-coral transition-colors mb-2 line-clamp-1">
          {job.title}
        </h3>

        <div className="flex items-center gap-3">
          {(companyProfile?.logoUrl && companyProfile.logoUrl.trim()) ? (
            <>
              <img
                src={companyProfile.logoUrl}
                alt={companyProfile.companyName}
                className="w-10 h-10 rounded-xl object-cover border border-border shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-border hidden">
                <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </>
          ) : (
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-border">
              <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          )}

          <div className="min-w-0">
            {isPreview ? (
              <div className="h-5 w-32 bg-border rounded blur-[3px] select-none opacity-60 mb-1">Company</div>
            ) : (
              <div className="font-bold text-primary truncate leading-tight">
                {companyProfile?.companyName || job.companyName || 'Company'}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <span>{companyProfile?.fundingStage || 'Early Stage'}</span>
              <span className="opacity-30">•</span>
              <span>{companyProfile?.teamSize ? `${companyProfile.teamSize} people` : companyProfile?.companySizeRange || 'Growing Team'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="px-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-muted mb-6">
        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 dark:text-gray-600">
          <DollarSign className="w-3.5 h-3.5 text-green-500" />
          {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-accent-coral" />
          {job.workMode} ({job.location})
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          Posted {getRelativeTime(job.postedDate)}
        </div>
      </div>

      {/* Description Preview */}
      <div className="px-6 mb-6">
        <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Role Overview</div>
        <p className="text-sm text-muted leading-relaxed line-clamp-2">
          {truncateText(job.description, 140)}
        </p>
      </div>

      {/* Match Breakdown Grid - Hidden in Preview Mode */}
      {!isPreview && matchResult && (
        <div className="px-6 mb-6">
          <div className="bg-gray-50 dark:bg-gray-900/80 rounded-[1.5rem] p-4 border border-border">
            <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Match Breakdown</div>
            <div className="grid grid-cols-4 gap-2">
              {/* Skills */}
              <div className="space-y-1.5 text-center">
                <div className="text-[9px] font-black text-accent-coral uppercase tracking-widest">Skills</div>
                <div className="text-sm font-black text-primary">{matchResult.details.skills.score}%</div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent-coral" style={{ width: `${matchResult.details.skills.score}%` }} />
                </div>
              </div>
              {/* Salary */}
              <div className="space-y-1.5 text-center">
                <div className="text-[9px] font-black text-green-600 uppercase tracking-widest">Salary</div>
                <div className="text-sm font-black text-primary">{matchResult.details.salary.score}%</div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: `${matchResult.details.salary.score}%` }} />
                </div>
              </div>
              {/* Values */}
              <div className="space-y-1.5 text-center">
                <div className="text-[9px] font-black text-accent-green uppercase tracking-widest">Values</div>
                <div className="text-sm font-black text-primary">{matchResult.details.culture.score}%</div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent-coral" style={{ width: `${matchResult.details.culture.score}%` }} />
                </div>
              </div>
              {/* Culture */}
              <div className="space-y-1.5 text-center">
                <div className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Culture</div>
                <div className="text-sm font-black text-primary">{matchResult.details.traits.score}%</div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-orange-600" style={{ width: `${matchResult.details.traits.score}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.requiredSkills.slice(0, 3).map(skill => (
                <div key={skill.name} className="flex items-center gap-1 bg-white dark:bg-surface px-2 py-1 rounded-lg border border-border shadow-sm">
                  <SkillIcon skillName={skill.name} size={12} showFallback={false} />
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">{skill.name}</span>
                </div>
              ))}
              {job.requiredSkills.length > 3 && (
                <div className="text-[9px] font-black text-gray-400 dark:text-gray-500 px-1 pt-1">+{job.requiredSkills.length - 3} more</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skills section for Preview Mode */}
      {isPreview && (
        <div className="px-6 mb-6">
          <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Required Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.slice(0, 4).map(skill => (
              <div key={skill.name} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg border border-border">
                <SkillIcon skillName={skill.name} size={12} showFallback={false} />
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">{skill.name}</span>
              </div>
            ))}
            {job.requiredSkills.length > 4 && (
              <div className="text-[9px] font-black text-gray-400 dark:text-gray-500 px-1 pt-1">+{job.requiredSkills.length - 4} more</div>
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-6 pb-6 mt-auto flex gap-3">
        {isPreview ? (
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(job); }}
            className="flex-1 bg-accent-coral text-white py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent-coral transition-all shadow-lg hover:shadow-xl transform active:scale-95 flex items-center justify-center gap-2"
          >
            View Role <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onApply(job.id); }}
              className="flex-1 bg-accent-coral text-white py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent-coral transition-all shadow-lg hover:shadow-xl transform active:scale-95 flex items-center justify-center gap-2"
            >
              Apply Now
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(job); }}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-primary rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EnrichedJobCard;
