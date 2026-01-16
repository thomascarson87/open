
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Users, TrendingUp, Search, Mail, Eye, EyeOff, Plus, ChevronRight, Award } from 'lucide-react';
import { ProfessionalVerification, VerificationStats, VerifiedSkillStats, Skill } from '../types';
import { verificationService } from '../services/verificationService';
import RequestVerificationModal from './RequestVerificationModal';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';

interface Props {
  candidateId: string;
  stats?: VerificationStats;
  skills?: Skill[]; // New prop to pass candidate skills
}

const VerifiedSkillBadge: React.FC<{ 
  skill: VerifiedSkillStats;
}> = ({ skill }) => {
  const claimedMeta = SKILL_LEVEL_METADATA[Math.round(skill.avg_claimed_level) as 1|2|3|4|5] || SKILL_LEVEL_METADATA[1];
  const assessedMeta = SKILL_LEVEL_METADATA[Math.round(skill.avg_assessed_level) as 1|2|3|4|5] || SKILL_LEVEL_METADATA[1];
  
  const levelDiff = skill.avg_assessed_level - skill.avg_claimed_level;
  const agreementColor = 
    skill.level_agreement_rate >= 0.8 ? 'text-green-600' :
    skill.level_agreement_rate >= 0.6 ? 'text-yellow-600' :
    'text-orange-600';
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-bold text-sm text-gray-900">{skill.skill}</h5>
          <p className="text-xs text-gray-500">
            {skill.verification_count} {skill.verification_count === 1 ? 'verification' : 'verifications'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl">{assessedMeta.icon}</div>
          <div className="text-[10px] font-bold text-gray-600">{assessedMeta.label}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Agreement:</span>
        <span className={`font-bold ${agreementColor}`}>
          {Math.round(skill.level_agreement_rate * 100)}%
        </span>
      </div>
      
      {Math.abs(levelDiff) > 0.5 && (
        <div className={`mt-2 text-xs px-2 py-1 rounded ${
          levelDiff > 0 
            ? 'bg-green-50 text-green-700' 
            : 'bg-orange-50 text-orange-700'
        }`}>
          {levelDiff > 0
            ? `+${levelDiff.toFixed(1)} levels higher`
            : `${levelDiff.toFixed(1)} levels lower`
          }
        </div>
      )}
    </div>
  );
};

const VerificationDashboard: React.FC<Props> = ({ candidateId, stats, skills = [] }) => {
  const [verifications, setVerifications] = useState<ProfessionalVerification[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const currentStats = stats || {
      total_verifications: 0,
      avg_communication: 0,
      avg_problem_solving: 0,
      avg_reliability: 0,
      avg_collaboration: 0,
      verified_skills: [],
      verified_traits: []
  };

  useEffect(() => {
    loadVerifications();
  }, [candidateId]);
  
  const loadVerifications = async () => {
    setLoading(true);
    try {
        const data = await verificationService.getVerifications(candidateId);
        setVerifications(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };
  
  const toggleVisibility = async (verificationId: string, currentVisibility: boolean) => {
    await verificationService.toggleVisibility(verificationId, !currentVisibility);
    loadVerifications();
  };

  const completedVerifications = verifications.filter(v => v.status === 'completed');
  const pendingVerifications = verifications.filter(v => v.status === 'pending');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Professional Verifications</h1>
            <p className="text-gray-600 mt-2">Build trust with verified references from colleagues.</p>
        </div>
        <button
            onClick={() => setShowRequestModal(true)}
            className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg transition-all"
        >
            <Plus className="w-5 h-5 mr-2" />
            Request Verification
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          label="Verified References"
          value={currentStats.total_verifications.toString()}
          subtext={currentStats.total_verifications >= 3 ? "✓ Verified Professional" : `${3 - currentStats.total_verifications} more recommended`}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
          label="Avg Communication"
          value={currentStats.avg_communication > 0 ? `${currentStats.avg_communication.toFixed(1)}/10` : '-'}
          subtext="Written & Verbal"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
          label="Avg Problem Solving"
          value={currentStats.avg_problem_solving > 0 ? `${currentStats.avg_problem_solving.toFixed(1)}/10` : '-'}
          subtext="Independence & Creativity"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
          label="Avg Reliability"
          value={currentStats.avg_reliability > 0 ? `${currentStats.avg_reliability.toFixed(1)}/10` : '-'}
          subtext="Deadlines & Quality"
        />
      </div>

      {/* Verified Skills Section (New) */}
      {currentStats.verified_skills && currentStats.verified_skills.length > 0 && (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-blue-500" />
            Verified Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentStats.verified_skills.slice(0, 9).map((skill, idx) => (
                <VerifiedSkillBadge key={idx} skill={skill} />
            ))}
            </div>
            {currentStats.verified_skills.length > 9 && (
            <p className="text-sm text-gray-500 text-center mt-4">
                +{currentStats.verified_skills.length - 9} more verified skills
            </p>
            )}
        </div>
      )}

      {/* CTA Box */}
      {currentStats.total_verifications < 1 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-100">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Why get verified?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-600" /> Verified profiles get 25% higher match scores</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-600" /> Companies unlock verified candidates 3x more often</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-600" /> Replace PDF references with data-driven insights</li>
                </ul>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 max-w-xs">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">How it works</div>
                <div className="space-y-3">
                    <div className="flex items-center text-sm"><span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold mr-2">1</span> Send invite link to colleague</div>
                    <div className="flex items-center text-sm"><span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold mr-2">2</span> They fill 90s form (no login)</div>
                    <div className="flex items-center text-sm"><span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold mr-2">3</span> Scores added to your profile</div>
                </div>
            </div>
            </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Completed Verifications */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Completed ({completedVerifications.length})
          </h3>
          <div className="space-y-4">
            {completedVerifications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 border-dashed">
                No completed verifications yet.
              </div>
            ) : (
              completedVerifications.map(verification => (
                <CompletedVerificationCard
                  key={verification.id}
                  verification={verification}
                  onToggleVisibility={() => toggleVisibility(verification.id, verification.is_visible_publicly)}
                />
              ))
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Pending Requests ({pendingVerifications.length})
          </h3>
          <div className="space-y-4">
            {pendingVerifications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 border-dashed">
                No pending requests.
              </div>
            ) : (
              pendingVerifications.map(verification => (
                <PendingVerificationCard
                  key={verification.id}
                  verification={verification}
                  onResend={() => { alert('Resent invite! (Mock)'); }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <RequestVerificationModal
          candidateId={candidateId}
          candidateSkills={skills}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            loadVerifications();
          }}
        />
      )}
    </div>
  );
};

// Supporting Components
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; subtext: string }> = 
  ({ icon, label, value, subtext }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      {icon}
      <span className="text-sm font-bold text-gray-500">{label}</span>
    </div>
    <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
    <div className="text-xs font-medium text-gray-500">{subtext}</div>
  </div>
);

const PendingVerificationCard: React.FC<{ verification: ProfessionalVerification; onResend: () => void }> =
  ({ verification, onResend }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-bold text-gray-900">{verification.referee_name || verification.referee_email}</h4>
        <p className="text-sm text-gray-600">{verification.referee_company || 'Company not specified'}</p>
        <p className="text-xs text-gray-400 mt-1 capitalize">{verification.relationship_type.replace('_', ' ')}</p>
      </div>
      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold uppercase tracking-wider">Pending</span>
    </div>
    <div className="flex items-center justify-between text-sm mt-4 pt-3 border-t border-gray-50">
      <span className="text-gray-400 text-xs">Sent {new Date(verification.created_at).toLocaleDateString()}</span>
      <button onClick={onResend} className="text-blue-600 hover:text-blue-800 font-bold flex items-center text-xs uppercase tracking-wide">
        <Mail className="w-3 h-3 mr-1" />
        Resend Invite
      </button>
    </div>
  </div>
);

const CompletedVerificationCard: React.FC<{ 
  verification: ProfessionalVerification; 
  onToggleVisibility: () => void;
}> = ({ verification, onToggleVisibility }) => {
  const avgScore = Math.round(
    (verification.communication_written + 
     verification.communication_verbal + 
     verification.problem_solving_independence + 
     verification.problem_solving_creativity + 
     verification.reliability_deadlines + 
     verification.reliability_quality + 
     verification.collaboration_quality) / 7 * 10
  ) / 10;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-gray-900">{verification.referee_name || verification.referee_email}</h4>
          <p className="text-sm text-gray-600">{verification.referee_company}</p>
          <div className="flex gap-2 mt-1">
             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{verification.relationship_type.replace('_', ' ')}</span>
             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{verification.years_worked_together}</span>
          </div>
        </div>
        <div className="text-right bg-green-50 px-3 py-2 rounded-lg">
          <div className="text-xl font-black text-green-700">{avgScore}</div>
          <div className="text-[10px] text-green-600 font-bold uppercase">Avg Score</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
        <MiniScoreBar label="Communication" score={(verification.communication_written + verification.communication_verbal) / 2} />
        <MiniScoreBar label="Problem Solving" score={(verification.problem_solving_independence + verification.problem_solving_creativity) / 2} />
        <MiniScoreBar label="Reliability" score={(verification.reliability_deadlines + verification.reliability_quality) / 2} />
        <MiniScoreBar label="Collaboration" score={verification.collaboration_quality} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Verified {new Date(verification.completed_at!).toLocaleDateString()}
        </span>
        <button
          onClick={onToggleVisibility}
          className={`text-xs font-bold flex items-center px-3 py-1.5 rounded-full transition-colors ${verification.is_visible_publicly ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {verification.is_visible_publicly ? (
            <>
              <Eye className="w-3 h-3 mr-1" /> Public
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 mr-1" /> Hidden
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const MiniScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div>
    <div className="flex justify-between mb-1">
        <span className="text-[10px] font-semibold text-gray-500 uppercase">{label}</span>
        <span className="text-[10px] font-bold text-gray-700">{score.toFixed(1)}</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full ${
          score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-blue-500' : 'bg-orange-500'
        }`}
        style={{ width: `${(score / 10) * 100}%` }}
      />
    </div>
  </div>
);

export default VerificationDashboard;
