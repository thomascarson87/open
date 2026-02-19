
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import CandidateProfileForm from './components/CandidateProfileForm';
import CompanyProfile from './components/CompanyProfile';
import EnrichedJobCard from './components/EnrichedJobCard';
import EnrichedCandidateCard from './components/EnrichedCandidateCard';
import JobDetailModal from './components/JobDetailModal';
import FluidGravityFilter, { MatchWeights } from './components/FluidGravityFilter';
import CandidateDetails from './components/CandidateDetails';
import CandidateDetailsLocked from './components/CandidateDetailsLocked';
import RecruiterATS from './components/RecruiterATS';
import ApplicationHub from './components/candidate/ApplicationHub';
import FollowedCompanies from './components/candidate/FollowedCompanies';
import CandidateApplications from './components/CandidateApplications';
import Messages from './components/Messages';
import Schedule from './components/Schedule';
import CreateJob from './components/CreateJob';
import Notifications from './components/Notifications';
import Network from './components/Network';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import GoogleAuthCallback from './components/GoogleAuthCallback'; // For Google Calendar OAuth
import AuthCallback from './components/AuthCallback'; // For Supabase OAuth (Google/GitHub sign-in)
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import TalentMatcher from './components/TalentMatcher';
import RecruiterMyJobs from './components/RecruiterMyJobs';
import VerificationForm from './components/VerificationForm';
import CandidateProfileTabs from './components/CandidateProfileTabs';
import DevModeSwitcher from './components/dev/DevModeSwitcher';
import TestSignupBanner from './components/dev/TestSignupBanner';
import HiringManagerPreferences from './pages/HiringManagerPreferences';
import PendingApprovals from './pages/PendingApprovals';
import MarketPulse from './pages/candidate/MarketPulse';
import TalentMarket from './pages/company/TalentMarket';
import CompanyHomepage from './components/homepage/CompanyHomepage';
import MatchRevealBanner from './components/MatchRevealBanner';
import { Role, CandidateProfile, JobPosting, Notification, CompanyProfile as CompanyProfileType, Connection, TeamMember, Skill } from './types';
import { Loader2, Briefcase } from 'lucide-react';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { notificationService } from './services/notificationService';

// API response types for unlock-profile endpoint
type UnlockErrorCode = 'INSUFFICIENT_CREDITS' | 'ALREADY_UNLOCKED' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INVALID_REQUEST';

interface UnlockSuccessResponse {
  success: true;
  candidate: CandidateProfile;
  creditsRemaining: number;
  unlock: {
    id: string;
    candidateId: string;
    companyId: string;
    unlockedAt: string;
    cost: number;
  };
}

interface UnlockErrorResponse {
  success: false;
  error: string;
  code: UnlockErrorCode;
}

type UnlockApiResponse = UnlockSuccessResponse | UnlockErrorResponse;
import { messageService } from './services/messageService';
import { fetchEnrichedJobs, EnrichedJob } from './services/jobDataService';
import { calculateMatch } from './services/matchingService';
import { mapJobFromDB, mapCandidateFromDB, mapCompanyFromDB } from './services/dataMapperService';

// Data mappers imported from services/dataMapperService.ts (single source of truth)

// Weighting logic function
function calculateWeightedScore(baseMatch: any, weights: MatchWeights): number {
  const total = weights.skills + weights.compensation + weights.culture;
  if (total === 0) return baseMatch.overallScore;

  const normalized = {
    skills: weights.skills / total,
    compensation: weights.compensation / total,
    culture: weights.culture / total
  };
  
  const skillScore = baseMatch.details.skills.score;
  const salaryScore = baseMatch.details.salary.score;
  const cultureScore = (
    baseMatch.details.culture.score + 
    baseMatch.details.traits.score
  ) / 2;
  
  return Math.round(
    (skillScore * normalized.skills) +
    (salaryScore * normalized.compensation) +
    (cultureScore * normalized.culture)
  );
}

function MainApp() {
    const { user, signOut, companyId: authCompanyId, teamRole, isDevMode, devProfileRole, testSignupAccounts } = useAuth();
    const [userRole, setUserRole] = useState<Role>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    
    // Discovery Feed State
    const [enrichedJobs, setEnrichedJobs] = useState<EnrichedJob[]>([]);
    const [matchWeights, setMatchWeights] = useState<MatchWeights>(() => {
        const saved = localStorage.getItem('match_weights');
        return saved ? JSON.parse(saved) : { skills: 33, compensation: 33, culture: 34 };
    });
    const [selectedEnrichedJob, setSelectedEnrichedJob] = useState<EnrichedJob | null>(null);

    // Save weights
    useEffect(() => {
        localStorage.setItem('match_weights', JSON.stringify(matchWeights));
    }, [matchWeights]);

    const [searchParams, setSearchParamsState] = useState(() => new URLSearchParams(window.location.search));

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            setSearchParamsState(params);
            const view = params.get('view');
            if (view) setCurrentView(view);
        };
        
        window.addEventListener('popstate', handlePopState);
        handlePopState();
        
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const setSearchParams = (newParams: Record<string, string>) => {
        const nextSearch = new URLSearchParams(newParams).toString();
        window.history.pushState({}, '', `${window.location.pathname}?${nextSearch}`);
        setSearchParamsState(new URLSearchParams(nextSearch));
    };

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [candidatesList, setCandidatesList] = useState<CandidateProfile[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamMembersLoading, setTeamMembersLoading] = useState(true);
    const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
    const [candidateCertIds, setCandidateCertIds] = useState<string[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileType | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

    // Helper to create a default empty profile for test signup users
    const getDefaultTestProfile = (): CandidateProfile | null => {
        const testAccount = testSignupAccounts?.find(a => a.id === user?.id);
        if (!testAccount) return null;

        return {
            id: testAccount.id,
            userId: testAccount.id,
            name: testAccount.name || '',
            headline: '',
            email: testAccount.email,
            location: '',
            bio: '',
            status: 'actively_looking',
            skills: [],
            values: [],
            characterTraits: [],
            salaryMin: 0,
            salaryCurrency: 'USD',
            preferredWorkMode: [],
            desiredPerks: [],
            interestedIndustries: [],
            desiredImpactScopes: [],
            contractTypes: [],
            noticePeriod: '',
            nonNegotiables: [],
            onboardingCompleted: false,
            createdAt: testAccount.createdAt,
            updatedAt: testAccount.createdAt,
        };
    };

    useEffect(() => {
        if (user) {
            fetchUserProfile();
            fetchNotifications();
        }
    }, [user, devProfileRole]);

    useEffect(() => {
        if (userRole) {
            fetchData();
        }
    }, [userRole]);

    const fetchUserProfile = async () => {
        try {
            // In dev mode, use the devProfileRole from AuthContext directly
            // since mock accounts may not have a profiles row in the database
            if (isDevMode && devProfileRole) {
                setUserRole(devProfileRole as Role);
                loadRoleData(devProfileRole as Role);
                return;
            }

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
                id: n.id, title: n.title, description: n.description, type: n.type, isRead: n.is_read,
                timestamp: n.created_at, link: n.link, metadata: n.metadata
            })));
        }
    };

    const loadRoleData = async (role: Role) => {
        try {
            if (role === 'candidate') {
                setTeamMembersLoading(false); // Not applicable for candidates
                const { data: cand } = await supabase.from('candidate_profiles').select('*').eq('id', user?.id).maybeSingle();
                if (cand) setCandidateProfile(mapCandidateFromDB(cand));
                // Fetch candidate's active certification IDs for matching
                const { data: certData } = await supabase
                    .from('candidate_certifications')
                    .select('certification_id')
                    .eq('candidate_id', user?.id)
                    .eq('status', 'active');
                if (certData) setCandidateCertIds(certData.map((c: any) => c.certification_id));
            } else {
                // Use authCompanyId from context (handles dev mode), fallback to user.id
                const effectiveCompanyId = authCompanyId || user?.id;

                const { data: comp } = await supabase.from('company_profiles').select('*').eq('id', effectiveCompanyId).maybeSingle();
                if (comp) setCompanyProfile(mapCompanyFromDB(comp));

                // Fetch team members for the company
                setTeamMembersLoading(true);
                const { data: team, error: teamError } = await supabase
                    .from('team_members')
                    .select('*')
                    .eq('company_id', effectiveCompanyId);

                if (team) setTeamMembers(team);
                setTeamMembersLoading(false);
            }
        } catch (e) {
            console.error(e);
            setTeamMembersLoading(false);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleTeamMemberUpdate = () => {
        if (userRole) loadRoleData(userRole);
    };

    const fetchData = async () => {
        try {
            if (userRole === 'candidate') {
                const enriched = await fetchEnrichedJobs();
                setEnrichedJobs(enriched);
            } else if (userRole === 'recruiter') {
                const { data: cands } = await supabase.from('candidate_profiles').select('*');
                if (cands) setCandidatesList(cands.map(mapCandidateFromDB));
            }
        } catch (e) { console.error(e); }
    };

    const handleCreateProfile = async (role: Role) => {
        if (!user) return;
        try {
            setIsLoadingProfile(true);
            await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: role });
            if (role === 'candidate') {
                await supabase.from('candidate_profiles').upsert({ id: user.id, name: user.email?.split('@')[0], email: user.email });
            } else {
                await supabase.from('company_profiles').upsert({ id: user.id, company_name: 'My Company' });
            }
            setUserRole(role);
        } catch (e) { console.error(e); } finally { setIsLoadingProfile(false); }
    };

    const handleUpdateCandidate = async (profile: CandidateProfile) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('candidate_profiles').update({
                name: profile.name, headline: profile.headline, bio: profile.bio, location: profile.location,
                status: profile.status, avatar_urls: profile.avatarUrls || [], video_intro_url: profile.videoIntroUrl,
                theme_color: profile.themeColor, theme_font: profile.themeFont, character_traits: profile.characterTraits || [],
                values_list: profile.values || [], contract_types: profile.contractTypes || [], preferred_work_mode: profile.preferredWorkMode || [],
                desired_perks: profile.desiredPerks || [], interested_industries: profile.interestedIndustries || [],
                non_negotiables: profile.nonNegotiables || [], desired_seniority: profile.desiredSeniority || [],
                skills: profile.skills.map(s => ({ name: s.name, years: s.years, level: s.level, description: s.description })),
                skills_with_levels: profile.skills, experience: profile.experience || [], total_years_experience: profile.totalYearsExperience,
                portfolio: profile.portfolio || [], references_list: profile.references || [], salary_expectation: profile.salaryExpectation,
                salary_min: profile.salaryMin, salary_currency: profile.salaryCurrency, notice_period: profile.noticePeriod,
                legal_status: profile.legalStatus, current_bonuses: profile.currentBonuses, ambitions: profile.ambitions,
                education_level: profile.educationLevel, education_field: profile.educationField, education_institution: profile.educationInstitution,
                myers_briggs: profile.myersBriggs, disc_profile: profile.discProfile, enneagram_type: profile.enneagramType,
                assessment_completed_at: profile.assessmentCompletedAt, current_impact_scope: profile.currentImpactScope,
                desired_impact_scope: profile.desiredImpactScopes, 
                work_style_preferences: profile.workStylePreferences || {},
                team_collaboration_preferences: profile.teamCollaborationPreferences || {}, timezone: profile.timezone, languages: profile.languages || [],
                // New fields
                salary_max: profile.salaryMax, education_graduation_year: profile.educationGraduationYear,
                call_ready: profile.callReady, call_link: profile.callLink, preferred_timezone: profile.preferredTimezone,
                preferred_company_size: profile.preferredCompanySize || [], willing_to_relocate: profile.willingToRelocate,
                open_to_equity: profile.openToEquity,
                // Management Preferences
                preferred_leadership_style: profile.preferredLeadershipStyle,
                preferred_feedback_frequency: profile.preferredFeedbackFrequency,
                preferred_communication_style: profile.preferredCommunicationStyle,
                preferred_meeting_culture: profile.preferredMeetingCulture,
                preferred_conflict_resolution: profile.preferredConflictResolution,
                preferred_mentorship_style: profile.preferredMentorshipStyle,
                growth_goals: profile.growthGoals,
                // Enrichment fields
                preferred_company_focus: profile.preferredCompanyFocus || [],
                preferred_mission_orientation: profile.preferredMissionOrientation || [],
                preferred_work_style: profile.preferredWorkStyle || [],
                regulatory_experience: profile.regulatoryExperience || [],
            }).eq('id', user.id);
            if (error) throw error;
            setCandidateProfile(profile);
            setCurrentView('dashboard');
        } catch (err) { alert('Failed to save profile.'); }
    };

    const handlePublishJob = async (job: JobPosting) => { 
        try {
            const salaryRangeStr = job.salaryRange || (
                job.salaryMin && job.salaryMax
                    ? `${job.salaryCurrency || '$'} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                    : job.salaryMin
                        ? `${job.salaryCurrency || '$'} ${job.salaryMin.toLocaleString()}+`
                        : 'Competitive'
            );

            const dbJobPayload = {
                company_id: user?.id,
                canonical_role_id: job.canonicalRoleId || null,
                company_name: companyProfile?.companyName,
                company_logo: companyProfile?.logoUrl || job.companyLogo,
                title: job.title,
                description: job.description,
                status: 'published',
                location: job.location,
                // Fixed: work_mode should use job.workMode from JobPosting interface
                work_mode: job.workMode,
                seniority: job.seniority,
                contract_types: job.contractTypes || [],
                salary_min: job.salaryMin,
                salary_max: job.salaryMax,
                salary_currency: job.salaryCurrency || 'USD',
                salary_range: salaryRangeStr,
                start_date: job.startDate,
                required_skills: job.requiredSkills,
                required_skills_with_levels: job.requiredSkills,
                tech_stack: job.techStack || [],
                required_impact_scope: job.requiredImpactScope,
                values_list: job.values || [],
                perks: job.perks || [],
                // Fixed: desired_traits and required_traits should use camelCase properties from JobPosting
                desired_traits: job.desiredTraits || [],
                required_traits: job.requiredTraits || [],
                company_industry: job.companyIndustry || companyProfile?.industry || [],
                required_education_level: job.requiredEducationLevel,
                preferred_education_level: job.preferredEducationLevel,
                education_required: job.educationRequired || false,
                responsibilities: job.responsibilities || [],
                impact_statement: job.impactStatement,
                key_deliverables: job.keyDeliverables || [],
                success_metrics: job.successMetrics || [],
                team_structure: job.teamStructure,
                growth_opportunities: job.growthOpportunities,
                desired_performance_scores: job.desiredPerformanceScores,
                work_style_requirements: job.workStyleRequirements || {},
                work_style_dealbreakers: job.workStyleDealbreakers || [],
                team_requirements: job.teamRequirements || {},
                team_dealbreakers: job.teamDealbreakers || [],
                approvals: job.approvals || {},
                posted_date: new Date().toISOString(),
                required_languages: job.requiredLanguages || [],
                preferred_languages: job.preferredLanguages || [],
                timezone_requirements: job.timezoneRequirements,
                required_timezone_overlap: job.requiredTimezoneOverlap,
                visa_sponsorship_available: job.visaSponsorshipAvailable || false,
                equity_offered: job.equityOffered || false,
                relocation_assistance: job.relocationAssistance || false,
                desired_enneagram_types: job.desiredEnneagramTypes || [],
                required_certifications: job.requiredCertifications || [],
                preferred_certifications: job.preferredCertifications || [],
                regulatory_domains: job.regulatoryDomains || []
            };

            const { error } = await supabase.from('jobs').insert([dbJobPayload]);
            if (error) throw error;
            await fetchData();
            setCurrentView('dashboard');
            alert('Job successfully published to the Open market!');
        } catch (err: any) {
            console.error('❌ Error publishing job:', err);
            alert(`Failed to publish job: ${err.message || 'Unknown database error'}`);
        }
    };

    const handleApply = async (jobId: string) => {
        if (userRole !== 'candidate') return;
        try {
            await supabase.from('applications').insert({ job_id: jobId, candidate_id: user?.id, company_id: enrichedJobs.find(j => j.job.id === jobId)?.job.companyId });
            alert("Applied successfully!");
        } catch (e) { console.error(e); }
    };

    const handleUnlockCandidate = async (candidateId: string): Promise<{ success: boolean; error?: { message: string; code: UnlockErrorCode } }> => {
        try {
            // Dev mode: bypass Vercel API (mock tokens can't authenticate)
            if (isDevMode) {
                const companyId = authCompanyId || user?.id;
                if (!companyId) {
                    return { success: false, error: { message: 'No company ID found.', code: 'UNAUTHORIZED' } };
                }

                // Check if already unlocked
                const { data: existing } = await supabase
                    .from('candidate_unlocks')
                    .select('id')
                    .eq('candidate_id', candidateId)
                    .eq('company_id', companyId)
                    .maybeSingle();

                if (!existing) {
                    // Create unlock record directly
                    await supabase.from('candidate_unlocks').insert({
                        candidate_id: candidateId,
                        company_id: companyId,
                        unlocked_by: user?.id,
                        cost_credits: 0,
                    });
                }

                // Fetch the candidate profile
                const { data: candidateData } = await supabase
                    .from('candidate_profiles')
                    .select('*')
                    .eq('id', candidateId)
                    .single();

                if (candidateData) {
                    const unlockedCandidate = mapCandidateFromDB({ ...candidateData, is_unlocked: true });
                    setCandidatesList(prev => prev.map(c => c.id === candidateId ? unlockedCandidate : c));
                    if (selectedCandidate?.id === candidateId) {
                        setSelectedCandidate(unlockedCandidate);
                    }
                }

                return { success: true };
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session?.access_token) {
                return {
                    success: false,
                    error: {
                        message: 'Please log in again to unlock profiles.',
                        code: 'UNAUTHORIZED'
                    }
                };
            }

            const response = await fetch('/api/unlock-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ candidateId })
            });

            const data: UnlockApiResponse = await response.json();

            if (data.success) {
                const unlockedCandidate = mapCandidateFromDB({ ...data.candidate, is_unlocked: true } as any);
                setCandidatesList(prev =>
                    prev.map(c => c.id === candidateId ? unlockedCandidate : c)
                );

                if (selectedCandidate?.id === candidateId) {
                    setSelectedCandidate(unlockedCandidate);
                }

                if (companyProfile) {
                    setCompanyProfile({
                        ...companyProfile,
                        credits: data.creditsRemaining
                    });
                }

                try {
                    await notificationService.createNotification(
                        candidateId,
                        'profile_viewed',
                        'Profile Unlocked',
                        `${companyProfile?.companyName || 'A company'} has unlocked your profile!`,
                        '/dashboard'
                    );
                } catch (notifError) {
                    console.error('Failed to send unlock notification:', notifError);
                }

                return { success: true };
            }

            if (data.code === 'ALREADY_UNLOCKED') {
                setCandidatesList(prev =>
                    prev.map(c => c.id === candidateId ? { ...c, isUnlocked: true } : c)
                );
                if (selectedCandidate?.id === candidateId) {
                    setSelectedCandidate({ ...selectedCandidate, isUnlocked: true });
                }
                return { success: true };
            }

            return {
                success: false,
                error: {
                    message: data.error,
                    code: data.code
                }
            };

        } catch (error) {
            console.error('Unlock profile error:', error);
            return {
                success: false,
                error: {
                    message: 'Network error. Please check your connection and try again.',
                    code: 'INVALID_REQUEST'
                }
            };
        }
    };

    const navigateToMessage = async (candidateId: string) => {
        try {
            const convId = await messageService.getOrCreateConversation(user!.id, candidateId);
            setSearchParams({ conversationId: convId, view: 'messages' });
            setCurrentView('messages');
        } catch (e) { console.error(e); }
    };

    // Sorted jobs for Discovery feed
    const sortedEnrichedJobs = useMemo(() => {
        if (!candidateProfile) return [];
        return enrichedJobs
            .map(ej => {
                const matchResult = calculateMatch(ej.job, candidateProfile, ej.company, candidateCertIds);
                const weightedScore = calculateWeightedScore(matchResult, matchWeights);
                return { ...ej, matchResult, weightedScore };
            })
            .sort((a, b) => b.weightedScore - a.weightedScore);
    }, [enrichedJobs, candidateProfile, matchWeights, candidateCertIds]);

    if (isLoadingProfile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>;

    if (!userRole) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-background text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-8 shadow-xl">c</div>
            <h2 className="font-heading text-3xl mb-2 tracking-tight">Welcome to chime</h2>
            <p className="text-muted mb-8 max-w-xs">Precision alignment for technical talent and the teams that need them.</p>
            <div className="flex gap-4">
                <button onClick={() => handleCreateProfile('candidate')} className="bg-accent-coral text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">I'm Talent</button>
                <button onClick={() => handleCreateProfile('recruiter')} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">I'm Hiring</button>
            </div>
            <button onClick={signOut} className="mt-12 text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest hover:text-primary">Sign Out</button>
        </div>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'profile':
                const tab = searchParams.get('tab') || 'profile';
                if (userRole === 'recruiter') return companyProfile && <CompanyProfile profile={companyProfile} onSave={setCompanyProfile} teamMembers={teamMembers} onTeamUpdate={handleTeamMemberUpdate} initialTab={tab} />;
                // Use actual profile, or default test profile for test signup users
                const effectiveProfile = candidateProfile || getDefaultTestProfile();
                if (!effectiveProfile) return null;
                return <CandidateProfileTabs profile={effectiveProfile} onUpdate={(u) => setCandidateProfile({...effectiveProfile, ...u})} onSave={() => handleUpdateCandidate(effectiveProfile)} />;
            case 'messages': 
                if (userRole === 'candidate') {
                    setCurrentView('applications');
                    return <ApplicationHub />;
                }
                return <Messages />;
            case 'schedule': 
                if (userRole === 'candidate') {
                    setCurrentView('applications');
                    return <ApplicationHub />;
                }
                return <Schedule />;
            case 'create-job': return <CreateJob onPublish={handlePublishJob} onCancel={() => setCurrentView('dashboard')} teamMembers={teamMembers} teamMembersLoading={teamMembersLoading} companyProfile={companyProfile} />;
            case 'talent-matcher': return <TalentMatcher onViewProfile={(c) => { setSelectedCandidate(c); setCurrentView('candidate-details'); }} onUnlock={handleUnlockCandidate} onSchedule={(id) => { setSearchParams({candidateId: id, view: 'schedule'}); setCurrentView('schedule'); }} onMessage={navigateToMessage} />;
            case 'candidate-details': return selectedCandidate && (userRole === 'recruiter' && !selectedCandidate.isUnlocked ? <CandidateDetailsLocked candidate={selectedCandidate} onUnlock={handleUnlockCandidate} onBack={() => setCurrentView('dashboard')} /> : <CandidateDetails candidate={selectedCandidate} onBack={() => setCurrentView('dashboard')} onUnlock={() => {}} onMessage={navigateToMessage} onSchedule={(id) => { setSearchParams({candidateId: id, view: 'schedule'}); setCurrentView('schedule'); }} />);
            case 'my-jobs': return <RecruiterMyJobs />;
            case 'network': return <Network connections={connections} />;
            case 'following': return <FollowedCompanies />;
            case 'ats': 
                return userRole === 'candidate' 
                  ? <ApplicationHub /> 
                  : <RecruiterATS />;
            case 'applications':
                return <ApplicationHub />;
            case 'notifications': return <Notifications notifications={notifications} />;
            case 'hm-preferences': return <HiringManagerPreferences />;
            case 'pending-approvals': return <PendingApprovals />;
            case 'market-pulse': return <MarketPulse />;
            case 'talent-market': return <TalentMarket />;
            default: 
                if (userRole === 'candidate') {
                    return (
                        <div className="max-w-[1400px] mx-auto px-4 py-8">
                            <FluidGravityFilter
                                weights={matchWeights}
                                onChange={setMatchWeights}
                                onReset={() => setMatchWeights({ skills: 33, compensation: 33, culture: 34 })}
                            />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {sortedEnrichedJobs.map(ej => (
                                    <EnrichedJobCard 
                                        key={ej.job.id} 
                                        job={ej.job} 
                                        companyProfile={ej.company} 
                                        matchResult={ej.matchResult!}
                                        weightedScore={ej.weightedScore!}
                                        onApply={handleApply} 
                                        onViewDetails={(j) => { 
                                            setSelectedEnrichedJob(ej);
                                        }} 
                                    />
                                ))}
                            </div>

                            {/* Fixed: Use optional chaining and non-null assertions where appropriate for matchResult now that EnrichedJob has it */}
                            {selectedEnrichedJob && selectedEnrichedJob.matchResult && (
                                <JobDetailModal 
                                    isOpen={!!selectedEnrichedJob}
                                    onClose={() => setSelectedEnrichedJob(null)}
                                    enrichedJob={selectedEnrichedJob}
                                    matchResult={selectedEnrichedJob.matchResult}
                                    onApply={handleApply}
                                />
                            )}

                            {sortedEnrichedJobs.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-surface rounded-[3rem] border-2 border-dashed border-border">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Briefcase className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-primary mb-2">
                                        {!candidateProfile?.skills || candidateProfile.skills.length === 0
                                            ? "Complete your profile to see matches"
                                            : "No matches found yet"
                                        }
                                    </h3>
                                    <p className="text-muted max-w-md mx-auto">
                                        {!candidateProfile?.skills || candidateProfile.skills.length === 0
                                            ? "Add your skills, preferences, and work history to unlock precision-matched opportunities."
                                            : "We're constantly adding new precision-aligned technical roles. Check back shortly!"
                                        }
                                    </p>
                                    {(!candidateProfile?.skills || candidateProfile.skills.length === 0) && (
                                        <button 
                                            onClick={() => setCurrentView('profile')}
                                            className="mt-6 px-8 py-3 bg-accent-coral text-white rounded-xl font-bold hover:bg-accent-coral transition-colors"
                                        >
                                            Complete Profile
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }
                return (
                    <CompanyHomepage
                        companyProfile={companyProfile!}
                        companyId={authCompanyId || user?.id || ''}
                        onViewProfile={(candidate) => { setSelectedCandidate(candidate); setCurrentView('candidate-details'); }}
                        onUnlock={handleUnlockCandidate}
                        onSchedule={(id) => { setSearchParams({candidateId: id, view: 'schedule'}); setCurrentView('schedule'); }}
                        onMessage={navigateToMessage}
                        onNavigateToCreateJob={() => setCurrentView('create-job')}
                        onNavigateToTalentMatcher={() => setCurrentView('talent-matcher')}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation role={userRole} currentView={currentView} setCurrentView={setCurrentView} onLogout={signOut} notificationCount={notifications.filter(n => !n.isRead).length} />
            {userRole && (
                <MatchRevealBanner
                    notifications={notifications}
                    userRole={userRole as 'candidate' | 'recruiter'}
                    onNavigate={(view) => setCurrentView(view)}
                    onNotificationsUpdate={fetchNotifications}
                />
            )}
            <div className="pt-6 pb-20 md:pb-6">{renderContent()}</div>
        </div>
    );
}

function AuthWrapper() {
    const { session, loading } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>(null);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>;
    
    if (session) return <MainApp />;

    if (showAuth) {
        return (
            <Login 
                selectedRole={selectedRole as 'candidate' | 'recruiter'} 
                onBack={() => {
                    setShowAuth(false);
                    setSelectedRole(null);
                }} 
            />
        );
    }

    return (
        <LandingPage 
            onSelectRole={(role) => { 
                localStorage.setItem('open_selected_role', role);
                setSelectedRole(role);
                setShowAuth(true);
            }} 
        />
    );
}

export default function App() {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => setPath(window.location.pathname);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const renderRoute = () => {
        // Supabase OAuth callback (Google/GitHub sign-in)
        if (path === '/auth/callback') return <AuthCallback />;
        // Google Calendar OAuth callback (separate from auth)
        if (path === '/auth/google/callback') return <GoogleAuthCallback />;
        // Password reset flow
        if (path === '/forgot-password') return <ForgotPassword />;
        if (path === '/reset-password') return <ResetPassword />;
        // Email verification
        if (path.startsWith('/verify/')) return <VerificationForm />;
        return <AuthWrapper />;
    };

    return (
        <DarkModeProvider>
            <AuthProvider>
                {renderRoute()}
                <DevModeSwitcher />
                <TestSignupBanner />
            </AuthProvider>
        </DarkModeProvider>
    );
}
