
import React from 'react';
import { JobPosting, CompanyProfile, MatchBreakdown } from '../types';
import { MapPin, DollarSign, Clock, Heart, X, Zap, Building2, ChevronRight } from 'lucide-react';
import SkillIcon from './SkillIcon';

interface Props {
  job: JobPosting;
  companyProfile: CompanyProfile;
  matchResult: MatchBreakdown;
  weightedScore: number;
  onApply: (jobId: string) => void;
  onViewDetails: (job: JobPosting) => void;
}

const EnrichedJobCard: React.FC<Props> = ({ 
  job, 
  companyProfile, 
  matchResult, 
  weightedScore, 
  onApply, 
  onViewDetails 
}) => {
  const getMatchColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
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
      className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full group"
    >
      {/* Header: Match Score & Actions */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-black flex items-center gap-1.5 ${getMatchColorClass(weightedScore)}`}>
            <Zap className="w-6 h-6 fill-current" /> {weightedScore}% Match
          </div>
          {weightedScore !== matchResult.overallScore && (
            <div className="bg-gray-50 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Adjusted Feed
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); }} className="p-2 text-gray-300 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); }} className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Job Info */}
      <div className="px-6 mb-4">
        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
          {job.title}
        </h3>
        
        <div className="flex items-center gap-3">
          {(companyProfile.logoUrl && companyProfile.logoUrl.trim()) ? (
            <>
              <img 
                src={companyProfile.logoUrl} 
                alt={companyProfile.companyName}
                className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 hidden">
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
            </>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100">
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
          )}
          
          <div className="min-w-0">
            <div className="font-bold text-gray-900 truncate leading-tight">
              {companyProfile.companyName}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
              <span>{companyProfile.fundingStage || 'Early Stage'}</span>
              <span className="opacity-30">•</span>
              <span>{companyProfile.teamSize ? `${companyProfile.teamSize} people` : companyProfile.companySizeRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="px-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-500 mb-6">
        <div className="flex items-center gap-1.5 text-gray-700">
          <DollarSign className="w-3.5 h-3.5 text-green-500" />
          {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          {job.workMode} ({job.location})
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          Posted {getRelativeTime(job.postedDate)}
        </div>
      </div>

      {/* Description Preview */}
      <div className="px-6 mb-6">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Role Overview</div>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {truncateText(job.description, 140)}
        </p>
      </div>

      {/* Match Breakdown Grid */}
      <div className="px-6 mb-6">
        <div className="bg-gray-50/80 rounded-[1.5rem] p-4 border border-gray-100">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Match Breakdown</div>
          <div className="grid grid-cols-4 gap-2">
            {/* Skills */}
            <div className="space-y-1.5 text-center">
              <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Skills</div>
              <div className="text-sm font-black text-gray-900">{matchResult.details.skills.score}%</div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${matchResult.details.skills.score}%` }} />
              </div>
            </div>
            {/* Salary */}
            <div className="space-y-1.5 text-center">
              <div className="text-[9px] font-black text-green-600 uppercase tracking-widest">Salary</div>
              <div className="text-sm font-black text-gray-900">{matchResult.details.salary.score}%</div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${matchResult.details.salary.score}%` }} />
              </div>
            </div>
            {/* Values */}
            <div className="space-y-1.5 text-center">
              <div className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Values</div>
              <div className="text-sm font-black text-gray-900">{matchResult.details.culture.score}%</div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: `${matchResult.details.culture.score}%` }} />
              </div>
            </div>
            {/* Culture */}
            <div className="space-y-1.5 text-center">
              <div className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Culture</div>
              <div className="text-sm font-black text-gray-900">{matchResult.details.traits.score}%</div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600" style={{ width: `${matchResult.details.traits.score}%` }} />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.requiredSkills.slice(0, 3).map(skill => (
              <div key={skill.name} className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                <SkillIcon skillName={skill.name} size={12} showFallback={false} />
                <span className="text-[10px] font-bold text-gray-700">{skill.name}</span>
              </div>
            ))}
            {job.requiredSkills.length > 3 && (
              <div className="text-[9px] font-black text-gray-400 px-1 pt-1">+{job.requiredSkills.length - 3} more</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 pb-6 mt-auto flex gap-3">
        <button 
          onClick={(e) => { e.stopPropagation(); onApply(job.id); }}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform active:scale-95 flex items-center justify-center gap-2"
        >
          Apply Now
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onViewDetails(job); }}
          className="px-4 py-3 bg-gray-50 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default EnrichedJobCard;
