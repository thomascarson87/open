
import React, { useState } from 'react';
import { CandidateProfile, ThemeColor, ThemeFont } from '../types';
import { 
  Lock, MapPin, DollarSign, Briefcase, Clock, ArrowLeft, Mail, 
  CheckCircle, Edit, Award, Smile, Heart, Globe, Zap, Shield, Tag, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';
import { supabase } from '../services/supabaseClient';

interface Props {
  candidate: CandidateProfile;
  onBack: () => void;
  onUnlock: (id: string) => void;
  onMessage: (candidateId: string) => void;
  onSchedule: (candidateId: string) => void;
  isOwner?: boolean;
  onEdit?: () => void;
}

const THEME_STYLES: Record<ThemeColor, { bg: string, text: string, border: string, accent: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', accent: 'bg-blue-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', accent: 'bg-purple-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', accent: 'bg-green-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', accent: 'bg-orange-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', accent: 'bg-pink-600' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', accent: 'bg-slate-600' },
};

const FONT_CLASSES: Record<ThemeFont, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    display: 'font-sans tracking-tight'
};

const CandidateDetails: React.FC<Props> = ({ candidate, onBack, onUnlock, isOwner = false, onEdit, onMessage, onSchedule }) => {
  const { user } = useAuth();
  // Double check locking logic, though App.tsx handles the main switch
  const isLocked = !isOwner && !candidate.isUnlocked;
  
  const theme = THEME_STYLES[candidate.themeColor || 'blue'];
  const fontClass = FONT_CLASSES[candidate.themeFont || 'sans'];
  const [activePhoto, setActivePhoto] = useState(0);

  const handleUnlockProfile = async () => {
      onUnlock(candidate.id);
      
      try {
          const { data: teamMember } = await supabase.from('team_members').select('company_id').eq('user_id', user!.id).maybeSingle();
          const companyId = teamMember?.company_id || user!.id;
          const { data: company } = await supabase.from('company_profiles').select('company_name').eq('id', companyId).single();
          
          if (company) {
             await notificationService.createNotification(
                 candidate.id,
                 'profile_viewed',
                 'Profile Unlocked',
                 `${company.company_name} has unlocked your profile!`,
                 '/dashboard'
             );
             
             await supabase.from('profile_views').insert({
                 candidate_id: candidate.id,
                 company_id: companyId,
                 unlocked: true
             });
          }
      } catch (e) {
          console.error("Error notifying candidate", e);
      }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500 pb-24 ${fontClass}`}>
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> {isOwner ? 'Back' : 'Back to Talent Pool'}
      </button>

      {/* 1. Hero Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
         <div className="p-10 flex flex-col md:flex-row gap-10 items-start">
            
            {/* Avatar Gallery */}
            <div className="w-full md:w-auto flex flex-col items-center">
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 relative group">
                     {isLocked ? (
                         <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400"><Lock className="w-12 h-12"/></div>
                     ) : (
                         candidate.avatarUrls && candidate.avatarUrls.length > 0 ? (
                             <img src={candidate.avatarUrls[activePhoto]} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                         ) : (
                             <div className={`w-full h-full flex items-center justify-center text-3xl font-bold text-white ${theme.accent}`}>{candidate.name.charAt(0)}</div>
                         )
                     )}
                </div>
            </div>

            <div className="flex-1 w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className={`text-4xl font-black mb-2 ${isLocked ? 'blur-sm text-gray-400 select-none' : 'text-gray-900'}`}>
                            {isLocked ? 'Hidden Candidate' : candidate.name}
                        </h1>
                        <p className={`text-2xl font-medium mb-4 ${theme.text}`}>{candidate.headline}</p>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 font-medium">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 opacity-50"/> {candidate.location}</span>
                            <span className="flex items-center"><DollarSign className="w-4 h-4 mr-2 opacity-50"/> Expected: ${candidate.salaryExpectation}</span>
                            {candidate.noticePeriod && (
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-2 opacity-50"/> {candidate.noticePeriod} Notice</span>
                            )}
                        </div>
                    </div>
                </div>

                {!isLocked && candidate.bio && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-2xl text-gray-700 italic border-l-4 border-gray-300 leading-relaxed">
                        "{candidate.bio}"
                    </div>
                )}
            </div>
         </div>

         {/* Actions */}
         <div className="bg-gray-50 px-10 py-5 flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 gap-4">
             <div className="flex items-center text-sm font-medium text-gray-500">
                 {isLocked ? <><Lock className="w-4 h-4 mr-2"/> Unlock full profile to view details.</> : <><CheckCircle className="w-4 h-4 mr-2 text-green-500"/> Full Access Granted</>}
             </div>
             <div className="w-full sm:w-auto">
                 {isOwner ? (
                     <button onClick={onEdit} className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg flex items-center justify-center transition-transform hover:-translate-y-0.5">
                        <Edit className="w-4 h-4 mr-2" /> Update Profile
                     </button>
                 ) : isLocked ? (
                     <button onClick={handleUnlockProfile} className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg flex items-center justify-center">
                        <Lock className="w-4 h-4 mr-2" /> Unlock Profile (1 Credit)
                     </button>
                 ) : (
                     <div className="flex gap-4 w-full sm:w-auto">
                        <button onClick={() => onSchedule(candidate.id)} className="flex-1 sm:flex-initial bg-white border border-gray-200 text-gray-900 px-6 py-2 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center">
                            <Calendar className="w-4 h-4 mr-2"/> Schedule
                        </button>
                        <button onClick={() => onMessage(candidate.id)} className={`flex-1 sm:flex-initial px-6 py-2 rounded-xl font-bold text-white shadow-md flex items-center justify-center ${theme.accent}`}>
                            <Mail className="w-4 h-4 mr-2" /> Message
                        </button>
                     </div>
                 )}
             </div>
         </div>
      </div>
      
      {/* Locked State: Limited View */}
      {isLocked ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Details Locked</h3>
              <p className="text-gray-500 mt-2">Unlock this profile to view experience, skills, and contact info.</p>
          </div>
      ) : (
          /* Unlocked State: Full Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Work History */}
              <div className="lg:col-span-2 space-y-8">
                  {/* 2. Work Experience */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                          <Briefcase className={`w-6 h-6 mr-3 ${theme.text}`}/> Work History
                      </h3>
                      {candidate.experience && candidate.experience.length > 0 ? (
                          <div className="space-y-10 relative pl-4">
                              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                              {candidate.experience.map((exp) => (
                                  <div key={exp.id} className="relative pl-8 group">
                                      <div className={`absolute left-0 top-1.5 w-7 h-7 bg-white border-4 ${theme.border} rounded-full z-10`}></div>
                                      <h4 className="text-xl font-bold text-gray-900">{exp.role}</h4>
                                      <div className="text-lg text-gray-600 font-medium mb-1">{exp.company}</div>
                                      <div className="text-sm text-gray-400 font-mono mb-4 uppercase tracking-wider flex items-center">
                                          <Calendar className="w-3 h-3 mr-2"/> {exp.duration}
                                      </div>
                                      <p className="text-gray-700 leading-relaxed mb-4">{exp.description}</p>
                                      {exp.achievements && exp.achievements.length > 0 && (
                                          <ul className="list-disc list-inside space-y-1 text-gray-600 bg-gray-50 p-4 rounded-xl">
                                              {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                                          </ul>
                                      )}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-gray-500 italic">No work history listed.</p>
                      )}
                  </div>
              </div>
              
              {/* Right Column: Details Sidebar */}
              <div className="space-y-6">
                  
                  {/* 3. Skills */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-500"/> Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-100 flex items-center">
                                    {skill.name} <span className="text-gray-400 ml-1 text-xs">· {skill.years}y</span>
                                </span>
                            ))}
                        </div>
                  </div>

                  {/* 4. Education */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Award className="w-5 h-5 mr-2 text-blue-500"/> Education</h3>
                      <div>
                          <div className="text-lg font-bold text-gray-900">{candidate.education_level || 'Not specified'}</div>
                          {(candidate.education_field || candidate.education_institution) && (
                              <div className="text-gray-600 mt-1">
                                  {candidate.education_field}
                                  {candidate.education_field && candidate.education_institution && <span> at </span>}
                                  <span className="text-gray-500">{candidate.education_institution}</span>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* 5. Personality & Values */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Smile className="w-5 h-5 mr-2 text-purple-500"/> Personality & Culture</h3>
                      
                      {/* Assessments */}
                      {(candidate.myers_briggs || candidate.enneagram_type) && (
                          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
                              {candidate.myers_briggs && (
                                  <div>
                                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">Myers-Briggs</div>
                                      <div className="text-2xl font-black text-gray-900">{candidate.myers_briggs}</div>
                                  </div>
                              )}
                              {candidate.enneagram_type && (
                                  <div>
                                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">Enneagram</div>
                                      <div className="text-lg font-bold text-gray-900">{candidate.enneagram_type}</div>
                                  </div>
                              )}
                          </div>
                      )}

                      {/* Values */}
                      <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-700 mb-3">Core Values</h4>
                          <div className="flex flex-wrap gap-2">
                              {candidate.values?.map((val, i) => (
                                  <span key={i} className={`px-2.5 py-1 text-xs font-bold rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}>{val}</span>
                              ))}
                          </div>
                      </div>

                      {/* Traits */}
                      <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-3">Traits</h4>
                          <div className="flex flex-wrap gap-2">
                              {candidate.characterTraits?.map((trait, i) => (
                                  <span key={i} className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-50 text-gray-600 border border-gray-200">{trait}</span>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* 6. Preferences */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Shield className="w-5 h-5 mr-2 text-gray-500"/> Preferences</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Work Mode</div>
                                <div className="flex gap-2">
                                    {candidate.preferredWorkMode?.map(m => (
                                        <span key={m} className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg">{m}</span>
                                    ))}
                                    {candidate.nonNegotiables?.includes('work_mode') && <span className="text-xs text-red-500 flex items-center"><Lock className="w-3 h-3 mr-1"/> Rigid</span>}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Contract Types</div>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.contractTypes?.map(t => (
                                        <span key={t} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                  </div>

                  {/* 7. Compensation */}
                  <div className="bg-green-50 rounded-3xl border border-green-100 p-6">
                        <h3 className="font-bold text-green-900 mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2"/> Compensation</h3>
                        
                        <div className="mb-4">
                            <div className="text-xs font-bold text-green-700 uppercase mb-1">Min Annual Salary</div>
                            <div className="text-2xl font-black text-green-900">
                                {candidate.salaryCurrency} ${(candidate.salaryMin || 0).toLocaleString()}
                            </div>
                            {candidate.nonNegotiables?.includes('salary_min') && (
                                <div className="text-xs text-red-600 font-bold mt-1 flex items-center"><Lock className="w-3 h-3 mr-1"/> Non-negotiable</div>
                            )}
                        </div>

                        {candidate.currentBonuses && (
                            <div>
                                <div className="text-xs font-bold text-green-700 uppercase mb-1">Current Bonus/Equity</div>
                                <div className="text-sm text-green-900 font-medium">{candidate.currentBonuses}</div>
                            </div>
                        )}
                  </div>

                  {/* 8. Perks & Industries */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Heart className="w-5 h-5 mr-2 text-pink-500"/> Interests</h3>
                        
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Desired Perks</h4>
                            <ul className="space-y-1">
                                {candidate.desiredPerks?.map((p, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start">
                                        <CheckCircle className="w-3 h-3 text-pink-500 mr-2 mt-1 flex-shrink-0"/> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Industries</h4>
                            <div className="flex flex-wrap gap-2">
                                {candidate.interestedIndustries?.map((ind, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-100 flex items-center">
                                        <Globe className="w-3 h-3 mr-1 text-gray-400"/> {ind}
                                    </span>
                                ))}
                            </div>
                        </div>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
};

export default CandidateDetails;
