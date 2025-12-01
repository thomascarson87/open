
import React from 'react';
import { CandidateProfile } from '../types';
import { Lock, MapPin, Briefcase, ChevronRight } from 'lucide-react';

interface Props {
  candidate: CandidateProfile;
  onUnlock: (id: string) => void;
  onBack: () => void;
}

const CandidateDetailsLocked: React.FC<Props> = ({ candidate, onUnlock, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Search
      </button>

      {/* Locked Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 font-bold border-4 border-white shadow-lg">
            {candidate.name.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left">
             <div className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold mb-3">
                <Lock className="w-3 h-3 mr-1" /> Profile Locked
             </div>
             <h1 className="text-3xl font-black text-gray-300 blur-sm select-none mb-1">
               {candidate.name}
             </h1>
             <p className="text-2xl font-bold text-gray-900 mb-2">{candidate.headline}</p>
             
             <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {candidate.location}</span>
                <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/> {candidate.experience.length > 0 ? `${candidate.experience[0].duration.split('•')[0]}` : 'Junior'}</span>
             </div>
          </div>

          <div className="flex flex-col items-center">
             {candidate.matchScore && (
                 <div className="w-16 h-16 rounded-full border-4 border-green-100 flex items-center justify-center text-green-600 font-bold text-xl mb-2">
                     {candidate.matchScore}%
                 </div>
             )}
             <button 
                onClick={() => onUnlock(candidate.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-0.5 flex items-center"
             >
                <Lock className="w-4 h-4 mr-2" /> Unlock (1 Credit)
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Visible Data */}
        <div className="md:col-span-2 space-y-6">
           {/* Summary */}
           <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Professional Summary</h3>
              <p className="text-gray-600 leading-relaxed italic">"{candidate.bio}"</p>
           </div>

           {/* Work Experience (Masked) */}
           <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-6">Work History</h3>
              <div className="space-y-8">
                 {candidate.experience.map((exp, i) => (
                    <div key={i} className="relative pl-6 border-l-2 border-gray-100">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                        <h4 className="font-bold text-gray-900 text-lg">{exp.role}</h4>
                        <div className="text-gray-500 font-medium mb-1">
                            {exp.isCurrentRole || !exp.endDate 
                                ? <span className="text-gray-400 italic">Current Company (Hidden)</span> 
                                : exp.company
                            }
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                           {exp.duration}
                        </div>
                        {/* Achievements - Visible to entice */}
                        {exp.achievements && exp.achievements.length > 0 && (
                            <ul className="space-y-1">
                                {exp.achievements.slice(0, 2).map((ach, j) => (
                                    <li key={j} className="text-sm text-gray-600 flex items-start">
                                        <span className="mr-2">•</span> {ach}
                                    </li>
                                ))}
                                {exp.achievements.length > 2 && <li className="text-xs text-gray-400 italic">+ {exp.achievements.length - 2} more achievements...</li>}
                            </ul>
                        )}
                    </div>
                 ))}
              </div>
           </div>

           {/* Skills - Visible */}
           <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                 {candidate.skills.slice(0, 10).map((skill, i) => (
                     <span key={i} className="px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-100">
                         {skill.name} • {skill.years}y
                     </span>
                 ))}
                 {candidate.skills.length > 10 && (
                     <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium">
                         +{candidate.skills.length - 10} more
                     </span>
                 )}
              </div>
           </div>
        </div>

        {/* Right Col: Locked Data */}
        <div className="space-y-6">
           {/* Contact Info - Locked */}
           <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6 relative overflow-hidden">
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/50 backdrop-blur-[2px] z-10">
                   <Lock className="w-8 h-8 text-gray-400 mb-2" />
                   <span className="text-sm font-bold text-gray-500">Contact Info Locked</span>
               </div>
               <div className="opacity-20 blur-sm select-none">
                   <div className="mb-4">
                       <div className="text-xs font-bold uppercase text-gray-500">Email</div>
                       <div className="text-gray-900">candidate@example.com</div>
                   </div>
                   <div className="mb-4">
                       <div className="text-xs font-bold uppercase text-gray-500">Phone</div>
                       <div className="text-gray-900">+1 555 123 4567</div>
                   </div>
                   <div>
                       <div className="text-xs font-bold uppercase text-gray-500">Socials</div>
                       <div className="text-blue-600">linkedin.com/in/candidate</div>
                   </div>
               </div>
           </div>

           {/* Metadata - Visible */}
           <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
               <h4 className="font-bold text-gray-900">The Details</h4>
               
               <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Salary Range</span>
                   <span className="font-bold text-gray-900">${candidate.salaryMin ? (candidate.salaryMin/1000).toFixed(0) + 'k' : 'N/A'}+</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Work Mode</span>
                   <span className="font-bold text-gray-900">{candidate.preferredWorkMode.join(', ')}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">References</span>
                   <span className="font-bold text-green-600">{candidate.references.length} Verified</span>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsLocked;
