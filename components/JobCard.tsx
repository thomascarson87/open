import React, { useState } from 'react';
import { JobPosting, CandidateProfile } from '../types';
import { MapPin, DollarSign, Clock, ArrowRight, Zap, Building2, Users, Briefcase } from 'lucide-react';
import { analyzeMatch } from '../services/geminiService';

interface Props {
  job: JobPosting;
  candidateProfile: CandidateProfile;
  onApply: (jobId: string) => void;
  onViewDetails: (job: JobPosting) => void;
  // In a real app we would pass full connection objects, but here we just check IDs/Strings loosely
  connections?: any[]; 
}

const JobCard: React.FC<Props> = ({ job, candidateProfile, onApply, onViewDetails, connections }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [matchData, setMatchData] = useState<{score: number, analysis: string} | null>(null);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnalyzing(true);
    const result = await analyzeMatch(candidateProfile, job);
    setMatchData(result);
    setAnalyzing(false);
  };

  // Mock Logic for Social Signals
  const isInternal = candidateProfile.experience.some(e => e.company === job.companyName && e.duration.includes('Present'));
  const hasReferral = connections?.some(c => c.company === job.companyName);

  return (
    <div 
        onClick={() => onViewDetails(job)}
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
    >
      {/* Social Signal Badges */}
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
            matchData ? (
                <div className="flex flex-col items-end">
                    <span className={`text-lg font-bold ${matchData.score > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {matchData.score}%
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Match</span>
                </div>
            ) : (
                <button 
                    onClick={handleAnalyze}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                    title="AI Match Analysis"
                >
                    {analyzing ? <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"/> : <Zap className="w-5 h-5" />}
                </button>
            )
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
                <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs font-medium text-gray-600">
                    {s.name}
                </span>
            ))}
         </div>

         {matchData && (
             <p className="text-xs text-gray-500 italic mt-3 bg-blue-50 p-2 rounded border border-blue-100">
                 "{matchData.analysis}"
             </p>
         )}

         {hasReferral && !isInternal && (
             <div className="mt-3 bg-purple-50 border border-purple-100 p-2 rounded-lg flex items-center text-xs text-purple-700">
                 <Users className="w-3 h-3 mr-2 text-purple-600" />
                 <b>1 Connection</b> works here. Request a referral!
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