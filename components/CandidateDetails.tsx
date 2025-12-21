import React, { useState } from 'react';
import { CandidateProfile, ThemeColor, ThemeFont } from '../types';
import { 
  Lock, MapPin, DollarSign, Briefcase, Clock, ArrowLeft, Mail, 
  CheckCircle, Edit, Award, Smile, Heart, Globe, Zap, Shield, Tag, Calendar, ShieldCheck, Target, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';
import { supabase } from '../services/supabaseClient';
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

const CandidateDetails: React.FC<Props> = ({ candidate, onBack, onUnlock, isOwner = false, onEdit, onMessage, onSchedule }) => {
  const isLocked = !isOwner && !candidate.isUnlocked;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 mb-8">
          <h1 className={`text-4xl font-black mb-2 ${isLocked ? 'blur-sm' : ''}`}>{isLocked ? 'Hidden Candidate' : candidate.name}</h1>
          <p className="text-2xl font-medium text-blue-600 mb-4">{candidate.headline}</p>
          <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {candidate.location}</span>
              <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1"/> {candidate.salaryMin}</span>
          </div>
      </div>

      {!isLocked && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                  {/* Work Style Preference Visualization */}
                  {candidate.workStylePreferences && Object.keys(candidate.workStylePreferences).length > 0 && (
                      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                              <Clock className="w-6 h-6 mr-3 text-blue-500"/> Personal Work Style
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {candidate.workStylePreferences.workIntensity && (
                                  <div className="bg-gray-50 p-4 rounded-2xl">
                                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">Intensity</div>
                                      <div className="font-bold text-gray-900 capitalize">{candidate.workStylePreferences.workIntensity.replace('_', ' ')}</div>
                                  </div>
                              )}
                              {candidate.workStylePreferences.workHours && (
                                  <div className="bg-gray-50 p-4 rounded-2xl">
                                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">Hours</div>
                                      <div className="font-bold text-gray-900 capitalize">{candidate.workStylePreferences.workHours.replace('_', ' ')}</div>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

                  {/* Team Preferences */}
                  {candidate.teamCollaborationPreferences && Object.keys(candidate.teamCollaborationPreferences).length > 0 && (
                      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                              <Users className="w-6 h-6 mr-3 text-green-500"/> Team Environment
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {candidate.teamCollaborationPreferences.teamSizePreference && (
                                  <div className="bg-gray-50 p-4 rounded-2xl">
                                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">Preferred Team Size</div>
                                      <div className="font-bold text-gray-900 capitalize">{candidate.teamCollaborationPreferences.teamSizePreference.replace('_', ' ')}</div>
                                  </div>
                              )}
                              {candidate.teamCollaborationPreferences.collaborationFrequency && (
                                  <div className="bg-gray-50 p-4 rounded-2xl">
                                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">Collaboration</div>
                                      <div className="font-bold text-gray-900 capitalize">{candidate.teamCollaborationPreferences.collaborationFrequency.replace('_', ' ')}</div>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center"><Zap className="w-6 h-6 mr-2" /> Skills</h3>
                      <div className="space-y-4">
                          {candidate.skills.map(s => <div key={s.name} className="flex justify-between border-b pb-2"><span className="font-bold">{s.name}</span><span className="text-blue-600">Level {s.level}</span></div>)}
                      </div>
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-blue-600 p-8 rounded-3xl text-white">
                      <h3 className="font-bold mb-2">Connect</h3>
                      <button onClick={() => onMessage(candidate.id)} className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold mb-3">Message</button>
                      <button onClick={() => onSchedule(candidate.id)} className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold">Schedule</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
export default CandidateDetails;
