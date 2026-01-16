
import React from 'react';
import { JobPosting, CompanyProfile, TeamMember, MatchBreakdown } from '../types';
import { X, Heart, Share2, Zap, Building2, MapPin, DollarSign, Clock, CheckCircle, Target, Code, Users, Gift, MessageSquare, ArrowRight, Layout, GraduationCap } from 'lucide-react';
import SkillIcon from './SkillIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  enrichedJob: {
    job: JobPosting;
    company: CompanyProfile;
    hiringManager: TeamMember | null;
  };
  matchResult: MatchBreakdown;
  onApply: (jobId: string) => void;
}

const JobDetailModal: React.FC<Props> = ({ isOpen, onClose, enrichedJob, matchResult, onApply }) => {
  if (!isOpen) return null;

  const { job, company, hiringManager } = enrichedJob;

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Competitive';
    const sym = currency === 'USD' ? '$' : currency;
    const kMin = min ? `${Math.round(min/1000)}K` : '';
    const kMax = max ? `${Math.round(max/1000)}K` : '';
    if (min && max) return `${sym}${kMin} - ${kMax}`;
    return min ? `${sym}${kMin}+` : `${sym}${kMax}`;
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header Overlay Actions */}
        <div className="absolute top-6 right-8 z-10 flex gap-2">
          <button className="p-3 bg-white/80 backdrop-blur shadow-sm hover:shadow-md rounded-2xl text-gray-400 hover:text-pink-500 transition-all">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white/80 backdrop-blur shadow-sm hover:shadow-md rounded-2xl text-gray-400 hover:text-blue-600 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-black transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Banner Section */}
        <div className="bg-gray-50 border-b border-gray-100 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {company.logoUrl ? (
              <img src={company.logoUrl} className="w-24 h-24 rounded-3xl object-cover shadow-xl border-4 border-white" alt={company.companyName} />
            ) : (
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl">
                {company.companyName.charAt(0)}
              </div>
            )}
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">{job.title}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {company.companyName}
                </div>
                <div className="h-1 w-1 bg-gray-300 rounded-full" />
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  {company.fundingStage} · {company.teamSize || company.companySizeRange} Employees
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 mt-6">
                <div className={`flex items-center gap-2 text-lg font-black ${getMatchColor(matchResult.overallScore)}`}>
                  <Zap className="w-5 h-5 fill-current" /> {matchResult.overallScore}% Match
                </div>
                <div className="flex items-center gap-2 text-lg font-black text-green-600">
                  <DollarSign className="w-5 h-5" /> {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                  <MapPin className="w-4 h-4" /> {job.workMode} ({job.location})
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <button 
              onClick={() => onApply(job.id)}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95"
            >
              Quick Apply
            </button>
            <button className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-black shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" /> Message Team
            </button>
          </div>
        </div>

        {/* Two Column Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Content (65%) */}
            <div className="lg:col-span-8 p-8 md:p-12 space-y-16">
              
              {/* Role Overview */}
              <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                  <Layout className="w-4 h-4 mr-2" /> Role Overview
                </h3>
                <div className="prose prose-blue max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </section>

              {/* Impact Statement */}
              {job.impact_statement && (
                <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
                  <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
                  <div className="relative z-10">
                    <h3 className="text-xs font-black text-blue-200 uppercase tracking-[0.3em] mb-4">Your Mission</h3>
                    <p className="text-2xl font-bold leading-tight">{job.impact_statement}</p>
                  </div>
                </section>
              )}

              {/* Required Skills */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center">
                    <Zap className="w-4 h-4 mr-2" /> Technical Requirements
                  </h3>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Precision Level Matching
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.requiredSkills.map(skill => (
                    <div key={skill.name} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-4 group hover:border-blue-200 transition-all">
                      <SkillIcon skillName={skill.name} size={32} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-black text-gray-900">{skill.name}</span>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                            L{skill.required_level}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(l => (
                            <div key={l} className={`h-1 flex-1 rounded-full ${l <= skill.required_level ? 'bg-blue-600' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> Key Responsibilities
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {job.responsibilities.map((resp, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 bg-white border-2 border-gray-50 rounded-2xl shadow-sm hover:border-blue-100 transition-all">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-gray-700 font-bold leading-relaxed">{resp}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Deliverables */}
              {job.key_deliverables && job.key_deliverables.length > 0 && (
                <section>
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                    <Target className="w-4 h-4 mr-2" /> Success Plan
                  </h3>
                  <div className="space-y-4">
                    {job.key_deliverables.map((del, i) => (
                      <div key={i} className="flex gap-6 items-start">
                        <div className="text-3xl font-black text-gray-100 select-none">0{i+1}</div>
                        <div className="flex-1 bg-gray-50 p-6 rounded-3xl border border-gray-100 font-bold text-gray-800 italic">
                          "{del}"
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Perks */}
              {(job.perks?.length || 0) > 0 && (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                    <Gift className="w-4 h-4 mr-2" /> Perks & Benefits
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {job.perks.map(perk => (
                      <div key={perk} className="px-5 py-3 bg-purple-50 text-purple-700 rounded-2xl font-black text-xs uppercase tracking-widest border border-purple-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> {perk}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar (35%) */}
            <div className="lg:col-span-4 bg-gray-50/50 p-8 md:p-12 border-l border-gray-100 space-y-10">
              
              {/* Match Deep Dive */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Match Analysis</h3>
                <div className="space-y-6">
                  {/* Skill Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-black text-gray-700">
                      <span>Skills</span>
                      <span className="text-blue-600">{matchResult.details.skills.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${matchResult.details.skills.score}%` }} />
                    </div>
                  </div>
                  
                  {/* Salary Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-black text-gray-700">
                      <span>Salary</span>
                      <span className="text-green-600">{matchResult.details.salary.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: `${matchResult.details.salary.score}%` }} />
                    </div>
                  </div>

                  {/* Culture Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-black text-gray-700">
                      <span>Values</span>
                      <span className="text-purple-600">{matchResult.details.culture.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: `${matchResult.details.culture.score}%` }} />
                    </div>
                  </div>

                  {/* Environment Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-black text-gray-700">
                      <span>Culture</span>
                      <span className="text-orange-600">{matchResult.details.traits.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600" style={{ width: `${matchResult.details.traits.score}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100">
                   <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-blue-900 leading-relaxed italic">
                        Precision level assessment indicates a top-decile proficiency match for this role's engineering cadence.
                      </p>
                   </div>
                </div>
              </div>

              {/* Company Info Card */}
              <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[100px] opacity-10" />
                <div className="relative z-10">
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-6">About {company.companyName}</h3>
                  <p className="text-sm font-medium leading-relaxed text-gray-400 mb-8 line-clamp-6">
                    {company.about || "Leading innovator in technical scale and human-centric engineering cultures."}
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                      <span className="text-gray-500 font-bold">Location</span>
                      <span className="font-black">{company.headquartersLocation || 'Global'}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                      <span className="text-gray-500 font-bold">Industry</span>
                      <span className="font-black">{(company.industry || []).join(', ')}</span>
                    </div>
                  </div>
                  <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    Company Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hiring Manager */}
              {hiringManager && (
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                    <Users className="w-4 h-4 mr-2" /> Hiring Manager
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-xl">
                      {hiringManager.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-gray-900">{hiringManager.name}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase">{hiringManager.role.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95">
                    Connect with {hiringManager.name.split(' ')[0]}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
