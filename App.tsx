
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
import WidgetSetup from './components/WidgetSetup'; 
import VerificationForm from './components/VerificationForm';
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
    
    skills: (data.skills || []).map((s: any) => ({
      name: s.name,
      years: s.years !== undefined ? s.years : (s.minimumYears || 0),
      weight: s.weight 
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

    education_level: data.education_level,
    education_field: data.education_field,
    education_institution: data.education_institution,
    myers_briggs: data.myers_briggs,
    disc_profile: data.disc_profile || { D: 0, I: 0, S: 0, C: 0 },
    enneagram_type: data.enneagram_type,
    assessment_completed_at: data.assessment_completed_at,
    is_mock_data: data.is_mock_data || false,
    
    verification_stats: data.verification_stats // Include stats
});

const mapCompanyFromDB = (data: any): CompanyProfileType => ({
  id: data.id,
  companyName: data.company_name || '',
  logoUrl: data.logo_url,
  website: data.website || '',
  tagline: data.tagline || '',
  about: data.about || '',
  missionStatement: data.mission_statement,
  industry: data.industry || [],
  values: data.values || [],
  cultureDescription: data.culture_description,
  workEnvironment: data.work_environment,
  desiredTraits: data.desired_traits || [],
  diversityStatement: data.diversity_statement,
  perks: data.perks || [],
  benefitsDescription: data.benefits_description,
  remotePolicy: data.remote_policy || '',
  teamSize: data.team_size || 0,
  foundedYear: data.founded_year || new Date().getFullYear(),
  headquartersLocation: data.headquarters_location || '',
  companySizeRange: data.company_size_range,
  fundingStage: data.funding_stage,
  growthStage: data.growth_stage,
  techStack: data.tech_stack || [],
  socialMedia: data.social_media || {},
  companyPhotos: data.company_photos || [],
  billing_plan: data.billing_plan || 'pay_per_hire',
  credits: data.credits || 0,
  is_mock_data: data.is_mock_data || false,
  mock_data_seed: data.mock_data_seed
});

function MainApp() {
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<Role>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidatesList, setCandidatesList] = useState<CandidateProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileType | null>(null);

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
      try {
          const { data: jobs } = await supabase.from('jobs').select('*');
          if (jobs) {
              const mappedJobs: JobPosting[] = [];
              jobs.forEach((job) => {
                  try {
                      mappedJobs.push(mapJobFromDB(job));
                  } catch (mapErr) { console.error(mapErr); }
              });
              setJobPostings(mappedJobs);
          }

          if (userRole === 'recruiter') {
              const { data: cands } = await supabase.from('candidate_profiles').select('*');
              if (cands) setCandidatesList(cands.map(mapCandidateFromDB));
          }
      } catch (globalErr) { console.error(globalErr); }
  };

  const handleCreateProfile = async (role: Role) => {
      if (!user) return;
      try {
          setIsLoadingProfile(true);
          await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: role });
          if (role === 'candidate') {
              await supabase.from('candidate_profiles').upsert({ id: user.id, name: user.email?.split('@')[0], email: user.email });
          } else {
              await supabase.from('company_profiles').upsert({ 
                  id: user.id, 
                  company_name: 'My Company',
                  industry: [], values: [], perks: [], desired_traits: [], tech_stack: [], company_photos: []
              });
          }
          setUserRole(role);
      } catch (e) { console.error(e); } finally { setIsLoadingProfile(false); }
  };

  const handleUpdateCandidate = async (profile: CandidateProfile) => {
      if (!user) return;
      try {
          const { error } = await supabase.from('candidate_profiles').update({
                  name: profile.name,
                  headline: profile.headline,
                  bio: profile.bio,
                  location: profile.location,
                  status: profile.status,
                  avatar_urls: profile.avatarUrls || [],
                  character_traits: profile.characterTraits || [],
                  values_list: profile.values || [],
                  contract_types: profile.contractTypes || [],
                  preferred_work_mode: profile.preferredWorkMode || [],
                  desired_perks: profile.desiredPerks || [],
                  interested_industries: profile.interestedIndustries || [],
                  non_negotiables: profile.nonNegotiables || [],
                  desired_seniority: profile.desiredSeniority || [],
                  skills: profile.skills || [],
                  experience: profile.experience || [],
                  portfolio: profile.portfolio || [],
                  references_list: profile.references || [],
                  salary_expectation: profile.salaryExpectation,
                  salary_min: profile.salaryMin,
                  salary_currency: profile.salaryCurrency,
                  notice_period: profile.noticePeriod,
                  legal_status: profile.legalStatus,
                  current_bonuses: profile.currentBonuses,
                  ambitions: profile.ambitions,
                  theme_color: profile.themeColor,
                  theme_font: profile.themeFont,
                  education_level: profile.education_level,
                  education_field: profile.education_field,
                  education_institution: profile.education_institution,
                  myers_briggs: profile.myers_briggs,
                  disc_profile: profile.disc_profile,
                  enneagram_type: profile.enneagram_type,
                  assessment_completed_at: profile.assessment_completed_at
              }).eq('id', user.id);
          
          if (error) {
              alert('Failed to save profile.'); return;
          }
          setCandidateProfile(profile);
          setCurrentView('dashboard');
      } catch (err) { console.error(err); }
  };

  const handleUpdateCompany = async (profile: CompanyProfileType) => {
      setCompanyProfile(profile);
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
          await supabase.from('applications').insert({ job_id: jobId, candidate_id: user?.id });
          alert("Applied successfully!");
      } catch (e) { console.error(e); }
  };

  const navigateToMessage = async (candidateId: string) => {
      try {
        const convId = await messageService.getOrCreateConversation(user!.id, candidateId);
        setSearchParams({ conversationId: convId });
        setCurrentView('messages');
      } catch (e) { console.error(e); }
  };

  const navigateToSchedule = (candidateId: string) => {
      setSearchParams({ candidateId });
      setCurrentView('schedule');
  };

  if (isLoadingProfile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;

  if (!userRole) return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Complete Your Setup</h2>
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
                 if (!companyProfile) return <div>Loading...</div>;
                 return <CompanyProfile profile={companyProfile} onSave={handleUpdateCompany} teamMembers={teamMembers} onTeamUpdate={handleTeamMemberUpdate}/>;
              } else {
                 if (!candidateProfile) return <div>Loading...</div>;
                 return <CandidateProfileForm profile={candidateProfile} onSave={handleUpdateCandidate} />;
              }
          case 'network': return <Network connections={connections} />;
          case 'messages': return <Messages />;
          case 'schedule': return <Schedule />;
          case 'notifications': return <Notifications notifications={notifications} />;
          case 'create-job': return <CreateJob onPublish={handlePublishJob} onCancel={() => setCurrentView('dashboard')} teamMembers={teamMembers} />;
          case 'my-jobs': return <RecruiterMyJobs />;
          case 'talent-matcher': return <TalentMatcher onViewProfile={(c) => { setSelectedCandidate(c); setCurrentView('candidate-details'); }} onUnlock={handleUnlockCandidate} onSchedule={navigateToSchedule} onMessage={navigateToMessage} />;
          case 'widget-setup': return <WidgetSetup onBack={() => setCurrentView('dashboard')} />; 
          case 'job-details': return selectedJob ? <JobDetails job={selectedJob} onBack={() => setCurrentView('dashboard')} onApply={handleApply} /> : null;
          case 'candidate-details': return selectedCandidate ? (
             userRole === 'recruiter' && !selectedCandidate.isUnlocked ? 
             <CandidateDetailsLocked candidate={selectedCandidate} onUnlock={handleUnlockCandidate} onBack={() => setCurrentView('dashboard')} /> :
             <CandidateDetails candidate={selectedCandidate} onBack={() => setCurrentView('dashboard')} onUnlock={handleUnlockCandidate} onMessage={navigateToMessage} onSchedule={navigateToSchedule} />
          ) : null;
          case 'ats': return userRole === 'candidate' ? <CandidateApplications jobs={jobPostings} onViewMessage={(id) => setCurrentView('messages')} /> : <RecruiterATS />;
          default: 
            if (userRole === 'candidate') {
                if (!candidateProfile) return <div>Loading...</div>;
                return <div className="max-w-7xl mx-auto px-4 py-8">{jobPostings.map(job => <JobCard key={job.id} job={job} candidateProfile={candidateProfile} onApply={handleApply} onViewDetails={(j) => { setSelectedJob(j); setCurrentView('job-details'); }} />)}</div>;
            }
            return <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">{candidatesList.map(c => <CandidateCard key={c.id} candidate={c} onUnlock={handleUnlockCandidate} onMessage={navigateToMessage} onSchedule={navigateToSchedule} onViewProfile={(c) => { setSelectedCandidate(c); setCurrentView('candidate-details'); }} />)}</div>;
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
    const [selectedRole, setSelectedRole] = useState<Role>(() => {
        const stored = localStorage.getItem('open_selected_role');
        return (stored === 'candidate' || stored === 'recruiter') ? stored : null;
    });

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

    if (session) return <MainApp />;

    if (selectedRole) {
        return <Login selectedRole={selectedRole} onBack={() => { localStorage.removeItem('open_selected_role'); setSelectedRole(null); }} />;
    }

    return <LandingPage onSelectRole={(r) => { localStorage.setItem('open_selected_role', r); setSelectedRole(r); }} />;
}

export default function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                <Route path="/verify/:token" element={<VerificationForm />} />
                <Route path="/*" element={<AuthWrapper />} />
            </Routes>
        </AuthProvider>
      </BrowserRouter>
  );
}
