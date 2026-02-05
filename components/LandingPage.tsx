import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import ForCompaniesInfo from './landing/ForCompaniesInfo';
import ForTalentInfo from './landing/ForTalentInfo';
import AboutSection from './landing/AboutSection';
import PricingSection from './landing/PricingSection';
import EnrichedCandidateCard from './EnrichedCandidateCard';
import EnrichedJobCard from './EnrichedJobCard';
import { CandidateProfile, JobPosting } from '../types';

interface Props {
    onSelectRole: (role: 'candidate' | 'recruiter') => void;
    onNavigate?: (path: string) => void;
}

// Chime Visual Effect Component - subtle resonance wave on hover
const ChimeVisual: React.FC<{ active?: boolean }> = ({ active }) => (
    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-blue-500/5 rounded-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl animate-pulse" />
    </div>
);

// Match Density Badge Component
const MatchDensityBadge: React.FC<{ score?: number }> = ({ score }) => {
    const displayScore = score || Math.floor(Math.random() * 8) + 85; // 85-92 range
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
            {displayScore}% Match Density
        </span>
    );
};

const LandingHomeContent: React.FC<Props & {
    setFeedType: (t: 'jobs' | 'talent') => void,
    feedType: 'jobs' | 'talent',
    jobs: any[],
    candidates: any[],
    loading: boolean,
    handleCardClick: (type: 'job' | 'candidate') => void
}> = ({ onSelectRole, setFeedType, feedType, jobs, candidates, loading, handleCardClick }) => {
    const [talentHover, setTalentHover] = useState(false);
    const [companyHover, setCompanyHover] = useState(false);

    return (
        <div className="w-full">
            {/* HERO SECTION */}
            <section className="max-w-5xl mx-auto text-center pt-8 pb-20 px-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Pill Badge */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold uppercase tracking-widest border border-teal-100 mb-8">
                    Precision Chiming for Technical Hiring
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.05] mb-8">
                    Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">High-Signal</span> Talent<br />
                    Meets High-Intent Teams
                </h1>
                <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12">
                    Move beyond the keyword lottery. chime uses precise data to align technical skills,
                    team values, and work styles—creating matches that actually last.
                </p>

                {/* Dual CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => onSelectRole('candidate')}
                        onMouseEnter={() => setTalentHover(true)}
                        onMouseLeave={() => setTalentHover(false)}
                        className="group relative w-full sm:w-auto bg-white border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-xl font-semibold text-base hover:border-gray-900 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                        <ChimeVisual active={talentHover} />
                        <span className="relative z-10 flex items-center justify-center">
                            Build Your Anonymous Profile
                            <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </span>
                    </button>
                    <button
                        onClick={() => onSelectRole('recruiter')}
                        onMouseEnter={() => setCompanyHover(true)}
                        onMouseLeave={() => setCompanyHover(false)}
                        className="group relative w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-800 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                        <ChimeVisual active={companyHover} />
                        <span className="relative z-10 flex items-center justify-center">
                            Find Your 85%+ Match
                            <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </span>
                    </button>
                </div>
            </section>

            {/* DUAL-PATH ENTRY SECTION */}
            <section className="max-w-6xl mx-auto px-4 pb-24">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* FOR TALENT */}
                    <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">For Talent</div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 tracking-tight">Own Your Career Signal</h2>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Stop being "hunted" by recruiters who haven't read your profile. On chime, you control the data.
                            Set your hard requirements—salary, tech stack, and autonomy—and only hear from companies that meet them.
                        </p>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">01</div>
                                <div>
                                    <div className="font-semibold text-gray-900 mb-1">Stealth Mode</div>
                                    <div className="text-sm text-gray-500">You are invisible until you choose to chime back</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">02</div>
                                <div>
                                    <div className="font-semibold text-gray-900 mb-1">Direct Access</div>
                                    <div className="text-sm text-gray-500">Skip the gatekeepers; talk to Hiring Managers</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">03</div>
                                <div>
                                    <div className="font-semibold text-gray-900 mb-1">True Transparency</div>
                                    <div className="text-sm text-gray-500">Salary and team culture data, upfront</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onSelectRole('candidate')}
                            className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center group"
                        >
                            Build Your Profile
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* FOR COMPANIES */}
                    <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">For Companies</div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 tracking-tight">Precision-Vetted Pipelines</h2>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Stop sifting through generic CVs. chime delivers a curated stream of candidates whose values
                            and technical DNA align with your specific team culture.
                        </p>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">01</div>
                                <div>
                                    <div className="font-semibold text-gray-900 mb-1">85%+ Match Rate</div>
                                    <div className="text-sm text-gray-500">Our data-matching eliminates the first three rounds of vetting</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">02</div>
                                <div>
                                    <div className="font-semibold text-gray-900 mb-1">Active Intent</div>
                                    <div className="text-sm text-gray-500">Connect with talent ready for their next move</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">03</div>
                                <div>
                                    <div className="font-semibold text-gray-900 mb-1">Quality over Quantity</div>
                                    <div className="text-sm text-gray-500">Pay for connections, not "post and pray"</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onSelectRole('recruiter')}
                            className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center group"
                        >
                            Start Hiring
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* MARKET PULSE SECTION */}
            <section className="max-w-7xl mx-auto px-4 pb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">The Network is Resonating</h2>
                    <p className="text-gray-500 text-lg">Live matches happening right now. See the precision for yourself.</p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="relative bg-gray-100 p-1 rounded-full flex w-72 h-11">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ${
                                feedType === 'jobs' ? 'left-1' : 'left-[calc(50%+2px)]'
                            }`}
                        />
                        <button
                            onClick={() => setFeedType('jobs')}
                            className={`flex-1 relative z-10 text-sm font-semibold transition-colors ${feedType === 'jobs' ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                            Open Roles
                        </button>
                        <button
                            onClick={() => setFeedType('talent')}
                            className={`flex-1 relative z-10 text-sm font-semibold transition-colors ${feedType === 'talent' ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                            Active Talent
                        </button>
                    </div>
                </div>

                {/* Feed Grid */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 h-64 animate-pulse">
                                    <div className="h-5 w-24 bg-gray-100 rounded mb-3" />
                                    <div className="h-6 w-48 bg-gray-100 rounded mb-6" />
                                    <div className="h-16 bg-gray-50 rounded mb-4" />
                                    <div className="flex gap-2">
                                        <div className="h-5 w-20 bg-gray-100 rounded" />
                                        <div className="h-5 w-16 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                            {feedType === 'jobs' ? (
                                jobs.length > 0 ? jobs.map((job: any) => {
                                    const mappedJob: JobPosting = {
                                        id: job.id,
                                        company_id: job.company_id || '',
                                        companyName: job.company_name || 'Company',
                                        companyLogo: job.company_logo,
                                        title: job.title || '',
                                        description: job.description || '',
                                        location: job.location || 'Remote',
                                        salaryRange: job.salary_range || '',
                                        salaryMin: job.salary_min,
                                        salaryMax: job.salary_max,
                                        salaryCurrency: job.salary_currency || 'USD',
                                        seniority: job.seniority || 'Mid Level',
                                        contractTypes: job.contract_types || [],
                                        workMode: job.work_mode || 'Remote',
                                        requiredSkills: (job.required_skills || []).map((s: any) => ({
                                            name: typeof s === 'string' ? s : s.name,
                                            required_level: s.required_level || 3,
                                            weight: s.weight || 'preferred'
                                        })),
                                        values: job.values_list || [],
                                        perks: job.perks || [],
                                        desiredTraits: job.desired_traits || [],
                                        requiredTraits: job.required_traits || [],
                                        postedDate: job.posted_date || job.created_at || new Date().toISOString(),
                                        status: job.status || 'published'
                                    };

                                    return (
                                        <div key={job.id} className="relative">
                                            <div className="absolute top-3 right-3 z-10">
                                                <MatchDensityBadge />
                                            </div>
                                            <EnrichedJobCard
                                                job={mappedJob}
                                                onApply={() => handleCardClick('job')}
                                                onViewDetails={() => handleCardClick('job')}
                                                isPreview={true}
                                            />
                                        </div>
                                    );
                                }) : (
                                    <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center text-gray-400 text-xl font-bold">0</div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No open roles yet</h3>
                                        <p className="text-gray-500 text-sm">Check back soon for new opportunities.</p>
                                    </div>
                                )
                            ) : (
                                candidates.length > 0 ? candidates.map(candidate => {
                                    const candidateProfile: CandidateProfile = {
                                        id: candidate.id,
                                        user_id: candidate.user_id || '',
                                        name: candidate.name || 'Hidden Name',
                                        headline: candidate.headline || '',
                                        email: candidate.email || '',
                                        location: candidate.location || 'Remote',
                                        bio: candidate.bio || '',
                                        status: candidate.status || 'open_to_offers',
                                        skills: candidate.skills || [],
                                        values: candidate.values_list || [],
                                        characterTraits: candidate.character_traits || [],
                                        salaryMin: candidate.salary_min || 0,
                                        salaryMax: candidate.salary_max,
                                        salaryCurrency: candidate.salary_currency || 'USD',
                                        preferredWorkMode: candidate.preferred_work_mode || [],
                                        desiredPerks: candidate.desired_perks || [],
                                        interestedIndustries: candidate.interested_industries || [],
                                        desiredImpactScopes: candidate.desired_impact_scopes || [],
                                        contractTypes: candidate.contract_types || [],
                                        noticePeriod: candidate.notice_period || '',
                                        nonNegotiables: candidate.non_negotiables || [],
                                        onboarding_completed: candidate.onboarding_completed || false,
                                        created_at: candidate.created_at || '',
                                        updated_at: candidate.updated_at || '',
                                        isUnlocked: false,
                                        matchScore: candidate.matchScore || 85
                                    };

                                    return (
                                        <div key={candidate.id} className="relative">
                                            <div className="absolute top-3 right-3 z-10">
                                                <MatchDensityBadge score={candidateProfile.matchScore} />
                                            </div>
                                            <EnrichedCandidateCard
                                                candidate={candidateProfile}
                                                onViewProfile={() => handleCardClick('candidate')}
                                                onUnlock={() => handleCardClick('candidate')}
                                                onSchedule={() => handleCardClick('candidate')}
                                                onMessage={() => handleCardClick('candidate')}
                                                showMatchBreakdown={false}
                                            />
                                        </div>
                                    );
                                }) : (
                                    <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center text-gray-400 text-xl font-bold">0</div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No candidates visible</h3>
                                        <p className="text-gray-500 text-sm">Talent profiles are currently private.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {!loading && (jobs.length > 0 || candidates.length > 0) && (
                        <div className="mt-10 text-center">
                            <button
                                onClick={() => handleCardClick(feedType === 'jobs' ? 'job' : 'candidate')}
                                className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                View All {feedType === 'jobs' ? 'Opportunities' : 'Candidates'}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* THE CHIME METHODOLOGY SECTION */}
            <section className="max-w-5xl mx-auto px-4 pb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">The 4 Dimensions of a Chime</h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">How we determine if a match will actually work.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        {
                            num: '1',
                            title: 'Technical Stack',
                            desc: 'Beyond keywords—we look at depth of experience.'
                        },
                        {
                            num: '2',
                            title: 'Working Style',
                            desc: 'Async vs. Sync, Collaborative vs. Autonomous.'
                        },
                        {
                            num: '3',
                            title: 'Core Values',
                            desc: 'Sustainability, Speed, Innovation, or Work-Life Balance.'
                        },
                        {
                            num: '4',
                            title: 'Growth Alignment',
                            desc: "Does the role's trajectory match the candidate's 5-year plan?"
                        }
                    ].map((dim) => (
                        <div
                            key={dim.num}
                            className="relative bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 transition-colors group"
                        >
                            <div className="absolute top-6 right-6 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg font-bold text-teal-600 group-hover:bg-teal-50 transition-colors">
                                {dim.num}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 pr-12">{dim.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{dim.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CLOSING CTA SECTION */}
            <section className="max-w-7xl mx-auto px-4 pb-16">
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
                    {/* Subtle background effect */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                            Stop Searching. Start Chiming.
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                            Join 1,000+ engineers and high-growth teams finding their perfect resonance.
                        </p>
                        <button
                            onClick={() => onSelectRole('candidate')}
                            className="bg-white text-gray-900 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Get Started for Free
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

const LandingPage: React.FC<Props> = ({ onSelectRole, onNavigate }) => {
    const [feedType, setFeedType] = useState<'jobs' | 'talent'>('jobs');
    const [jobs, setJobs] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInfoPage, setShowInfoPage] = useState<false | 'companies' | 'talent' | 'about' | 'pricing'>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('status', 'published')
                    .order('posted_date', { ascending: false })
                    .limit(6);

                if (jobsData) setJobs(jobsData);

                const { data: candidatesData } = await supabase
                    .from('candidate_profiles')
                    .select('*')
                    .neq('status', 'not_looking')
                    .limit(6);

                if (candidatesData) setCandidates(candidatesData);
            } catch (e) {
                console.error("Error fetching feed data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCardClick = (type: 'job' | 'candidate') => {
        if (type === 'job') {
            onSelectRole('candidate');
            onNavigate?.('/signup?role=candidate');
        } else {
            onSelectRole('recruiter');
            onNavigate?.('/signup?role=recruiter');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between sticky top-0 z-50 bg-gray-50/90 backdrop-blur-sm">
                <div
                    className="flex items-center space-x-2.5 cursor-pointer group"
                    onClick={() => { setShowInfoPage(false); setMobileMenuOpen(false); window.scrollTo(0,0); }}
                >
                    <div className="w-8 h-8 bg-gray-900 rounded-lg text-white flex items-center justify-center font-bold text-lg group-hover:bg-black transition-colors">c</div>
                    <span className="text-xl font-bold tracking-tight">chime</span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden sm:flex items-center space-x-8">
                    <button
                        onClick={() => { setShowInfoPage('talent'); setMobileMenuOpen(false); }}
                        className={`text-sm font-medium transition-colors ${
                            showInfoPage === 'talent' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        For Talent
                    </button>
                    <button
                        onClick={() => { setShowInfoPage('companies'); setMobileMenuOpen(false); }}
                        className={`text-sm font-medium transition-colors ${
                            showInfoPage === 'companies' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        For Companies
                    </button>
                    <button
                        onClick={() => { setShowInfoPage('pricing'); setMobileMenuOpen(false); }}
                        className={`text-sm font-medium transition-colors ${
                            showInfoPage === 'pricing' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Pricing
                    </button>
                    <button
                        onClick={() => { setShowInfoPage('about'); setMobileMenuOpen(false); }}
                        className={`text-sm font-medium transition-colors ${
                            showInfoPage === 'about' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        About
                    </button>
                    <button
                        onClick={() => onSelectRole('candidate')}
                        className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile Header Controls */}
                <div className="flex items-center gap-3 sm:hidden">
                    <button
                        onClick={() => onSelectRole('candidate')}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="sm:hidden bg-white border-b border-gray-100 shadow-lg fixed top-[72px] left-0 right-0 z-40 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-4 space-y-2">
                        <button
                            onClick={() => {
                                setShowInfoPage('talent');
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                                showInfoPage === 'talent'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            For Talent
                        </button>
                        <button
                            onClick={() => {
                                setShowInfoPage('companies');
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                                showInfoPage === 'companies'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            For Companies
                        </button>
                        <button
                            onClick={() => {
                                setShowInfoPage('pricing');
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                                showInfoPage === 'pricing'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Pricing
                        </button>
                        <button
                            onClick={() => {
                                setShowInfoPage('about');
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                                showInfoPage === 'about'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            About
                        </button>
                        {showInfoPage && (
                            <button
                                onClick={() => {
                                    setShowInfoPage(false);
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Back to Home
                            </button>
                        )}
                    </div>
                </div>
            )}

            <main className="flex-grow flex flex-col items-center">
                {!showInfoPage ? (
                    <div className="pt-6 w-full">
                        <LandingHomeContent
                            onSelectRole={onSelectRole}
                            onNavigate={onNavigate}
                            setFeedType={setFeedType}
                            feedType={feedType}
                            jobs={jobs}
                            candidates={candidates}
                            loading={loading}
                            handleCardClick={handleCardClick}
                        />
                    </div>
                ) : showInfoPage === 'companies' ? (
                    <ForCompaniesInfo
                        onGetStarted={() => onSelectRole('recruiter')}
                        onBack={() => setShowInfoPage(false)}
                    />
                ) : showInfoPage === 'talent' ? (
                    <ForTalentInfo
                        onGetStarted={() => onSelectRole('candidate')}
                        onBack={() => setShowInfoPage(false)}
                    />
                ) : showInfoPage === 'about' ? (
                    <AboutSection
                        onGetStarted={() => onSelectRole('candidate')}
                        onBack={() => setShowInfoPage(false)}
                    />
                ) : showInfoPage === 'pricing' ? (
                    <PricingSection
                        onGetStarted={() => onSelectRole('recruiter')}
                        onBack={() => setShowInfoPage(false)}
                    />
                ) : null}
            </main>

            <footer className="py-10 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <div className="mb-4 md:mb-0">
                        &copy; 2025 chime. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-gray-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
