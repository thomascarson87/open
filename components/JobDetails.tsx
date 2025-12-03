
import React from 'react';
import { JobPosting, TeamMember } from '../types';
import { ArrowLeft, MapPin, DollarSign, Clock, Building2, CheckCircle, Calendar, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services/messageService';
import { supabase } from '../services/supabaseClient';

interface Props {
  job: JobPosting;
  onBack: () => void;
  onApply: (id: string) => void;
  teamMembers?: TeamMember[];
  onApprove?: (jobId: string, role: 'hiringManager' | 'finance') => void;
}

const JobDetails: React.FC<Props> = ({ job, onBack, onApply, teamMembers, onApprove }) => {
  const { user } = useAuth();
  
  const handleApply = async () => {
      onApply(job.id);
      
      // Auto-create conversation
      if (user) {
          try {
             // Need candidate ID
             const { data: cand } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).single();
             if (cand) {
                // Determine recruiter ID (company owner for now)
                const recruiterId = job.company_id; 
                
                // Get application ID (Need to wait for onApply to finish in parent, but assuming eventual consistency here or independent check)
                // Better approach: onApply returns app ID. For now we will try to get/create conversation loosely.
                
                await messageService.getOrCreateConversation(recruiterId, cand.id, null, job.id);
             }
          } catch (e) {
              console.warn("Could not auto-start conversation", e);
          }
      }
  };

  const isPending = job.status === 'pending_approval';
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
           <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {job.companyLogo ? <img src={job.companyLogo} className="w-full h-full object-cover"/> : <Building2 className="w-10 h-10 text-gray-400"/>}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center text-gray-600 space-x-4">
                        <span className="font-medium">{job.companyName}</span>
                    </div>
                </div>
              </div>
              <button 
                onClick={handleApply}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isPending}
              >
                {isPending ? 'Pending Approval' : 'Apply Now'}
              </button>
           </div>
        </div>
        
        <div className="p-8">
            <h3 className="font-bold text-lg mb-4">Description</h3>
            <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
