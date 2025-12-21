
import React from 'react';
import { CandidateProfile } from '../types';
import { Lock, MapPin, DollarSign, Briefcase, Clock, ArrowLeft, Mail, CheckCircle, Award, Smile, Heart, Globe, Zap, MessageCircle, CalendarPlus, Unlock, ShieldCheck, Shield, Users, Building2, GraduationCap } from 'lucide-react';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';

interface Props {
    candidate: CandidateProfile;
    onBack: () => void;
    onUnlock: (id: string) => void;
    onMessage: (id: string) => void;
    onSchedule: (id: string) => void;
    isOwner?: boolean;
}

const CandidateDetails: React.FC<Props> = ({ candidate, onBack, onUnlock, onMessage, onSchedule, isOwner = false }) => {
    const isLocked = !isOwner && !candidate.isUnlocked;

    if (isLocked) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-8 font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Search</button>
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-16 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><Lock className="w-10 h-10 text-gray-300" /></div>
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Full Profile Locked</h1>
                    <p className="text-gray-500 mb-12 max-w-md mx-auto text-lg leading-relaxed">Unlock this profile to see verified work history, technical proof-of-work, and direct contact details.</p>
                    <div className="bg-gray-50 rounded-[2.5rem] p-10 mb-12 max-w-xl mx-auto border-2 border-dashed border-gray-200">
                        <p className="font-black text-2xl text-gray-900 mb-2">{candidate.headline}</p>
                        <p className="text-gray-500 font-bold mb-6">{candidate.location}</p>
                        <div className="flex justify-center gap-6 text-sm">
                            <span className="bg-white px-4 py-2 rounded-full border border-gray-200 font-bold text-gray-600">{candidate.skills?.length || 0} Skills</span>
                            <span className="bg-white px-4 py-2 rounded-full border border-gray-200 font-bold text-gray-600">{candidate.experience?.length || 0} Roles</span>
                            {candidate.matchScore && <span className="bg-green-100 px-4 py-2 rounded-full font-black text-green-700">{candidate.matchScore}% Match</span>}
                        </div>
                    </div>
                    <button onClick={() => onUnlock(candidate.id)} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"><Unlock className="w-6 h-6" /> Unlock for 1 Credit</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-6 duration-700 pb-32">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-8 font-black uppercase tracking-widest text-xs"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Search</button>

            {/* Header Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 mb-8">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                    <div className="flex-shrink-0">
                        {candidate.avatarUrls?.[0] ? <img src={candidate.avatarUrls[0]} alt={candidate.name} className="w-40 h-40 rounded-3xl object-cover border-8 border-gray-50 shadow-inner" /> : <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-6xl font-black shadow-2xl">{candidate.name?.charAt(0)}</div>}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                            <div><h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{candidate.name}</h1><p className="text-2xl font-medium text-blue-600 leading-tight">{candidate.headline}</p></div>
                            {candidate.matchScore && <div className="bg-green-100 px-6 py-4 rounded-3xl border border-green-200 text-center shadow-sm"><span className="block text-3xl font-black text-green-700 leading-none mb-1">{candidate.matchScore}%</span><span className="text-[10px] font-black uppercase tracking-widest text-green-600">Open Match</span></div>}
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold text-gray-500">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><MapPin className="w-4 h-4 text-blue-500" /> {candidate.location}</span>
                            {candidate.salaryMin && <span className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full text-green-700"><DollarSign className="w-4 h-4" /> {candidate.salaryCurrency || 'USD'} {candidate.salaryMin?.toLocaleString()}+</span>}
                            {candidate.status && <span className={`px-3 py-1.5 rounded-full uppercase text-[10px] tracking-widest border-2 ${candidate.status === 'actively_looking' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{candidate.status.replace(/_/g, ' ')}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio */}
                    {candidate.bio && <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10"><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Professional Narrative</h3><p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{candidate.bio}</p></div>}
                    
                    {/* Technical Proficiency */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center"><Zap className="w-4 h-4 mr-2 text-yellow-500" /> Technical Mastery</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {candidate.skills.map((skill, idx) => {
                                const meta = SKILL_LEVEL_METADATA[skill.level] || SKILL_LEVEL_METADATA[3];
                                return (
                                    <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{skill.name}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{skill.years}y EXP</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            {[1, 2, 3, 4, 5].map(l => <div key={l} className={`h-1.5 flex-1 rounded-full ${l <= skill.level ? 'bg-blue-600' : 'bg-gray-200'}`} />)}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="text-xl">{meta.icon}</span> {meta.label} Proficiency</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Environment Alignment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-500" /> Work Style</h3>
                            <div className="space-y-4">
                                {Object.entries(candidate.workStylePreferences || {}).map(([k, v]) => v && (
                                    <div key={k} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{k.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="text-sm font-black text-gray-800 capitalize">{String(v).replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center"><Users className="w-4 h-4 mr-2 text-green-500" /> Team Dynamics</h3>
                            <div className="space-y-4">
                                {Object.entries(candidate.teamCollaborationPreferences || {}).map(([k, v]) => v && (
                                    <div key={k} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{k.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="text-sm font-black text-gray-800 capitalize">{String(v).replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Work History */}
                    {candidate.experience && candidate.experience.length > 0 && (
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center"><Briefcase className="w-4 h-4 mr-2 text-purple-500" /> Verified Career Journey</h3>
                            <div className="space-y-10">
                                {candidate.experience.map((exp, i) => (
                                    <div key={i} className="relative pl-8 border-l-4 border-gray-50 pb-2 last:pb-0">
                                        <div className="absolute -left-[10px] top-0 w-4 h-4 bg-white border-4 border-purple-500 rounded-full shadow-sm" />
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-4">
                                            <div><h4 className="text-xl font-black text-gray-900 leading-tight">{exp.role}</h4><p className="text-gray-500 font-bold">{exp.company}</p></div>
                                            <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">{exp.startDate} — {exp.isCurrentRole ? 'Present' : exp.endDate}</span>
                                        </div>
                                        {exp.description && <p className="text-gray-600 leading-relaxed mb-4">{exp.description}</p>}
                                        {exp.skillsAcquired && <div className="flex flex-wrap gap-2">{exp.skillsAcquired.map(s => <span key={s} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold"># {s}</span>)}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white sticky top-24 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                        <h3 className="relative z-10 font-black text-2xl mb-8 tracking-tight">Direct Access</h3>
                        <div className="relative z-10 space-y-4">
                            <button onClick={() => onMessage(candidate.id)} className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3"><MessageCircle className="w-5 h-5" /> Start Dialogue</button>
                            <button onClick={() => onSchedule(candidate.id)} className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black border border-gray-700 hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"><CalendarPlus className="w-5 h-5" /> Request Sync</button>
                        </div>
                        {candidate.email && (
                            <div className="relative z-10 mt-10 pt-10 border-t border-white/10">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Verified Contact</p>
                                <p className="font-bold truncate text-blue-400">{candidate.email}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Localization</h4>
                        <div className="space-y-4">
                            {candidate.timezone && <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-indigo-500" /><div><p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Timezone</p><p className="font-bold text-gray-900">{candidate.timezone}</p></div></div>}
                            {candidate.languages && candidate.languages.length > 0 && <div className="flex items-center gap-3"><Smile className="w-5 h-5 text-pink-500" /><div><p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Languages</p><p className="font-bold text-gray-900">{candidate.languages.map(l => l.language).join(', ')}</p></div></div>}
                        </div>
                    </div>

                    {candidate.nonNegotiables && candidate.nonNegotiables.length > 0 && (
                        <div className="bg-red-50 rounded-[2rem] border-2 border-red-100 p-8">
                            <h4 className="text-red-900 font-black text-xs uppercase tracking-widest mb-4 flex items-center"><Shield className="w-4 h-4 mr-2" /> Non-Negotiables</h4>
                            <ul className="space-y-3">{candidate.nonNegotiables.map(item => <li key={item} className="flex items-center text-red-700 text-sm font-bold"><CheckCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" /> {item.replace(/_/g, ' ')}</li>)}</ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateDetails;
