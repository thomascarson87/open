import React, { useState } from 'react';
import { CandidateProfile, ThemeColor, ThemeFont } from '../types';
import { 
    Lock, MapPin, DollarSign, Briefcase, Clock, ArrowLeft, Mail, 
    CheckCircle, Edit, Award, Smile, Heart, Globe, Zap, Shield, 
    Tag, Calendar, ShieldCheck, Target, Users, Building2, GraduationCap,
    Star, ExternalLink, Play, MessageCircle, CalendarPlus, Unlock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SKILL_LEVEL_METADATA, IMPACT_SCOPE_METADATA } from '../constants/matchingData';

interface Props {
    candidate: CandidateProfile;
    onBack: () => void;
    onUnlock: (id: string) => void;
    onMessage: (candidateId: string) => void;
    onSchedule: (candidateId: string) => void;
    isOwner?: boolean;
    onEdit?: () => void;
}

const CandidateDetails: React.FC<Props> = ({ 
    candidate, 
    onBack, 
    onUnlock, 
    isOwner = false, 
    onEdit, 
    onMessage, 
    onSchedule 
}) => {
    const isLocked = !isOwner && !candidate.isUnlocked;

    if (isLocked) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                    <Lock className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Profile Locked</h1>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Unlock this candidate's full profile to see contact details and work history.</p>
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-lg mx-auto">
                        <p className="font-bold text-lg text-gray-900">{candidate.headline}</p>
                        <p className="text-gray-500 mt-1">{candidate.location}</p>
                        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
                            <span>{candidate.skills?.length || 0} skills</span>
                            <span>•</span>
                            <span>{candidate.experience?.length || 0} roles</span>
                            {candidate.matchScore && (<><span className="text-green-600 font-bold">{candidate.matchScore}% match</span></>)}
                        </div>
                    </div>
                    <button onClick={() => onUnlock(candidate.id)} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 mx-auto"><Unlock className="w-5 h-5" /> Unlock Profile</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500 pb-24">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium"><ArrowLeft className="w-4 h-4 mr-2" /> Back to results</button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 mb-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                        {candidate.avatarUrls?.[0] ? <img src={candidate.avatarUrls[0]} alt={candidate.name} className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-100" /> : <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black">{candidate.name?.charAt(0)}</div>}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div><h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{candidate.name}</h1><p className="text-xl md:text-2xl font-medium text-blue-600 mb-4">{candidate.headline}</p></div>
                            {candidate.matchScore && (<div className="bg-green-100 px-4 py-2 rounded-xl"><span className="text-2xl font-black text-green-700">{candidate.matchScore}%</span><p className="text-xs text-green-600 font-bold">Match</p></div>)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {candidate.location}</span>
                            {candidate.salaryMin && (<span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {candidate.salaryCurrency || 'USD'} {candidate.salaryMin?.toLocaleString()}+</span>)}
                            {candidate.status && (<span className={`px-3 py-1 rounded-full text-xs font-bold ${candidate.status === 'actively_looking' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{candidate.status.replace(/_/g, ' ')}</span>)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {candidate.bio && (<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"><h3 className="text-xl font-bold text-gray-900 mb-4">About</h3><p className="text-gray-600 whitespace-pre-wrap">{candidate.bio}</p></div>)}
                    
                    {/* Work Style */}
                    {candidate.workStylePreferences && Object.keys(candidate.workStylePreferences).length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Clock className="w-6 h-6 mr-3 text-blue-500" /> Work Style</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(candidate.workStylePreferences).map(([key, val]) => val && (
                                    <div key={key} className="bg-blue-50 p-4 rounded-xl">
                                        <div className="text-xs font-bold text-blue-600 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                                        <div className="font-bold text-blue-900 capitalize">{val.replace(/_/g, ' ')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Prefs */}
                    {candidate.teamCollaborationPreferences && Object.keys(candidate.teamCollaborationPreferences).length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Users className="w-6 h-6 mr-3 text-green-500" /> Team Dynamics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(candidate.teamCollaborationPreferences).map(([key, val]) => val && (
                                    <div key={key} className="bg-green-50 p-4 rounded-xl">
                                        <div className="text-xs font-bold text-green-600 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                                        <div className="font-bold text-green-900 capitalize">{val.replace(/_/g, ' ')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Zap className="w-6 h-6 mr-3 text-yellow-500" /> Skills</h3>
                        <div className="space-y-4">
                            {candidate.skills.map((skill, idx) => {
                                const meta = SKILL_LEVEL_METADATA[skill.level] || SKILL_LEVEL_METADATA[3];
                                return (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3"><span className="text-2xl">{meta.icon}</span><div><span className="font-bold text-gray-900">{skill.name}</span>{skill.years && <span className="text-gray-400 text-sm ml-2">({skill.years}y)</span>}</div></div>
                                        <div className="text-right"><div className="font-bold text-blue-600">Level {skill.level}</div><div className="text-xs text-gray-500">{meta.label}</div></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-600 p-8 rounded-3xl text-white sticky top-4">
                        <h3 className="font-bold text-xl mb-6">Connect</h3>
                        <button onClick={() => onMessage(candidate.id)} className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold mb-3 flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5" /> Message</button>
                        <button onClick={() => onSchedule(candidate.id)} className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><CalendarPlus className="w-5 h-5" /> Schedule Call</button>
                        {candidate.email && (<div className="mt-6 pt-6 border-t border-blue-500"><p className="text-blue-200 text-sm mb-1">Email</p><p className="font-medium truncate">{candidate.email}</p></div>)}
                    </div>
                    {candidate.languages && candidate.languages.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center"><Globe className="w-4 h-4 mr-2 text-indigo-500" /> Languages</h4>
                            <div className="space-y-2">{candidate.languages.map((l, i) => (<div key={i} className="flex justify-between text-sm"><span className="font-medium">{l.language}</span><span className="text-gray-500">{l.proficiency}</span></div>))}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateDetails;
