
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, TrendingUp, Star, Award, User, Briefcase, Layout, Users, Clock } from 'lucide-react';
import { verificationService } from '../services/verificationService';
import { supabase } from '../services/supabaseClient'; 
import { ProfessionalVerification, CandidateProfile, Skill } from '../types';

const VerificationForm = () => {
  const { token } = useParams<{ token: string }>();
  
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<ProfessionalVerification | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  const [formData, setFormData] = useState({
    verified_skills: [] as Array<{ skill: string; confirmed: boolean; proficiency: number }>,
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

      if (verData.status === 'expired' || new Date(verData.expires_at) < new Date()) {
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

          // Init form
          setFormData(prev => ({
              ...prev,
              verified_skills: mappedCandidate.skills.map((s: any) => ({ skill: s.name, confirmed: false, proficiency: 5 })), // Default proficiency fixed to 5
              verified_traits: mappedCandidate.characterTraits.map((t: string) => ({ trait: t, agreement: 3 }))
          }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await verificationService.submitVerification(token!, formData);
      setSubmitted(true);
    } catch (error) {
      alert('Failed to submit. Try again.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-8 text-lg">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-orange-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Link Expired</h2>
          <p className="text-gray-600 mb-8">
            This verification link has expired. Please ask {candidate?.name} to resend the invitation.
          </p>
        </div>
      </div>
    );
  }

  if (!verification || !candidate) return <div className="p-10 text-center">Invalid Link</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Candidate</span>
              </div>
              <p className="text-gray-500 font-medium mb-2">{candidate.headline}</p>
              <div className="flex gap-4 text-sm text-gray-400">
                  <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/> {verification.referee_company}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 relative pt-1">
            <div className="flex mb-2 items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>Step {step} of 3</span>
              <span>{Math.round((step/3)*100)}%</span>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
              <div style={{ width: `${(step/3)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-900 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 md:p-10">
          
          {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right duration-300 space-y-8">
                 <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Skills</h2>
                     <p className="text-gray-500">Which of these skills did you observe {candidate.name} demonstrating?</p>
                 </div>
                 
                 <div className="space-y-4">
                     {formData.verified_skills.map((skill, idx) => (
                         <div key={idx} className={`p-4 rounded-xl border-2 transition-all ${skill.confirmed ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                             <div className="flex items-center justify-between">
                                 <label className="flex items-center cursor-pointer flex-1">
                                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${skill.confirmed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                         {skill.confirmed && <CheckCircle className="w-4 h-4 text-white" />}
                                     </div>
                                     <span className={`font-bold text-lg ${skill.confirmed ? 'text-green-900' : 'text-gray-700'}`}>{skill.skill}</span>
                                 </label>
                                 <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={skill.confirmed} 
                                    onChange={() => {
                                        const newSkills = [...formData.verified_skills];
                                        newSkills[idx].confirmed = !newSkills[idx].confirmed;
                                        setFormData({...formData, verified_skills: newSkills});
                                    }}
                                 />
                             </div>
                             
                             {skill.confirmed && (
                                 <div className="mt-4 pl-10">
                                     <div className="flex justify-between text-xs font-bold text-green-700 mb-2 uppercase">
                                         <span>Beginner</span>
                                         <span>Expert</span>
                                     </div>
                                     <input 
                                        type="range" min="1" max="10" 
                                        value={skill.proficiency}
                                        onChange={(e) => {
                                            const newSkills = [...formData.verified_skills];
                                            newSkills[idx].proficiency = parseInt(e.target.value);
                                            setFormData({...formData, verified_skills: newSkills});
                                        }}
                                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                     />
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
                 
                 <div className="flex justify-end pt-4">
                     <button onClick={() => setStep(2)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg">Next Step</button>
                 </div>
             </div>
          )}

          {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right duration-300 space-y-8">
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Ratings</h2>
                     <p className="text-gray-500">Rate {candidate.name}'s performance in these key areas.</p>
                 </div>

                 <div className="space-y-8">
                     <RatingGroup 
                        title="Communication"
                        icon={<Layout className="w-5 h-5 text-blue-500"/>}
                        items={[
                            { label: "Written Communication", value: formData.communication_written, key: 'communication_written' },
                            { label: "Verbal Communication", value: formData.communication_verbal, key: 'communication_verbal' }
                        ]}
                        onChange={(key, val) => setFormData({...formData, [key]: val})}
                     />
                     <RatingGroup 
                        title="Execution"
                        icon={<TrendingUp className="w-5 h-5 text-green-500"/>}
                        items={[
                            { label: "Problem Solving", value: formData.problem_solving_independence, key: 'problem_solving_independence' },
                            { label: "Reliability", value: formData.reliability_deadlines, key: 'reliability_deadlines' }
                        ]}
                        onChange={(key, val) => setFormData({...formData, [key]: val})}
                     />
                     <RatingGroup 
                        title="Teamwork"
                        icon={<Users className="w-5 h-5 text-purple-500"/>}
                        items={[
                            { label: "Collaboration", value: formData.collaboration_quality, key: 'collaboration_quality' }
                        ]}
                        onChange={(key, val) => setFormData({...formData, [key]: val})}
                     />
                 </div>

                 <div className="flex justify-between pt-4">
                     <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-900">Back</button>
                     <button onClick={() => setStep(3)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg">Next Step</button>
                 </div>
              </div>
          )}

          {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right duration-300 space-y-8">
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Character Traits</h2>
                     <p className="text-gray-500">How much do you agree that {candidate.name} exhibits these traits?</p>
                 </div>

                 <div className="space-y-4">
                     {formData.verified_traits.map((trait, idx) => (
                         <div key={idx} className="bg-gray-50 p-6 rounded-2xl">
                             <h3 className="font-bold text-lg text-gray-900 mb-4 text-center">"{trait.trait}"</h3>
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
                                            ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                                            : 'bg-white text-gray-400 hover:bg-gray-100'
                                        }`}
                                     >
                                         {rating === 1 ? 'Disagree' : rating === 5 ? 'Agree' : rating}
                                     </button>
                                 ))}
                             </div>
                             <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 uppercase">
                                 <span>Strongly Disagree</span>
                                 <span>Strongly Agree</span>
                             </div>
                         </div>
                     ))}
                 </div>

                 <div className="flex justify-between pt-4">
                     <button onClick={() => setStep(2)} className="text-gray-500 font-bold hover:text-gray-900">Back</button>
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

const RatingGroup = ({ title, icon, items, onChange }: any) => (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
            {icon}
            <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-6">
            {items.map((item: any) => (
                <div key={item.key}>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">{item.label}</label>
                        <span className="text-sm font-bold text-blue-600">{item.value}/10</span>
                    </div>
                    <input 
                        type="range" min="1" max="10" 
                        value={item.value}
                        onChange={(e) => onChange(item.key, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                    />
                </div>
            ))}
        </div>
    </div>
);

export default VerificationForm;
