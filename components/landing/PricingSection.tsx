import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface Props {
    onGetStarted: () => void;
    onBack: () => void;
}

type TierId = 'solo' | 'ensemble' | 'orchestra';

interface TierFeature {
    label: string;
    value: string;
    highlight?: boolean;
}

interface Tier {
    id: TierId;
    name: string;
    tagline: string;
    price: string;
    period: string;
    highlight?: string;
    popular?: boolean;
    features: TierFeature[];
    cta: string;
    ctaStyle: 'primary' | 'secondary';
}

const tiers: Tier[] = [
    {
        id: 'solo',
        name: 'Solo',
        tagline: 'For founders hiring their first team',
        price: '€0',
        period: '/month',
        highlight: '14-day full access trial with 20 free chimes',
        features: [
            { label: 'Direct Applicants', value: 'Always free', highlight: true },
            { label: 'Active Jobs', value: 'Up to 3' },
            { label: 'Team Seats', value: '2 seats' },
            { label: 'Careers Widget', value: 'Basic branding' },
            { label: 'Matching', value: '8-dimension precision matching' },
            { label: 'Equalizer', value: 'Weighted matching equalizer' },
            { label: 'Support', value: 'Email support' },
            { label: 'Talent Pool', value: '€10 per chime (pay-as-you-go)' }
        ],
        cta: 'Start Free Trial',
        ctaStyle: 'secondary'
    },
    {
        id: 'ensemble',
        name: 'Ensemble',
        tagline: 'For growing teams scaling fast',
        price: '€99',
        period: '/month',
        popular: true,
        features: [
            { label: 'Direct Applicants', value: 'Always free', highlight: true },
            { label: 'Active Jobs', value: 'Up to 10' },
            { label: 'Team Seats', value: '5 seats' },
            { label: 'Careers Widget', value: 'Full white-label' },
            { label: 'Chimes', value: '15 included monthly (then €10 each)' },
            { label: 'Approvals', value: 'Hiring manager & executive workflows' },
            { label: 'Insights', value: 'Market competitiveness data' },
            { label: 'Analytics', value: 'Talent pool analytics' },
            { label: 'Roadmap', value: 'Product roadmap input' }
        ],
        cta: 'Start Trial',
        ctaStyle: 'primary'
    },
    {
        id: 'orchestra',
        name: 'Orchestra',
        tagline: 'For organizations hiring at scale',
        price: '€399',
        period: '/month',
        features: [
            { label: 'Direct Applicants', value: 'Always free', highlight: true },
            { label: 'Active Jobs', value: 'Unlimited' },
            { label: 'Team Seats', value: 'Unlimited' },
            { label: 'Careers Widget', value: 'Full white-label + API access' },
            { label: 'Chimes', value: 'Unlimited included' },
            { label: 'Approvals', value: 'All approval workflows' },
            { label: 'Intelligence', value: 'Full Market Intelligence suite' },
            { label: 'Analytics', value: 'ROI dashboard & hiring velocity' },
            { label: 'Support', value: 'Priority support + dedicated CSM' },
            { label: 'Roadmap', value: 'Product roadmap input' }
        ],
        cta: 'Contact Us',
        ctaStyle: 'secondary'
    }
];

// Hiring velocity options for calculator
const hiringOptions = [
    { value: 1, label: '1-3 hires/quarter', tier: 'solo' as TierId },
    { value: 2, label: '4-8 hires/quarter', tier: 'ensemble' as TierId },
    { value: 3, label: '9+ hires/quarter', tier: 'orchestra' as TierId }
];

const PricingSection: React.FC<Props> = ({ onGetStarted, onBack }) => {
    const [hiringVelocity, setHiringVelocity] = useState(1);

    // Determine recommended tier based on slider
    const recommendedTier = useMemo((): TierId => {
        const option = hiringOptions.find(o => o.value === hiringVelocity);
        return option?.tier || 'solo';
    }, [hiringVelocity]);

    // Calculate cost comparison based on velocity
    const costAnalysis = useMemo(() => {
        const hiresPerQuarter = hiringVelocity === 1 ? 2 : hiringVelocity === 2 ? 6 : 12;
        const hiresPerYear = hiresPerQuarter * 4;
        const avgSalary = 90000;

        // Agency cost (20% of salary)
        const agencyCost = hiresPerYear * avgSalary * 0.20;

        // Chime cost based on tier
        let chimeCost = 0;
        if (recommendedTier === 'solo') {
            chimeCost = hiresPerYear * 10; // €10 per unlock
        } else if (recommendedTier === 'ensemble') {
            const monthlyFee = 99 * 12;
            const includedChimes = 15 * 12; // 180 chimes/year
            const extraChimes = Math.max(0, hiresPerYear - includedChimes) * 10;
            chimeCost = monthlyFee + extraChimes;
        } else {
            chimeCost = 399 * 12; // Unlimited
        }

        const savings = agencyCost - chimeCost;

        return {
            hiresPerYear,
            agencyCost,
            chimeCost,
            savings,
            savingsPercent: Math.round((savings / agencyCost) * 100)
        };
    }, [hiringVelocity, recommendedTier]);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-16">

            {/* HERO SECTION */}
            <section className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Pill Badge */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold uppercase tracking-widest border border-teal-100 mb-8">
                    Pricing
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.05] mb-8">
                    Pay for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Precision</span>,<br />
                    Not Noise
                </h1>

                <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
                    No hidden fees. No per-seat surprises. Direct applicants are always free.
                    You only pay when you unlock talent from our precision-matched pool.
                </p>
            </section>

            {/* TRIAL CALLOUT - Subtle version */}
            <section className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">14 days full access + 20 free chimes.</span>
                        {' '}No credit card required.
                    </p>
                </div>
            </section>

            {/* FREE ATS CALLOUT */}
            <section className="max-w-4xl mx-auto text-center">
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Free ATS for everyone</h2>
                    <p className="text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Unlimited direct applicants through your careers widget—always free, no unlock cost.
                        Chimes are only for proactively browsing and unlocking candidates from the talent pool.
                    </p>
                </div>
            </section>

            {/* FIND YOUR FIT - Interactive Selector */}
            <section className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Find Your Fit</h2>
                        <p className="text-sm text-gray-500">Adjust based on your hiring velocity to see real costs</p>
                    </div>

                    {/* Slider */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-500 mb-3">
                            {hiringOptions.map((option) => (
                                <span
                                    key={option.value}
                                    className={`transition-colors ${hiringVelocity === option.value ? 'text-gray-900 font-semibold' : ''}`}
                                >
                                    {option.label}
                                </span>
                            ))}
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            value={hiringVelocity}
                            onChange={(e) => setHiringVelocity(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:w-5
                                [&::-webkit-slider-thumb]:h-5
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:bg-gray-900
                                [&::-webkit-slider-thumb]:cursor-pointer
                                [&::-webkit-slider-thumb]:transition-transform
                                [&::-webkit-slider-thumb]:hover:scale-110
                                [&::-moz-range-thumb]:w-5
                                [&::-moz-range-thumb]:h-5
                                [&::-moz-range-thumb]:rounded-full
                                [&::-moz-range-thumb]:bg-gray-900
                                [&::-moz-range-thumb]:border-0
                                [&::-moz-range-thumb]:cursor-pointer"
                        />
                    </div>

                    {/* Cost Comparison Result */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hires/Year</div>
                            <div className="text-2xl font-bold text-gray-900">{costAnalysis.hiresPerYear}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Agency Cost</div>
                            <div className="text-2xl font-bold text-gray-400 line-through">€{(costAnalysis.agencyCost / 1000).toFixed(0)}k</div>
                        </div>
                        <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                            <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">With Chime</div>
                            <div className="text-2xl font-bold text-teal-700">€{costAnalysis.chimeCost < 1000 ? costAnalysis.chimeCost : (costAnalysis.chimeCost / 1000).toFixed(1) + 'k'}</div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            At your pace, you'd save approximately <span className="font-bold text-gray-900">€{(costAnalysis.savings / 1000).toFixed(0)}k/year</span> ({costAnalysis.savingsPercent}%) compared to agency fees.
                        </p>
                    </div>
                </div>
            </section>

            {/* PRICING CARDS */}
            <section className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {tiers.map((tier) => {
                    const isMatch = tier.id === recommendedTier;
                    const isPopular = tier.popular;
                    return (
                        <div
                            key={tier.id}
                            className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${
                                isPopular
                                    ? 'border-teal-300 shadow-lg md:-translate-y-2'
                                    : isMatch
                                        ? 'border-teal-200 shadow-md'
                                        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                            }`}
                        >
                            {/* Badges */}
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold tracking-wide">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            {isMatch && !isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-700 text-white text-xs font-semibold tracking-wide">
                                        Best fit for you
                                    </span>
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                                <p className="text-sm text-gray-500">{tier.tagline}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-2">
                                <span className="text-4xl font-black text-gray-900">{tier.price}</span>
                                <span className="text-gray-500">{tier.period}</span>
                            </div>

                            {/* Trial Highlight for Solo */}
                            {tier.highlight && (
                                <div className="mb-6">
                                    <span className="text-sm text-teal-600 font-medium">{tier.highlight}</span>
                                </div>
                            )}
                            {!tier.highlight && <div className="mb-6" />}

                            {/* Features */}
                            <div className="space-y-3 mb-8">
                                {tier.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${feature.highlight ? 'bg-teal-500' : 'bg-gray-300'}`} />
                                        <p className={`text-sm ${feature.highlight ? 'text-teal-700' : 'text-gray-600'}`}>
                                            <span className={`font-medium ${feature.highlight ? 'text-teal-700' : 'text-gray-900'}`}>{feature.value}</span>
                                            {feature.label !== feature.value && (
                                                <span className={feature.highlight ? 'text-teal-600' : 'text-gray-400'}> — {feature.label.toLowerCase()}</span>
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button
                                onClick={onGetStarted}
                                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center group ${
                                    tier.ctaStyle === 'primary' || isPopular
                                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {tier.cta}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    );
                })}
            </section>

            {/* TRANSPARENCY INCENTIVE */}
            <section className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-8 md:p-10 border border-teal-100/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-white border border-teal-200 flex items-center justify-center shadow-sm">
                                <Check className="w-7 h-7 text-teal-600" strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Transparency Incentive
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Jobs with a <span className="font-semibold text-gray-900">verified salary range</span> earn{' '}
                                <span className="font-semibold text-teal-700">2 bonus chimes</span>.
                                Lead on transparency, get rewarded.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* EARLY ADOPTER */}
            <section className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
                    <span className="w-2 h-2 rounded-full bg-teal-500 mr-3" />
                    Early adopters get direct input on our product roadmap
                </div>
            </section>

            {/* HONEST COMPARISON */}
            <section className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                        The Real Economics
                    </h2>
                    <p className="text-gray-500">We believe you should see the math before you commit.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Traditional */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Job Boards
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-4">€500-2,000</div>
                        <p className="text-sm text-gray-500">Per post. No guarantee of quality. High volume, low signal.</p>
                    </div>

                    {/* Agencies */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Recruitment Agencies
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-4">15-25%</div>
                        <p className="text-sm text-gray-500">Of annual salary. At €100k, that's €15-25k per hire.</p>
                    </div>

                    {/* Chime */}
                    <div className="bg-white rounded-xl p-6 border-2 border-teal-200 shadow-sm">
                        <div className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">
                            Chime
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-4">€10</div>
                        <p className="text-sm text-gray-600">Per precision match. Direct applicants free. No salary percentage.</p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                        Common Questions
                    </h2>
                </div>

                <div className="space-y-6">
                    {[
                        {
                            q: 'What is a "Chime"?',
                            a: 'A Chime is an unlock. When you find a matched candidate in our talent pool, you spend a Chime to reveal their full profile and contact details. Direct applicants to your job posts are always free—no Chimes required.'
                        },
                        {
                            q: 'Are direct applicants really free?',
                            a: 'Yes. Anyone who applies through your careers widget or job posts is completely free to view, message, and hire. Chimes are only used when you proactively browse our talent pool and want to unlock a candidate who hasn\'t applied to you.'
                        },
                        {
                            q: 'What happens during the 14-day trial?',
                            a: 'You get full Orchestra-level access plus 20 free chimes to unlock candidates. No credit card required. At the end of 14 days, you choose the plan that fits your needs—or stay on Solo for free.'
                        },
                        {
                            q: 'What happens to unused Chimes?',
                            a: 'On Ensemble, included Chimes roll over for up to 3 months. We want you to hire when you find the right match, not rush to use credits.'
                        },
                        {
                            q: 'Can I add more team members?',
                            a: 'Solo includes 2 seats, Ensemble includes 5. Need more? Orchestra offers unlimited seats, or contact us for custom arrangements.'
                        },
                        {
                            q: 'What if I outgrow my plan?',
                            a: 'Upgrade anytime. If you start on Solo and your hiring accelerates, switching to Ensemble takes one click. Your job posts, candidates, and pipeline history all carry over.'
                        }
                    ].map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CLOSING CTA */}
            <section className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
                    {/* Subtle background effect */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                            Start Your Free Trial
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                            14 days of full access. 20 free chimes. No credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onGetStarted}
                                className="bg-white text-gray-900 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl group inline-flex items-center justify-center"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back Button */}
            <div className="pt-8 pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Home</span>
                </button>
            </div>
        </div>
    );
};

export default PricingSection;
