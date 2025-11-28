
import React, { useState } from 'react';
import { CandidateProfile, ThemeColor, ThemeFont } from '../types';
import { Lock, MapPin, DollarSign, Briefcase, Clock, ArrowLeft, Mail, CheckCircle, Star, Video, Github, Globe, Award, Info, Edit, Trophy, Zap, ChevronRight, Quote } from 'lucide-react';

interface Props {
  candidate: CandidateProfile;
  onBack: () => void;
  onUnlock: (id: string) => void;
  onMessage: (id: string) => void;
  onSchedule: (id: string) => void;
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

const CandidateDetails: React.FC<Props> = ({ candidate, onBack, onUnlock, onMessage, onSchedule, isOwner = false, onEdit }) => {
  // If user is owner, they always see unlocked view
  const isLocked = !isOwner && !candidate.isUnlocked;
  const theme = THEME_STYLES[candidate.themeColor || 'blue'];
  const fontClass = FONT_CLASSES[candidate.themeFont || 'sans'];
  const [activePhoto, setActivePhoto] = useState(0);

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500 pb-24 ${fontClass}`}>
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> {isOwner ? 'Back' : 'Back to Talent Pool'}
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
         <div className="p-10 flex flex-col md:flex-row gap-10 items-start">
            
            {/* Gallery */}
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
                {!isLocked && candidate.avatarUrls && candidate.avatarUrls.length > 1 && (
                    <div className="flex gap-2 mt-4">
                        {candidate.avatarUrls.map((url, i) => (
                            <button key={i} onClick={() => setActivePhoto(i)} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${activePhoto === i ? 'border-gray-900' : 'border-transparent'}`}>
                                <img src={url} className="w-full h-full object-cover"/>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className={`text-4xl font-black mb-2 ${isLocked ? 'blur-sm text-gray-400 select-none' : 'text-gray-900'}`}>
                            {isLocked ? 'Hidden Candidate' : candidate.name}
                        </h1>
                        <p className={`text-2xl font-medium mb-4 ${theme.text}`}>{candidate.headline}</p>
                        
                        {!isLocked && candidate.status && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 mb-4 capitalize">
                                {candidate.status.replace(/_/g, ' ')}
                            </span>
                        )}

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 font-medium">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 opacity-50"/> {candidate.location}</span>
                            <span className="flex items-center"><DollarSign className="w-4 h-4 mr-2 opacity-50"/> ${candidate.salaryExpectation} {candidate.nonNegotiables.includes('salary') && <Lock className="w-3 h-3 ml-1 text-red-400" />}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-2 opacity-50"/> {candidate.noticePeriod}</span>
                        </div>
                    </div>
                    {candidate.matchScore && !isOwner && (
                        <div className="hidden md:flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-4 border-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
                                {candidate.matchScore}%
                            </div>
                            <span className="text-xs text-green-600 font-bold mt-1 uppercase">Match</span>
                        </div>
                    )}
                </div>

                {!isLocked && candidate.bio && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-2xl text-gray-700 italic border-l-4 border-gray-300">
                        "{candidate.bio}"
                    </div>
                )}
            </div>
         </div>

         {/* Actions */}
         <div className="bg-gray-50 px-10 py-5 flex justify-between items-center border-t border-gray-100">
             <div className="flex items-center text-sm font-medium text-gray-500">
                 {isLocked ? <><Lock className="w-4 h-4 mr-2"/> Unlock full profile to view video intro, portfolio, and contact info.</> : (isOwner ? <><CheckCircle className="w-4 h-4 mr-2 text-green-500"/> Your Public Profile Preview</> : <><CheckCircle className="w-4 h-4 mr-2 text-green-500"/> Full Access Granted</>)}
             </div>
             <div>
                 {isOwner ? (
                     <button onClick={onEdit} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg flex items-center transition-transform hover:-translate-y-0.5">
                        <Edit className="w-4 h-4 mr-2" /> Update Profile
                     </button>
                 ) : isLocked ? (
                     <button onClick={() => onUnlock(candidate.id)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg flex items-center">
                        <Lock className="w-4 h-4 mr-2" /> Unlock Profile (1 Credit)
                     </button>
                 ) : (
                     <div className="flex gap-4">
                        <button onClick={() => onSchedule(candidate.id)} className="bg-white border border-gray-200 text-gray-900 px-6 py-2 rounded-xl font-bold hover:bg-gray-50">Schedule Interview</button>
                        <button onClick={() => onMessage(candidate.id)} className={`px-6 py-2 rounded-xl font-bold text-white shadow-md flex items-center ${theme.accent}`}>
                            <Mail className="w-4 h-4 mr-2" /> Message
                        </button>
                     </div>
                 )}
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Video Intro */}
              {!isLocked && candidate.videoIntroUrl && (
                  <div className="bg-black rounded-3xl overflow-hidden shadow-lg aspect-video relative group">
                      <video src={candidate.videoIntroUrl} controls className="w-full h-full" />
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center">
                          <Video className="w-3 h-3 mr-1"/> Video Intro
                      </div>
                  </div>
              )}

              {/* Experience */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center"><Briefcase className={`w-6 h-6 mr-3 ${theme.text}`}/> Work History</h3>
                  <div className="space-y-10 relative pl-4">
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                      {candidate.experience.map((exp) => (
                          <div key={exp.id} className="relative pl-8 group">
                              <div className={`absolute left-[-0.35rem] top-1.5 w-3 h-3 bg-white border-4 ${theme.border.replace('border', 'border-current')} ${theme.text} rounded-full`}></div>
                              <h4 className="text-xl font-bold text-gray-900">{exp.role}</h4>
                              <div className="text-lg text-gray-600 font-medium mb-1">{exp.company}</div>
                              <div className="text-sm text-gray-400 font-mono mb-4 uppercase tracking-wider">{exp.duration}</div>
                              
                              {(exp.description || (exp.achievements && exp.achievements.length > 0) || (exp.skillsAcquired && exp.skillsAcquired.length > 0)) && (
                                  <div className="mt-4 bg-gray-50 rounded-xl p-5 text-sm space-y-4">
                                      {exp.description && <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                                      
                                      {exp.achievements && exp.achievements.length > 0 && (
                                          <div>
                                              <h5 className="font-bold text-gray-900 mb-2 flex items-center"><Trophy className="w-3 h-3 mr-1.5 text-yellow-500"/> Key Achievements</h5>
                                              <ul className="space-y-1">
                                                  {exp.achievements.map((ach, i) => (
                                                      <li key={i} className="flex items-start text-gray-600">
                                                          <span className="mr-2">•</span>{ach}
                                                      </li>
                                                  ))}
                                              </ul>
                                          </div>
                                      )}

                                      {exp.skillsAcquired && exp.skillsAcquired.length > 0 && (
                                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                                              {exp.skillsAcquired.map((skill, i) => (
                                                  <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-500 flex items-center">
                                                      <Zap className="w-3 h-3 mr-1 text-gray-400"/> {skill}
                                                  </span>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

               {/* Professional References */}
              {!isLocked && candidate.references && candidate.references.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Quote className={`w-6 h-6 mr-3 ${theme.text}`}/> Professional References</h3>
                      <div className="grid grid-cols-1 gap-6">
                          {candidate.references.map((ref) => (
                              <div key={ref.id} className="bg-gray-50 p-6 rounded-2xl relative">
                                  <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-200" />
                                  <p className="text-gray-700 italic leading-relaxed mb-6 relative z-10">"{ref.content}"</p>
                                  
                                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                      <div>
                                          <h5 className="font-bold text-gray-900">{ref.authorName}</h5>
                                          <p className="text-xs text-gray-500 font-medium">{ref.authorRole} at {ref.authorCompany}</p>
                                          <p className="text-xs text-gray-400 mt-0.5">Relation: {ref.relationship}</p>
                                      </div>
                                      <div className="text-right">
                                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${theme.bg} ${theme.text}`}>
                                              {ref.assessment}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

               {/* Ambitions */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Award className={`w-6 h-6 mr-3 ${theme.text}`}/> Ambitions</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                      {candidate.ambitions}
                  </p>
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
              
              {/* Traits */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Character Traits</h3>
                  <div className="flex flex-wrap gap-2">
                      {candidate.characterTraits && candidate.characterTraits.map(t => (
                          <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{t}</span>
                      ))}
                  </div>
              </div>

              {/* Logistics / Nitty Gritty */}
              {!isLocked && (
                  <div className={`rounded-3xl shadow-sm border ${theme.border} ${theme.bg} p-8`}>
                      <h3 className={`text-lg font-bold ${theme.text} mb-6 flex items-center`}><Info className="w-5 h-5 mr-2"/> The Nitty Gritty</h3>
                      <div className="space-y-4 text-sm">
                          <div className="flex justify-between border-b border-black/5 pb-2">
                              <span className="text-gray-500">Legal Status</span>
                              <span className="font-bold text-gray-900">{candidate.legalStatus || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between border-b border-black/5 pb-2">
                              <span className="text-gray-500">Contract Types</span>
                              <div className="text-right font-bold text-gray-900 flex flex-col">
                                  {candidate.contractTypes && candidate.contractTypes.map(t => <span key={t}>{t}</span>)}
                              </div>
                          </div>
                          <div>
                              <span className="text-gray-500 block mb-1">Current Bonuses</span>
                              <p className="font-medium text-gray-900">{candidate.currentBonuses || 'None'}</p>
                          </div>
                      </div>
                  </div>
              )}

              {/* Portfolio */}
              {!isLocked && candidate.portfolio && candidate.portfolio.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Globe className="w-5 h-5 mr-2"/> Portfolio</h3>
                      <div className="space-y-3">
                          {candidate.portfolio.map(p => (
                              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                                  <div className="p-2 bg-white rounded-lg shadow-sm mr-3 text-gray-600 group-hover:text-blue-600">
                                      {p.platform.toLowerCase().includes('github') ? <Github className="w-4 h-4"/> : <Globe className="w-4 h-4"/>}
                                  </div>
                                  <div className="overflow-hidden">
                                      <div className="font-bold text-gray-900 text-sm truncate">{p.platform}</div>
                                      <div className="text-xs text-gray-400 truncate">{p.url}</div>
                                  </div>
                              </a>
                          ))}
                      </div>
                  </div>
              )}

              {/* Skills */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Top Skills</h3>
                  <div className="space-y-3">
                      {candidate.skills.slice(0, 8).map((skill, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700">{skill.name}</span>
                              <div className="flex items-center">
                                  <div className="w-20 h-1.5 bg-gray-100 rounded-full mr-3 overflow-hidden">
                                      <div className={`h-full rounded-full ${theme.accent}`} style={{width: `${Math.min(100, (skill.years / 8) * 100)}%`}}></div>
                                  </div>
                                  <span className="text-gray-400 w-6 text-right">{skill.years}y</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default CandidateDetails;