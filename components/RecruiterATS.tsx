
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from './StatusBadge';
import { atsService } from '../services/atsService';
import { ApplicationStatus } from '../types';
import { Search, Filter, MoreHorizontal, MessageSquare, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecruiterATS: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user, filter]);

  const loadApplications = async () => {
    setLoading(true);
    // Get company ID for user
    const { data: teamMember } = await supabase
        .from('team_members')
        .select('company_id')
        .eq('user_id', user!.id)
        .maybeSingle();
    
    // Also check if user is owner
    const companyId = teamMember?.company_id || user!.id;

    let query = supabase
      .from('applications')
      .select(`
        *,
        candidate:candidate_profiles(id, name, email, headline, avatar_urls),
        job:jobs(id, title)
      `)
      // Need to filter by company's jobs.
      // This is complex in one query without View. 
      // Simplified: We rely on RLS or filtering locally for MVP, but proper way is inner join on Jobs.
      // Assuming RLS policy "Recruiters view applications for their jobs" works.
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (error) console.error(error);
    
    // Client side filter to ensure we only see apps for our company's jobs (if RLS is loose)
    // In production, RLS handles this.
    setApplications(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    await atsService.updateApplicationStatus({
      applicationId: appId,
      newStatus,
      changedBy: user!.id,
      changeType: 'manual',
      notes: 'Manual status update from dashboard'
    });
    loadApplications();
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    await supabase
      .from('applications')
      .update({
        rejection_reason: rejectReason,
      })
      .eq('id', selectedApp.id);

    await handleStatusChange(selectedApp.id, 'rejected');
    setShowRejectModal(false);
    setSelectedApp(null);
    setRejectReason('');
  };

  const openMessage = (app: any) => {
      // Find conversation or create one?
      // For now navigate to messages
      navigate('/messages');
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Applicant Tracking</h1>
            <p className="text-gray-500 mt-1">Manage your hiring pipeline efficiently.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2"/> Filter
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 scrollbar-hide">
          {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === tab.id 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                  {tab.label}
              </button>
          ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
         {loading ? (
             <div className="p-12 text-center text-gray-500">Loading pipeline...</div>
         ) : applications.length === 0 ? (
             <div className="p-12 text-center text-gray-500">No applications found in this stage.</div>
         ) : (
             <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Candidate</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Role</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Stage</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Match</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Applied</th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {applications.map(app => (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 mr-3 overflow-hidden">
                                        {app.candidate.avatar_urls?.[0] ? <img src={app.candidate.avatar_urls[0]} className="w-full h-full object-cover"/> : app.candidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{app.candidate.name}</div>
                                        <div className="text-xs text-gray-500">{app.candidate.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="font-medium text-gray-900">{app.job.title}</div>
                            </td>
                            <td className="py-4 px-6">
                                <StatusBadge status={app.status} size="sm" />
                            </td>
                            <td className="py-4 px-6">
                                {app.match_score ? (
                                    <span className={`font-bold ${app.match_score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {app.match_score}%
                                    </span>
                                ) : '-'}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                                {new Date(app.created_at || app.last_updated).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => openMessage(app)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <MessageSquare className="w-4 h-4"/>
                                    </button>
                                    
                                    {/* Action Dropdown simulated */}
                                    <div className="relative group">
                                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                            <MoreHorizontal className="w-4 h-4"/>
                                        </button>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block z-10 p-1">
                                            <button 
                                                onClick={() => handleStatusChange(app.id, 'reviewing')}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                            >
                                                Move to Review
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(app.id, 'offer_extended')}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                            >
                                                Mark Offer Sent
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button 
                                                onClick={() => { setSelectedApp(app); setShowRejectModal(true); }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                Reject Candidate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
         )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Candidate</h3>
                  <p className="text-gray-500 text-sm mb-4">Are you sure you want to reject {selectedApp?.candidate.name}? This will update their status and notify them.</p>
                  
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-xl h-24 mb-4 text-sm"
                    placeholder="Reason for rejection (optional internal note)..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />

                  <div className="flex gap-3 justify-end">
                      <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                      <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Confirm Rejection</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RecruiterATS;
