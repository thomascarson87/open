import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services/messageService';
import StatusBadge from './StatusBadge';
import { atsService } from '../services/atsService';
import { ApplicationStatus } from '../types';
import { 
  Search, Filter, MoreHorizontal, MessageSquare, X, Check,
  User, MapPin, Briefcase, GraduationCap, Heart, Zap, Clock,
  Calendar, Phone, Code, Star, ChevronRight, Mail, DollarSign,
  UserCheck, XCircle, Gift, ArrowRight, ExternalLink, Users
} from 'lucide-react';

const getSkillLevelLabel = (level: number): string => {
  const labels: Record<number, string> = {
    1: 'Learning',
    2: 'Practicing', 
    3: 'Applying',
    4: 'Mastering',
    5: 'Innovating'
  };
  return labels[level] || 'Unknown';
};

const getSkillLevelColor = (level: number): string => {
  const colors: Record<number, string> = {
    1: 'bg-slate-200 text-slate-700',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-green-100 text-green-700',
    4: 'bg-purple-100 text-purple-700',
    5: 'bg-yellow-100 text-yellow-700'
  };
  return colors[level] || 'bg-gray-200';
};

const RecruiterATS: React.FC = () => {
  const { user } = useAuth();
  
  // State for data management
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  
  // State for UI interactions
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppForReject, setSelectedAppForReject] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const actionMenuRef = useRef<HTMLDivElement>(null);
  const profilePanelRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
      if (profilePanelRef.current && !profilePanelRef.current.contains(event.target as Node) && 
          !(event.target as HTMLElement).closest('.candidate-trigger')) {
        setSelectedCandidateProfile(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user, filter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data: teamMember } = await supabase
          .from('team_members')
          .select('company_id')
          .eq('user_id', user!.id)
          .maybeSingle();
      
      const companyId = teamMember?.company_id || user!.id;

      let query = supabase
        .from('applications')
        .select(`
          *,
          candidate:candidate_profiles(
            id, name, email, headline, avatar_urls, skills, experience, 
            education_level, education_field, education_institution, 
            values_list, character_traits, location, bio, 
            work_style_preferences, salary_min, salary_currency, timezone, languages
          ),
          job:jobs(id, title, company_id)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setApplications(data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await atsService.updateApplicationStatus({
        applicationId: appId,
        newStatus,
        changedBy: user!.id,
        changeType: 'manual',
        notes: `Status manually updated to ${newStatus}`
      });
      setOpenActionMenu(null);
      loadApplications();
      
      // If profile panel is open for this app, update it
      if (selectedCandidateProfile?.id === appId) {
        setSelectedCandidateProfile((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!selectedAppForReject) return;

    try {
      await supabase
        .from('applications')
        .update({ rejection_reason: rejectReason })
        .eq('id', selectedAppForReject.id);

      await handleStatusChange(selectedAppForReject.id, 'rejected');
      setShowRejectModal(false);
      setSelectedAppForReject(null);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject candidate:', error);
      alert('Failed to record rejection. Please try again.');
    }
  };

  const openMessage = async (app: any) => {
      if (!app.candidate?.id) {
          alert('Cannot message: candidate information missing');
          return;
      }
      
      try {
          const conversationId = await messageService.getOrCreateConversation(
              user!.id,
              app.candidate.id,
              app.id,
              app.job?.id
          );
          
          window.history.pushState({}, '', `/?view=messages&conversationId=${conversationId}`);
          window.dispatchEvent(new Event('popstate'));
      } catch (error) {
          console.error('Failed to start conversation:', error);
          alert('Failed to start conversation. Please try again.');
      }
  };

  const TABS: { id: ApplicationStatus | 'all', label: string }[] = [
      { id: 'all', label: 'All' },
      { id: 'applied', label: 'New' },
      { id: 'reviewing', label: 'Reviewing' },
      { id: 'phone_screen_scheduled', label: 'Screening' },
      { id: 'technical_scheduled', label: 'Interviewing' },
      { id: 'offer_extended', label: 'Offers' },
      { id: 'hired', label: 'Hired' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Applicant Tracking</h1>
            <p className="text-gray-500 mt-1">Manage your hiring pipeline with precision.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-gray-50 transition-colors shadow-sm">
                <Filter className="w-4 h-4 mr-2 text-gray-400"/> Filter
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 scrollbar-hide no-scrollbar">
          {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    filter === tab.id 
                    ? 'bg-gray-900 text-white shadow-lg scale-105' 
                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                  {tab.label}
                  {filter !== tab.id && applications.filter(a => tab.id === 'all' || a.status === tab.id).length > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">{applications.filter(a => tab.id === 'all' || a.status === tab.id).length}</span>
                  )}
              </button>
          ))}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
         {loading ? (
             <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                <Clock className="w-10 h-10 animate-spin mb-4 opacity-20"/>
                <p className="font-bold uppercase tracking-widest text-xs">Synchronizing Pipeline...</p>
             </div>
         ) : applications.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 opacity-20"/>
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No candidates in this stage</h3>
                <p className="text-sm">Try broadening your filters or checking New Applicants.</p>
             </div>
         ) : (
             <div className="overflow-x-auto">
               <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                          <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Candidate</th>
                          <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Target Role</th>
                          <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stage</th>
                          <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Open Match</th>
                          <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Applied</th>
                          <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {applications.map(app => (
                          <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="py-5 px-8">
                                  <div 
                                    className="flex items-center cursor-pointer candidate-trigger" 
                                    onClick={() => setSelectedCandidateProfile(app)}
                                  >
                                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400 mr-4 overflow-hidden border-2 border-transparent group-hover:border-blue-200 transition-all shadow-sm">
                                          {app.candidate?.avatar_urls?.[0] ? <img src={app.candidate.avatar_urls[0]} className="w-full h-full object-cover"/> : app.candidate?.name?.charAt(0) || '?'}
                                      </div>
                                      <div>
                                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{app.candidate?.name || 'Unknown Candidate'}</div>
                                          <div className="text-xs text-gray-500 font-medium">{app.candidate?.headline}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="py-5 px-8">
                                  <div className="font-bold text-gray-700 text-sm">{app.job?.title || 'Unknown Role'}</div>
                              </td>
                              <td className="py-5 px-8">
                                  <StatusBadge status={app.status} size="sm" />
                              </td>
                              <td className="py-5 px-8">
                                  {app.match_score ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full ${app.match_score >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${app.match_score}%` }}
                                          />
                                        </div>
                                        <span className={`text-sm font-black ${app.match_score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {app.match_score}%
                                        </span>
                                      </div>
                                  ) : '-'}
                              </td>
                              <td className="py-5 px-8 text-sm font-medium text-gray-400">
                                  {new Date(app.created_at || app.last_updated).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </td>
                              <td className="py-5 px-8">
                                  <div className="flex justify-end gap-3 items-center">
                                      <button 
                                        onClick={() => openMessage(app)} 
                                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-blue-100"
                                        title="Send Message"
                                      >
                                          <MessageSquare className="w-5 h-5"/>
                                      </button>
                                      
                                      <div className="relative">
                                          <button 
                                            onClick={() => setOpenActionMenu(openActionMenu === app.id ? null : app.id)}
                                            className={`p-2.5 rounded-xl transition-all border ${
                                              openActionMenu === app.id 
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                                                : 'text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-sm border-transparent hover:border-gray-100'
                                            }`}
                                          >
                                              <MoreHorizontal className="w-5 h-5"/>
                                          </button>
                                          
                                          {openActionMenu === app.id && (
                                            <div 
                                              ref={actionMenuRef}
                                              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                                            >
                                                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Pipeline</p>
                                                </div>
                                                <button onClick={() => handleStatusChange(app.id, 'reviewing')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center transition-colors">
                                                    <Zap className="w-4 h-4 mr-3 text-blue-500"/> Move to Review
                                                </button>
                                                <button onClick={() => handleStatusChange(app.id, 'phone_screen_scheduled')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center transition-colors">
                                                    <Phone className="w-4 h-4 mr-3 text-purple-500"/> Phone Screen
                                                </button>
                                                <button onClick={() => handleStatusChange(app.id, 'technical_scheduled')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center transition-colors">
                                                    <Code className="w-4 h-4 mr-3 text-indigo-500"/> Technical Interview
                                                </button>
                                                <button onClick={() => handleStatusChange(app.id, 'final_round_scheduled')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center transition-colors">
                                                    <Users className="w-4 h-4 mr-3 text-teal-500"/> Final Round
                                                </button>
                                                <button onClick={() => handleStatusChange(app.id, 'offer_extended')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center transition-colors">
                                                    <Gift className="w-4 h-4 mr-3 text-orange-500"/> Extend Offer
                                                </button>
                                                <button onClick={() => handleStatusChange(app.id, 'hired')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center transition-colors">
                                                    <UserCheck className="w-4 h-4 mr-3 text-green-500"/> Mark as Hired
                                                </button>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button onClick={() => { setSelectedAppForReject(app); setShowRejectModal(true); setOpenActionMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center transition-colors">
                                                    <XCircle className="w-4 h-4 mr-3"/> Reject Candidate
                                                </button>
                                            </div>
                                          )}
                                      </div>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
               </table>
             </div>
         )}
      </div>

      {/* Candidate Profile Slide-Out Panel */}
      <div 
        className={`fixed inset-0 z-[60] transition-opacity duration-300 pointer-events-none ${selectedCandidateProfile ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
      >
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" 
          onClick={() => setSelectedCandidateProfile(null)}
        />
        <div 
          ref={profilePanelRef}
          className={`absolute inset-y-0 right-0 w-full md:w-[520px] bg-white shadow-2xl transition-transform duration-500 ease-out transform ${selectedCandidateProfile ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        >
          {selectedCandidateProfile && (
            <>
              {/* Panel Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedCandidateProfile(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Candidate Profile</h2>
                </div>
                <StatusBadge status={selectedCandidateProfile.status} size="md" />
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Identity Card */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-xl mb-6 border-4 border-white">
                    {selectedCandidateProfile.candidate?.avatar_urls?.[0] ? (
                      <img src={selectedCandidateProfile.candidate.avatar_urls[0]} className="w-full h-full object-cover" />
                    ) : (
                      selectedCandidateProfile.candidate?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 leading-tight mb-1">{selectedCandidateProfile.candidate?.name}</h3>
                  <p className="text-blue-600 font-bold text-lg mb-4">{selectedCandidateProfile.candidate?.headline}</p>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-bold text-gray-500 border border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> {selectedCandidateProfile.candidate?.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full text-xs font-bold text-green-700 border border-green-100">
                      <DollarSign className="w-3.5 h-3.5" /> {selectedCandidateProfile.candidate?.salary_currency || 'USD'} {selectedCandidateProfile.candidate?.salary_min?.toLocaleString() || 'Open'}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full text-xs font-bold text-purple-700 border border-purple-100">
                      <Clock className="w-3.5 h-3.5" /> {selectedCandidateProfile.candidate?.timezone || 'UTC'}
                    </span>
                  </div>
                </div>

                {/* Match Score */}
                <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 p-24 bg-blue-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Precision Match Score</h4>
                      <p className="text-gray-400 text-sm font-medium">Based on your requirements</p>
                    </div>
                    <div className="text-5xl font-black tabular-nums">{selectedCandidateProfile.match_score}%</div>
                  </div>
                  <div className="relative z-10 mt-6 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${selectedCandidateProfile.match_score}%` }} />
                  </div>
                </div>

                {/* About Section */}
                {selectedCandidateProfile.candidate?.bio && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                      <User className="w-3 h-3 mr-2" /> Professional Narrative
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                      {selectedCandidateProfile.candidate.bio}
                    </p>
                  </div>
                )}

                {/* Skills Grid */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                    <Zap className="w-3 h-3 mr-2 text-yellow-500" /> Technical Proficiency
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedCandidateProfile.candidate?.skills?.map((skill: any, i: number) => (
                      <div key={i} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800 text-sm">{skill.name}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getSkillLevelColor(skill.level)}`}>
                            {getSkillLevelLabel(skill.level)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <div key={lvl} className={`h-1.5 flex-1 rounded-full ${lvl <= skill.level ? 'bg-blue-600' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">{skill.years}Y Industry Experience</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Timeline */}
                {selectedCandidateProfile.candidate?.experience?.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                      <Briefcase className="w-3 h-3 mr-2" /> Career History
                    </h4>
                    <div className="space-y-8 pl-2">
                      {selectedCandidateProfile.candidate.experience.map((exp: any, i: number) => (
                        <div key={i} className="relative pl-6 border-l-2 border-gray-100 pb-1">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-sm" />
                          <h5 className="font-bold text-gray-900 text-sm">{exp.role}</h5>
                          <div className="text-blue-600 text-xs font-bold mb-2">{exp.company}</div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                            {exp.startDate} — {exp.isCurrentRole ? 'Present' : exp.endDate}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedCandidateProfile.candidate?.education_level && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                      <GraduationCap className="w-3 h-3 mr-2" /> Education
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="font-bold text-gray-900 text-sm">{selectedCandidateProfile.candidate.education_level}</div>
                      <div className="text-gray-500 text-xs font-medium">{selectedCandidateProfile.candidate.education_field}</div>
                      <div className="text-gray-400 text-[10px] font-bold mt-1 uppercase">{selectedCandidateProfile.candidate.education_institution}</div>
                    </div>
                  </div>
                )}

                {/* Values & Culture */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                      <Heart className="w-3 h-3 mr-2 text-pink-500" /> Values
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidateProfile.candidate?.values_list?.map((v: string) => (
                        <span key={v} className="px-3 py-1 bg-pink-50 text-pink-700 text-[10px] font-black rounded-full border border-pink-100">{v}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                      <Star className="w-3 h-3 mr-2 text-orange-500" /> Traits
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidateProfile.candidate?.character_traits?.map((t: string) => (
                        <span key={t} className="px-3 py-1 bg-orange-50 text-orange-700 text-[10px] font-black rounded-full border border-orange-100">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-20" /> {/* Spacer */}
              </div>

              {/* Panel Footer Actions */}
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] grid grid-cols-2 gap-4 sticky bottom-0 z-10">
                <button 
                  onClick={() => openMessage(selectedCandidateProfile)}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button 
                  onClick={() => {/* Mock scheduling */ alert('Redirecting to Schedule...'); }}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                  <Calendar className="w-4 h-4" /> Schedule
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-200">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                    <XCircle className="w-8 h-8 text-red-600"/>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Reject Candidate</h3>
                  <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    This will update {selectedAppForReject?.candidate?.name || 'the candidate'}'s status to Rejected. They will be notified through their Application Hub.
                  </p>
                  
                  <div className="mb-8">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rejection Feedback (Optional)</label>
                    <textarea
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-32 text-sm font-medium focus:ring-2 focus:ring-red-100 focus:bg-white outline-none transition-all resize-none"
                      placeholder="Provide specific feedback to help the candidate improve..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                      <button 
                        onClick={() => { setShowRejectModal(false); setSelectedAppForReject(null); }} 
                        className="flex-1 px-6 py-4 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-50 rounded-2xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleReject} 
                        className="flex-1 px-6 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-700 shadow-lg active:scale-95 transition-all"
                      >
                        Confirm Rejection
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RecruiterATS;
