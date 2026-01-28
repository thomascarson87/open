import React, { useState, useEffect } from 'react';
import { User, Briefcase, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import ForCompaniesInfo from './landing/ForCompaniesInfo';
import ForTalentInfo from './landing/ForTalentInfo';
import EnrichedCandidateCard from './EnrichedCandidateCard';
import EnrichedJobCard from './EnrichedJobCard';
import { CandidateProfile, JobPosting } from '../types';

interface Props {
    onSelectRole: (role: 'candidate' | 'recruiter') => void;
    onNavigate?: (path: string) => void;
}

const LandingHomeContent: React.FC<Props & { setFeedType: (t: 'jobs' | 'talent') => void, feedType: 'jobs' | 'talent', jobs: any[], candidates: any[], loading: boolean, handleCardClick: (type: 'job' | 'candidate') => void }> = ({ onSelectRole, onNavigate, setFeedType, feedType, jobs, candidates, loading, handleCardClick }) => (
    <>
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                Precision Chiming for Technical Hiring
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.1]">
                Hiring, <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Aligned.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Precision alignment for people, not profiles. chime connects technical talent with companies where they'll actually thrive — by skills, values, and the way teams work.
            </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100 mb-24">
            
            {/* Talent Card */}
            <button 
                onClick={() => onSelectRole('candidate')}
                className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-200 hover:border-blue-500 transition-all duration-300 text-left overflow-hidden h-full"
            >
                <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                        <User className="w-7 h-7 text-gray-900 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm Looking</h3>
                    <p className="text-gray-500 mb-8">
                        I'm looking for a role where my skills, values, and compensation expectations are met.
                    </p>
                    
                    <ul className="space-y-3 mb-8 flex-grow">
                        <li className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Private by default
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Salary transparency
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Direct hiring manager access
                        </li>
                    </ul>

                    <div className="flex items-center font-bold text-blue-600 group-hover:translate-x-2 transition-transform mt-auto">
                        Create Candidate Profile <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </button>

            {/* Hiring Card */}
            <button 
                onClick={() => onSelectRole('recruiter')}
                className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-200 hover:border-gray-900 transition-all duration-300 text-left overflow-hidden h-full"
            >
                <div className="absolute top-0 right-0 p-32 bg-gray-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="w-14 h-14 bg-gray-50 group-hover:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                        <Briefcase className="w-7 h-7 text-gray-900 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm Hiring</h3>
                    <p className="text-gray-500 mb-8">
                        I'm looking for high-quality candidates with precise alignment to our tech stack.
                    </p>
                    
                    <ul className="space-y-3 mb-8 flex-grow">
                        <li className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-2 text-gray-900" /> 85%+ Match Rate
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-2 text-gray-900" /> Pay only for connections
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-2 text-gray-900" /> Team collaboration tools
                        </li>
                    </ul>

                    <div className="flex items-center font-bold text-gray-900 group-hover:translate-x-2 transition-transform mt-auto">
                        Post a Job <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </button>
        </div>

        {/* Live Feed Section */}
        <div className="w-full max-w-7xl px-2 sm:px-4">
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Market Pulse</h2>
                <p className="text-gray-500 text-center mb-8">Real opportunities and talent live on chime right now.</p>
                
                {/* Toggle */}
                <div className="relative bg-gray-100 p-1 rounded-full flex w-64 h-12 shadow-inner">
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-spring ${
                            feedType === 'jobs' ? 'left-1' : 'left-[calc(50%+2px)]'
                        }`}
                    ></div>
                    <button 
                        onClick={() => setFeedType('jobs')}
                        className={`flex-1 relative z-10 text-sm font-bold transition-colors ${feedType === 'jobs' ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                        Browse Roles
                    </button>
                    <button 
                        onClick={() => setFeedType('talent')}
                        className={`flex-1 relative z-10 text-sm font-bold transition-colors ${feedType === 'talent' ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                        Browse Candidates
                    </button>
                </div>
            </div>

            {/* Feed Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-64 animate-pulse">
                                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 w-48 bg-gray-200 rounded mb-8"></div>
                                <div className="h-20 bg-gray-100 rounded mb-4"></div>
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-500">
                        {feedType === 'jobs' ? (
                            jobs.length > 0 ? jobs.map((job: any) => {
                                // Transform raw DB job to JobPosting shape for the card
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
                                    <EnrichedJobCard
                                        key={job.id}
                                        job={mappedJob}
                                        onApply={() => handleCardClick('job')}
                                        onViewDetails={() => handleCardClick('job')}
                                        isPreview={true}
                                    />
                                );
                            }) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">No open roles yet</h3>
                                    <p className="text-gray-500">Check back soon for new opportunities.</p>
                                </div>
                            )
                        ) : (
                            candidates.length > 0 ? candidates.map(candidate => {
                                // Transform raw DB candidate to CandidateProfile shape for the card
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
                                    isUnlocked: false, // Always locked on landing page
                                    matchScore: candidate.matchScore || 85 // Default score for preview
                                };

                                return (
                                    <EnrichedCandidateCard
                                        key={candidate.id}
                                        candidate={candidateProfile}
                                        onViewProfile={() => handleCardClick('candidate')}
                                        onUnlock={() => handleCardClick('candidate')}
                                        onSchedule={() => handleCardClick('candidate')}
                                        onMessage={() => handleCardClick('candidate')}
                                        showMatchBreakdown={false}
                                    />
                                );
                            }) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">No candidates visible</h3>
                                    <p className="text-gray-500">Talent profiles are currently private.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
                
                {!loading && (jobs.length > 0 || candidates.length > 0) && (
                    <div className="mt-12 text-center">
                        <button 
                            onClick={() => handleCardClick(feedType === 'jobs' ? 'job' : 'candidate')}
                            className="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            View All {feedType === 'jobs' ? 'Opportunities' : 'Candidates'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    </>
);

const LandingPage: React.FC<Props> = ({ onSelectRole, onNavigate }) => {
    const [feedType, setFeedType] = useState<'jobs' | 'talent'>('jobs');
    const [jobs, setJobs] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInfoPage, setShowInfoPage] = useState<false | 'companies' | 'talent'>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Jobs
                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('status', 'published')
                    .order('posted_date', { ascending: false })
                    .limit(6);
                
                if (jobsData) setJobs(jobsData);

                // Fetch Candidates
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
        // If clicking a job, user is likely a candidate
        if (type === 'job') {
            onSelectRole('candidate');
            onNavigate?.('/signup?role=candidate');
        } 
        // If clicking a candidate, user is likely a recruiter
        else {
            onSelectRole('recruiter');
            onNavigate?.('/signup?role=recruiter');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between sticky top-0 z-50 bg-gray-50/80 backdrop-blur-sm border-b border-transparent">
                <div 
                    className="flex items-center space-x-2 cursor-pointer group" 
                    onClick={() => { setShowInfoPage(false); setMobileMenuOpen(false); window.scrollTo(0,0); }}
                >
                    <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">c</div>
                    <span className="text-xl font-bold tracking-tight">chime</span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden sm:flex items-center space-x-6">
                    <button 
                        onClick={() => { setShowInfoPage('talent'); setMobileMenuOpen(false); }} 
                        className={`text-sm font-medium transition-colors ${
                            showInfoPage === 'talent' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        For Talent
                    </button>
                    <button 
                        onClick={() => { setShowInfoPage('companies'); setMobileMenuOpen(false); }} 
                        className={`text-sm font-medium transition-colors ${
                            showInfoPage === 'companies' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        For Companies
                    </button>
                    <button 
                        onClick={() => onSelectRole('candidate')} 
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg active:scale-95"
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile Header Controls */}
                <div className="flex items-center gap-3 sm:hidden">
                    <button 
                        onClick={() => onSelectRole('candidate')} 
                        className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all active:scale-95"
                    >
                        Get Started
                    </button>
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="sm:hidden bg-white border-b border-gray-200 shadow-xl fixed top-[80px] left-0 right-0 z-40 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-6 space-y-3">
                        <button 
                            onClick={() => {
                                setShowInfoPage('talent');
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-4 rounded-2xl font-bold transition-all flex items-center justify-between ${
                                showInfoPage === 'talent' 
                                    ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200' 
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            For Talent
                            <ArrowRight className="w-4 h-4 opacity-50" />
                        </button>
                        <button 
                            onClick={() => {
                                setShowInfoPage('companies');
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-4 rounded-2xl font-bold transition-all flex items-center justify-between ${
                                showInfoPage === 'companies' 
                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' 
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            For Companies
                            <ArrowRight className="w-4 h-4 opacity-50" />
                        </button>
                        <div className="pt-2">
                            <button 
                                onClick={() => {
                                    setShowInfoPage(false);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full text-center px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                                    !showInfoPage 
                                        ? 'text-gray-900 bg-gray-100' 
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-grow flex flex-col items-center pb-20">
                {!showInfoPage ? (
                    <div className="pt-10 w-full flex flex-col items-center px-4">
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
                ) : (
                    <ForTalentInfo 
                        onGetStarted={() => onSelectRole('candidate')}
                        onBack={() => setShowInfoPage(false)}
                    />
                )}
            </main>

            <footer className="py-12 bg-white border-t border-gray-100 text-center text-sm text-gray-400">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        &copy; 2025 chime. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-gray-900">Privacy</a>
                        <a href="#" className="hover:text-gray-900">Terms</a>
                        <a href="#" className="hover:text-gray-900">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
