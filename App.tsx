
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
import { Role, CandidateProfile, JobPosting, Notification, CompanyProfile as CompanyProfileType, Connection, TeamMember, Skill } from './types';
import { Loader2, Briefcase } from 'lucide-react';
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

const mapJobFromDB = (data: any): JobPosting => {
    if (!data) return {} as JobPosting;
    const skillsSource = data.required_skills_with_levels || data.required_skills || [];
    return {
        ...data,
        id: data.id,
        company_id: data.company_id,
        canonical_role_id: data.canonical_role_id,
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
        requiredSkills: skillsSource.map((s: any) => ({
            name: s.name,
            required_level: s.required_level || (s.minimumYears >= 5 ? 4 : s.minimumYears >= 3 ? 3 : 2),
            minimumYears: s.minimumYears,
            weight: s.weight || 'preferred'
        })),
        values: data.values_list || [],
        perks: data.perks || [],
        desiredTraits: data.desired_traits || [],
        requiredTraits: data.required_traits || [],
        companyIndustry: data.company_industry || [],
        required_education_level: data.required_education_level,
        preferred_education_level: data.preferred_education_level,
        education_required: data.education_required || false,
        responsibilities: data.responsibilities || [],
        impact_statement: data.impact_statement,
        key_deliverables: data.key_deliverables || [],
        success_metrics: data.success_metrics || [],
        team_structure: data.team_structure,
        growth_opportunities: data.growth_opportunities,
        tech_stack: data.tech_stack || [],
        required_impact_scope: data.required_impact_scope,
        workStyleRequirements: data.work_style_requirements || {},
        workStyleDealbreakers: data.work_style_dealbreakers || [],
        teamRequirements: data.team_requirements || {},
        teamDealbreakers: data.team_dealbreakers || [],
        requiredLanguages: data.required_languages || [],
        timezoneRequirements: data.timezone_requirements,
        // New fields
        preferredLanguages: data.preferred_languages || [],
        requiredTimezoneOverlap: data.required_timezone_overlap,
        visaSponsorshipAvailable: data.visa_sponsorship_available || false,
        equityOffered: data.equity_offered || false,
        relocationAssistance: data.relocation_assistance || false,
        desiredEnneagramTypes: data.desired_enneagram_types || []
    };
};

const mapCandidateFromDB = (data: any): CandidateProfile => {
    if (!data) return {} as CandidateProfile;
    const skillsSource = data.skills_with_levels || data.skills || [];
    return { 
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
        skills: skillsSource.map((s: any) => ({
            name: s.name,
            years: s.years !== undefined ? s.years : (s.minimumYears || 0),
            level: s.level || (s.years >= 8 ? 5 : s.years >= 5 ? 4 : s.years >= 3 ? 3 : s.years >= 1 ? 2 : 1),
            description: s.description
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
        call_ready: data.call_ready,
        call_link: data.call_link,
        enneagram_type: data.enneagram_type,
        assessment_completed_at: data.assessment_completed_at,
        is_mock_data: data.is_mock_data || false,
        verification_stats: data.verification_stats,
        currentImpactScope: data.current_impact_scope,
        desiredImpactScopes: data.desired_impact_scope || [],
        workStylePreferences: data.work_style_preferences || {},
        teamCollaborationPreferences: data.team_collaboration_preferences || {},
        timezone: data.timezone,
        languages: data.languages || [],
        totalYearsExperience: data.total_years_experience,
        // New fields
        salaryMax: data.salary_max,
        education_graduation_year: data.education_graduation_year,
        callReady: data.call_ready,
        callLink: data.call_link,
        preferredTimezone: data.preferred_timezone,
        preferredCompanySize: data.preferred_company_size || [],
        willingToRelocate: data.willing_to_relocate,
        openToEquity: data.open_to_equity,
        // Management Preferences
        preferredLeadershipStyle: data.preferred_leadership_style,
        preferredFeedbackFrequency: data.preferred_feedback_frequency,
        preferredCommunicationStyle: data.preferred_communication_style,
        preferredMeetingCulture: data.preferred_meeting_culture,
        preferredConflictResolution: data.preferred_conflict_resolution,
        preferredMentorshipStyle: data.preferred_mentorship_style,
        growthGoals: data.growth_goals
    };
};

const mapCompanyFromDB = (data: any): CompanyProfileType => {
    if (!data) return {} as CompanyProfileType;
    return {
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
        mock_data_seed: data.mock_data_seed,
        workStyleCulture: data.work_style_culture || {},
        teamStructure: data.team_structure || {},
        companyLanguages: data.company_languages || [],
        // New fields
        defaultTimezone: data.default_timezone,
        visaSponsorshipPolicy: data.visa_sponsorship_policy
    };
};

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
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileType | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

    // Helper to create a default empty profile for test signup users
    const getDefaultTestProfile = (): CandidateProfile | null => {
        const testAccount = testSignupAccounts?.find(a => a.id === user?.id);
        if (!testAccount) return null;

        return {
            id: testAccount.id,
            user_id: testAccount.id,
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
            onboarding_completed: false,
            created_at: testAccount.createdAt,
            updated_at: testAccount.createdAt,
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
                education_level: profile.education_level, education_field: profile.education_field, education_institution: profile.education_institution,
                myers_briggs: profile.myers_briggs, disc_profile: profile.disc_profile, enneagram_type: profile.enneagram_type,
                assessment_completed_at: profile.assessment_completed_at, current_impact_scope: profile.currentImpactScope,
                desired_impact_scope: profile.desiredImpactScopes, 
                work_style_preferences: profile.workStylePreferences || {},
                team_collaboration_preferences: profile.teamCollaborationPreferences || {}, timezone: profile.timezone, languages: profile.languages || [],
                // New fields
                salary_max: profile.salaryMax, education_graduation_year: profile.education_graduation_year,
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
                growth_goals: profile.growthGoals
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
                canonical_role_id: job.canonical_role_id || null,
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
                tech_stack: job.tech_stack || [],
                required_impact_scope: job.required_impact_scope,
                values_list: job.values || [],
                perks: job.perks || [],
                // Fixed: desired_traits and required_traits should use camelCase properties from JobPosting
                desired_traits: job.desiredTraits || [],
                required_traits: job.requiredTraits || [],
                company_industry: job.companyIndustry || companyProfile?.industry || [],
                required_education_level: job.required_education_level,
                preferred_education_level: job.preferred_education_level,
                education_required: job.education_required || false,
                responsibilities: job.responsibilities || [],
                impact_statement: job.impact_statement,
                key_deliverables: job.key_deliverables || [],
                success_metrics: job.success_metrics || [],
                team_structure: job.team_structure,
                growth_opportunities: job.growth_opportunities,
                desired_performance_scores: job.desired_performance_scores,
                work_style_requirements: job.workStyleRequirements || {},
                work_style_dealbreakers: job.workStyleDealbreakers || [],
                team_requirements: job.teamRequirements || {},
                team_dealbreakers: job.teamDealbreakers || [],
                approvals: job.approvals || {},
                posted_date: new Date().toISOString(),
                // New fields
                preferred_languages: job.preferredLanguages || [],
                required_timezone_overlap: job.requiredTimezoneOverlap,
                visa_sponsorship_available: job.visaSponsorshipAvailable || false,
                equity_offered: job.equityOffered || false,
                relocation_assistance: job.relocationAssistance || false,
                desired_enneagram_types: job.desiredEnneagramTypes || []
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
            await supabase.from('applications').insert({ job_id: jobId, candidate_id: user?.id, company_id: enrichedJobs.find(j => j.job.id === jobId)?.job.company_id });
            alert("Applied successfully!");
        } catch (e) { console.error(e); }
    };

    const handleUnlockCandidate = async (candidateId: string): Promise<{ success: boolean; error?: { message: string; code: UnlockErrorCode } }> => {
        try {
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
                const unlockedCandidate = mapCandidateFromDB({ ...data.candidate, is_unlocked: true });
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
                const matchResult = calculateMatch(ej.job, candidateProfile, ej.company);
                const weightedScore = calculateWeightedScore(matchResult, matchWeights);
                // The mapping already includes matchResult, no type assertion needed later
                return { ...ej, matchResult, weightedScore };
            })
            .sort((a, b) => b.weightedScore - a.weightedScore);
    }, [enrichedJobs, candidateProfile, matchWeights]);

    if (isLoadingProfile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;

    if (!userRole) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-50 text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-8 shadow-xl">c</div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome to chime</h2>
            <p className="text-gray-500 mb-8 max-w-xs">Precision alignment for technical talent and the teams that need them.</p>
            <div className="flex gap-4">
                <button onClick={() => handleCreateProfile('candidate')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">I'm Talent</button>
                <button onClick={() => handleCreateProfile('recruiter')} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">I'm Hiring</button>
            </div>
            <button onClick={signOut} className="mt-12 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-gray-900">Sign Out</button>
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
                                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Briefcase className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                                        {!candidateProfile?.skills || candidateProfile.skills.length === 0
                                            ? "Complete your profile to see matches"
                                            : "No matches found yet"
                                        }
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        {!candidateProfile?.skills || candidateProfile.skills.length === 0
                                            ? "Add your skills, preferences, and work history to unlock precision-matched opportunities."
                                            : "We're constantly adding new precision-aligned technical roles. Check back shortly!"
                                        }
                                    </p>
                                    {(!candidateProfile?.skills || candidateProfile.skills.length === 0) && (
                                        <button 
                                            onClick={() => setCurrentView('profile')}
                                            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
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
        <div className="min-h-screen bg-gray-50/50">
            <Navigation role={userRole} currentView={currentView} setCurrentView={setCurrentView} onLogout={signOut} notificationCount={notifications.filter(n => !n.isRead).length} />
            <div className="pt-6 pb-20 md:pb-6">{renderContent()}</div>
        </div>
    );
}

function AuthWrapper() {
    const { session, loading } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>(null);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    
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
        <AuthProvider>
            {renderRoute()}
            <DevModeSwitcher />
            <TestSignupBanner />
        </AuthProvider>
    );
}
