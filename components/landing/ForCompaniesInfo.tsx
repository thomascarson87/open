import React, { useState } from 'react';
import {
    Search, ArrowRight, CheckCircle, X, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { SKILLS_LIST, CULTURAL_VALUES, ALL_CHARACTER_TRAITS } from '../../constants/matchingData';

interface Props {
    onGetStarted: () => void;
    onBack: () => void;
}

const DemoBrowseTalent = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Matched Talent</h4>
            <div className="flex items-center text-xs font-bold text-blue-600"><Search className="w-3 h-3 mr-1"/> Precision Search</div>
        </div>
        {[
            { name: 'S.K.', role: 'Senior Frontend Engineer', skills: ['React', 'TypeScript', 'Node.js'], match: 94 },
            { name: 'M.R.', role: 'Full Stack Developer', skills: ['Python', 'React', 'AWS'], match: 89 },
            { name: 'L.V.', role: 'Engineering Manager', skills: ['Strategy', 'Mentorship', 'Go'], match: 82 }
        ].map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400">{c.name}</div>
                    <div>
                        <div className="font-bold text-sm text-gray-900">{c.role}</div>
                        <div className="flex gap-1 mt-1">
                            {c.skills.map(s => <span key={s} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{s}</span>)}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-black text-green-600">{c.match}%</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase">Match</div>
                </div>
            </div>
        ))}
    </div>
);

const DemoPostJob = () => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
            <h4 className="font-bold text-gray-900">Define Precision Levels</h4>
        </div>
        <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm">React Proficiency</span>
                    <span className="text-xs font-bold text-blue-600">Level 4: Mastering</span>
                </div>
                <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(lvl => <div key={lvl} className={`h-1.5 flex-1 rounded-full ${lvl <= 4 ? 'bg-blue-600' : 'bg-gray-200'}`} />)}
                </div>
                <p className="text-[10px] text-gray-500">"Handles ambiguous problems creatively. Establishes best practices."</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border-l-4 border-l-purple-400 border border-purple-100">
                <div>
                    <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Impact Scope</div>
                    <div className="font-bold text-sm text-purple-900">Cross-Team Impact</div>
                </div>
            </div>
        </div>
    </div>
);

const DemoReviewApplicants = () => (
    <div className="flex gap-4 overflow-x-auto no-scrollbar animate-in fade-in duration-500">
        {[
            { title: 'New', count: 8, candidates: ['Alex M.', 'Jordan L.'] },
            { title: 'Reviewing', count: 3, candidates: ['Sam T.'] },
            { title: 'Interview', count: 2, candidates: ['Chris P.', 'Taylor W.'] }
        ].map((col, i) => (
            <div key={i} className="w-48 flex-shrink-0">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{col.title}</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{col.count}</span>
                </div>
                <div className="space-y-2">
                    {col.candidates.map(cand => (
                        <div key={cand} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing">
                            <div className="text-xs font-bold text-gray-800">{cand}</div>
                            <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-4/5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const DemoWidgetPreview = () => {
    const [color, setColor] = useState('#3b82f6');
    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Widget Preview</h4>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Brand Color</span>
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                        className="w-6 h-6 rounded border-0 p-0 cursor-pointer"
                    />
                </div>
            </div>
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-black text-xl">L</div>
                    <div>
                        <div className="font-bold text-sm">Logo Corp</div>
                        <div className="text-[10px] text-gray-500">Powered by Open Platform</div>
                    </div>
                </div>
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="p-4 rounded-xl border border-gray-100 flex justify-between items-center group">
                            <div>
                                <div className="font-bold text-xs">Senior Cloud Architect</div>
                                <div className="text-[9px] text-gray-400 mt-0.5">Remote · Full-Time</div>
                            </div>
                            <button style={{ backgroundColor: color }} className="text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm">Apply</button>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-center">
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-widest">12 More Open Positions</div>
                </div>
            </div>
        </div>
    );
};

const ForCompaniesInfo: React.FC<Props> = ({ onGetStarted, onBack }) => {
    const [activeFeature, setActiveFeature] = useState('widget');
    const [activeDemo, setActiveDemo] = useState('browse');
    const [hiresPerYear, setHiresPerYear] = useState(5);
    const [avgSalary, setAvgSalary] = useState(120000);

    const agencyCost = avgSalary * 0.20 * hiresPerYear;
    const jobBoardCost = 500 * 5 * hiresPerYear;
    const openCost = 50 * 3 * hiresPerYear;
    const savings = agencyCost + jobBoardCost - openCost;

    const features = [
        { id: 'widget', title: 'White-Label Widget' },
        { id: 'matching', title: 'Precision Matching' },
        { id: 'approvals', title: 'Approvals' },
        { id: 'savings', title: 'Cost Savings' }
    ];

    const oldWayItems = [
        '$15K-30K per hire to agencies',
        'Mass applications from job boards',
        'Weeks screening misaligned candidates',
        'Culture fit? Hope for the best',
        'No data on what makes hires succeed'
    ];

    const openWayItems = [
        '$50 per candidate unlock',
        'Pre-matched on 8 dimensions',
        'Match scores tell you who to call',
        'Skills, values, culture - all aligned',
        'Data-driven hiring that enriches over time'
    ];

    const demoTabs = [
        { id: 'browse', label: 'Browse Talent' },
        { id: 'post', label: 'Post a Job' },
        { id: 'review', label: 'Review Applicants' },
        { id: 'widget_demo', label: 'Widget Preview' }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-10 space-y-24">
            
            {/* Hero Section */}
            <section className="text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest border border-blue-100 mb-8">
                    Free Widget • No Credit Card
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.1] mb-8">
                    Your Careers Page,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Supercharged
                    </span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
                    One embed gives you a white-label ATS with precision matching. 
                    Attract talent who align with your team's skills, values, and culture.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={onGetStarted}
                        className="bg-black text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all hover:shadow-2xl active:scale-95"
                    >
                        Get Your Free Widget
                    </button>
                    <button 
                        onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white border border-gray-200 text-gray-700 px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all active:scale-95"
                    >
                        See How It Works
                    </button>
                </div>
            </section>

            {/* Social Proof Bar */}
            <section className="py-12 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10">
                    {[
                        { value: '500+', label: 'Companies' },
                        { value: '12,000+', label: 'Candidates' },
                        { value: '94%', label: 'Match Accuracy' },
                        { value: '16x', label: 'Cost Savings' },
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

            {/* Problem/Solution Section */}
            <section className="space-y-12">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">There's a Better Way to Hire</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">Traditional methods prioritize volume. We prioritize data-enriched precision.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Old Way */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-gray-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-8 flex items-center">
                                <X className="w-4 h-4 mr-2" /> The Old Way
                            </div>
                            <ul className="space-y-4">
                                {oldWayItems.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-400 border-l-4 border-l-gray-200 pl-4 py-1">
                                        <span className="font-bold line-through">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Open Way */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-8 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" /> The Open Way
                            </div>
                            <ul className="space-y-4">
                                {openWayItems.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 group/item border-l-4 border-l-blue-500 pl-4 py-1">
                                        <span className="font-bold text-lg leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Enrichment Multiplier</p>
                                <div className="text-blue-400 font-black text-xl">16x ROI</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Deep-Dives (Tabs) */}
            <section className="bg-white rounded-[3rem] border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
                    {features.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFeature(f.id)}
                            className={`px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 whitespace-nowrap ${
                                activeFeature === f.id
                                    ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                                    : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {f.title}
                        </button>
                    ))}
                </div>
                <div className="p-10 md:p-16">
                    {activeFeature === 'widget' && (
                        <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight">Your Brand,<br />Our Intelligence</h3>
                                <ul className="space-y-4">
                                    {['One line of code - works on any CMS', 'Fully customizable to match your UI', 'Mobile-responsive, accessibility-ready', 'Direct auto-sync with your Open jobs'].map(pt => (
                                        <li key={pt} className="flex items-center gap-3 text-gray-600 font-bold">
                                            <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> {pt}
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <p className="text-sm font-bold text-blue-800 leading-relaxed italic">
                                        "Every application through your widget automatically enriches your talent pipeline with verified skills, values, and culture data."
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-900 rounded-[2rem] p-8 shadow-2xl font-mono text-xs text-blue-300">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                                <code className="block whitespace-pre-wrap leading-relaxed">
                                    {`<div id="open-careers-widget"></div>\n<script \n  src="https://cdn.openplatform.com/widget.js"\n  data-company-id="5cbc6857-3dce..."\n  defer\n></script>`}
                                </code>
                            </div>
                        </div>
                    )}
                    {activeFeature === 'matching' && (
                        <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight">Hire for the Team, Not Just the Role</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { l: '8 Match Dimensions', n: '01' },
                                        { l: 'Behavioral Skills', n: '02' },
                                        { l: 'Culture Alignment', n: '03' },
                                        { l: 'Personality Fit', n: '04' }
                                    ].map(box => (
                                        <div key={box.l} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 border-l-4 border-l-blue-400">
                                            <div className="text-2xl font-black text-blue-200 mb-2">{box.n}</div>
                                            <div className="text-xs font-black uppercase tracking-widest text-gray-900">{box.l}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-gray-600 font-medium leading-relaxed">Open's 8-dimensional matching evaluates candidates on skills, experience, values, personality, education, compensation, location, and culture fit - creating matches traditional methods can't achieve.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl border-l-4 border-l-blue-600">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cadence Tuning</div>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-2"><span>Steady Pace</span><span>Startup Hustle</span></div>
                                            <div className="h-2 bg-gray-100 rounded-full relative"><div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-lg" /></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-2"><span>Collaborative</span><span>Highly Autonomous</span></div>
                                            <div className="h-2 bg-gray-100 rounded-full relative"><div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-lg" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeFeature === 'approvals' && (
                         <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight">Stakeholder Alignment,<br />Before You Post</h3>
                                <p className="text-gray-600 font-medium leading-relaxed">Every approval decision is logged and enriches your hiring analytics. Understand bottlenecks and eliminate the "budget freeze" surprise mid-hiring.</p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border-l-4 border-l-green-500 border border-green-100">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <div>
                                            <div className="text-xs font-black text-green-800 uppercase">Hiring Manager Approved</div>
                                            <div className="text-[10px] text-green-600 font-bold">2 hours ago · Sarah J.</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-2xl border-l-4 border-l-yellow-500 border border-yellow-100">
                                        <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                                        <div>
                                            <div className="text-xs font-black text-yellow-800 uppercase">Finance Review Pending</div>
                                            <div className="text-[10px] text-yellow-600 font-bold">Assigned to Mark R.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-[2.5rem] border border-gray-100 p-8 shadow-inner">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Pipeline Audit Trail</div>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-2 h-2 rounded-full bg-blue-200 mt-2" />
                                            <div className="flex-1 h-12 bg-white rounded-xl border border-gray-100 animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeFeature === 'savings' && (
                        <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                             <div className="space-y-8">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight">Scale Your Hiring,<br />Not Your Fees</h3>
                                <div className="space-y-8 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><label className="text-sm font-black text-gray-700 uppercase">Hires per year</label><span className="text-blue-600 font-black text-lg">{hiresPerYear}</span></div>
                                        <input type="range" min="1" max="50" value={hiresPerYear} onChange={e => setHiresPerYear(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><label className="text-sm font-black text-gray-700 uppercase">Average salary</label><span className="text-blue-600 font-black text-lg">${(avgSalary/1000).toFixed(0)}K</span></div>
                                        <input type="range" min="50000" max="300000" step="5000" value={avgSalary} onChange={e => setAvgSalary(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10 space-y-10">
                                    <div>
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Estimated Annual Savings</div>
                                        <div className="text-6xl font-black tabular-nums">${savings.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-4 border-t border-white/5 pt-8">
                                        <div className="flex justify-between text-sm"><span className="text-gray-500">Standard Agency Costs</span><span className="text-red-400 line-through">${agencyCost.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-gray-500">Open Platform Costs</span><span className="text-green-400 font-black">${openCost.toLocaleString()}</span></div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">"Savings compound as hiring data grows. Open companies see 40% faster time-to-hire after 6 months."</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Interactive Demo Section */}
            <section id="demo" className="space-y-12">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Experience Open Platform</h2>
                    <p className="text-gray-500 font-medium">Explore the unified recruitment interface built for precision.</p>
                </div>
                
                <div className="bg-white rounded-[3rem] border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in duration-700">
                    {/* Browser Chrome */}
                    <div className="bg-gray-50 px-6 py-4 flex items-center gap-4 border-b border-gray-200">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="bg-white rounded-full px-6 py-2 text-xs font-bold text-gray-400 flex items-center border border-gray-200 shadow-sm">
                                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-green-500" />
                                app.openplatform.com/companies
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
                                        activeDemo === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Mobile Demo Tabs */}
                        <div className="md:hidden flex border-b border-gray-100 overflow-x-auto no-scrollbar px-4">
                             {demoTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveDemo(tab.id)}
                                    className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                                        activeDemo === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Demo Main Content Area */}
                        <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white">
                            {activeDemo === 'browse' && <DemoBrowseTalent />}
                            {activeDemo === 'post' && <DemoPostJob />}
                            {activeDemo === 'review' && <DemoReviewApplicants />}
                            {activeDemo === 'widget_demo' && <DemoWidgetPreview />}
                        </div>
                    </div>
                    
                    {/* Demo Footer */}
                    <div className="bg-gray-900 px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Setup in 5 minutes</span>
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-gray-900 font-black px-8 py-3 rounded-xl text-sm hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95"
                        >
                            Get Started Free
                        </button>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-blue-600 rounded-[4rem] text-white text-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-800 opacity-50" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 max-w-3xl mx-auto px-6 space-y-10">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Start Hiring Smarter Today</h2>
                    <p className="text-blue-100 text-xl font-medium leading-relaxed">
                        Free widget. Unified ATS. Precision matching. <br className="hidden md:block" />
                        Pay only when you find your perfect match.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={onGetStarted}
                            className="bg-white text-blue-600 px-12 py-5 rounded-[2rem] font-black text-xl hover:shadow-2xl transition-all active:scale-95 w-full sm:w-auto"
                        >
                            Create Free Account
                        </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No Credit Card</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Setup in 5 Minutes</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Cancel Anytime</span>
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

export default ForCompaniesInfo;
