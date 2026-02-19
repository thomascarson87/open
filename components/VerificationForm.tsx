import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, Star, Award, User, Briefcase, Layout, Users, Clock, Info, HelpCircle, ArrowRight } from 'lucide-react';
import { verificationService } from '../services/verificationService';
import { supabase } from '../services/supabaseClient'; 
import { ProfessionalVerification, CandidateProfile, Skill, VerifiedSkill } from '../types';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';

const RatingGroup = ({ title, icon, items, onChange }: any) => (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-6">
            {icon}
            <h3 className="font-bold text-primary">{title}</h3>
        </div>
        <div className="space-y-6">
            {items.map((item: any) => (
                <div key={item.key}>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">{item.label}</label>
                        <span className="text-sm font-bold text-accent-coral">{item.value}/10</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={item.value} 
                        onChange={(e) => onChange(item.key, parseInt(e.target.value))}
                        className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[var(--accent-coral)]"
                    />
                    <div className="flex justify-between mt-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                        <span>Entry</span>
                        <span>Expert</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const VerificationForm = () => {
  // Custom manual parsing for token since useParams is missing
  const token = React.useMemo(() => {
    const path = window.location.pathname;
    const parts = path.split('/verify/');
    return parts.length > 1 ? parts[1] : null;
  }, []);
  
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<ProfessionalVerification | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkill[]>([]);
  
  const [formData, setFormData] = useState({
    communication_written: 5,
    communication_verbal: 5,
    problem_solving_independence: 5,
    problem_solving_creativity: 5,
    reliability_deadlines: 5,
    reliability_quality: 5,
    collaboration_quality: 5,
    leadership_mentorship: 0,
    leadership_decisions: 0,
    verified_traits: [] as Array<{ trait: string; agreement: number }>
  });

  useEffect(() => {
    if (token) fetchVerificationData();
  }, [token]);

  const fetchVerificationData = async () => {
    try {
      const verData = await verificationService.getVerificationByToken(token!);
      
      if (!verData) {
          throw new Error("Verification not found");
      }

      if (verData.status === 'completed') {
        setSubmitted(true);
        setLoading(false);
        return;
      }

      if (verData.status === 'expired' || (verData.expires_at && new Date(verData.expires_at) < new Date())) {
        setIsExpired(true);
        setLoading(false);
        return;
      }

      setVerification(verData);

      // Fetch Candidate
      const { data: candData } = await supabase.from('candidate_profiles').select('*').eq('id', verData.candidate_id).single();
      
      if (candData) {
          const mappedCandidate: CandidateProfile = {
              ...candData,
              skills: candData.skills || [],
              characterTraits: candData.character_traits || []
          };
          setCandidate(mappedCandidate);

          // Initialize verified skills with candidate's claimed levels
          if (mappedCandidate.skills) {
            const initialSkills: VerifiedSkill[] = mappedCandidate.skills.map((skill: Skill) => ({
              skill: skill.name,
              confirmed: false, 
              candidate_claimed_level: skill.level,
              referee_assessed_level: skill.level, 
              notes: ''
            }));
            setVerifiedSkills(initialSkills);
          }

          // Init form traits
          setFormData(prev => ({
              ...prev,
              verified_traits: (mappedCandidate.characterTraits || []).map((t: string) => ({ trait: t, agreement: 3 }))
          }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const updateVerifiedSkill = (index: number, updates: Partial<VerifiedSkill>) => {
    setVerifiedSkills(prev => prev.map((skill, idx) => 
      idx === index ? { ...skill, ...updates } : skill
    ));
  };

  const handleSubmit = async () => {
    try {
      const submissionData = {
          ...formData,
          verified_skills: verifiedSkills
      };
      await verificationService.submitVerification(token!, submissionData);
      setSubmitted(true);
    } catch (error) {
      alert('Failed to submit. Try again.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-surface rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="font-heading text-3xl text-primary mb-4">Thank You!</h2>
          <p className="text-muted mb-8 text-lg">
            Your verification has been secured. {candidate?.name} has been notified and their profile boosted.
          </p>
          <a href="/" className="block bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-surface rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-orange-600" />
          </div>
          <h2 className="font-heading text-3xl text-primary mb-4">Link Expired</h2>
          <p className="text-muted mb-8">
            This verification link has expired. Please ask {candidate?.name} to resend the invitation.
          </p>
        </div>
      </div>
    );
  }

  if (!verification || !candidate) return <div className="p-10 text-center">Invalid Link</div>;

  return (
    <div className="min-h-screen bg-background py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-surface rounded-3xl shadow-sm border border-border p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-accent-coral to-accent-green rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-heading text-2xl text-primary">{candidate.name}</h1>
                  <span className="bg-accent-coral-bg text-accent-coral text-xs font-bold px-2 py-1 rounded">Candidate</span>
              </div>
              <p className="text-muted font-medium mb-2">{candidate.headline}</p>
              <div className="flex gap-4 text-sm text-gray-400 dark:text-gray-500">
                  <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/> {verification.referee_company}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 relative pt-1">
            <div className="flex mb-2 items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <span>Step {step} of 3</span>
              <span>{Math.round((step/3)*100)}%</span>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100 dark:bg-gray-800">
              <div style={{ width: `${(step/3)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-900 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface rounded-3xl shadow-lg border border-border p-8 md:p-10">
          
          {step === 1 && (
             <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="bg-gradient-to-r from-accent-coral to-accent-green rounded-xl p-5 border border-accent-coral-bg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-accent-coral mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-accent-coral mb-1">How Skill Assessment Works</h4>
                      <p className="text-sm text-accent-coral leading-relaxed">
                        <strong>{verification?.referee_name || 'The candidate'}</strong> has indicated their skill levels. 
                        Please verify which skills you worked with them on, and assess their <strong>actual proficiency</strong> 
                        based on observable behaviors.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {verifiedSkills.map((verifiedSkill, idx) => {
                    const claimedMeta = SKILL_LEVEL_METADATA[verifiedSkill.candidate_claimed_level];
                    
                    return (
                      <div 
                        key={idx} 
                        className={`border-2 rounded-xl p-5 transition-all ${
                          verifiedSkill.confirmed 
                            ? 'border-green-200 bg-green-50/50' 
                            : 'border-border bg-white dark:bg-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={verifiedSkill.confirmed}
                                onChange={(e) => updateVerifiedSkill(idx, { confirmed: e.target.checked })}
                                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-700 text-accent-coral focus:ring-2 focus:ring-accent-coral"
                              />
                              <span className="ml-3 font-bold text-lg text-primary group-hover:text-accent-coral transition-colors">
                                {verifiedSkill.skill}
                              </span>
                            </label>
                          </div>
                          
                          <div className="bg-accent-coral-bg px-3 py-1.5 rounded-lg border border-accent-coral-light">
                            <div className="text-xs text-accent-coral font-semibold uppercase tracking-wide mb-0.5">They claimed</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{claimedMeta?.icon || ''}</span>
                              <span className="text-sm font-bold text-accent-coral">{claimedMeta?.label || 'Applying'}</span>
                            </div>
                          </div>
                        </div>

                        {verifiedSkill.confirmed && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-3">What level did you observe? *</label>
                              <div className="grid grid-cols-5 gap-2">
                                {[1, 2, 3, 4, 5].map((level) => {
                                  const meta = SKILL_LEVEL_METADATA[level as 1|2|3|4|5];
                                  const isSelected = verifiedSkill.referee_assessed_level === level;
                                  return (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() => updateVerifiedSkill(idx, { referee_assessed_level: level as any })}
                                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                                        isSelected ? 'border-green-500 bg-green-50' : 'border-border bg-white dark:bg-surface hover:border-gray-300 dark:border-gray-700'
                                      }`}
                                    >
                                      <div className="text-xl mb-1">{meta?.icon || level}</div>
                                      <div className="text-[10px] font-bold text-muted">{meta?.label || 'Level'}</div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-muted mb-1">Optional: Add context</label>
                              <input
                                type="text"
                                maxLength={50}
                                value={verifiedSkill.notes || ''}
                                onChange={(e) => updateVerifiedSkill(idx, { notes: e.target.value })}
                                placeholder="e.g., Led major projects using this"
                                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-accent-coral outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-end pt-4">
                     <button 
                        onClick={() => setStep(2)} 
                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg disabled:opacity-50 flex items-center"
                        disabled={verifiedSkills.filter(s => s.confirmed).length === 0}
                     >
                         Next Step <ArrowRight className="w-4 h-4 ml-2" />
                     </button>
                 </div>
             </div>
          )}

          {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right duration-300 space-y-8">
                  <div>
                     <h2 className="font-heading text-2xl text-primary mb-2">Performance Ratings</h2>
                     <p className="text-muted">Rate {candidate.name}'s performance in these key areas.</p>
                 </div>

                 <div className="space-y-8">
                     <RatingGroup 
                        title="Communication"
                        icon={<Layout className="w-5 h-5 text-accent-coral"/>}
                        items={[
                            { label: "Written Communication", value: formData.communication_written, key: 'communication_written' },
                            { label: "Verbal Communication", value: formData.communication_verbal, key: 'communication_verbal' }
                        ]}
                        onChange={(key: string, val: number) => setFormData({...formData, [key]: val})}
                     />
                     <RatingGroup 
                        title="Execution"
                        icon={<TrendingUp className="w-5 h-5 text-green-500"/>}
                        items={[
                            { label: "Problem Solving", value: formData.problem_solving_independence, key: 'problem_solving_independence' },
                            { label: "Reliability", value: formData.reliability_deadlines, key: 'reliability_deadlines' }
                        ]}
                        onChange={(key: string, val: number) => setFormData({...formData, [key]: val})}
                     />
                     <RatingGroup 
                        title="Teamwork"
                        icon={<Users className="w-5 h-5 text-accent-green"/>}
                        items={[
                            { label: "Collaboration", value: formData.collaboration_quality, key: 'collaboration_quality' }
                        ]}
                        onChange={(key: string, val: number) => setFormData({...formData, [key]: val})}
                     />
                 </div>

                 <div className="flex justify-between pt-4">
                     <button onClick={() => setStep(1)} className="text-muted font-bold hover:text-primary">Back</button>
                     <button onClick={() => setStep(3)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg">Next Step</button>
                 </div>
              </div>
          )}

          {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right duration-300 space-y-8">
                  <div>
                     <h2 className="font-heading text-2xl text-primary mb-2">Character Traits</h2>
                     <p className="text-muted">How much do you agree that {candidate.name} exhibits these traits?</p>
                 </div>

                 <div className="space-y-4">
                     {formData.verified_traits.length > 0 ? formData.verified_traits.map((trait, idx) => (
                         <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl">
                             <h3 className="font-bold text-lg text-primary mb-4 text-center">"{trait.trait}"</h3>
                             <div className="flex justify-between gap-2">
                                 {[1, 2, 3, 4, 5].map(rating => (
                                     <button
                                        key={rating}
                                        onClick={() => {
                                            const newTraits = [...formData.verified_traits];
                                            newTraits[idx].agreement = rating;
                                            setFormData({...formData, verified_traits: newTraits});
                                        }}
                                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                                            trait.agreement === rating 
                                            ? 'bg-accent-coral text-white shadow-lg transform scale-105' 
                                            : 'bg-white dark:bg-surface text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 border'
                                        }`}
                                     >
                                         {rating === 1 ? 'Disagree' : rating === 5 ? 'Agree' : rating}
                                     </button>
                                 ))}
                             </div>
                             <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                                 <span>Disagree</span>
                                 <span>Agree</span>
                             </div>
                         </div>
                     )) : (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500 italic">No specific traits requested for verification.</div>
                     )}
                 </div>

                 <div className="flex justify-between pt-4">
                     <button onClick={() => setStep(2)} className="text-muted font-bold hover:text-primary">Back</button>
                     <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg flex items-center">
                         <CheckCircle className="w-5 h-5 mr-2"/> Submit Verification
                     </button>
                 </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
