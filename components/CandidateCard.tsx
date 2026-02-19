
import React from 'react';
import { CandidateProfile } from '../types';
import { Lock, Mail, Calendar, MapPin, DollarSign, Eye, Briefcase, CheckCircle, Users } from 'lucide-react';

interface Props {
  candidate: CandidateProfile & { roleMatchType?: 'exact' | 'related' | 'none' };
  onUnlock: (id: string) => void;
  onSchedule: (id: string) => void;
  onMessage: (id: string) => void;
  onViewProfile: (candidate: CandidateProfile) => void;
}

const CandidateCard: React.FC<Props> = ({ candidate, onUnlock, onSchedule, onMessage, onViewProfile }) => {
  const isLocked = !candidate.isUnlocked;
  const roleMatchType = (candidate as any).roleMatchType;

  return (
    <div
        onClick={() => onViewProfile(candidate)}
        className="bg-white dark:bg-surface rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer"
    >

      {/* Role Match Indicator */}
      {roleMatchType && roleMatchType !== 'none' && (
        <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          roleMatchType === 'exact'
            ? 'bg-green-50 text-green-700 border-b border-green-100'
            : 'bg-accent-coral-bg text-accent-coral border-b border-accent-coral-bg'
        }`}>
          {roleMatchType === 'exact' ? (
            <><CheckCircle className="w-3 h-3" /> Exact Role Match</>
          ) : (
            <><Users className="w-3 h-3" /> Related Role</>
          )}
        </div>
      )}

      {/* Top Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm ${isLocked ? 'bg-border text-gray-400 dark:text-gray-500' : 'bg-gradient-to-tr from-accent-coral to-accent-green'}`}>
                    {isLocked ? <Lock className="w-6 h-6" /> : candidate.name.charAt(0)}
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${isLocked ? 'blur-[3px] select-none text-gray-400 dark:text-gray-500' : 'text-primary'}`}>
                        {isLocked ? 'Hidden Name' : candidate.name}
                    </h3>
                    <p className="text-sm font-medium text-accent-coral">{candidate.headline}</p>
                </div>
            </div>
             {candidate.matchScore && (
                <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                    {candidate.matchScore}% Match
                </div>
             )}
        </div>

        {/* Primary Role Badge */}
        {candidate.primaryRoleName && (
          <div className="mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-green-bg text-accent-green rounded-lg text-sm font-bold border border-accent-green">
              <Briefcase className="w-3.5 h-3.5" />
              {candidate.primaryRoleName}
            </div>
            {/* Secondary Roles */}
            {candidate.secondaryRoles && candidate.secondaryRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {candidate.secondaryRoles.map((role) => (
                  <span
                    key={role.id}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-muted rounded text-[10px] font-medium"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 text-sm text-muted">
             <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500"/>
                {candidate.location}
             </div>
             <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500"/>
                Expected: ${candidate.salaryExpectation}
             </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
            {candidate.skills.slice(0, 4).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-gray-50 dark:bg-gray-900 text-muted rounded text-xs border border-border">
                    {skill.name} <span className="text-gray-400 dark:text-gray-500">· {skill.years}y</span>
                </span>
            ))}
        </div>
      </div>

      <div className="mt-auto border-t border-border bg-gray-50 dark:bg-gray-900/50 p-4">
        {isLocked ? (
             <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onViewProfile(candidate); }}
                    className="flex items-center justify-center bg-surface border border-border hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 dark:text-gray-600 py-2 rounded-lg text-sm font-medium transition-colors"
                 >
                    <Eye className="w-4 h-4 mr-2" /> View Profile
                </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onUnlock(candidate.id); }}
                    className="flex items-center justify-center bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Lock className="w-4 h-4 mr-2" /> Unlock
                </button>
             </div>
        ) : (
            <div className="grid grid-cols-2 gap-3">
                <button onClick={(e) => { e.stopPropagation(); onSchedule(candidate.id); }} className="flex items-center justify-center bg-surface border border-border hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 dark:text-gray-600 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Calendar className="w-4 h-4 mr-2" /> Schedule
                </button>
                <button onClick={(e) => { e.stopPropagation(); onMessage(candidate.id)} } className="flex items-center justify-center bg-accent-coral hover:bg-accent-coral text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <Mail className="w-4 h-4 mr-2" /> Message
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
