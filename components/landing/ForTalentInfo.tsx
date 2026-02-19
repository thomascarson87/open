import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, FileText, Shield, Compass, LayoutDashboard, MessageSquare, Eye, TrendingUp, ChevronDown, User, EyeOff, Target, BadgeCheck, Lock, Unlock, Calendar, Paperclip, Send } from 'lucide-react';

interface Props {
    onGetStarted: () => void;
    onBack: () => void;
}

// Chime Verified Badge Component with premium styling
const ChimeVerifiedBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
    <span className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-accent-coral via-accent-coral-light to-accent-coral bg-[length:200%_100%] animate-shimmer text-white rounded-full font-semibold ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
        <Shield className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        Chime Verified
    </span>
);

// Demo tabs configuration
const candidateDemoTabs = [
    { id: 'profile', label: 'Living Profile', icon: User },
    { id: 'stealth', label: 'Stealth Mode', icon: EyeOff },
    { id: 'matching', label: 'Match Intelligence', icon: Target },
    { id: 'messaging', label: 'Direct Access', icon: MessageSquare },
    { id: 'verification', label: 'Get Verified', icon: BadgeCheck }
] as const;

type CandidateDemoTabId = typeof candidateDemoTabs[number]['id'];

const ForTalentInfo: React.FC<Props> = ({ onGetStarted, onBack }) => {
    const [stealthMode, setStealthMode] = useState(true);
    const [mobileTableIndex, setMobileTableIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<CandidateDemoTabId>('profile');
    const [profileView, setProfileView] = useState<'resume' | 'chime'>('chime');
    const [demoStealthMode, setDemoStealthMode] = useState(true);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const comparisonData = [
        {
            feature: 'Privacy',
            oldWay: 'Your boss can see you\'re "Open to Work"',
            chimeWay: 'Total stealth until you engage'
        },
        {
            feature: 'Quality',
            oldWay: 'Self-reported skills (unreliable)',
            chimeWay: 'Peer-verified authority'
        },
        {
            feature: 'Communication',
            oldWay: 'Third-party recruiters / Spam',
            chimeWay: 'Direct Hiring Manager access'
        },
        {
            feature: 'Matching',
            oldWay: 'Based on keywords',
            chimeWay: 'Based on "Ways of Working" & Ambition'
        },
        {
            feature: 'Application',
            oldWay: 'Black hole / No feedback',
            chimeWay: 'Transparent tracking & status'
        }
    ];

    const toolsetFeatures = [
        {
            icon: LayoutDashboard,
            title: 'The Unified Command Center',
            desc: 'A clean, minimal dashboard to track every "Chime." No more messy spreadsheets or lost emails.'
        },
        {
            icon: MessageSquare,
            title: 'Direct-to-Manager Messaging',
            desc: 'Cut out the middleman. When you "Chime" with a company, you are placed in a direct thread with the Hiring Manager. No ghosting, no gatekeepers.'
        },
        {
            icon: Eye,
            title: 'Anonymous Discovery',
            desc: 'You remain a "Signal" until you decide to reveal your "Identity." Browse the market without your current employer ever knowing you\'re looking.'
        },
        {
            icon: TrendingUp,
            title: 'Transparent Tracking',
            desc: 'See exactly where you stand in every application. No black holes. No wondering. Full visibility.'
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-24">

            {/* Add shimmer animation for verified badge */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .animate-shimmer {
                    animation: shimmer 3s ease-in-out infinite;
                }
            `}</style>

            {/* HERO SECTION */}
            <section className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Pill Badge */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-coral-bg text-accent-coral text-xs font-semibold uppercase tracking-widest border border-accent-coral-bg mb-8">
                    For Talent
                </div>

                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl tracking-tight text-primary leading-[1.05] mb-8">
                    Your Career, In<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">High Definition</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto leading-relaxed mb-12">
                    Stop fitting your life into a 2-page PDF. Chime maps your skills, values, and professional ambitions
                    to the teams where you'll actually thrive. Precision matches, private by default, and verified by peers.
                </p>

                {/* Dual CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={onGetStarted}
                        className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-800 hover:shadow-lg transition-all group flex items-center justify-center"
                    >
                        Build Your Verified Profile
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto bg-white dark:bg-surface border-2 border-border text-gray-700 dark:text-gray-300 dark:text-gray-600 px-8 py-4 rounded-xl font-semibold text-base hover:border-gray-300 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        See How the Match Works
                    </button>
                </div>
            </section>

            {/* THREE PILLARS OF CAREER PRECISION */}
            <section id="pillars" className="space-y-16">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-coral-bg text-accent-coral text-xs font-semibold uppercase tracking-widest border border-accent-coral-bg mb-6">
                        The Candidate Advantage
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Three Pillars of Career Precision
                    </h2>
                    <p className="text-muted text-lg">You are more than your tech stack.</p>
                </div>

                {/* Three Pillars Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Pillar 1: The Living Granular CV */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <FileText className="w-6 h-6 text-muted" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            The "<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">Living</span>" Granular CV
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">The Anatomy of a Profile:</span> Move beyond bullet points.
                                Build a profile that captures your architectural preferences, your ideal team velocity, and your growth trajectory.
                            </p>
                            <p>
                                <span className="font-semibold text-primary">Supported & Scalable:</span> Every claim you make—from
                                "Scale-up Leadership" to "Rust Concurrency"—can be supported by real-world evidence and direct links to your best work.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2: Peer-Verified Authority */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-muted" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">Peer-Verified</span> Authority
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">Proof Over Promises:</span> Use our Verify Functionality to gain the{' '}
                                <ChimeVerifiedBadge size="sm" /> badge. High-signal talent shouldn't have to prove themselves in every interview;
                                let your peers and past collaborators vouch for your quality through our precision verification layer.
                            </p>
                            <p>
                                <span className="font-semibold text-primary">The Result:</span> Recruiters stop asking "Can you do this?"
                                and start asking "When can you start?"
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3: The Algorithm of Ambition */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <Compass className="w-6 h-6 text-muted" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            The Algorithm of <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">Ambition</span>
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">Total Alignment:</span> Our matching engine doesn't just look for a
                                "React Developer." It looks for a "React Developer who thrives in async-first, flat-hierarchy, sustainability-focused startups."
                            </p>
                            <p>
                                <span className="font-semibold text-primary">Inside Intelligence:</span> Get real insights into how a hiring manager
                                actually works before you even speak to them. See their team's communication style and decision-making framework.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* INTERACTIVE PRODUCT SHOWCASE */}
            <section className="space-y-12">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-coral-bg text-accent-coral text-xs font-semibold uppercase tracking-widest border border-accent-coral-bg mb-6">
                        Experience The Difference
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Your Career Command Center
                    </h2>
                    <p className="text-muted text-lg">
                        See how Chime puts you in control of your career trajectory.
                    </p>
                </div>

                {/* Tab Navigation - Desktop */}
                <div className="hidden md:flex justify-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl max-w-4xl mx-auto">
                    {candidateDemoTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-surface text-accent-coral shadow-sm'
                                        : 'text-muted hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Navigation - Mobile Dropdown */}
                <div className="md:hidden relative">
                    <button
                        onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-primary"
                    >
                        <span className="flex items-center gap-2">
                            {(() => {
                                const currentTab = candidateDemoTabs.find(t => t.id === activeTab);
                                const Icon = currentTab?.icon || User;
                                return (
                                    <>
                                        <Icon className="w-4 h-4 text-accent-coral" />
                                        {currentTab?.label}
                                    </>
                                );
                            })()}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                            {candidateDemoTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setMobileDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-accent-coral-bg text-accent-coral'
                                                : 'text-muted hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Demo Content Area */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">

                    {/* TAB 1: Living Profile */}
                    {activeTab === 'profile' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Your Living Profile</h3>
                                    <p className="text-muted text-sm">12+ data dimensions vs. 2 pages of bullets.</p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setProfileView('resume')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            profileView === 'resume' ? 'bg-white dark:bg-surface text-primary shadow-sm' : 'text-muted'
                                        }`}
                                    >
                                        <FileText className="w-4 h-4" /> Resume
                                    </button>
                                    <button
                                        onClick={() => setProfileView('chime')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            profileView === 'chime' ? 'bg-accent-coral text-white shadow-sm' : 'text-muted'
                                        }`}
                                    >
                                        <Target className="w-4 h-4" /> Chime Profile
                                    </button>
                                </div>
                            </div>

                            {/* Split Screen Comparison */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Traditional Resume View */}
                                <div className={`transition-all duration-300 ${profileView === 'resume' ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-border h-full">
                                        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Traditional Resume</div>
                                        <div className="bg-white dark:bg-surface rounded-lg p-4 border border-border shadow-sm space-y-4">
                                            <div className="border-b border-border pb-3">
                                                <div className="font-bold text-primary">Alex Rivera</div>
                                                <div className="text-sm text-muted">Senior Frontend Engineer</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Experience</div>
                                                <div className="text-sm text-muted">5+ years React development...</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Skills</div>
                                                <div className="text-sm text-muted">React, TypeScript, Node.js...</div>
                                            </div>
                                            <div className="text-center py-4 border-t border-border">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">...and that's it.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chime Profile View */}
                                <div className={`transition-all duration-300 ${profileView === 'chime' ? 'opacity-100 scale-[1.02]' : 'opacity-60'}`}>
                                    <div className="bg-accent-coral-bg rounded-xl p-6 border border-accent-coral-light h-full">
                                        <div className="text-xs font-semibold text-accent-coral uppercase tracking-wider mb-4">Chime Profile</div>
                                        <div className="bg-white dark:bg-surface rounded-lg p-4 border border-accent-coral-light shadow-sm space-y-4">
                                            <div className="flex items-center gap-3 border-b border-border pb-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-coral to-accent-green flex items-center justify-center text-white font-bold">A</div>
                                                <div>
                                                    <div className="font-bold text-primary flex items-center gap-2">
                                                        Alex Rivera
                                                        <ChimeVerifiedBadge size="sm" />
                                                    </div>
                                                    <div className="text-sm text-muted">Senior Frontend Engineer</div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Skills with Proficiency</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="px-2 py-1 bg-accent-coral-bg text-accent-coral rounded text-xs font-medium">React L4</span>
                                                    <span className="px-2 py-1 bg-accent-coral-bg text-accent-coral rounded text-xs font-medium">TypeScript L4</span>
                                                    <span className="px-2 py-1 bg-accent-green-bg text-accent-green rounded text-xs font-medium">Node.js L3</span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Working Style</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="px-2 py-1 bg-accent-green-bg text-accent-green rounded text-xs font-medium">Async-First</span>
                                                    <span className="px-2 py-1 bg-accent-green-bg text-accent-green rounded text-xs font-medium">High Autonomy</span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Core Values</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Work-Life Balance</span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Continuous Learning</span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Growth Trajectory</div>
                                                <div className="text-sm text-muted">IC → Tech Lead in 2-3 years</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Stealth Mode */}
                    {activeTab === 'stealth' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-primary mb-2">Stealth Mode</h3>
                                <p className="text-muted text-sm max-w-xl mx-auto">
                                    Browse jobs, build matches, and explore opportunities—all while your current employer has zero visibility.
                                </p>
                            </div>

                            {/* Toggle Control */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setDemoStealthMode(!demoStealthMode)}
                                    className={`relative w-20 h-10 rounded-full transition-all duration-300 ${
                                        demoStealthMode
                                            ? 'bg-accent-coral shadow-lg shadow-accent-coral/50'
                                            : 'bg-gray-300'
                                    }`}
                                >
                                    <div className={`absolute top-1 w-8 h-8 bg-white dark:bg-surface rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                                        demoStealthMode ? 'left-[44px]' : 'left-1'
                                    }`}>
                                        {demoStealthMode ? (
                                            <EyeOff className="w-4 h-4 text-accent-coral" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* Side by Side Comparison */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Stealth Mode ON */}
                                <div className={`transition-all duration-500 ${demoStealthMode ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 relative overflow-hidden">
                                        {demoStealthMode && (
                                            <div className="absolute inset-0 bg-accent-coral/10 animate-pulse" />
                                        )}
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="px-2 py-1 bg-accent-coral/20 text-accent-coral-light text-xs font-semibold rounded flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> Stealth Mode Active
                                                </span>
                                                <span className="text-accent-coral-light font-bold">92%</span>
                                            </div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                                    <User className="w-6 h-6 text-muted" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white font-mono">Signal-7</div>
                                                    <div className="text-sm text-gray-400 dark:text-gray-500">Company: Stealth</div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="px-2 py-1 bg-gray-800 text-gray-300 dark:text-gray-600 rounded text-xs">React L4</span>
                                                    <span className="px-2 py-1 bg-gray-800 text-gray-300 dark:text-gray-600 rounded text-xs">TypeScript L4</span>
                                                </div>
                                                <div className="text-xs text-muted">Skills visible • Identity hidden</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stealth Mode OFF */}
                                <div className={`transition-all duration-500 ${!demoStealthMode ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                                    <div className="bg-surface rounded-xl p-6 border border-border">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1">
                                                <Unlock className="w-3 h-3" /> Profile Public
                                            </span>
                                            <span className="text-accent-coral font-bold">92%</span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-coral to-accent-green flex items-center justify-center text-white font-bold">
                                                A
                                            </div>
                                            <div>
                                                <div className="font-bold text-primary">Alex Rivera</div>
                                                <div className="text-sm text-muted">TechCorp Inc.</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="px-2 py-1 bg-accent-coral-bg text-accent-coral rounded text-xs">React L4</span>
                                                <span className="px-2 py-1 bg-accent-coral-bg text-accent-coral rounded text-xs">TypeScript L4</span>
                                            </div>
                                            <div className="text-xs text-muted">Full profile visible</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center text-sm text-muted">
                                You decide when to reveal your identity. Companies see your signal, not your name.
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Match Intelligence */}
                    {activeTab === 'matching' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">Match Intelligence</h3>
                                <p className="text-muted text-sm">See exactly why a role is a 90% match and where the gaps are.</p>
                            </div>

                            {/* Match Visualization */}
                            <div className="grid md:grid-cols-3 gap-6 items-start">
                                {/* Your Profile */}
                                <div className="bg-accent-coral-bg rounded-xl p-5 border border-accent-coral-light">
                                    <div className="text-xs font-semibold text-accent-coral uppercase tracking-wider mb-4">Your Profile</div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-muted mb-1">Technical Stack</div>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="px-2 py-0.5 bg-white dark:bg-surface border border-accent-coral-light rounded text-xs text-accent-coral">React</span>
                                                <span className="px-2 py-0.5 bg-white dark:bg-surface border border-accent-coral-light rounded text-xs text-accent-coral">TypeScript</span>
                                                <span className="px-2 py-0.5 bg-white dark:bg-surface border border-accent-coral-light rounded text-xs text-accent-coral">Node.js</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted mb-1">Working Style</div>
                                            <span className="px-2 py-0.5 bg-white dark:bg-surface border border-accent-coral-light rounded text-xs text-accent-coral">Async-First</span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted mb-1">Growth Goal</div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300 dark:text-gray-600">IC → Tech Lead (2-3 yrs)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Match Score */}
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-coral to-accent-green flex items-center justify-center">
                                            <div className="w-20 h-20 rounded-full bg-white dark:bg-surface flex items-center justify-center">
                                                <span className="text-2xl font-black text-primary">90%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm font-medium text-muted">Overall Match</div>
                                </div>

                                {/* Job Opportunity */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-border">
                                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Job Opportunity</div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-muted mb-1">Required Stack</div>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="px-2 py-0.5 bg-green-100 border border-green-200 rounded text-xs text-green-700">React</span>
                                                <span className="px-2 py-0.5 bg-green-100 border border-green-200 rounded text-xs text-green-700">TypeScript</span>
                                                <span className="px-2 py-0.5 bg-surface border border-border rounded text-xs text-muted">Python</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted mb-1">Team Style</div>
                                            <span className="px-2 py-0.5 bg-green-100 border border-green-200 rounded text-xs text-green-700">Async-First</span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted mb-1">Growth Path</div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300 dark:text-gray-600">Tech Lead (1-2 yrs)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-border">
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-4">Match Breakdown</div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Technical Stack', score: 94, status: 'match', detail: 'React, TypeScript, Node.js' },
                                        { label: 'Working Style', score: 88, status: 'match', detail: 'Async-first communication' },
                                        { label: 'Core Values', score: 96, status: 'match', detail: 'Work-life balance, Continuous learning' },
                                        { label: 'Growth Alignment', score: 82, status: 'partial', detail: 'Timeline slight mismatch: You prefer 2-3 yrs, role suggests 1-2 yrs' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-32 text-sm text-muted">{item.label}</div>
                                            <div className="flex-1">
                                                <div className="h-2 bg-border rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.status === 'match' ? 'bg-accent-coral' : 'bg-amber-400'}`}
                                                        style={{ width: `${item.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className={`w-12 text-right text-sm font-semibold ${item.status === 'match' ? 'text-accent-coral' : 'text-amber-600'}`}>
                                                {item.score}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Direct Access Messaging */}
                    {activeTab === 'messaging' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">Direct Access</h3>
                                <p className="text-muted text-sm">No recruiter gatekeepers. Just direct, technical conversations with hiring managers.</p>
                            </div>

                            {/* Chat Interface */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-border overflow-hidden max-w-2xl mx-auto">
                                {/* Chat Header */}
                                <div className="bg-white dark:bg-surface px-4 py-3 border-b border-border flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-coral to-accent-green flex items-center justify-center text-white font-bold text-sm">SC</div>
                                    <div>
                                        <div className="font-semibold text-primary text-sm">Sarah Chen</div>
                                        <div className="text-xs text-muted">Hiring Manager @ TechCorp</div>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="px-2 py-1 bg-accent-coral-bg text-accent-coral text-xs font-semibold rounded">92% Match</span>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 max-h-80 overflow-y-auto">
                                    {/* Message from Hiring Manager */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-coral to-accent-green flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">SC</div>
                                        <div className="bg-white dark:bg-surface rounded-lg rounded-tl-none p-3 border border-border max-w-[80%]">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600">Hi Signal-7! Your profile shows a 92% match for our Senior Engineer role. I'd love to discuss our async-first culture and growth trajectory. Are you open to a brief call this week?</p>
                                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">2:34 PM</div>
                                        </div>
                                    </div>

                                    {/* Message from Candidate */}
                                    <div className="flex gap-3 justify-end">
                                        <div className="bg-accent-coral text-white rounded-lg rounded-tr-none p-3 max-w-[80%]">
                                            <p className="text-sm">Thanks Sarah! I'm interested. Before we schedule, can you share more about the team's tech debt management philosophy and on-call rotation?</p>
                                            <div className="text-xs text-accent-coral-light mt-1">2:41 PM</div>
                                        </div>
                                    </div>

                                    {/* Response with attachment */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-coral to-accent-green flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">SC</div>
                                        <div className="space-y-2 max-w-[80%]">
                                            <div className="bg-white dark:bg-surface rounded-lg rounded-tl-none p-3 border border-border">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600">Great questions. We dedicate 20% of each sprint to tech debt and rotate on-call weekly across a team of 8. I've attached our engineering principles doc.</p>
                                            </div>
                                            <div className="bg-white dark:bg-surface rounded-lg p-3 border border-border flex items-center gap-2">
                                                <Paperclip className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                <span className="text-sm text-accent-coral font-medium">engineering-principles.pdf</span>
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">2:45 PM</div>
                                        </div>
                                    </div>

                                    {/* Final message with calendar */}
                                    <div className="flex gap-3 justify-end">
                                        <div className="space-y-2 max-w-[80%]">
                                            <div className="bg-accent-coral text-white rounded-lg rounded-tr-none p-3">
                                                <p className="text-sm">This aligns well with my values. Let's schedule a call.</p>
                                            </div>
                                            <div className="bg-accent-coral text-white rounded-lg p-3 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm font-medium">calendar.chime.works/signal-7</span>
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500 text-right">2:48 PM</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Input Area */}
                                <div className="bg-white dark:bg-surface px-4 py-3 border-t border-border flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-coral"
                                        disabled
                                    />
                                    <button className="p-2 bg-accent-coral rounded-lg text-white">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: Verification */}
                    {activeTab === 'verification' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">Get Verified</h3>
                                <p className="text-muted text-sm">Let your peers vouch for your skills. Verified profiles get unlocked 3x more often.</p>
                            </div>

                            {/* Verification Flow */}
                            <div className="space-y-4">
                                {/* Step 1 */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-coral-bg flex items-center justify-center">
                                        <span className="text-sm font-bold text-accent-coral">1</span>
                                    </div>
                                    <div className="flex-1 bg-surface rounded-xl p-4 border border-border">
                                        <div className="font-semibold text-primary mb-2">Submit Verification Request</div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1.5 bg-accent-coral-bg border border-accent-coral-light rounded-lg text-sm text-accent-coral">
                                                Skill: React (Mastering Level)
                                            </span>
                                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-border rounded-lg text-sm text-muted">
                                                Verifier: Sarah Chen (Tech Lead)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="w-px h-6 bg-gray-300" />
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-coral-bg flex items-center justify-center">
                                        <span className="text-sm font-bold text-accent-coral">2</span>
                                    </div>
                                    <div className="flex-1 bg-surface rounded-xl p-4 border border-border">
                                        <div className="font-semibold text-primary mb-2">Verifier Receives Request</div>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm text-muted italic">
                                            "Alex Rivera has requested you verify their React expertise. Please confirm their proficiency level and provide brief context."
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="w-px h-6 bg-gray-300" />
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1 bg-green-50 rounded-xl p-4 border border-green-200">
                                        <div className="font-semibold text-primary mb-2 flex items-center gap-2">
                                            Verification Confirmed
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="text-sm text-muted mb-2">
                                            Verified by Sarah Chen (Tech Lead @ Previous Co)
                                        </div>
                                        <div className="bg-white dark:bg-surface rounded-lg p-3 text-sm text-muted italic border border-green-200">
                                            "Worked with Alex for 2 years. Led our migration to React 18. Exceptional understanding of performance optimization."
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="w-px h-6 bg-gray-300" />
                                </div>

                                {/* Step 4 - Badge Earned */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-coral to-accent-green flex items-center justify-center">
                                        <BadgeCheck className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 bg-gradient-to-r from-accent-coral-bg to-accent-green-bg rounded-xl p-4 border border-accent-coral-light">
                                        <div className="font-semibold text-primary mb-3">Badge Earned</div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted">Before:</span>
                                                <span className="px-2 py-1 bg-surface border border-border rounded text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600">React (Mastering)</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted">After:</span>
                                                <span className="px-2 py-1 bg-white dark:bg-surface border border-accent-coral-light rounded text-sm text-accent-coral flex items-center gap-1">
                                                    React (Mastering) <Check className="w-3 h-3 text-accent-coral" />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <ChimeVerifiedBadge />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dashboard Preview Callout */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-border">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <h4 className="font-bold text-primary mb-2">The Unified Command Center</h4>
                            <p className="text-muted text-sm mb-4">Track every opportunity in one place. No spreadsheets. No chaos.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Active Matches', value: '5', color: 'blue' },
                                    { label: 'Messages', value: '3', color: 'green' },
                                    { label: 'In Progress', value: '2', color: 'purple' },
                                    { label: 'Profile', value: '87%', color: 'teal' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-surface rounded-lg p-3 border border-border text-center">
                                        <div className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                                        <div className="text-xs text-muted">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE CANDIDATE TOOLSET */}
            <section className="space-y-12">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-coral-bg text-accent-coral text-xs font-semibold uppercase tracking-widest border border-accent-coral-bg mb-6">
                        Your Command Center
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Built for How You Actually Job Search
                    </h2>
                </div>

                {/* 2x2 Feature Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {toolsetFeatures.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <div key={i} className="bg-surface rounded-xl p-6 border border-border hover:border-border hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent-coral-bg flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-accent-coral" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary mb-2">{feature.title}</h3>
                                        <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* COMPARATIVE VALUE TABLE */}
            <section className="space-y-12">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-coral-bg text-accent-coral text-xs font-semibold uppercase tracking-widest border border-accent-coral-bg mb-6">
                        Why Talent Chooses Chime
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Stop Settling for Noise
                    </h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden rounded-xl border border-border">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Feature</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">The Old Way (LinkedIn/Boards)</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-accent-coral uppercase tracking-wider bg-accent-coral-bg/50">The Chime Way</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {comparisonData.map((row, i) => (
                                <tr key={i} className="bg-white dark:bg-surface">
                                    <td className="px-6 py-4 text-sm font-semibold text-primary">{row.feature}</td>
                                    <td className="px-6 py-4 text-sm text-muted">{row.oldWay}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-accent-coral bg-accent-coral-bg/30">
                                        <span className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-accent-coral" />
                                            {row.chimeWay}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {comparisonData.map((row, i) => (
                        <div key={i} className="bg-surface rounded-xl border border-border p-5">
                            <div className="text-sm font-bold text-primary mb-4">{row.feature}</div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase flex-shrink-0">Old Way</span>
                                    <span className="text-sm text-muted text-right">{row.oldWay}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4 pt-2 border-t border-border">
                                    <span className="text-xs text-accent-coral uppercase font-semibold flex-shrink-0">Chime</span>
                                    <span className="text-sm font-semibold text-accent-coral flex items-center gap-1 text-right">
                                        <Check className="w-4 h-4 flex-shrink-0" />
                                        {row.chimeWay}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* STEALTH MODE FEATURE CALLOUT */}
            <section className="space-y-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-coral-bg text-accent-coral text-xs font-semibold uppercase tracking-widest border border-accent-coral-bg mb-6">
                        Privacy First
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Job Search Without the Anxiety
                    </h2>
                </div>

                {/* Stealth Mode Visual */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                    {/* Subtle background glow */}
                    <div className={`absolute inset-0 transition-opacity duration-700 ${stealthMode ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-coral/20 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        {/* Toggle Visual */}
                        <div className="flex-shrink-0">
                            <div className="flex flex-col items-center gap-6">
                                {/* Toggle Switch */}
                                <button
                                    onClick={() => setStealthMode(!stealthMode)}
                                    className={`relative w-24 h-12 rounded-full transition-all duration-300 ${
                                        stealthMode
                                            ? 'bg-accent-coral shadow-lg shadow-accent-coral/50'
                                            : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`absolute top-1 w-10 h-10 bg-white dark:bg-surface rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                                        stealthMode ? 'left-[52px]' : 'left-1'
                                    }`}>
                                        <Eye className={`w-5 h-5 transition-colors ${stealthMode ? 'text-accent-coral' : 'text-gray-400 dark:text-gray-500'}`} />
                                    </div>
                                </button>

                                {/* Status Text */}
                                <div className="text-center">
                                    <div className={`text-sm font-semibold transition-colors ${stealthMode ? 'text-accent-coral-light' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {stealthMode ? 'Stealth Mode Active' : 'Full Profile Visible'}
                                    </div>
                                    {stealthMode && (
                                        <div className="mt-2 px-3 py-1 bg-accent-coral/20 border border-accent-coral/30 rounded-lg">
                                            <span className="text-accent-coral-light font-mono text-sm">Signal-7</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Copy */}
                        <div className="flex-1 text-center lg:text-left">
                            <p className="text-gray-300 dark:text-gray-600 text-lg leading-relaxed mb-6">
                                Browse opportunities, build your profile, and explore matches—all while remaining completely anonymous.
                                Your current employer will never know you're looking. You control when to reveal your identity.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                                    <Check className="w-4 h-4 text-accent-coral-light" />
                                    Invisible to current employer
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                                    <Check className="w-4 h-4 text-accent-coral-light" />
                                    Reveal on your terms
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                                    <Check className="w-4 h-4 text-accent-coral-light" />
                                    Companies see your signal, not your name
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CLOSING CTA SECTION */}
            <section className="py-16">
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
                    {/* Subtle background effect */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-coral/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white mb-4 tracking-tight">
                            Ready to Find Your Perfect Resonance?
                        </h2>
                        <p className="text-gray-400 dark:text-gray-500 text-lg mb-10">
                            Join 1,000+ engineers who've stopped settling for "close enough."
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={onGetStarted}
                                className="w-full sm:w-auto bg-white dark:bg-surface text-primary px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Build Your Profile Free
                            </button>
                        </div>
                        <p className="mt-6 text-muted text-sm">
                            <button
                                onClick={() => document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' })}
                                className="hover:text-gray-300 dark:text-gray-600 transition-colors underline underline-offset-2"
                            >
                                See how matching works
                            </button>
                        </p>
                    </div>
                </div>
            </section>

            {/* Back Link */}
            <div className="text-center pb-8">
                <button
                    onClick={onBack}
                    className="text-gray-400 dark:text-gray-500 font-medium hover:text-muted transition-colors flex items-center justify-center mx-auto text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Main Landing
                </button>
            </div>
        </div>
    );
};

export default ForTalentInfo;
