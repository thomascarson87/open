
import React from 'react';
import { JobPosting, TeamMember } from '../types';
import { ArrowLeft, MapPin, DollarSign, Clock, Building2, CheckCircle, Calendar, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  job: JobPosting;
  onBack: () => void;
  onApply: (id: string) => void;
  teamMembers?: TeamMember[];
  onApprove?: (jobId: string, role: 'hiringManager' | 'finance') => void;
}

const JobDetails: React.FC<Props> = ({ job, onBack, onApply, teamMembers, onApprove }) => {
  const { user } = useAuth();
  
  // Logic to check if current user is an approver
  const isPending = job.status === 'pending_approval';
  
  // Check against real user ID from Supabase Auth
  const isFinanceApprover = user && (job.approvals?.finance?.assignedTo === user.id);
  const isHMApprover = user && (job.approvals?.hiringManager?.assignedTo === user.id);

  const financeStatus = job.approvals?.finance?.status || 'pending';
  const hmStatus = job.approvals?.hiringManager?.status || 'pending';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </button>

      {isPending && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-orange-800 flex items-center">
                      <ShieldCheck className="w-5 h-5 mr-2"/> Approval Required
                  </h3>
                  <span className="text-sm text-orange-600 font-medium bg-orange-100 px-3 py-1 rounded-full">Status: Pending</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${hmStatus === 'approved' ? 'bg-green-50 border-green-200' : 'bg-white border-orange-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-900">Hiring Manager</span>
                          {hmStatus === 'approved' ? <CheckCircle className="w-5 h-5 text-green-500"/> : <Clock className="w-5 h-5 text-orange-300"/>}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Requirements Review</p>
                      
                      {hmStatus === 'pending' && isHMApprover && (
                          <div className="flex gap-2">
                              <button onClick={() => onApprove && onApprove(job.id, 'hiringManager')} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded hover:bg-green-700">Approve</button>
                              <button className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded hover:bg-gray-50">Reject</button>
                          </div>
                      )}
                      {hmStatus === 'pending' && !isHMApprover && (
                          <div className="text-xs text-gray-400 italic">Waiting for manager approval...</div>
                      )}
                      {hmStatus === 'approved' && <span className="text-xs text-green-600 font-bold">Approved</span>}
                  </div>

                   <div className={`p-4 rounded-xl border ${financeStatus === 'approved' ? 'bg-green-50 border-green-200' : 'bg-white border-orange-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-900">Finance</span>
                           {financeStatus === 'approved' ? <CheckCircle className="w-5 h-5 text-green-500"/> : <Clock className="w-5 h-5 text-orange-300"/>}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Budget Check</p>
                      {financeStatus === 'pending' && isFinanceApprover && (
                          <div className="flex gap-2">
                              <button onClick={() => onApprove && onApprove(job.id, 'finance')} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded hover:bg-green-700">Approve</button>
                              <button className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded hover:bg-gray-50">Reject</button>
                          </div>
                      )}
                      {financeStatus === 'pending' && !isFinanceApprover && (
                          <div className="text-xs text-gray-400 italic">Waiting for finance approval...</div>
                      )}
                      {financeStatus === 'approved' && <span className="text-xs text-green-600 font-bold">Approved</span>}
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
           <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                    {job.companyLogo ? <img src={job.companyLogo} className="w-full h-full object-cover rounded-xl"/> : <Building2 className="w-10 h-10 text-gray-400"/>}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center text-gray-600 space-x-4">
                        <span className="font-medium">{job.companyName}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400"/> {job.location}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                         <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-gray-400"/> {job.workMode}</span>
                    </div>
                </div>
              </div>
              <button 
                onClick={() => onApply(job.id)}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isPending}
              >
                {isPending ? 'Pending Approval' : 'Apply Now'}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 p-8 border-r border-gray-100 space-y-8">
                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">About the Role</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                                {skill.name} • {skill.years}+ yrs
                            </span>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Values & Culture</h3>
                    <div className="grid grid-cols-2 gap-3">
                         {job.values.map((val, i) => (
                             <div key={i} className="flex items-center text-gray-700">
                                 <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                                 {val}
                             </div>
                         ))}
                    </div>
                </section>
            </div>

            <div className="p-8 bg-gray-50 space-y-6">
                 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Compensation & Perks</h4>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <DollarSign className="w-5 h-5 text-green-600 mr-3 mt-0.5"/>
                            <div>
                                <span className="block font-bold text-gray-900">{job.salaryRange}</span>
                                <span className="text-xs text-gray-500">Yearly Salary</span>
                            </div>
                        </div>
                        {job.startDate && (
                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-0.5"/>
                                <div>
                                    <span className="block font-bold text-gray-900">{new Date(job.startDate).toLocaleDateString()}</span>
                                    <span className="text-xs text-gray-500">Target Start Date</span>
                                </div>
                            </div>
                        )}
                        <div className="pt-4 border-t border-gray-100">
                            <ul className="space-y-2">
                                {job.perks.map((perk, i) => (
                                    <li key={i} className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-indigo-500 mr-2"/>
                                        {perk}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
