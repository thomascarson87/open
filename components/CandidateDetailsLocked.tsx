
import React from 'react';
import { CandidateProfile } from '../types';
import { Lock, MapPin, Briefcase, ChevronRight } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  candidate: CandidateProfile;
  onUnlock: (id: string) => void;
  onBack: () => void;
}

const CandidateDetailsLocked: React.FC<Props> = ({ candidate, onUnlock, onBack }) => {
  const { user } = useAuth();

  const handleUnlock = async () => {
      onUnlock(candidate.id);
      
      try {
          // Get company name
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
          }
      } catch (e) {
          console.error("Error notifying candidate", e);
      }
  };

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
             </div>
          </div>

          <div className="flex flex-col items-center">
             <button 
                onClick={handleUnlock}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-0.5 flex items-center"
             >
                <Lock className="w-4 h-4 mr-2" /> Unlock (1 Credit)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsLocked;
