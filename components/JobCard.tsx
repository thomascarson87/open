

import React, { useMemo } from 'react';
import { JobPosting, CandidateProfile } from '../types';
import { MapPin, DollarSign, Clock, ArrowRight, Building2, Users } from 'lucide-react';
import { calculateMatch } from '../services/matchingService';

interface Props {
  job: JobPosting;
  candidateProfile: CandidateProfile;
  onApply: (jobId: string) => void;
  onViewDetails: (job: JobPosting) => void;
  connections?: any[]; 
}

const JobCard: React.FC<Props> = ({ job, candidateProfile, onApply, onViewDetails, connections }) => {
  
  // Calculate Match Score
  const matchResult = useMemo(() => {
      return calculateMatch(job, candidateProfile);
  }, [job, candidateProfile]);

  const isInternal = candidateProfile.experience.some(e => e.company === job.companyName && e.duration.includes('Present'));
  const hasReferral = connections?.some(c => c.company === job.companyName);

  return (
    <div 
        onClick={() => onViewDetails(job)}
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
    >
      {isInternal && (
          <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
              INTERNAL ROLE
          </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
               {job.companyLogo ? <img src={job.companyLogo} className="w-full h-full object-cover rounded-lg" /> : <Building2 className="w-6 h-6" />}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                <p className="text-sm font-medium text-gray-500">{job.companyName}</p>
            </div>
        </div>
        
        {!isInternal && (
            <div className="flex flex-col items-end">
                <span className={`text-lg font-bold ${
                    matchResult.overallScore >= 80 ? 'text-green-600' : 
                    matchResult.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                    {matchResult.overallScore}%
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Match</span>
            </div>
        )}
      </div>

      <div className="space-y-3 mb-6 flex-grow">
         <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600">
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400"/> {job.location}</span>
            <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1 text-gray-400"/> {job.salaryRange}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-gray-400"/> {job.workMode}</span>
         </div>
         
         <div className="flex flex-wrap gap-2 pt-2">
            {job.requiredSkills.slice(0, 3).map((s, i) => (
                <span key={i} className={`px-2 py-1 border rounded text-xs font-medium ${s.weight === 'required' ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-white border-dashed border-gray-300 text-gray-500'}`}>
                    {s.name}
                </span>
            ))}
         </div>
         
         {/* Industry Tags */}
         {job.companyIndustry && (
            <div className="flex flex-wrap gap-2 mt-2">
                {job.companyIndustry.slice(0, 2).map(ind => (
                <span key={ind} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                    🏢 {ind}
                </span>
                ))}
            </div>
         )}

         {/* Top Values */}
         {job.values.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
                {job.values.slice(0, 2).map(val => (
                <span key={val} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    💡 {val}
                </span>
                ))}
            </div>
         )}

         {/* Match Breakdown Snippet */}
         <div className="grid grid-cols-4 gap-1 mt-2">
             <div className="text-[10px] text-center bg-gray-50 rounded py-1">
                 <span className="block text-gray-400">Skills</span>
                 <span className="font-bold text-gray-700">{matchResult.details.skills.score}%</span>
             </div>
             <div className="text-[10px] text-center bg-gray-50 rounded py-1">
                 <span className="block text-gray-400">Values</span>
                 <span className="font-bold text-gray-700">{matchResult.details.culture.score}%</span>
             </div>
             <div className="text-[10px] text-center bg-gray-50 rounded py-1">
                 <span className="block text-gray-400">Perks</span>
                 <span className="font-bold text-gray-700">{matchResult.details.perks.score}%</span>
             </div>
             <div className="text-[10px] text-center bg-gray-50 rounded py-1">
                 <span className="block text-gray-400">Traits</span>
                 <span className="font-bold text-gray-700">{matchResult.details.traits.score}%</span>
             </div>
         </div>

         {matchResult.dealBreakers.length > 0 && (
             <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                 ⚠️ {matchResult.dealBreakers[0]}
             </div>
         )}

         {hasReferral && !isInternal && (
             <div className="mt-3 bg-purple-50 border border-purple-100 p-2 rounded-lg flex items-center text-xs text-purple-700">
                 <Users className="w-3 h-3 mr-2 text-purple-600" />
                 <b>1 Connection</b> works here.
             </div>
         )}
      </div>

      <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 mt-auto">
        <button 
            onClick={(e) => { e.stopPropagation(); onApply(job.id); }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isInternal 
                ? 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50' 
                : 'bg-gray-900 text-white hover:bg-black'
            }`}
        >
            {isInternal ? 'Apply Internally' : (hasReferral ? 'Ask for Referral' : 'Apply Now')}
        </button>
         <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center">
            Details <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
