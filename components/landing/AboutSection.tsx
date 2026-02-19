import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
    onGetStarted: () => void;
    onBack: () => void;
}

const AboutSection: React.FC<Props> = ({ onGetStarted, onBack }) => {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-24">

            {/* HERO SECTION - Brand Manifesto */}
            <section className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Pill Badge */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-coral-bg text-accent-coral text-xs font-semibold uppercase tracking-widest border border-accent-coral-bg mb-8">
                    The Chime Manifesto
                </div>

                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl tracking-tight text-primary leading-[1.05] mb-8">
                    Beyond Keywords.<br />
                    Beyond AI.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-coral to-accent-green">Resonance.</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto leading-relaxed mb-12">
                    A match isn't a keyword hit. It's the alignment of technical DNA, team values, and organizational impact.
                    We support teams who understand that great hires aren't found—they chime.
                </p>
            </section>

            {/* POSITIONING STATEMENT */}
            <section className="max-w-4xl mx-auto">
                <div className="bg-surface rounded-2xl p-10 md:p-14 border border-border shadow-sm">
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Our Position</div>
                    <h2 className="font-heading text-2xl md:text-3xl text-primary mb-6 tracking-tight leading-tight">
                        European-first. Built for the high-velocity tech ecosystem where precision matters more than volume.
                    </h2>
                    <p className="text-muted leading-relaxed text-lg mb-8">
                        We don't sell "reach" like LinkedIn. We don't offer "storage" like generic applicant tracking systems.
                        We deliver precision—the measurable confidence that when you connect with a candidate,
                        the fundamentals are already aligned.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <span className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-lg text-sm font-medium">Seed to Series A Focus</span>
                        <span className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-lg text-sm font-medium">Technical Hiring</span>
                        <span className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-lg text-sm font-medium">EU 2026 Ready</span>
                    </div>
                </div>
            </section>

            {/* THREE PILLARS */}
            <section className="space-y-16">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-green-bg text-accent-green text-xs font-semibold uppercase tracking-widest border border-accent-green-bg mb-6">
                        Our Principles
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        Three Pillars of Professional Resonance
                    </h2>
                    <p className="text-muted text-lg">What sets chime apart from everything else.</p>
                </div>

                {/* Pillars Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Pillar 1: Precision over Volume */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-accent-green-bg flex items-center justify-center mb-6">
                            <span className="text-accent-green font-bold text-lg">01</span>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            Precision over Volume
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">8 Dimensions of Professional Resonance.</span> Skills, experience,
                                values, personality, education, compensation, location, culture—all weighted and aligned before you ever see a profile.
                            </p>
                            <p>
                                Our data matching eliminates the first three rounds of vetting.
                                When you connect, you're already past the "do we even make sense?" conversation.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2: Native Transparency */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-accent-coral-bg flex items-center justify-center mb-6">
                            <span className="text-accent-coral font-bold text-lg">02</span>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            Native Transparency
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">Built for EU 2026 Pay Transparency Directive.</span> While others
                                scramble to retrofit compliance, chime was architected from day one with salary transparency as a feature, not a burden.
                            </p>
                            <p>
                                Turn regulatory compliance into a talent magnet. Companies that lead on transparency attract
                                candidates who value integrity—exactly the people you want building your team.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3: Human-Centric Data */}
                    <div className="bg-surface rounded-xl p-8 border border-border hover:border-border hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <span className="text-muted font-bold text-lg">03</span>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4">
                            Human-Centric Data
                        </h3>
                        <div className="space-y-4 text-muted text-sm leading-relaxed">
                            <p>
                                <span className="font-semibold text-primary">No black box AI.</span> Every match is explainable.
                                You see exactly which dimensions aligned and which didn't. No mysterious "AI recommendations"
                                you're supposed to trust blindly.
                            </p>
                            <p>
                                Our matching honors individual growth ambitions. A candidate's five-year trajectory
                                matters as much as their current skills. We connect people to roles that advance their careers,
                                not just fill your seats.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE 8 DIMENSIONS */}
            <section className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4 tracking-tight">
                        The 8 Dimensions of Resonance
                    </h2>
                    <p className="text-muted text-lg">Every match is evaluated across eight weighted dimensions.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: 'Skills', desc: 'Technical stack depth' },
                        { name: 'Experience', desc: 'Years and scope' },
                        { name: 'Values', desc: 'What drives decisions' },
                        { name: 'Personality', desc: 'Work style fit' },
                        { name: 'Education', desc: 'Formal and self-taught' },
                        { name: 'Compensation', desc: 'Aligned expectations' },
                        { name: 'Location', desc: 'Remote, hybrid, onsite' },
                        { name: 'Culture', desc: 'Team dynamics' }
                    ].map((dim, idx) => (
                        <div key={dim.name} className="bg-surface rounded-xl p-5 border border-border hover:border-border transition-colors text-center">
                            <div className="text-2xl font-bold text-accent-green mb-2">{String(idx + 1).padStart(2, '0')}</div>
                            <div className="font-semibold text-primary mb-1">{dim.name}</div>
                            <div className="text-xs text-muted">{dim.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CLOSING CTA */}
            <section className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
                    {/* Subtle background effect */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-coral/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white mb-4 tracking-tight">
                            Ready to Resonate?
                        </h2>
                        <p className="text-gray-400 dark:text-gray-500 text-lg mb-10 max-w-xl mx-auto">
                            Join the network of precision-matched talent and high-growth teams.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="bg-white dark:bg-surface text-primary px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors shadow-lg hover:shadow-xl group inline-flex items-center"
                        >
                            Get Started for Free
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Back Button */}
            <div className="pt-8 pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center text-muted hover:text-primary transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Home</span>
                </button>
            </div>
        </div>
    );
};

export default AboutSection;
