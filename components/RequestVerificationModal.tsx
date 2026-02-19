
import React, { useState } from 'react';
import { X, Search, Mail, CheckCircle, ArrowRight, Award } from 'lucide-react';
import { verificationService } from '../services/verificationService';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';
import { Skill } from '../types';

interface Props {
  candidateId: string;
  candidateSkills: Skill[]; 
  onClose: () => void;
  onSuccess: () => void;
}

const RequestVerificationModal: React.FC<Props> = ({ 
  candidateId, 
  candidateSkills,
  onClose, 
  onSuccess 
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    referee_email: '',
    referee_name: '',
    referee_company: '',
    relationship_type: 'peer' as 'manager' | 'peer' | 'direct_report' | 'client',
    years_worked_together: '1-2 years' as '<1 year' | '1-2 years' | '2-5 years' | '5+ years'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verificationService.createVerificationRequest({
          candidate_id: candidateId,
          ...formData
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (error) {
      console.error('Error sending verification request:', error);
      alert('Failed to send verification request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300 shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-2">Request Sent!</h3>
          <p className="text-muted">
            We've emailed {formData.referee_name} with a secure link. You'll be notified when they complete the verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl max-w-xl w-full overflow-hidden animate-in fade-in slide-in-from-bottom duration-300 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white dark:bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl text-primary">Request Verification</h2>
            <div className="flex gap-2 mt-1">
                <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-accent-coral' : 'bg-border'}`}></div>
                <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-accent-coral' : 'bg-border'}`}></div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {step === 1 ? (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                  Colleague's Email *
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={formData.referee_email}
                  onChange={(e) => setFormData({ ...formData, referee_email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent-coral outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                  Colleague's Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.referee_name}
                  onChange={(e) => setFormData({ ...formData, referee_name: e.target.value })}
                  placeholder="e.g. Sarah Jones"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent-coral outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                  Company worked at together
                </label>
                <input
                  type="text"
                  required
                  value={formData.referee_company}
                  onChange={(e) => setFormData({ ...formData, referee_company: e.target.value })}
                  placeholder="e.g. TechFlow Inc."
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent-coral outline-none transition-all"
                />
              </div>

              {/* Show Skills to be Verified */}
              <div className="bg-accent-coral-bg rounded-xl p-4 border border-accent-coral-bg">
                <div className="flex items-center mb-2">
                  <Award className="w-4 h-4 text-accent-coral mr-2" />
                  <h4 className="text-sm font-bold text-accent-coral">Skills to Verify</h4>
                </div>
                <p className="text-xs text-accent-coral mb-3">
                  Your colleague will assess these skills and validate the proficiency levels:
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {candidateSkills.slice(0, 10).map((skill, idx) => {
                    const levelMeta = SKILL_LEVEL_METADATA[skill.level];
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white dark:bg-surface rounded-lg px-3 py-2 border border-accent-coral-bg">
                        <span className="font-semibold text-primary">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{levelMeta.icon}</span>
                          <span className="text-muted">{levelMeta.label}</span>
                        </div>
                      </div>
                    );
                  })}
                  {candidateSkills.length > 10 && (
                    <p className="text-xs text-muted text-center">
                      +{candidateSkills.length - 10} more skills
                    </p>
                  )}
                  {candidateSkills.length === 0 && (
                      <p className="text-xs text-muted text-center italic">No skills added yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!formData.referee_email || !formData.referee_name}
                  onClick={() => setStep(2)}
                  className="bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2"/>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-3">
                  Relationship *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'manager', label: 'They managed me' },
                    { value: 'peer', label: 'We were peers' },
                    { value: 'direct_report', label: 'I managed them' },
                    { value: 'client', label: 'They were a client' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, relationship_type: option.value as any })}
                      className={`p-4 rounded-xl border-2 text-sm font-bold transition-all text-left ${
                        formData.relationship_type === option.value
                          ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                          : 'border-border hover:border-gray-300 dark:border-gray-700 text-muted'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-3">
                  Duration *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    '<1 year',
                    '1-2 years',
                    '2-5 years',
                    '5+ years'
                  ].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, years_worked_together: option as any })}
                      className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        formData.years_worked_together === option
                          ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                          : 'border-border hover:border-gray-300 dark:border-gray-700 text-muted'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-accent-coral-bg rounded-xl p-4 border border-accent-coral-bg text-sm text-accent-coral leading-relaxed">
                <strong>What happens next:</strong> We'll email your colleague a secure link. 
                They'll verify your skills and provide performance ratings. No account required for them.
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-muted hover:text-primary font-bold text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-accent-coral hover:bg-accent-coral disabled:opacity-70 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
};

export default RequestVerificationModal;
