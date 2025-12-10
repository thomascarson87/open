
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
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
import TalentMatcher from './components/TalentMatcher';
import RecruiterMyJobs from './components/RecruiterMyJobs';
import { Role, CandidateProfile, JobPosting, Notification, CompanyProfile as CompanyProfileType, Connection, TeamMember } from './types';
import { Loader2 } from 'lucide-react';
import { messageService } from './services/messageService';

// Mappers with strict default values to prevent "undefined includes" crashes
const mapJobFromDB = (data: any): JobPosting => ({ 
    ...data, 
    id: data.id,
    company_id: data.company_id,
    companyName: data.company_name,
    companyLogo: data.company_logo,
    title: data.title,
    description: data.description,
    location: data.location,
    salaryRange: data.salary_range,
    salaryMin: data.salary_min,
    salaryMax: data.salary_max,
    salaryCurrency: data.salary_currency || 'USD',
    seniority: data.seniority,
    contractTypes: data.contract_types || [],
    startDate: data.start_date,
    workMode: data.work_mode || 'Remote',
    postedDate: data.posted_date || data.created_at,
    status: data.status,
    approvals: data.approvals,

    requiredSkills: data.required_skills || [], 
    values: data.values_list || [],
    perks: data.perks || [],
    desiredTraits: data.desired_traits || [],
    requiredTraits: data.required_traits || [],
    
    // 🆕 PHASE 1 FIELDS
    companyIndustry: data.company_industry || [],
    required_education_level: data.required_education_level,
    preferred_education_level: data.preferred_education_level,
    education_required: data.education_required || false,
    desired_myers_briggs: data.desired_myers_briggs || [],
    desired_disc_profile: data.desired_disc_profile,
    responsibilities: data.responsibilities || [],
    impact_statement: data.impact_statement,
    key_deliverables: data.key_deliverables || [],
    success_metrics: data.success_metrics || [],
    team_structure: data.team_structure,
    growth_opportunities: data.growth_opportunities,
    tech_stack: data.tech_stack || [],
    is_mock_data: data.is_mock_data || false,
    mock_data_seed: data.mock_data_seed
});

const mapCandidateFromDB = (data: any): CandidateProfile => ({ 
    ...data, 
    id: data.id,
    name: data.name,
    headline: data.headline,
    email: data.email,
    location: data.location,
    avatarUrls: data.avatar_urls || [], 
    videoIntroUrl: data.video_intro_url,
    themeColor: data.theme_color,
    themeFont: data.theme_font,
    bio: data.bio,
    status: data.status,
    
    // Fix skills mapping to ensure 'years' property exists (handle dirty data with 'minimumYears')
    skills: (data.skills || []).map((s: any) => ({
      name: s.name,
      years: s.years !== undefined ? s.years : (s.minimumYears || 0),
      weight: s.weight // Keep optional weight if present
    })),

    contractTypes: data.contract_types || [],
    preferredWorkMode: data.preferred_work_mode || [],
    desiredPerks: data.desired_perks || [],
    interestedIndustries: data.interested_industries || [],
    characterTraits: data.character_traits || [],
    values: data.values_list || [],
    nonNegotiables: data.non_negotiables || [],
    portfolio: data.portfolio || [],
    references: data.references_list || [],
    experience: data.experience || [],
    desiredSeniority: data.desired_seniority || [],
    
    salaryExpectation: data.salary_expectation,
    salaryMin: data.salary_min,
    salaryCurrency: data.salary_currency,
    legalStatus: data.legal_status,
    currentBonuses: data.current_bonuses,
    noticePeriod: data.notice_period,
    ambitions: data.ambitions,
    isUnlocked: data.is_unlocked,

    // 🆕 PHASE 1 FIELDS
    education_level: data.education_level,
    education_field: data.education_field,
    education_institution: data.education_institution,
    myers_briggs: data.myers_briggs,
    disc_profile: data.disc_profile || { D: 0, I: 0, S: 0, C: 0 },
    enneagram_type: data.enneagram_type,
    assessment_completed_at: data.assessment_completed_at,
    is_mock_data: data.is_mock_data || false,
    mock_data_seed: data.mock_data_seed
});

const mapCompanyFromDB = (data: any): CompanyProfileType => ({ 
    ...data, 
    companyName: data.company_name,
    logoUrl: data.logo_url,
    industry: data.industry || [], 
    values: data.values || [],
    perks: data.perks || [],
    desiredTraits: data.desired_traits || [],
    billing_plan: data.billing_plan || 'pay_per_hire',
    credits: data.credits || 0,
    
    // 🆕 PHASE 1 FIELDS
    is_mock_data: data.is_mock_data || false,
    mock_data_seed: data.mock_data_seed
});

function MainApp() {
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<Role>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  // Handle URL based routing for direct links
  useEffect(() => {
      const view = searchParams.get('view');
      if (view) {
          setCurrentView(view);
      }
  }, [searchParams]);

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
                    
                    // Load team members
                    const { data: team } = await supabase.from('team_members').select('*').eq('company_id', user?.id);
                    if (team) setTeamMembers(team);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingProfile(false);
        }
  };

  const fetchData = async () => {
      console.log('🔍 [App] fetchData: Starting data fetch sequence...');
      
      try {
          // 1. Fetch Jobs
          console.log('🔄 [App] Requesting jobs from Supabase...');
          const { data: jobs, error: jobsError } = await supabase.from('jobs').select('*');
          
          if (jobsError) {
              console.error('❌ [App] fetchData: Supabase returned error fetching jobs:', jobsError);
              console.error('❌ [App] Error details:', jobsError.message, jobsError.details);
          } else {
              console.log(`📊 [App] fetchData: Raw jobs fetched from DB: ${jobs?.length || 0}`);
              
              if (jobs && jobs.length > 0) {
                  console.log('📄 [App] fetchData: Sample raw job (first item):', jobs[0]);
              } else {
                  console.log('⚠️ [App] fetchData: Job array is empty. This usually indicates Row Level Security (RLS) is filtering results, or the table is empty.');
                  console.log('ℹ️ [App] Current user ID:', user?.id);
              }
              
              // Safe Mapping
              const mappedJobs: JobPosting[] = [];
              (jobs || []).forEach((job, index) => {
                  try {
                      const mapped = mapJobFromDB(job);
                      mappedJobs.push(mapped);
                  } catch (mapErr) {
                      console.error(`❌ [App] fetchData: Error mapping job at index ${index} (ID: ${job?.id})`, mapErr);
                      console.error('💥 [App] fetchData: Problematic job object:', job);
                  }
              });

              console.log(`✅ [App] fetchData: Successfully mapped ${mappedJobs.length} jobs.`);
              if (mappedJobs.length > 0) {
                  console.log('✅ [App] First mapped job:', mappedJobs[0]);
              }
              setJobPostings(mappedJobs);
          }

          // 2. Fetch Candidates (Recruiter Only)
          if (userRole === 'recruiter') {
              console.log('🔍 [App] fetchData: User is recruiter, fetching candidates...');
              const { data: cands, error: candError } = await supabase.from('candidate_profiles').select('*');
              
              if (candError) {
                  console.error('❌ [App] fetchData: Error fetching candidates:', candError);
              } else {
                  console.log(`📊 [App] fetchData: Raw candidates fetched: ${cands?.length || 0}`);
                  if (cands) setCandidatesList(cands.map(mapCandidateFromDB));
              }
          }
      } catch (globalErr) {
          console.error('❌ [App] fetchData: Critical unhandled exception:', globalErr);
      }
  };

  const handleCreateProfile = async (role: Role) => {
      if (!user) return;
      try {
          setIsLoadingProfile(true);
          await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: role });
          // Also init detailed profile
          if (role === 'candidate') {
              await supabase.from('candidate_profiles').upsert({ id: user.id, name: user.email?.split('@')[0], email: user.email });
          } else {
              await supabase.from('company_profiles').upsert({ id: user.id, company_name: 'My Company' });
          }
          setUserRole(role);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingProfile(false);
      }
  };

  // Handlers
  const handleUpdateCandidate = async (profile: CandidateProfile) => {
      if (!user) return;
      
      try {
          // Update in Supabase with ALL fields including Phase 1
          const { error } = await supabase
              .from('candidate_profiles')
              .update({
                  // Basic Info
                  name: profile.name,
                  headline: profile.headline,
                  bio: profile.bio,
                  location: profile.location,
                  status: profile.status,
                  
                  // Arrays (use snake_case for database)
                  avatar_urls: profile.avatarUrls || [],
                  character_traits: profile.characterTraits || [],
                  values_list: profile.values || [],
                  contract_types: profile.contractTypes || [],
                  preferred_work_mode: profile.preferredWorkMode || [],
                  desired_perks: profile.desiredPerks || [],
                  interested_industries: profile.interestedIndustries || [],
                  non_negotiables: profile.nonNegotiables || [],
                  desired_seniority: profile.desiredSeniority || [],
                  
                  // JSONB fields
                  skills: profile.skills || [],
                  experience: profile.experience || [],
                  portfolio: profile.portfolio || [],
                  references_list: profile.references || [],
                  
                  // Salary & Work
                  salary_expectation: profile.salaryExpectation,
                  salary_min: profile.salaryMin,
                  salary_currency: profile.salaryCurrency,
                  notice_period: profile.noticePeriod,
                  legal_status: profile.legalStatus,
                  current_bonuses: profile.currentBonuses,
                  ambitions: profile.ambitions,
                  
                  // Theme
                  theme_color: profile.themeColor,
                  theme_font: profile.themeFont,
                  
                  // 🆕 PHASE 1 FIELDS - EDUCATION
                  education_level: profile.education_level,
                  education_field: profile.education_field,
                  education_institution: profile.education_institution,
                  
                  // 🆕 PHASE 1 FIELDS - PERSONALITY ASSESSMENTS
                  myers_briggs: profile.myers_briggs,
                  disc_profile: profile.disc_profile || { D: 0, I: 0, S: 0, C: 0 },
                  enneagram_type: profile.enneagram_type,
                  assessment_completed_at: profile.assessment_completed_at
              })
              .eq('id', user.id);
          
          if (error) {
              console.error('Error saving profile:', error);
              alert('Failed to save profile. Please try again.');
              return;
          }
          
          // Update local state AFTER successful database save
          setCandidateProfile(profile);
          setCurrentView('dashboard');
          
          console.log('✅ Profile saved successfully to database!');
          
      } catch (err) {
          console.error('Error updating candidate profile:', err);
          alert('An error occurred while saving. Please try again.');
      }
  };

  const handleUpdateCompany = async (profile: CompanyProfileType) => {
      await supabase.from('company_profiles').update({
          company_name: profile.companyName,
          website: profile.website,
          about: profile.about,
          values: profile.values,
          perks: profile.perks,
          desired_traits: profile.desiredTraits,
          industry: profile.industry
      }).eq('id', user?.id);
      
      setCompanyProfile(profile);
      // No view change, just save
  };
  
  const handleTeamMemberUpdate = async () => {
      if (userRole === 'recruiter') {
         const { data: team } = await supabase.from('team_members').select('*').eq('company_id', user?.id);
         if (team) setTeamMembers(team);
      }
  };

  const handlePublishJob = async (job: JobPosting) => { 
      await supabase.from('jobs').insert([{
         ...job,
         company_id: user?.id,
         company_name: companyProfile?.companyName,
         required_skills: job.requiredSkills,
         values_list: job.values,
         desired_traits: job.desiredTraits,
         required_traits: job.requiredTraits,
         perks: job.perks
      }]);
      fetchData();
      setCurrentView('dashboard'); 
  };
  
  const handleUnlockCandidate = (id: string) => { 
      setCandidatesList(prev => prev.map(c => c.id === id ? { ...c, isUnlocked: true } : c));
  };
  
  const handleApply = async (jobId: string) => { 
      if (!userRole || userRole !== 'candidate') return;
      try {
          await supabase.from('applications').insert({
              job_id: jobId,
              candidate_id: user?.id
          });
          alert("Applied successfully!");
      } catch (e) {
          console.error(e);
      }
  };

  // Improved Navigation Handlers
  const navigateToMessage = async (candidateId: string) => {
      try {
        const convId = await messageService.getOrCreateConversation(user!.id, candidateId);
        setSearchParams({ conversationId: convId });
        setCurrentView('messages');
      } catch (e) {
          console.error("Failed to start conversation", e);
      }
  };

  const navigateToSchedule = (candidateId: string) => {
      setSearchParams({ candidateId });
      setCurrentView('schedule');
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
              if (userRole === 'recruiter') {
                 if (!companyProfile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /><span className="ml-2">Loading company profile...</span></div>;
                 return <CompanyProfile 
                    profile={companyProfile} 
                    onSave={handleUpdateCompany} 
                    teamMembers={teamMembers} 
                    onTeamUpdate={handleTeamMemberUpdate}
                />;
              } else {
                 if (!candidateProfile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /><span className="ml-2">Loading your profile...</span></div>;
                 return <CandidateProfileForm profile={candidateProfile} onSave={handleUpdateCandidate} />;
              }
          case 'network': return <Network connections={connections} />;
          case 'messages': return <Messages />;
          case 'schedule': return <Schedule />;
          case 'notifications': return <Notifications notifications={notifications} />;
          case 'create-job': return <CreateJob onPublish={handlePublishJob} onCancel={() => setCurrentView('dashboard')} teamMembers={teamMembers} />;
          case 'my-jobs': return <RecruiterMyJobs />;
          case 'talent-matcher': return <TalentMatcher 
                                            onViewProfile={(c) => { setSelectedCandidate(c); setCurrentView('candidate-details'); }}
                                            onUnlock={handleUnlockCandidate}
                                            onSchedule={navigateToSchedule}
                                            onMessage={navigateToMessage}
                                        />;
          case 'job-details': return selectedJob ? <JobDetails job={selectedJob} onBack={() => setCurrentView('dashboard')} onApply={handleApply} /> : null;
          case 'candidate-details': return selectedCandidate ? (
             userRole === 'recruiter' && !selectedCandidate.isUnlocked ? 
             <CandidateDetailsLocked candidate={selectedCandidate} onUnlock={handleUnlockCandidate} onBack={() => setCurrentView('dashboard')} /> :
             <CandidateDetails 
                candidate={selectedCandidate} 
                onBack={() => setCurrentView('dashboard')} 
                onUnlock={handleUnlockCandidate} 
                onMessage={navigateToMessage} 
                onSchedule={navigateToSchedule} 
             />
          ) : null;
          case 'ats': return userRole === 'candidate' ? <CandidateApplications jobs={jobPostings} onViewMessage={(id) => setCurrentView('messages')} /> : <RecruiterATS />;
          default: 
            if (userRole === 'candidate') {
                if (!candidateProfile) {
                    return (
                        <div className="min-h-screen flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                            <span className="ml-2">Loading your profile...</span>
                        </div>
                    );
                }
                return (
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        {jobPostings.map(job => <JobCard key={job.id} job={job} candidateProfile={candidateProfile} onApply={handleApply} onViewDetails={(j) => { setSelectedJob(j); setCurrentView('job-details'); }} />)}
                    </div>
                );
            }
            return (
                <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {candidatesList.map(c => <CandidateCard key={c.id} candidate={c} onUnlock={handleUnlockCandidate} onMessage={navigateToMessage} onSchedule={navigateToSchedule} onViewProfile={(c) => { setSelectedCandidate(c); setCurrentView('candidate-details'); }} />)}
                </div>
            );
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
