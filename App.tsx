
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import CandidateProfileForm from './components/CandidateProfileForm';
import CompanyProfile from './components/CompanyProfile';
import JobCard from './components/JobCard';
import JobDetails from './components/JobDetails';
import CandidateCard from './components/CandidateCard';
import CandidateDetails from './components/CandidateDetails';
import ATSBoard from './components/ATSBoard';
import CandidateApplications from './components/CandidateApplications';
import Messages from './components/Messages';
import Schedule from './components/Schedule';
import CreateJob from './components/CreateJob';
import Notifications from './components/Notifications';
import Network from './components/Network';
import Login from './components/Login';
import { Role, CandidateProfile, JobPosting, Application, JobType, WorkMode, Notification, CompanyProfile as CompanyProfileType, Connection, TeamMember } from './types';
import { User, Briefcase } from 'lucide-react';

// --- DATA MAPPERS ---
// These functions translate between Supabase (snake_case) and App (camelCase)

const mapCandidateFromDB = (data: any): CandidateProfile => ({
    id: data.id,
    name: data.name || '',
    headline: data.headline || '',
    email: data.email || '',
    location: data.location || '',
    avatarUrls: data.avatar_urls || [],
    videoIntroUrl: data.video_intro_url,
    themeColor: data.theme_color || 'blue',
    themeFont: data.theme_font || 'sans',
    bio: data.bio || '',
    status: data.status || 'not_looking',
    characterTraits: data.character_traits || [],
    legalStatus: data.legal_status || '',
    contractTypes: data.contract_types || [],
    currentBonuses: data.current_bonuses || '',
    experience: data.experience || [],
    certificates: data.certificates || [],
    portfolio: data.portfolio || [],
    references: data.references_list || [], // Mapped from references_list
    noticePeriod: data.notice_period || '',
    skills: data.skills || [],
    values: data.values_list || [], // Mapped from values_list
    ambitions: data.ambitions || '',
    salaryExpectation: data.salary_expectation || '',
    preferredWorkMode: data.preferred_work_mode || [],
    desiredPerks: data.desired_perks || [],
    nonNegotiables: data.non_negotiables || [],
    resumeText: data.resume_text,
    isUnlocked: data.is_unlocked || false,
    matchScore: data.match_score,
    connections: data.connections
});

const mapCandidateToDB = (profile: CandidateProfile) => ({
    id: profile.id,
    name: profile.name,
    headline: profile.headline,
    email: profile.email,
    location: profile.location,
    avatar_urls: profile.avatarUrls,
    video_intro_url: profile.videoIntroUrl,
    theme_color: profile.themeColor,
    theme_font: profile.themeFont,
    bio: profile.bio,
    status: profile.status,
    character_traits: profile.characterTraits,
    legal_status: profile.legalStatus,
    contract_types: profile.contractTypes,
    current_bonuses: profile.currentBonuses,
    experience: profile.experience,
    certificates: profile.certificates,
    portfolio: profile.portfolio,
    references_list: profile.references, // Map back to references_list
    notice_period: profile.noticePeriod,
    skills: profile.skills,
    values_list: profile.values, // Map back to values_list
    ambitions: profile.ambitions,
    salary_expectation: profile.salaryExpectation,
    preferred_work_mode: profile.preferredWorkMode,
    desired_perks: profile.desiredPerks,
    non_negotiables: profile.nonNegotiables,
    is_unlocked: profile.isUnlocked
});

const mapCompanyFromDB = (data: any): CompanyProfileType => ({
    id: data.id,
    companyName: data.company_name || '',
    industry: data.industry || '',
    size: data.size || '',
    website: data.website || '',
    location: data.location || '',
    about: data.about || '',
    paymentMethod: data.payment_method,
    logoUrl: data.logo_url
});

const mapCompanyToDB = (profile: CompanyProfileType) => ({
    id: profile.id,
    company_name: profile.companyName,
    industry: profile.industry,
    size: profile.size,
    website: profile.website,
    location: profile.location,
    about: profile.about,
    payment_method: profile.paymentMethod,
    logo_url: profile.logoUrl
});

const mapJobFromDB = (data: any): JobPosting => ({
    id: data.id,
    company_id: data.company_id,
    companyName: data.company_name || '',
    companyLogo: data.company_logo, // If you join with company profile
    title: data.title,
    description: data.description,
    location: data.location,
    salaryRange: data.salary_range,
    seniority: data.seniority,
    startDate: data.start_date,
    workMode: data.work_mode,
    requiredSkills: data.required_skills || [],
    values: data.values_list || [],
    perks: data.perks || [],
    postedDate: data.posted_date,
    status: data.status,
    approvals: data.approvals
});

const mapJobToDB = (job: JobPosting) => ({
    company_id: job.company_id,
    company_name: job.companyName,
    title: job.title,
    description: job.description,
    location: job.location,
    salary_range: job.salaryRange,
    seniority: job.seniority,
    start_date: job.startDate,
    work_mode: job.workMode,
    required_skills: job.requiredSkills,
    values_list: job.values,
    perks: job.perks,
    status: job.status,
    approvals: job.approvals,
    posted_date: job.postedDate
});

// --- MAIN APP ---

function MainApp() {
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<Role>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Data State
  const [credits, setCredits] = useState(5);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidatesList, setCandidatesList] = useState<CandidateProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // B2B State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Profiles
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileType | null>(null);

  // Selections
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (user) {
        fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
      if (userRole) {
          fetchData();
      }
  }, [userRole]);

  const fetchUserProfile = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();

        if (data) {
            if (data.role) {
                setUserRole(data.role as Role);
                if (data.role === 'candidate') {
                     const { data: cand } = await supabase.from('candidate_profiles').select('*').eq('id', user?.id).single();
                     if (cand) setCandidateProfile(mapCandidateFromDB(cand));
                } else {
                     const { data: comp } = await supabase.from('company_profiles').select('*').eq('id', user?.id).single();
                     if (comp) {
                         setCompanyProfile(mapCompanyFromDB(comp));
                         const { data: team } = await supabase.from('team_members').select('*').eq('company_id', comp.id);
                         if (team) setTeamMembers(team as TeamMember[]);
                     }
                }
            } else {
                setUserRole(null);
            }
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    } finally {
        setIsLoadingProfile(false);
    }
  };

  const fetchData = async () => {
      // 1. Fetch Jobs
      const { data: jobs } = await supabase.from('jobs').select('*');
      if (jobs) setJobPostings(jobs.map(mapJobFromDB));

      // 2. Fetch Applications
      if (user) {
        if (userRole === 'candidate') {
            const { data: apps } = await supabase.from('applications').select('*').eq('candidate_id', user.id);
            if (apps) setApplications(apps.map(a => ({
                id: a.id,
                jobId: a.job_id,
                candidateId: a.candidate_id,
                status: a.status,
                matchScore: a.match_score,
                lastUpdated: a.last_updated
            })));
        } else {
             const { data: apps } = await supabase.from('applications').select('*');
             if (apps) setApplications(apps.map(a => ({
                 id: a.id,
                 jobId: a.job_id,
                 candidateId: a.candidate_id,
                 status: a.status,
                 matchScore: a.match_score,
                 lastUpdated: a.last_updated
             })));
        }
      }

      // 3. Fetch Candidates
      if (userRole === 'recruiter') {
          const { data: cands } = await supabase.from('candidate_profiles').select('*');
          if (cands) setCandidatesList(cands.map(mapCandidateFromDB));
      }
  };

  const handleCreateProfile = async (role: Role) => {
      if (!user) return;
      try {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', user.id);

          if (profileError) throw profileError;
          
          if (role === 'candidate') {
              const newProfile: CandidateProfile = {
                  id: user.id,
                  name: user.email?.split('@')[0] || 'Candidate',
                  headline: 'New Member',
                  email: user.email!,
                  location: '',
                  status: 'actively_looking',
                  skills: [],
                  experience: [],
                  portfolio: [],
                  references: [],
                  avatarUrls: [],
                  contractTypes: [JobType.FULL_TIME],
                  preferredWorkMode: [WorkMode.REMOTE],
                  characterTraits: [],
                  values: [],
                  nonNegotiables: [],
                  desiredPerks: [],
                  themeColor: 'blue',
                  themeFont: 'sans',
                  bio: '',
                  legalStatus: '',
                  currentBonuses: '',
                  noticePeriod: '',
                  ambitions: '',
                  salaryExpectation: ''
              };
              // Map to DB format before sending
              await supabase.from('candidate_profiles').upsert([mapCandidateToDB(newProfile)]);
              setCandidateProfile(newProfile);
          } else {
               const newProfile: CompanyProfileType = {
                   id: user.id,
                   companyName: 'New Company',
                   about: '',
                   location: '',
                   industry: '',
                   size: '1-10',
                   website: ''
               };
               // Map to DB format before sending
               await supabase.from('company_profiles').upsert([mapCompanyToDB(newProfile)]);
               setCompanyProfile(newProfile);
          }

          setUserRole(role);
      } catch (e) {
          console.error("Error creating profile", e);
          alert("Error setting up profile. Please try again or refresh.");
      }
  };

  const handleUpdateCandidate = async (profile: CandidateProfile) => {
      setCandidateProfile(profile);
      await supabase.from('candidate_profiles').update(mapCandidateToDB(profile)).eq('id', user?.id);
  };

  const handleUpdateCompany = async (profile: CompanyProfileType) => {
      setCompanyProfile(profile);
      await supabase.from('company_profiles').update(mapCompanyToDB(profile)).eq('id', user?.id);
  };

  const handlePublishJob = async (job: JobPosting) => {
      const newJob = { ...job, company_id: user?.id, postedDate: new Date().toISOString() };
      const { data, error } = await supabase.from('jobs').insert([mapJobToDB(newJob)]).select();
      
      if (data) {
          setJobPostings([mapJobFromDB(data[0]), ...jobPostings]);
          setCurrentView('dashboard');
      } else if (error) {
          console.error("Error publishing job", error);
          alert("Failed to publish job. Ensure you are logged in as a company.");
      }
  };

  const handleApproveJob = async (jobId: string, role: 'hiringManager' | 'finance') => {
      const updatedJobs = jobPostings.map(j => {
          if (j.id === jobId && j.approvals) {
              const newApprovals = { ...j.approvals, [role]: { ...j.approvals[role], status: 'approved' } };
              let status = j.status;
              const hmApproved = role === 'hiringManager' || newApprovals.hiringManager?.status === 'approved';
              const finApproved = role === 'finance' || newApprovals.finance?.status === 'approved';
              if (hmApproved && finApproved) status = 'published';

              return { ...j, approvals: newApprovals, status: status as any };
          }
          return j;
      });
      setJobPostings(updatedJobs);
      if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob(updatedJobs.find(j => j.id === jobId) || null);
      }
      
      const job = updatedJobs.find(j => j.id === jobId);
      if (job) {
          await supabase.from('jobs').update({ approvals: job.approvals, status: job.status }).eq('id', jobId);
      }
  };

  const handleApply = async (jobId: string) => {
      if (!user) return;
      const newApp = {
          job_id: jobId,
          candidate_id: user.id,
          status: 'applied',
          match_score: 0, 
          last_updated: new Date().toISOString()
      };
      
      const { data, error } = await supabase.from('applications').insert([newApp]).select();
      if (data) {
        setApplications([...applications, {
             id: data[0].id,
             jobId: data[0].job_id,
             candidateId: data[0].candidate_id,
             status: data[0].status,
             matchScore: data[0].match_score,
             lastUpdated: data[0].last_updated
        }]);
        alert("Application sent!");
      } else {
        console.error(error);
        alert("Failed to apply. You might have already applied.");
      }
  };

  const handleUnlockCandidate = (id: string) => {
      if (credits > 0) {
          setCredits(c => c - 1);
          setCandidatesList(prev => prev.map(c => c.id === id ? { ...c, isUnlocked: true } : c));
          // In real app, persist unlock to DB
      }
  };

  if (isLoadingProfile) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div></div>;
  }

  if (!userRole) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
              <div className="max-w-2xl w-full text-center mb-12">
                  <h1 className="text-4xl font-black text-gray-900 mb-4">Welcome to Open</h1>
                  <p className="text-xl text-gray-500">To get started, please tell us what brings you here.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                  <button onClick={() => handleCreateProfile('candidate')} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-gray-900 hover:shadow-xl transition-all group text-left">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                          <User className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">I'm Talent</h3>
                      <p className="text-gray-500">I'm looking for a job where my skills and values are appreciated.</p>
                  </button>
                  <button onClick={() => handleCreateProfile('recruiter')} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-gray-900 hover:shadow-xl transition-all group text-left">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                          <Briefcase className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">I'm Hiring</h3>
                      <p className="text-gray-500">I'm looking for high-quality candidates with precise alignment.</p>
                  </button>
              </div>
              <button onClick={signOut} className="mt-12 text-gray-400 hover:text-gray-600 text-sm">Sign out</button>
          </div>
      );
  }

  const renderContent = () => {
      switch (currentView) {
          case 'profile':
              if (userRole === 'recruiter' && companyProfile) {
                  return <CompanyProfile profile={companyProfile} onSave={handleUpdateCompany} />;
              }
              if (userRole === 'candidate' && candidateProfile) {
                return <CandidateProfileForm profile={candidateProfile} onSave={handleUpdateCandidate} />;
              }
              return <div className="text-center p-10">Loading profile data...</div>;
          case 'network':
              return <Network connections={connections} />;
          case 'messages':
              return <Messages />;
          case 'schedule':
              return <Schedule />;
          case 'notifications':
              return <Notifications notifications={notifications} />;
          case 'create-job':
              return <CreateJob onPublish={handlePublishJob} onCancel={() => setCurrentView('dashboard')} teamMembers={teamMembers} />;
          case 'job-details':
              return selectedJob && candidateProfile ? (
                <JobDetails 
                    job={selectedJob} 
                    onBack={() => setCurrentView('dashboard')} 
                    onApply={handleApply} 
                    teamMembers={teamMembers}
                    onApprove={handleApproveJob}
                />
               ) : null;
          case 'candidate-details':
              return selectedCandidate ? (
                <CandidateDetails 
                    candidate={selectedCandidate} 
                    onBack={() => setCurrentView('dashboard')} 
                    onUnlock={handleUnlockCandidate}
                    onMessage={() => setCurrentView('messages')}
                    onSchedule={() => setCurrentView('schedule')}
                /> 
              ) : null;
          case 'ats':
              if (userRole === 'candidate') {
                  return <CandidateApplications applications={applications} jobs={jobPostings} onViewMessage={() => setCurrentView('messages')}/>;
              }
              return (
                  <div className="max-w-7xl mx-auto px-4 py-8">
                     <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Tracker</h2>
                     <ATSBoard applications={applications} jobs={jobPostings} candidates={candidatesList} />
                  </div>
              );
          case 'dashboard':
          default:
              if (userRole === 'candidate') {
                  return (
                      <div className="max-w-7xl mx-auto px-4 py-8">
                          <div className="mb-8">
                              <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended for you</h1>
                              <p className="text-gray-500">Based on your profile, values, and experience.</p>
                          </div>
                          {jobPostings.length === 0 && <p className="text-center text-gray-500 py-10">No jobs posted yet.</p>}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {jobPostings.filter(j => j.status === 'published').map(job => (
                                  <JobCard 
                                    key={job.id} 
                                    job={job} 
                                    candidateProfile={candidateProfile!} 
                                    onApply={handleApply} 
                                    onViewDetails={(j) => { setSelectedJob(j); setCurrentView('job-details'); }}
                                    connections={connections}
                                  />
                              ))}
                          </div>
                      </div>
                  );
              } else {
                  return (
                      <div className="max-w-7xl mx-auto px-4 py-8">
                          <div className="flex justify-between items-center mb-8">
                              <div>
                                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Talent Pool</h1>
                                  <p className="text-gray-500">High-intent candidates matching your open roles.</p>
                              </div>
                              <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                                  {credits} Credits Remaining
                              </div>
                          </div>
                          {candidatesList.length === 0 && <p className="text-center text-gray-500 py-10">No candidates available yet.</p>}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {candidatesList.map(c => (
                                  <CandidateCard 
                                    key={c.id} 
                                    candidate={c} 
                                    onUnlock={handleUnlockCandidate} 
                                    onMessage={() => setCurrentView('messages')}
                                    onSchedule={() => setCurrentView('schedule')}
                                    onViewProfile={(c) => { setSelectedCandidate(c); setCurrentView('candidate-details'); }}
                                  />
                              ))}
                          </div>
                      </div>
                  );
              }
      }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navigation 
        role={userRole} 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onLogout={signOut}
        notificationCount={notifications.length}
      />
      <div className="pt-6 pb-20 md:pb-6">
          {renderContent()}
      </div>
    </div>
  );
}

export default function App() {
  return (
      <HashRouter>
        <AuthProvider>
            <AuthWrapper />
        </AuthProvider>
      </HashRouter>
  );
}

function AuthWrapper() {
    const { session, loading } = useAuth();
    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    return session ? <MainApp /> : <Login />;
}
