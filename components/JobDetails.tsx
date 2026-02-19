import React from 'react';
import { JobPosting, TeamMember } from '../types';
import { ArrowLeft, Building2, Zap, CheckCircle, Check, TrendingUp, Code, GraduationCap, Target } from 'lucide-react';
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
             // Need candidate ID. In this schema, candidate_profile.id IS the user_id.
             const { data: cand } = await supabase.from('candidate_profiles').select('id').eq('id', user.id).single();
             if (cand) {
                const recruiterId = job.companyId;
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
      <button onClick={onBack} className="flex items-center text-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </button>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-8 border-b border-border">
           <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                    {job.companyLogo ? <img src={job.companyLogo} className="w-full h-full object-cover"/> : <Building2 className="w-10 h-10 text-gray-400 dark:text-gray-500"/>}
                </div>
                <div>
                    <h1 className="font-heading text-3xl text-primary mb-2">{job.title}</h1>
                    <div className="flex flex-col gap-1 text-muted">
                        <span className="font-medium">{job.companyName}</span>
                        {job.requiredEducationLevel && (
                            <span className="flex items-center text-sm bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 dark:text-gray-600 px-2 py-1 rounded-lg w-fit mt-1">
                                <GraduationCap className="w-3 h-3 mr-1.5"/>
                                {job.requiredEducationLevel} Required
                            </span>
                        )}
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
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-8">{job.description}</p>
            
            {/* Impact Section */}
            {job.impactStatement && (
                <div className="bg-gradient-to-r from-accent-coral to-accent-green border-l-4 border-accent-coral p-6 rounded-r-lg mb-8 shadow-sm">
                    <div className="flex items-start">
                        <div className="bg-white dark:bg-surface p-2 rounded-full shadow-sm mr-4 mt-1">
                            <Zap className="w-5 h-5 text-accent-coral"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-accent-coral mb-2 text-lg">Your Impact</h3>
                            <p className="text-accent-coral leading-relaxed">{job.impactStatement}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-primary mb-5 flex items-center">
                        <CheckCircle className="w-6 h-6 mr-2 text-green-600"/> What You'll Do
                    </h3>
                    <ul className="grid grid-cols-1 gap-3">
                        {job.responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-border">
                                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 bg-white dark:bg-surface rounded-full p-0.5 shadow-sm"/>
                                <span className="text-gray-700 dark:text-gray-300 dark:text-gray-600 font-medium">{resp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Deliverables / Metrics */}
            {(job.keyDeliverables?.length || 0) > 0 && (
                <div className="mb-10">
                     <h3 className="text-xl font-bold text-primary mb-5 flex items-center">
                        <Target className="w-6 h-6 mr-2 text-accent-green"/> Key Deliverables
                    </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {job.keyDeliverables?.map((del, i) => (
                            <div key={i} className="flex items-center p-4 bg-surface border border-border rounded-xl shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-accent-green-bg flex items-center justify-center text-accent-green font-bold mr-3 flex-shrink-0">
                                    {i + 1}
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 dark:text-gray-600 font-medium">{del}</span>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {/* Success Metrics (Alternative if available) */}
            {(job.successMetrics?.length || 0) > 0 && (
                <div className="mb-10">
                     <h3 className="text-xl font-bold text-primary mb-5 flex items-center">
                        <TrendingUp className="w-6 h-6 mr-2 text-orange-600"/> How Success is Measured
                    </h3>
                     <div className="flex flex-wrap gap-3">
                        {job.successMetrics?.map((metric, i) => (
                            <span key={i} className="px-4 py-2 bg-orange-50 text-orange-800 rounded-full font-medium border border-orange-100">
                                {metric}
                            </span>
                        ))}
                     </div>
                </div>
            )}

            {/* Tech Stack */}
            {(job.techStack?.length || 0) > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-primary mb-5 flex items-center">
                        <Code className="w-6 h-6 mr-2 text-accent-green"/> Technologies You'll Use
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {job.techStack?.map((tech, i) => (
                            <div key={i} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold shadow-md hover:scale-105 transition-transform cursor-default">
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
