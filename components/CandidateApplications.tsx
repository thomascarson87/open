
import React from 'react';
import { Application, JobPosting, ApplicationStatus } from '../types';
import { Building2, Calendar, ChevronRight, CheckCircle, Clock, FileText, UserCheck, Users, Briefcase, XCircle } from 'lucide-react';

interface Props {
  applications: Application[];
  jobs: JobPosting[];
  onViewMessage: (appId: string) => void;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string, color: string, icon: React.ReactNode, description: string }> = {
    'applied': { label: 'Applied', color: 'bg-gray-100 text-gray-600', icon: <Clock className="w-4 h-4"/>, description: 'Application received' },
    'screening': { label: 'Screening', color: 'bg-blue-50 text-blue-600', icon: <FileText className="w-4 h-4"/>, description: 'Resume under review' },
    'hr_interview': { label: 'HR Interview', color: 'bg-indigo-50 text-indigo-600', icon: <Users className="w-4 h-4"/>, description: 'Initial culture fit call' },
    'technical_test': { label: 'Technical Test', color: 'bg-purple-50 text-purple-600', icon: <Briefcase className="w-4 h-4"/>, description: 'Skills assessment' },
    'manager_interview': { label: 'Manager Interview', color: 'bg-orange-50 text-orange-600', icon: <UserCheck className="w-4 h-4"/>, description: 'Meeting with hiring manager' },
    'exec_interview': { label: 'Executive Stage', color: 'bg-violet-50 text-violet-600', icon: <Building2 className="w-4 h-4"/>, description: 'Final leadership review' },
    'offer': { label: 'Offer Received', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4"/>, description: 'Offer letter sent' },
    'contracting': { label: 'Contracting', color: 'bg-teal-50 text-teal-600', icon: <FileText className="w-4 h-4"/>, description: 'Finalizing paperwork' },
    'hired': { label: 'Hired', color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-4 h-4"/>, description: 'Welcome to the team!' },
    'rejected': { label: 'Not Selected', color: 'bg-red-50 text-red-600', icon: <XCircle className="w-4 h-4"/>, description: 'Application closed' },
};

const CandidateApplications: React.FC<Props> = ({ applications, jobs, onViewMessage }) => {
  const getJob = (id: string) => jobs.find(j => j.id === id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Applications</h1>
      <p className="text-gray-500 mb-8">Track the status of your current and past selection processes.</p>

      <div className="space-y-4">
        {applications.length === 0 ? (
             <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Briefcase className="w-8 h-8 text-gray-300" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">No applications yet</h3>
                 <p className="text-gray-500 mt-2">Start discovering jobs to track them here.</p>
             </div>
        ) : (
            applications.map(app => {
                const job = getJob(app.jobId);
                const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG['applied'];

                return (
                    <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            
                            {/* Job Info */}
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {job?.companyLogo ? <img src={job.companyLogo} className="w-full h-full object-cover rounded-lg"/> : <Building2 className="w-6 h-6 text-gray-400"/>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{job?.title || 'Unknown Role'}</h3>
                                    <p className="text-gray-600">{job?.companyName || 'Unknown Company'}</p>
                                    <div className="flex items-center text-xs text-gray-400 mt-1">
                                        <Calendar className="w-3 h-3 mr-1" /> Applied on {new Date(app.lastUpdated).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex-1 md:flex md:justify-center">
                                <div className="flex flex-col items-start md:items-center">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mb-1 ${statusInfo.color}`}>
                                        <span className="mr-2">{statusInfo.icon}</span>
                                        {statusInfo.label}
                                    </span>
                                    <span className="text-xs text-gray-400">{statusInfo.description}</span>
                                </div>
                            </div>

                            {/* Action */}
                            <div>
                                <button 
                                    onClick={() => onViewMessage(app.id)}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center"
                                >
                                    View Messages <ChevronRight className="w-4 h-4 ml-1 opacity-50"/>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default CandidateApplications;
