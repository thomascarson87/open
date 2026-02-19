import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Code, Calculator, Target, Shield, Columns, Sun, Moon, ChevronDown, MessageSquare, Calendar, MoveRight, User } from 'lucide-react';
import { SKILLS_LIST, CULTURAL_VALUES } from '../../constants/matchingData';

interface Props {
    onGetStarted: () => void;
    onBack: () => void;
}

// Demo tab definitions
const demoTabs = [
    { id: 'widget', label: 'Embeddable Widget', icon: Code },
    { id: 'calculator', label: 'Cost Calculator', icon: Calculator },
    { id: 'matching', label: 'Match Algorithm', icon: Target },
    { id: 'approval', label: 'Executive Guardrails', icon: Shield },
    { id: 'ats', label: 'Built-in ATS', icon: Columns }
] as const;

type DemoTabId = typeof demoTabs[number]['id'];

// Sample skills for matching demo
const sampleCandidateSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'];
const sampleJobSkills = ['React', 'TypeScript', 'Python', 'PostgreSQL', 'Docker'];
const sampleCandidateValues = ['Remote-First Culture', 'Ownership & Autonomy', 'Continuous Learning', 'Work-Life Balance'];
const sampleJobValues = ['Remote-First Culture', 'Ownership & Autonomy', 'Fast-Paced Environment', 'Technical Excellence'];

const ForCompaniesInfo: React.FC<Props> = ({ onGetStarted, onBack }) => {
    const [activeTab, setActiveTab] = useState<DemoTabId>('widget');
    const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
    const [hiresPerYear, setHiresPerYear] = useState(10);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    // Cost calculator values
    const avgSalary = 120000;
    const agencyFee = 0.20;
    const chimeCostPerHire = 1800;
    const traditionalCost = hiresPerYear * avgSalary * agencyFee;
    const chimeCost = hiresPerYear * chimeCostPerHire;
    const savings = traditionalCost - chimeCost;

    const comparisonData = [
        {
            feature: 'Matching',
            traditional: 'Keyword Based (Low Signal)',
            agencies: 'Human Based (Expensive)',
            chime: 'Data Based (Precision)'
        },
        {
            feature: 'ATS',
            traditional: 'External / Costly',
            agencies: 'None',
            chime: 'Integrated & Free'
        },
        {
            feature: 'CFO Oversight',
            traditional: 'Manual / Retrospective',
            agencies: 'None',
            chime: 'Built-in Guardrails'
        },
        {
            feature: 'Candidate Privacy',
            traditional: 'Public / Noisy',
            agencies: 'Controlled',
            chime: 'Protected / High-Intent'
        },
        {
            feature: 'Cost',
            traditional: 'Per Post',
            agencies: '15-25% of Salary',
            chime: 'Fractional / Utility-Based'
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-24">

            {/* HERO SECTION */}
            <section className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Pill Badge */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-green-bg text-accent-green text-xs font-semibold uppercase tracking-widest border border-accent-green-bg mb-8">
                    For Companies
                </div>

                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl tracking-tight text-primary leading-[1.05] mb-8">
                    The Hiring <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">Operating System</span><br />
                    for High-Growth Teams
                </h1>

                <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto leading-relaxed mb-12">
                    Stop paying for "post and pray." Access a pre-aligned network of technical talent,
                    manage your entire pipeline with a free white-label ATS, and ensure every hire
                    resonates with your culture and budget.
                </p>

                {/* Dual CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={onGetStarted}
                        className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-800 hover:shadow-lg transition-all group flex items-center justify-center"
                    >
                        Claim Your Company Profile
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => document.getElementById('precision-suite')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto bg-white dark:bg-surface border-2 border-border text-gray-700 dark:text-gray-300 dark:text-gray-600 px-8 py-4 rounded-xl font-semibold text-base hover:border-gray-300 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                        Schedule a Demo of the 85% Match
                    </button>
                </div>
            </section>

            {/* THE PRECISION SUITE - Three Pillars */}
            <section id="precision-suite" className="space-y-16">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-green-bg text-accent-green text-xs font-semibold uppercase tracking-widest border border-accent-green-bg mb-6">
                        The Precision Suite
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Three Pillars of Precision Hiring
                    </h2>
                    <p className="text-muted text-lg">Built by engineers, for technical leaders.</p>
                </div>

                {/* Three Pillars Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Pillar 1: Hyper-Precise Alignment */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">Hyper-Precise</span> Alignment
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">Multi-Dimensional Data Matching:</span> We don't just match on "Python."
                                We align on 12+ data fields, including working style (Async/Sync), management preference, and exact salary bands.
                            </p>
                            <p>
                                <span className="font-semibold text-primary">The Hiring Manager Layer:</span> Built by engineers, for engineers.
                                Our interface allows technical leaders to bypass HR bottlenecks and see the data that actually matters:
                                code samples, architectural preferences, and problem-solving styles.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2: All-in-One Infrastructure */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <div className="w-6 h-6 flex flex-col gap-1">
                                <div className="h-1.5 bg-gray-400 rounded" />
                                <div className="h-1.5 bg-gray-400 rounded" />
                                <div className="h-1.5 bg-gray-400 rounded" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">All-in-One</span> Infrastructure
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">Free White-Label ATS:</span> A fully branded Applicant Tracking System
                                that lives on your domain. Includes built-in messaging, automated scheduling, and stage tracking.
                            </p>
                            <p>
                                <span className="font-semibold text-primary">Career Page Embed Widget:</span> Turn your existing website into a talent magnet.
                                Copy-paste a single line of code to display your chime jobs, complete with your company's values and "vibe" profile.
                            </p>
                            <p>
                                <span className="font-semibold text-primary">Company Culture Hub:</span> A dedicated page to showcase your mission, values, and bio.
                                It's not just a bio; it's a "Company DNA" profile that talent uses to self-select.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3: Governance & Oversight */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                                <Check className="w-4 h-4 text-gray-400 dark:text-gray-500" strokeWidth={3} />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">Governance</span> & Oversight
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">Executive Approval Workflows:</span> Built-in "guardrails" for the CEO and CFO.
                                Set pre-approved salary bands; if a match exceeds the budget, it triggers an instant oversight request—no more
                                "surprise" offers that the board won't sign off on.
                            </p>
                            <p>
                                <span className="font-semibold text-primary">Cost-Effective Scalability:</span> Eliminate the 20% agency fees.
                                chime's model is built for sustainable growth, charging for successful connections and platform utility, not a tax on your headcount.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* VISUAL NARRATIVE: THE HIRING FLOW */}
            <section className="py-12">
                <div className="bg-background rounded-2xl p-8 md:p-12 border border-border">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                        {[
                            { label: 'Raw Data', sub: 'Skills, Values, Style' },
                            { label: 'Matching Algorithm', sub: '12+ Dimensions' },
                            { label: 'Chime', sub: '85%+ Alignment' },
                            { label: 'Hire', sub: 'That Actually Lasts' }
                        ].map((step, i) => (
                            <React.Fragment key={step.label}>
                                <div className="text-center flex-1">
                                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{step.sub}</div>
                                    <div className="text-lg font-bold text-primary">{step.label}</div>
                                </div>
                                {i < 3 && (
                                    <div className="hidden md:block">
                                        <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}
                                {i < 3 && (
                                    <div className="md:hidden">
                                        <div className="w-px h-6 bg-border" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* INTERACTIVE PRODUCT SHOWCASE */}
            <section className="space-y-12">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-coral-bg text-accent-coral text-xs font-semibold uppercase tracking-widest border border-accent-coral-bg mb-6">
                        See It In Action
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Your New Hiring Infrastructure
                    </h2>
                    <p className="text-muted text-lg">
                        Don't just read about it. See how Chime becomes your complete talent operating system.
                    </p>
                </div>

                {/* Tab Navigation - Desktop */}
                <div className="hidden md:flex justify-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl max-w-4xl mx-auto">
                    {demoTabs.map((tab) => {
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
                                const currentTab = demoTabs.find(t => t.id === activeTab);
                                const Icon = currentTab?.icon || Code;
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
                            {demoTabs.map((tab) => {
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
                    {/* TAB 1: Widget & Careers Page Preview */}
                    {activeTab === 'widget' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Embeddable Careers Widget</h3>
                                    <p className="text-muted text-sm">One line of code. Your entire careers page.</p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setWidgetTheme('light')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            widgetTheme === 'light' ? 'bg-white dark:bg-surface text-primary shadow-sm' : 'text-muted'
                                        }`}
                                    >
                                        <Sun className="w-4 h-4" /> Light
                                    </button>
                                    <button
                                        onClick={() => setWidgetTheme('dark')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            widgetTheme === 'dark' ? 'bg-gray-800 text-white shadow-sm' : 'text-muted'
                                        }`}
                                    >
                                        <Moon className="w-4 h-4" /> Dark
                                    </button>
                                </div>
                            </div>

                            {/* Browser Chrome Mockup */}
                            <div className="rounded-xl overflow-hidden shadow-2xl border border-border">
                                {/* Browser Header */}
                                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-3 border-b border-border">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-surface rounded-md px-3 py-1.5 text-xs text-muted font-mono">
                                        yourcompany.com/careers
                                    </div>
                                </div>

                                {/* Widget Preview */}
                                <div className={`p-6 md:p-10 ${widgetTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                    <div className={`max-w-2xl mx-auto space-y-4 ${widgetTheme === 'dark' ? 'text-white' : 'text-primary'}`}>
                                        <h4 className="text-2xl font-bold">Join Our Team</h4>
                                        <p className={`text-sm ${widgetTheme === 'dark' ? 'text-gray-400 dark:text-gray-500' : 'text-muted'}`}>
                                            We're building the future of technical hiring. Find a role that chimes with you.
                                        </p>

                                        {/* Sample Job Cards */}
                                        <div className="space-y-3 pt-4">
                                            {[
                                                { title: 'Senior Frontend Engineer', location: 'Remote', match: '92%' },
                                                { title: 'Backend Engineer', location: 'San Francisco, CA', match: '88%' },
                                                { title: 'Product Designer', location: 'Remote', match: '85%' }
                                            ].map((job, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-4 rounded-lg border ${
                                                        widgetTheme === 'dark'
                                                            ? 'bg-gray-800 border-gray-700'
                                                            : 'bg-white dark:bg-surface border-border'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-semibold text-sm">{job.title}</div>
                                                            <div className={`text-xs mt-1 ${widgetTheme === 'dark' ? 'text-gray-400 dark:text-gray-500' : 'text-muted'}`}>
                                                                {job.location}
                                                            </div>
                                                        </div>
                                                        <span className="px-2 py-1 bg-accent-coral-bg text-accent-coral text-xs font-semibold rounded">
                                                            {job.match} Match
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Powered by Chime footer */}
                                        <div className={`text-center pt-6 text-xs ${widgetTheme === 'dark' ? 'text-muted' : 'text-gray-400 dark:text-gray-500'}`}>
                                            Powered by <span className="font-semibold">chime</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Code Snippet */}
                            <div className="bg-gray-900 rounded-xl p-4 md:p-6 overflow-x-auto">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Embed Code</span>
                                    <button className="text-xs text-accent-coral-light hover:text-accent-coral-light font-medium">Copy</button>
                                </div>
                                <code className="text-sm text-green-400 font-mono whitespace-nowrap">
                                    {'<script src="https://chime.works/widget.js" data-company="your-company-id"></script>'}
                                </code>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Cost Calculator */}
                    {activeTab === 'calculator' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">Cost Calculator</h3>
                                <p className="text-muted text-sm">See how much you could save by switching to Chime.</p>
                            </div>

                            {/* Slider Section */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">Hires Per Year</label>
                                        <span className="text-2xl font-bold text-primary">{hiresPerYear}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={hiresPerYear}
                                        onChange={(e) => setHiresPerYear(parseInt(e.target.value))}
                                        className="w-full h-3 bg-border rounded-full appearance-none cursor-pointer accent-[var(--accent-coral)]"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        <span>1</span>
                                        <span>25</span>
                                        <span>50</span>
                                    </div>
                                </div>

                                {/* Cost Comparison Cards */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Traditional Cost */}
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-border">
                                        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Traditional Agencies</div>
                                        <div className="text-3xl font-bold text-primary mb-1">
                                            ${traditionalCost.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-muted">
                                            {hiresPerYear} hires x ${(avgSalary * agencyFee).toLocaleString()} (20% of avg salary)
                                        </div>
                                    </div>

                                    {/* Chime Cost */}
                                    <div className="bg-accent-coral-bg rounded-xl p-6 border border-accent-coral-light">
                                        <div className="text-xs font-semibold text-accent-coral uppercase tracking-wider mb-2">Chime Platform</div>
                                        <div className="text-3xl font-bold text-accent-coral mb-1">
                                            ${chimeCost.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-accent-coral">
                                            {hiresPerYear} hires x ${chimeCostPerHire.toLocaleString()} per hire
                                        </div>
                                    </div>
                                </div>

                                {/* Savings Display */}
                                <div className="bg-gradient-to-r from-accent-coral to-accent-green rounded-xl p-8 text-center">
                                    <div className="text-white/80 text-sm font-medium mb-2">Your Annual Savings</div>
                                    <div className="text-4xl md:text-5xl font-black text-white mb-4">
                                        ${savings.toLocaleString()}
                                    </div>
                                    <div className="text-white/70 text-sm">
                                        That's enough to hire {Math.floor(savings / avgSalary)} additional engineers
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Precision Matching Simulation */}
                    {activeTab === 'matching' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">Precision Matching Algorithm</h3>
                                <p className="text-muted text-sm">Watch how we align candidates to roles across 12+ dimensions.</p>
                            </div>

                            {/* Matching Visualization */}
                            <div className="grid md:grid-cols-3 gap-6 items-start">
                                {/* Candidate Profile */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-border">
                                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Candidate Profile</div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs text-muted mb-2">Technical Skills</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {sampleCandidateSkills.map((skill, i) => (
                                                    <span key={i} className="px-2 py-1 bg-surface border border-border rounded text-xs font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted mb-2">Core Values</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {sampleCandidateValues.map((value, i) => (
                                                    <span key={i} className="px-2 py-1 bg-accent-green-bg border border-accent-green-bg rounded text-xs font-medium text-accent-green">
                                                        {value}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted mb-2">Work Style</div>
                                            <span className="px-2 py-1 bg-accent-green-bg border border-accent-green-bg rounded text-xs font-medium text-accent-green">
                                                Async-First
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Matching Animation */}
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-coral to-accent-green flex items-center justify-center animate-pulse">
                                            <Target className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-accent-coral-light/30 animate-ping" />
                                    </div>
                                    <div className="mt-4 text-sm font-medium text-muted">Analyzing Match</div>
                                </div>

                                {/* Job Requirements */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-border">
                                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Job Requirements</div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs text-muted mb-2">Required Skills</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {sampleJobSkills.map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className={`px-2 py-1 border rounded text-xs font-medium ${
                                                            sampleCandidateSkills.includes(skill)
                                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                                : 'bg-white dark:bg-surface border-border text-gray-700 dark:text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted mb-2">Team Values</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {sampleJobValues.map((value, i) => (
                                                    <span
                                                        key={i}
                                                        className={`px-2 py-1 border rounded text-xs font-medium ${
                                                            sampleCandidateValues.includes(value)
                                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                                : 'bg-accent-green-bg border-accent-green-bg text-accent-green'
                                                        }`}
                                                    >
                                                        {value}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted mb-2">Work Environment</div>
                                            <span className="px-2 py-1 bg-green-50 border border-green-200 rounded text-xs font-medium text-green-700">
                                                Async-First
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Match Score Breakdown */}
                            <div className="bg-gradient-to-br from-gray-50 to-accent-coral-bg rounded-xl p-6 border border-border">
                                <div className="text-center mb-6">
                                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">
                                        90%
                                    </div>
                                    <div className="text-sm font-medium text-muted mt-1">Overall Match Score</div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { label: 'Technical Stack', score: 92 },
                                        { label: 'Working Style', score: 88 },
                                        { label: 'Core Values', score: 95 },
                                        { label: 'Growth Alignment', score: 85 },
                                        { label: 'Team Dynamics', score: 90 }
                                    ].map((dim, i) => (
                                        <div key={i} className="text-center">
                                            <div className="relative w-16 h-16 mx-auto mb-2">
                                                <svg className="w-16 h-16 transform -rotate-90">
                                                    <circle
                                                        cx="32"
                                                        cy="32"
                                                        r="28"
                                                        stroke="#E5E7EB"
                                                        strokeWidth="6"
                                                        fill="none"
                                                    />
                                                    <circle
                                                        cx="32"
                                                        cy="32"
                                                        r="28"
                                                        stroke={dim.score >= 90 ? 'var(--accent-coral)' : dim.score >= 85 ? '#0D9488' : '#6B7280'}
                                                        strokeWidth="6"
                                                        fill="none"
                                                        strokeDasharray={`${dim.score * 1.76} 176`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                                                    {dim.score}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted">{dim.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Approval Workflow */}
                    {activeTab === 'approval' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">Executive Guardrails</h3>
                                <p className="text-muted text-sm">Built-in approval workflows for CFO and CEO oversight.</p>
                            </div>

                            {/* Workflow Diagram */}
                            <div className="space-y-4">
                                {/* Step 1 */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-coral-bg flex items-center justify-center">
                                        <span className="text-sm font-bold text-accent-coral">1</span>
                                    </div>
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-border">
                                        <div className="font-semibold text-primary mb-1">Hiring Manager Creates Job</div>
                                        <div className="text-sm text-muted">Defines role requirements, salary range, and team fit criteria</div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="w-px h-6 bg-gray-300" />
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-coral-bg flex items-center justify-center">
                                        <span className="text-sm font-bold text-accent-coral">2</span>
                                    </div>
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-border">
                                        <div className="font-semibold text-primary mb-1">System Checks Budget</div>
                                        <div className="text-sm text-muted">Automatically validates salary against pre-approved bands</div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="w-px h-6 bg-gray-300" />
                                </div>

                                {/* Step 3 - Split */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Auto-approve path */}
                                    <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">Within Budget</span>
                                        </div>
                                        <div className="font-semibold text-primary mb-1">Auto-Approve</div>
                                        <div className="text-sm text-muted mb-3">Job published immediately</div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-green-700">Published</span>
                                        </div>
                                    </div>

                                    {/* Requires approval path */}
                                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">Exceeds Budget</span>
                                        </div>
                                        <div className="font-semibold text-primary mb-1">CFO/CEO Approval Required</div>
                                        <div className="text-sm text-muted mb-3">Notification sent for review</div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-amber-600" />
                                            <span className="text-sm font-medium text-amber-700">Pending Review</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Notification Card */}
                            <div className="bg-surface rounded-xl border border-border shadow-lg overflow-hidden max-w-md mx-auto">
                                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-border">
                                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">CFO Notification</div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-primary">New role request exceeds approved band</div>
                                            <div className="text-sm text-muted mt-1">Senior Engineer position requires review</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted">Role:</span>
                                            <span className="font-medium text-primary">Senior Engineer</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted">Requested:</span>
                                            <span className="font-medium text-red-600">$180K</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted">Approved max:</span>
                                            <span className="font-medium text-primary">$160K</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 px-4 py-2 bg-accent-coral text-white text-sm font-medium rounded-lg hover:bg-accent-coral transition-colors">
                                            Approve
                                        </button>
                                        <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-600 text-sm font-medium rounded-lg hover:bg-border transition-colors">
                                            Adjust Band
                                        </button>
                                        <button className="px-4 py-2 bg-surface border border-border text-muted text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 transition-colors">
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: White-Label ATS Preview */}
                    {activeTab === 'ats' && (
                        <div className="p-6 md:p-10 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Built-in Applicant Tracking</h3>
                                    <p className="text-muted text-sm">Manage your entire pipeline from yourcompany.chime.works</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Live Preview
                                </div>
                            </div>

                            {/* ATS Kanban Preview */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-border overflow-x-auto">
                                <div className="flex gap-4 min-w-[800px]">
                                    {/* Stage Columns */}
                                    {[
                                        { name: 'New Applications', count: 3, candidates: [
                                            { id: 'Signal-7', score: 88, stage: 'new' },
                                            { id: 'Signal-12', score: 92, stage: 'new' },
                                            { id: 'Signal-18', score: 85, stage: 'new' }
                                        ]},
                                        { name: 'Screening', count: 5, candidates: [
                                            { id: 'Signal-4', score: 90, stage: 'screening' },
                                            { id: 'Signal-9', score: 87, stage: 'screening' }
                                        ]},
                                        { name: 'Technical Interview', count: 2, candidates: [
                                            { id: 'Signal-2', score: 94, stage: 'technical' }
                                        ]},
                                        { name: 'Final Round', count: 1, candidates: [
                                            { id: 'Signal-1', score: 96, stage: 'final' }
                                        ]},
                                        { name: 'Offer', count: 1, candidates: [] }
                                    ].map((stage, i) => (
                                        <div key={i} className="flex-1 min-w-[200px]">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600">{stage.name}</span>
                                                <span className="w-6 h-6 rounded-full bg-border text-xs font-medium text-muted flex items-center justify-center">
                                                    {stage.count}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {stage.candidates.map((candidate, j) => (
                                                    <div
                                                        key={j}
                                                        className="bg-white dark:bg-surface rounded-lg p-3 border border-border shadow-sm hover:shadow-md hover:border-accent-coral-light transition-all cursor-pointer"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                                </div>
                                                                <span className="text-sm font-medium text-primary">{candidate.id}</span>
                                                            </div>
                                                            <span className="px-2 py-0.5 bg-accent-coral-bg text-accent-coral text-xs font-semibold rounded">
                                                                {candidate.score}%
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded text-xs text-muted transition-colors">
                                                                <MessageSquare className="w-3 h-3" />
                                                                Message
                                                            </button>
                                                            <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded text-xs text-muted transition-colors">
                                                                <Calendar className="w-3 h-3" />
                                                                Schedule
                                                            </button>
                                                            <button className="flex items-center justify-center px-2 py-1 bg-accent-coral-bg hover:bg-accent-coral-bg rounded text-xs text-accent-coral transition-colors">
                                                                <MoveRight className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {stage.candidates.length === 0 && (
                                                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center text-sm text-gray-400 dark:text-gray-500">
                                                        Drop here
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Highlights */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: MessageSquare, label: 'Built-in Messaging' },
                                    { icon: Calendar, label: 'Calendar Scheduling' },
                                    { icon: Columns, label: 'Stage Tracking' },
                                    { icon: Code, label: 'Your Domain' }
                                ].map((feature, i) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-surface rounded-lg border border-border">
                                            <div className="w-8 h-8 rounded-lg bg-accent-coral-bg flex items-center justify-center">
                                                <Icon className="w-4 h-4 text-accent-coral" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">{feature.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* COMPARATIVE VALUE TABLE */}
            <section className="space-y-12">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-green-bg text-accent-green text-xs font-semibold uppercase tracking-widest border border-accent-green-bg mb-6">
                        Why chime Wins
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Stop Overpaying for Underperformance
                    </h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden rounded-xl border border-border">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Feature</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Traditional Job Boards</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Recruitment Agencies</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-accent-green uppercase tracking-wider bg-accent-green-bg/50">chime.works</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {comparisonData.map((row, i) => (
                                <tr key={i} className="bg-white dark:bg-surface">
                                    <td className="px-6 py-4 text-sm font-semibold text-primary">{row.feature}</td>
                                    <td className="px-6 py-4 text-sm text-muted">{row.traditional}</td>
                                    <td className="px-6 py-4 text-sm text-muted">{row.agencies}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-accent-green bg-accent-green-bg/30">
                                        <span className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-accent-green" />
                                            {row.chime}
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
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">Job Boards</span>
                                    <span className="text-sm text-muted">{row.traditional}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">Agencies</span>
                                    <span className="text-sm text-muted">{row.agencies}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-border">
                                    <span className="text-xs text-accent-green uppercase font-semibold">chime</span>
                                    <span className="text-sm font-semibold text-accent-green flex items-center gap-1">
                                        <Check className="w-4 h-4" />
                                        {row.chime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CLOSING CTA SECTION */}
            <section className="py-16">
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
                    {/* Subtle background effect */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-coral/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white mb-4 tracking-tight">
                            Ready to Build Your Precision Pipeline?
                        </h2>
                        <p className="text-gray-400 dark:text-gray-500 text-lg mb-10">
                            Join 50+ high-growth teams hiring smarter, not harder.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={onGetStarted}
                                className="w-full sm:w-auto bg-white dark:bg-surface text-primary px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Get Started Free
                            </button>
                        </div>
                        <p className="mt-6 text-muted text-sm">
                            <button className="hover:text-gray-300 dark:text-gray-600 transition-colors underline underline-offset-2">
                                Schedule a demo
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

export default ForCompaniesInfo;
