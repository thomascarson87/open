
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import CandidateProfileForm from './components/CandidateProfileForm';
import CompanyProfile from './components/CompanyProfile';
import JobCard from './components/JobCard';
import JobDetails from './components/JobDetails';
import CandidateCard from './components/CandidateCard';
import CandidateDetails from './components/CandidateDetails';
import CandidateDetailsLocked from './components/CandidateDetailsLocked';
import RecruiterATS from './components/RecruiterATS';
import CandidateApplications from './components/CandidateApplications';
import Messages from './components/Messages';
import Schedule from './components/Schedule';
import CreateJob from './components/CreateJob';
import Notifications from './components/Notifications';
import Network from './components/Network';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import { Role, CandidateProfile, JobPosting, Notification, CompanyProfile as CompanyProfileType, Connection, TeamMember } from './types';
import { Loader2 } from 'lucide-react';

// Mock mappers for compilation
const mapJobFromDB = (data: any): JobPosting => ({ ...data, requiredSkills: data.required_skills || [], values: data.values_list || [] });
const mapCandidateFromDB = (data: any): CandidateProfile => ({ ...data, avatarUrls: data.avatar_urls || [], skills: data.skills || [] });
const mapCompanyFromDB = (data: any): CompanyProfileType => ({ ...data, logoUrl: data.logo_url });

function MainApp() {
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<Role>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Data State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidatesList, setCandidatesList] = useState<CandidateProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileType | null>(null);

  // Selections
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (user) {
        fetchUserProfile();
        fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
      if (userRole) {
          fetchData();
      }
  }, [userRole]);

  const fetchUserProfile = async () => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user?.id).maybeSingle(); 
        if (data && data.role) {
             setUserRole(data.role as Role);
             loadRoleData(data.role as Role);
        } else {
             const pendingRole = localStorage.getItem('open_selected_role');
             if (pendingRole && (pendingRole === 'candidate' || pendingRole === 'recruiter')) {
                 await handleCreateProfile(pendingRole as Role);
                 localStorage.removeItem('open_selected_role');
             } else {
                 setUserRole(null);
                 setIsLoadingProfile(false);
             }
        }
    } catch (error) {
        setIsLoadingProfile(false);
    }
  };

  const fetchNotifications = async () => {
      if (!user) return;
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) {
          setNotifications(data.map((n: any) => ({
              id: n.id,
              title: n.title,
              description: n.description,
              type: n.type,
              isRead: n.is_read,
              timestamp: n.created_at,
              link: n.link,
              metadata: n.metadata
          })));
      }
  };

  const loadRoleData = async (role: Role) => {
        try {
            if (role === 'candidate') {
                    const { data: cand } = await supabase.from('candidate_profiles').select('*').eq('id', user?.id).maybeSingle();
                    if (cand) setCandidateProfile(mapCandidateFromDB(cand));
            } else {
                    const { data: comp } = await supabase.from('company_profiles').select('*').eq('id', user?.id).maybeSingle();
                    if (comp) setCompanyProfile(mapCompanyFromDB(comp));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingProfile(false);
        }
  };

  const fetchData = async () => {
      const { data: jobs } = await supabase.from('jobs').select('*');
      if (jobs) setJobPostings(jobs.map(mapJobFromDB));
      if (userRole === 'recruiter') {
          const { data: cands } = await supabase.from('candidate_profiles').select('*');
          if (cands) setCandidatesList(cands.map(mapCandidateFromDB));
      }
  };

  const handleCreateProfile = async (role: Role) => {
      if (!user) return;
      try {
          setIsLoadingProfile(true);
          await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: role });
          setUserRole(role);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingProfile(false);
      }
  };

  // Handlers
  const handleUpdateCandidate = async (profile: CandidateProfile) => {
      /* Update logic would go here */
      setCandidateProfile(profile);
      setCurrentView('dashboard');
  };
  const handleUpdateCompany = async (profile: CompanyProfileType) => {
      /* Update logic would go here */
      setCompanyProfile(profile);
      setCurrentView('dashboard');
  };
  const handlePublishJob = async (job: JobPosting) => { setCurrentView('dashboard'); };
  const handleUnlockCandidate = (id: string) => { 
      setCandidatesList(prev => prev.map(c => c.id === id ? { ...c, isUnlocked: true } : c));
  };
  const handleApply = async (jobId: string) => { 
      // This is handled in JobDetails usually, or we show a toast here
  };

  if (isLoadingProfile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;

  if (!userRole) return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Complete Your Setup</h2>
          <p className="text-gray-500 mb-8">It looks like your profile role isn't set.</p>
          <div className="flex gap-4">
              <button onClick={() => handleCreateProfile('candidate')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">I'm Talent</button>
              <button onClick={() => handleCreateProfile('recruiter')} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold">I'm Hiring</button>
          </div>
          <button onClick={signOut} className="mt-8 text-gray-400 text-sm underline">Sign Out</button>
      </div>
  );

  const renderContent = () => {
      switch (currentView) {
          case 'profile':
              return userRole === 'recruiter' && companyProfile ? <CompanyProfile profile={companyProfile} onSave={handleUpdateCompany} /> : <CandidateProfileForm profile={candidateProfile!} onSave={handleUpdateCandidate} />;
          case 'network': return <Network connections={connections} />;
          case 'messages': return <Messages />;
          case 'schedule': return <Schedule />;
          case 'notifications': return <Notifications notifications={notifications} />;
          case 'create-job': return <CreateJob onPublish={handlePublishJob} onCancel={() => setCurrentView('dashboard')} teamMembers={teamMembers} />;
          case 'job-details': return selectedJob ? <JobDetails job={selectedJob} onBack={() => setCurrentView('dashboard')} onApply={handleApply} /> : null;
          case 'candidate-details': return selectedCandidate ? (
             userRole === 'recruiter' && !selectedCandidate.isUnlocked ? 
             <CandidateDetailsLocked candidate={selectedCandidate} onUnlock={handleUnlockCandidate} onBack={() => setCurrentView('dashboard')} /> :
             <CandidateDetails candidate={selectedCandidate} onBack={() => setCurrentView('dashboard')} onUnlock={handleUnlockCandidate} onMessage={() => setCurrentView('messages')} onSchedule={() => setCurrentView('schedule')} />
          ) : null;
          case 'ats': return userRole === 'candidate' ? <CandidateApplications jobs={jobPostings} onViewMessage={() => setCurrentView('messages')} /> : <RecruiterATS />;
          default: return userRole === 'candidate' ? 
            <div className="max-w-7xl mx-auto px-4 py-8">
                {jobPostings.map(job => <JobCard key={job.id} job={job} candidateProfile={candidateProfile!} onApply={handleApply} onViewDetails={(j) => { setSelectedJob(j); setCurrentView('job-details'); }} />)}
            </div> : 
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {candidatesList.map(c => <CandidateCard key={c.id} candidate={c} onUnlock={handleUnlockCandidate} onMessage={() => setCurrentView('messages')} onSchedule={() => setCurrentView('schedule')} onViewProfile={(c) => { setSelectedCandidate(c); setCurrentView('candidate-details'); }} />)}
            </div>;
      }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navigation role={userRole} currentView={currentView} setCurrentView={setCurrentView} onLogout={signOut} notificationCount={notifications.filter(n => !n.isRead).length} />
      <div className="pt-6 pb-20 md:pb-6">{renderContent()}</div>
    </div>
  );
}

function AuthWrapper() {
    const { session, loading } = useAuth();
    // Check local storage for pre-selected role (persists across reloads on login screen)
    const [selectedRole, setSelectedRole] = useState<Role>(() => {
        const stored = localStorage.getItem('open_selected_role');
        return (stored === 'candidate' || stored === 'recruiter') ? stored : null;
    });

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

    if (session) return <MainApp />;

    // If a role is selected (but not logged in), show Login
    if (selectedRole) {
        return (
            <Login 
                selectedRole={selectedRole} 
                onBack={() => {
                    localStorage.removeItem('open_selected_role');
                    setSelectedRole(null);
                }} 
            />
        );
    }

    // Default to Landing Page
    return (
        <LandingPage 
            onSelectRole={(r) => { 
                localStorage.setItem('open_selected_role', r); 
                setSelectedRole(r); 
            }} 
        />
    );
}

export default function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                <Route path="/*" element={<AuthWrapper />} />
            </Routes>
        </AuthProvider>
      </BrowserRouter>
  );
}
