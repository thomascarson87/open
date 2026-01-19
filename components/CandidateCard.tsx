
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
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer"
    >

      {/* Role Match Indicator */}
      {roleMatchType && roleMatchType !== 'none' && (
        <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          roleMatchType === 'exact'
            ? 'bg-green-50 text-green-700 border-b border-green-100'
            : 'bg-blue-50 text-blue-700 border-b border-blue-100'
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
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm ${isLocked ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'}`}>
                    {isLocked ? <Lock className="w-6 h-6" /> : candidate.name.charAt(0)}
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${isLocked ? 'blur-[3px] select-none text-gray-400' : 'text-gray-900'}`}>
                        {isLocked ? 'Hidden Name' : candidate.name}
                    </h3>
                    <p className="text-sm font-medium text-blue-600">{candidate.headline}</p>
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-200">
              <Briefcase className="w-3.5 h-3.5" />
              {candidate.primaryRoleName}
            </div>
            {/* Secondary Roles */}
            {candidate.secondaryRoles && candidate.secondaryRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {candidate.secondaryRoles.map((role) => (
                  <span
                    key={role.id}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-600">
             <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400"/>
                {candidate.location}
             </div>
             <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400"/>
                Expected: ${candidate.salaryExpectation}
             </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
            {candidate.skills.slice(0, 4).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-200">
                    {skill.name} <span className="text-gray-400">· {skill.years}y</span>
                </span>
            ))}
        </div>
      </div>

      <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-4">
        {isLocked ? (
             <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onViewProfile(candidate); }}
                    className="flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
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
                <button onClick={(e) => { e.stopPropagation(); onSchedule(candidate.id); }} className="flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Calendar className="w-4 h-4 mr-2" /> Schedule
                </button>
                <button onClick={(e) => { e.stopPropagation(); onMessage(candidate.id)} } className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <Mail className="w-4 h-4 mr-2" /> Message
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
