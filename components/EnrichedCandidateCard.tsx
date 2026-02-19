
import React from 'react';
import { CandidateProfile, MatchBreakdown, Skill } from '../types';
import { MapPin, DollarSign, Clock, Heart, X, Zap, Lock, Calendar, Mail, Eye } from 'lucide-react';
import SkillIcon from './SkillIcon';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';

interface EnrichedCandidateCardProps {
  candidate: CandidateProfile;
  matchResult?: MatchBreakdown;
  onViewProfile: (candidate: CandidateProfile) => void;
  onUnlock: (id: string) => void | Promise<{ success: boolean; error?: { message: string; code: string } }>;
  onSchedule: (id: string) => void;
  onMessage: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSave?: (id: string) => void;
  showMatchBreakdown?: boolean;
}

const EnrichedCandidateCard: React.FC<EnrichedCandidateCardProps> = ({
  candidate,
  matchResult,
  onViewProfile,
  onUnlock,
  onSchedule,
  onMessage,
  onDismiss,
  onSave,
  showMatchBreakdown = true
}) => {
  const isLocked = !candidate.isUnlocked;
  const matchScore = candidate.matchScore || matchResult?.overallScore || 0;

  const getMatchColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-accent-coral';
    return 'text-orange-600';
  };

  const formatSalary = (salaryMin?: number, salaryMax?: number, currency: string = 'USD') => {
    if (!salaryMin && !salaryMax) return 'Negotiable';
    const sym = currency === 'USD' ? '$' : currency;
    const kMin = salaryMin ? `${Math.round(salaryMin / 1000)}k` : '';
    const kMax = salaryMax ? `${Math.round(salaryMax / 1000)}k` : '';
    if (salaryMin && salaryMax) return `${sym}${kMin} - ${sym}${kMax}`;
    return salaryMin ? `${sym}${kMin}+` : `Up to ${sym}${kMax}`;
  };

  const getAvailabilityText = (status: CandidateProfile['status']) => {
    switch (status) {
      case 'actively_looking': return 'Actively Looking';
      case 'open_to_offers': return 'Open to Offers';
      case 'happy_but_listening': return 'Passively Open';
      case 'not_looking': return 'Not Looking';
      default: return 'Available';
    }
  };

  const getSkillLevelLabel = (level: 1 | 2 | 3 | 4 | 5): string => {
    return SKILL_LEVEL_METADATA[level]?.label || `L${level}`;
  };

  const getDisplaySkills = (): Skill[] => {
    // Use skills_with_levels if available, otherwise fall back to skills
    const skillsSource = (candidate as any).skills_with_levels || candidate.skills || [];
    return skillsSource.slice(0, 4);
  };

  const formatSkillDisplay = (skill: Skill): string => {
    if (skill.level) {
      return getSkillLevelLabel(skill.level);
    }
    if (skill.years) {
      return `${skill.years}y`;
    }
    return '';
  };

  return (
    <div
      onClick={() => onViewProfile(candidate)}
      className="bg-white dark:bg-surface rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full group"
    >
      {/* Header: Match Score & Actions */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {matchScore > 0 && (
            <div className={`text-2xl font-black flex items-center gap-1.5 ${getMatchColorClass(matchScore)}`}>
              <Zap className="w-6 h-6 fill-current" /> {matchScore}% Match
            </div>
          )}
          {matchResult && matchScore !== matchResult.overallScore && (
            <div className="bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
              Adjusted Feed
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(candidate.id); }}
              className="p-2 text-gray-300 dark:text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors"
            >
              <Heart className="w-5 h-5" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(candidate.id); }}
              className="p-2 text-gray-300 dark:text-gray-600 hover:text-muted hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Candidate Info */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar / Lock Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm border border-border ${
            isLocked
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              : 'bg-gradient-to-br from-accent-coral to-accent-green text-white'
          }`}>
            {isLocked ? <Lock className="w-5 h-5" /> : candidate.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            {/* Name (blurred if locked) */}
            <h3 className={`text-xl font-black group-hover:text-accent-coral transition-colors line-clamp-1 ${
              isLocked ? 'blur-[4px] select-none text-gray-400 dark:text-gray-500' : 'text-primary'
            }`}>
              {isLocked ? 'Hidden Name' : candidate.name}
            </h3>
            {/* Headline */}
            <p className="text-sm font-bold text-muted line-clamp-1">
              {candidate.headline}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="px-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-muted mb-6">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-accent-coral" />
          {candidate.location}
        </div>
        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 dark:text-gray-600">
          <DollarSign className="w-3.5 h-3.5 text-green-500" />
          {formatSalary(candidate.salaryMin, candidate.salaryMax, candidate.salaryCurrency || 'USD')}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          {getAvailabilityText(candidate.status)}
        </div>
      </div>

      {/* Skills Section */}
      <div className="px-6 mb-6">
        <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Skills</div>
        <div className="flex flex-wrap gap-1.5">
          {getDisplaySkills().map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg border border-border"
            >
              <SkillIcon skillName={skill.name} size={12} showFallback={false} />
              <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 capitalize">{skill.name}</span>
              {formatSkillDisplay(skill) && (
                <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500">· {formatSkillDisplay(skill)}</span>
              )}
            </div>
          ))}
          {(candidate.skills?.length || 0) > 4 && (
            <div className="text-[9px] font-black text-gray-400 dark:text-gray-500 px-1 pt-1">
              +{candidate.skills.length - 4} more
            </div>
          )}
        </div>
      </div>

      {/* Match Breakdown Grid */}
      {showMatchBreakdown && matchResult && (
        <div className="px-6 mb-6">
          <div className="bg-gray-50 dark:bg-gray-900/80 rounded-[1.5rem] p-4 border border-border">
            <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Match Breakdown</div>
            <div className={`grid gap-2 ${matchResult.details.certifications && matchResult.details.certifications.reason !== 'No certification requirements' ? 'grid-cols-5' : 'grid-cols-4'}`}>
              {/* Skills */}
              <div className="space-y-1.5 text-center">
                <div className="text-[9px] font-black text-accent-coral uppercase tracking-widest">Skills</div>
                <div className="text-sm font-black text-primary">{matchResult.details.skills?.score || 0}%</div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent-coral" style={{ width: `${matchResult.details.skills?.score || 0}%` }} />
                </div>
              </div>
              {/* Salary */}
              <div className="space-y-1.5 text-center">
                <div className="text-[9px] font-black text-green-600 uppercase tracking-widest">Salary</div>
                <div className="text-sm font-black text-primary">{matchResult.details.salary?.score || 0}%</div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: `${matchResult.details.salary?.score || 0}%` }} />
                </div>
              </div>
              {/* Values */}
              <div className="space-y-1.5 text-center">
                <div className="text-[9px] font-black text-accent-green uppercase tracking-widest">Values</div>
                <div className="text-sm font-black text-primary">{matchResult.details.culture?.score || 0}%</div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent-coral" style={{ width: `${matchResult.details.culture?.score || 0}%` }} />
                </div>
              </div>
              {/* Culture */}
              <div className="space-y-1.5 text-center">
                <div className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Culture</div>
                <div className="text-sm font-black text-primary">{matchResult.details.traits?.score || 0}%</div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-orange-600" style={{ width: `${matchResult.details.traits?.score || 0}%` }} />
                </div>
              </div>
              {/* Certifications (conditional) */}
              {matchResult.details.certifications && matchResult.details.certifications.reason !== 'No certification requirements' && (
                <div className="space-y-1.5 text-center">
                  <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Certs</div>
                  <div className="text-sm font-black text-primary">{matchResult.details.certifications.score}%</div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600" style={{ width: `${matchResult.details.certifications.score}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-6 pb-6 mt-auto flex gap-3">
        {isLocked ? (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onViewProfile(candidate); }}
              className="flex-1 bg-gray-50 dark:bg-gray-900 text-primary py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Profile
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onUnlock(candidate.id); }}
              className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Unlock
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onSchedule(candidate.id); }}
              className="flex-1 bg-gray-50 dark:bg-gray-900 text-primary py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMessage(candidate.id); }}
              className="flex-1 bg-accent-coral text-white py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent-coral transition-all shadow-lg hover:shadow-xl transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Message
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EnrichedCandidateCard;
