import React, { useState } from 'react';
import { CheckCircle, X, ArrowRight, ArrowLeft, Lock, Users, ShieldCheck } from 'lucide-react';
import { SKILLS_LIST, SKILL_LEVEL_METADATA } from '../../constants/matchingData';

interface Props {
    onGetStarted: () => void;
    onBack: () => void;
}

const DemoProfile = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">Y</div>
            <div>
                <h4 className="font-black text-gray-900 text-xl">You</h4>
                <p className="text-purple-600 font-bold text-sm">Senior Frontend Engineer</p>
            </div>
        </div>
        
        <div className="space-y-4">
            <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Verified Skills</div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-black border border-purple-100 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> React L4
                    </span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-black border border-purple-100 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> TypeScript L3
                    </span>
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg text-[11px] font-black border border-gray-100">Node.js L3</span>
                </div>
            </div>
            
            <div className="pt-4 border-t border-gray-50">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Non-Negotiables</div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                        <span>Remote Work Only</span>
                        <Lock className="w-3 h-3 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                        <span>$140,000+ Min Salary</span>
                        <Lock className="w-3 h-3 text-red-500" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const DemoMatches = () => (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your Chimes</h4>
            <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">47 Roles Found</span>
        </div>
        {[
            { company: 'Acme Tech', role: 'Staff UI Engineer', score: 94, tags: ['Remote', '$160k+'] },
            { company: 'Brightly', role: 'Frontend Lead', score: 88, tags: ['Remote', '$155k+'] },
            { company: 'GlobalScale', role: 'Senior React Dev', score: 72, tags: ['Hybrid', '$170k+'], warning: 'Does not meet work mode non-negotiable' }
        ].map((m, i) => (
            <div key={i} className={`bg-white p-4 rounded-xl border transition-all ${m.score >= 90 ? 'border-purple-200 shadow-md ring-1 ring-purple-100' : 'border-gray-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.company}</div>
                        <div className="font-bold text-sm text-gray-900">{m.role}</div>
                    </div>
                    <div className="text-right">
                        <div className={`text-lg font-black ${m.score >= 90 ? 'text-purple-600' : 'text-gray-600'}`}>{m.score}%</div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase">Chime</div>
                    </div>
                </div>
                <div className="flex gap-2 mb-2">
                    {m.tags.map(t => <span key={t} className="text-[9px] font-black bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-full">{t}</span>)}
                </div>
                {m.warning && <div className="text-[9px] font-bold text-red-500 flex items-center gap-1 bg-red-50 p-1.5 rounded-lg border border-red-100"><X className="w-2.5 h-2.5" /> {m.warning}</div>}
            </div>
        ))}
    </div>
);

const ForTalentInfo: React.FC<Props> = ({ onGetStarted, onBack }) => {
    const [activeTab, setActiveTab] = useState('preferences');
    const [activeDemo, setActiveDemo] = useState('profile');

    const frustrations = [
        { title: 'The Black Hole', desc: 'You apply. You customize the cover letter. You never hear back.' },
        { title: 'Keyword Roulette', desc: '"10 years experience in a 5-year-old framework." Your actual skills don\'t matter if the ATS rejects your resume.' },
        { title: 'Recruiter Spam', desc: '"Amazing opportunity!" — a 3-month contract in a city you don\'t live in for half your rate.' },
        { title: 'Culture Surprise', desc: 'The job said "fast-paced." They meant "unsustainable." You find out after you start.' },
        { title: 'Salary Games', desc: 'Five rounds of interviews before they mention compensation. It\'s 30% below your floor.' },
        { title: 'The Ghost', desc: 'Three interviews, a take-home, "we\'ll be in touch." That was six weeks ago.' }
    ];

    const benefits = [
        { num: '01', title: 'Chimed, Not Searched', desc: 'See every role that fits the moment you sign up. No applications required.', detail: 'Aligned on skills, values, team dynamics, and more.' },
        { num: '02', title: 'You Set the Rules', desc: 'Non-negotiables are non-negotiable. Remote-only? You only see remote.', detail: 'Salary floor, work mode, company size — you decide.' },
        { num: '03', title: 'Team Fit, Not Just Company Fit', desc: 'Know how teams actually work before you join. Intensity, cadence, communication style.', detail: 'Avoid culture surprise after you start.' },
        { num: '04', title: 'Skills Over Tenure', desc: 'We measure what you can do, not how long you\'ve done it.', detail: '5 proficiency levels that show growth trajectory, not just years.' },
        { num: '05', title: 'Verified Credibility', desc: 'Colleagues vouch for your skills. Not LinkedIn-style endorsements — real verification.', detail: 'Verified profiles get prioritized by companies.' },
        { num: '06', title: 'Direct Conversations', desc: 'When a company unlocks you, you chat directly. No recruiters in between.', detail: 'Integrated scheduling and messaging.' }
    ];

    const steps = [
        { num: '1', title: 'Build Your Profile', desc: 'Add skills with proficiency levels. Set salary, location, and work mode preferences. Define how you like to work.', time: '~10 min' },
        { num: '2', title: 'See What Chimes', desc: 'Instantly view every role that fits your criteria — company, team, and role level.', time: 'Instant' },
        { num: '3', title: 'Get Verified', desc: 'Invite past colleagues to verify your skills. Verified profiles get more attention.', time: 'Optional' },
        { num: '4', title: 'Companies Come to You', desc: 'When a company unlocks your profile, you\'re notified. Chat directly. You\'re always in control.', time: 'Ongoing' }
    ];

    const tabs = [
        { id: 'preferences', title: 'Your Rules' },
        { id: 'skills', title: 'Actual Proficiency' },
        { id: 'verification', title: 'Real Proof' },
        { id: 'matching', title: 'Jobs That Fit' }
    ];

    const demoTabs = [
        { id: 'profile', label: 'Your Profile' },
        { id: 'matches', label: 'Your Matches' },
        { id: 'verify', label: 'Verification' }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-10 space-y-24">
            
            {/* Hero Section */}
            <section className="text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-black uppercase tracking-widest border border-purple-100 mb-8">
                    Free Forever · No Spam · You Control Visibility
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.1] mb-8">
                    Find Roles That<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                        Chime With You
                    </span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
                    chime aligns you with companies based on skills, values, and how teams actually work — not keyword games. Companies come to you, already knowing you're a fit.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onGetStarted}
                        className="bg-purple-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-purple-700 transition-all hover:shadow-2xl active:scale-95 shadow-purple-200/50"
                    >
                        Build Your Profile
                    </button>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white border border-gray-200 text-gray-700 px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all active:scale-95"
                    >
                        See How It Works
                    </button>
                </div>
            </section>

            {/* Sound Familiar Section */}
            <section className="space-y-12 bg-white rounded-[3rem] p-12 md:p-16 border border-gray-100 shadow-sm">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">The Job Search You Know</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">Traditional job hunting is broken. We've been there too.</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {frustrations.map((f, i) => (
                        <div key={i} className="bg-gray-50 rounded-2xl p-6 border-l-4 border-l-gray-300 border border-gray-100/50 hover:bg-white hover:shadow-md hover:border-l-purple-400 transition-all group">
                            <h3 className="font-black text-gray-900 mb-2">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
                
                <div className="text-center pt-8 border-t border-gray-50">
                    <p className="text-xl font-black text-gray-900 mb-2">There's a better way to find your next role.</p>
                    <p className="text-gray-500 font-medium italic">What if companies came to you, already knowing you're a good fit?</p>
                </div>
            </section>

            {/* Benefits Grid */}
            <section id="features" className="space-y-16">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest mb-4">
                        The chime Way
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Job Hunting That Respects Your Time</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((b, i) => (
                        <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-xl transition-all relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-16 bg-purple-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="text-3xl font-black text-purple-200 mb-4 group-hover:text-purple-400 transition-colors">
                                    {b.num}
                                </div>
                                <h3 className="font-black text-gray-900 mb-3 text-lg leading-tight">{b.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">{b.desc}</p>
                                <div className="text-purple-600 text-[11px] font-black uppercase tracking-widest flex items-center">
                                    {b.detail}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Deep-Dives (Tabs) */}
            <section className="bg-white rounded-[3rem] border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-gray-50/50">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 whitespace-nowrap ${
                                activeTab === t.id
                                    ? 'border-purple-600 text-purple-600 bg-purple-50/30'
                                    : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-white'
                            }`}
                        >
                            {t.title}
                        </button>
                    ))}
                </div>
                <div className="p-10 md:p-20">
                    {activeTab === 'preferences' && (
                        <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">Your Rules,<br />Your Way</h3>
                                <p className="text-gray-600 text-lg font-medium leading-relaxed">
                                    Not everything is equally important. Mark what's a dealbreaker and what's flexible. 
                                    Companies only see you if they meet YOUR non-negotiables.
                                </p>
                                <ul className="space-y-4">
                                    {['Remote work requirement', 'Strict salary floors', 'Preferred company size', 'Work-life balance focus'].map(pt => (
                                        <li key={pt} className="flex items-center gap-3 text-gray-900 font-bold">
                                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            </div>
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-[2.5rem] p-8 border-2 border-gray-100 shadow-inner">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg border-l-4 border-l-red-500 mb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Work Mode</div>
                                        <div className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Dealbreaker</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-3 rounded-xl border-2 border-purple-600 bg-purple-50 text-purple-700 text-center text-xs font-black">Remote Only</div>
                                        <div className="flex-1 p-3 rounded-xl border-2 border-gray-100 text-gray-300 text-center text-xs font-black grayscale opacity-50">Hybrid</div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg border-l-4 border-l-purple-500 opacity-60 grayscale scale-95 origin-top translate-y-2">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Salary Floor</div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full relative"><div className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-600 rounded-full shadow-lg" /></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'skills' && (
                        <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">Show What You<br />Can Actually Do</h3>
                                <p className="text-gray-600 text-lg font-medium leading-relaxed">
                                    Years of experience is a lazy metric. We measure real proficiency across 5 levels. 
                                    Are you actively learning something new? Great — we show that growth.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.values(SKILL_LEVEL_METADATA).slice(0, 4).map((lvl: any) => (
                                        <div key={lvl.label} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <div className="text-2xl mb-2">{lvl.icon}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{lvl.label}</div>
                                            <div className="text-xs font-bold text-gray-700 leading-tight line-clamp-1">{lvl.descriptor}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl border-t-8 border-t-purple-600">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="font-black text-xl">React Mastery</span>
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black">Level 4: Mastering</span>
                                    </div>
                                    <div className="flex gap-2 mb-6">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-2 flex-1 rounded-full ${i <= 4 ? 'bg-purple-600' : 'bg-gray-100'}`} />)}
                                    </div>
                                    <p className="text-gray-500 text-sm italic font-medium leading-relaxed">"Handles ambiguous problems creatively. Establishes team conventions and best practices."</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'verification' && (
                        <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">Real References,<br />Real Trust</h3>
                                <p className="text-gray-600 text-lg font-medium leading-relaxed">
                                    Colleagues confirm specific skills you've witnessed in action. 
                                    Verified profiles are unlocked 3x more often by hiring teams.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm"><Users className="w-5 h-5" /></div>
                                        <div>
                                            <div className="text-[10px] font-black text-purple-800 uppercase tracking-widest">Colleague Verified</div>
                                            <div className="text-xs text-purple-600 font-bold">"Exceptional problem solver under pressure"</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-32 bg-purple-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-green-400 border border-white/5"><ShieldCheck className="w-6 h-6" /></div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</div>
                                            <div className="text-lg font-black">Trusted Professional</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Communication</span>
                                            <span className="font-black text-green-400">9.2 / 10</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Technical Ability</span>
                                            <span className="font-black text-green-400">Verified L4</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'matching' && (
                        <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">The Moment You<br />Go Live, Roles Chime</h3>
                                <p className="text-gray-600 text-lg font-medium leading-relaxed">
                                    No more "wondering" if you're qualified. We align roles to YOU.
                                    See exactly why a job is a 90% chime and where the 10% gap is.
                                </p>
                                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                    <p className="text-sm font-black text-purple-900 leading-relaxed italic">
                                        "Chimes update in real-time as you refine your profile. Data always enriches, never resets."
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-[2rem] border-2 border-purple-100 shadow-2xl scale-105">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black">A</div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-purple-600 leading-none">94%</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chime Score</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {['Skills: 98%', 'Values: 92%', 'Culture: 91%'].map(m => (
                                            <div key={m} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {m}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-3 rounded-xl bg-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-lg">Talk Direct</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="space-y-16">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Four Steps to Finding Your Chime</h2>
                    <p className="text-gray-500 font-medium">No resume games. No keyword stuffing. Just the facts.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-6 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:scale-[1.02] group">
                            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg shadow-purple-200 group-hover:rotate-6 transition-transform">
                                {s.num}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-black text-gray-900 text-lg leading-tight">{s.title}</h3>
                                    <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{s.time}</span>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Interactive Demo Section */}
            <section id="demo" className="space-y-12">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Experience chime</h2>
                    <p className="text-gray-500 font-medium">Take a test drive of the interface built for technical talent.</p>
                </div>
                
                <div className="bg-white rounded-[3rem] border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in duration-700">
                    {/* Browser Chrome */}
                    <div className="bg-gray-50 px-6 py-4 flex items-center gap-4 border-b border-gray-200">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="bg-white rounded-full px-6 py-2 text-xs font-bold text-gray-400 flex items-center border border-gray-200 shadow-sm">
                                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-purple-500" />
                                app.chime.works/dashboard
                            </div>
                        </div>
                    </div>
                    
                    {/* Demo Interface */}
                    <div className="flex flex-col md:flex-row h-[600px]">
                        {/* Sidebar Demo */}
                        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 space-y-2 hidden md:block">
                            <div className="h-4 w-24 bg-gray-200 rounded mb-8 animate-pulse" />
                            {demoTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveDemo(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        activeDemo === tab.id ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Demo Main Content Area */}
                        <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white custom-scrollbar">
                            {activeDemo === 'profile' && <DemoProfile />}
                            {activeDemo === 'matches' && <DemoMatches />}
                            {activeDemo === 'verify' && (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Verification Flow</h4>
                                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                        <p className="text-purple-900 font-bold mb-4">Request from Sarah (Manager):</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-xs font-bold text-purple-700 bg-white p-3 rounded-xl border-l-4 border-l-purple-400 border border-purple-100">
                                                <CheckCircle className="w-4 h-4 text-purple-600" /> Proficiency verified: Mastered React
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-bold text-purple-700 bg-white p-3 rounded-xl border-l-4 border-l-purple-400 border border-purple-100">
                                                <CheckCircle className="w-4 h-4 text-purple-600" /> Collaboration score: 9.5 / 10
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center pt-4">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Added instantly to your live profile</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Demo Footer */}
                    <div className="bg-purple-600 px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <span className="text-purple-100 text-sm font-bold uppercase tracking-widest">Setup in 10 minutes</span>
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-purple-600 font-black px-8 py-3 rounded-xl text-sm hover:bg-purple-50 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                        >
                            Start Chiming Free
                        </button>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10">
                    {[
                        { value: '12,000+', label: 'Candidates' },
                        { value: '500+', label: 'Companies' },
                        { value: '94%', label: 'Match Accuracy' },
                        { value: '3x', label: 'Faster Time-to-Role' },
                    ].map((stat, i) => (
                        <React.Fragment key={stat.label}>
                            <div className="text-center">
                                <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                            {i < 3 && <div className="h-10 w-px bg-gray-100 hidden md:block" />}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-br from-purple-600 to-pink-500 rounded-[4rem] text-white text-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-white/5 opacity-20" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl" />
                
                <div className="relative z-10 max-w-3xl mx-auto px-6 space-y-10">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Find Your Chime</h2>
                    <p className="text-purple-100 text-xl font-medium leading-relaxed">
                        10 minutes to set up. Instant alignment. Zero spam.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-purple-600 px-12 py-5 rounded-[2rem] font-black text-xl hover:shadow-2xl transition-all active:scale-95 w-full sm:w-auto transform hover:scale-105"
                        >
                            Build Your Profile
                        </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-purple-100/60">
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No Credit Card</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Free Forever</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Delete Anytime</span>
                    </div>
                </div>
            </section>
            
            <div className="text-center pb-12">
                <button 
                    onClick={onBack}
                    className="text-gray-400 font-bold hover:text-gray-900 transition-colors flex items-center justify-center mx-auto text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Main Landing
                </button>
            </div>
        </div>
    );
};

export default ForTalentInfo;
