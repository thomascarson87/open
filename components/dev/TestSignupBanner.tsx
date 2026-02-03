import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ONBOARDING_STAGES } from '../../types';
import { Sparkles, RotateCcw, ChevronDown, ChevronUp, X } from 'lucide-react';

// Simplified stage info for test signups - no DB queries needed
const STAGE_INFO = [
  { stage: ONBOARDING_STAGES.BROWSABLE, name: 'Stage 1', description: 'Basic info' },
  { stage: ONBOARDING_STAGES.CAN_APPLY, name: 'Stage 2', description: 'Can apply' },
  { stage: ONBOARDING_STAGES.COMPLETE, name: 'Stage 3', description: 'Complete' },
];

export default function TestSignupBanner() {
  const { user, isDevMode, testSignupAccounts, deleteTestSignup, devLogout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Check if current user is a test signup
  const testAccount = testSignupAccounts.find(a => a.id === user?.id);
  const isTestSignup = !!testAccount;

  // Get stage from localStorage account data (no DB query needed)
  const currentStage = testAccount?.onboardingStage || 0;

  const handleReset = async () => {
    if (!user?.id || !confirm('Reset this test signup? The session will be cleared.')) return;

    setIsResetting(true);
    try {
      await deleteTestSignup(user.id);
      devLogout(); // Clear the mock session
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset test signup:', err);
      setIsResetting(false);
    }
  };

  // Don't render if not in dev mode or not a test signup
  if (!isDevMode || !isTestSignup) return null;

  const currentStageInfo = STAGE_INFO.find(s => s.stage === currentStage) || STAGE_INFO[0];

  return (
    // Positioned at top-left to avoid blocking navigation (profile dropdown is top-right)
    <div className="fixed top-4 left-4 z-[9997]">
      {/* Expanded View */}
      {expanded && (
        <div className="mb-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-amber-200 overflow-hidden animate-in slide-in-from-top-2 duration-200 w-64">
          <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Test Signup Mode
            </div>
            <button onClick={() => setExpanded(false)} className="text-amber-400 hover:text-amber-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3">
            {/* Test Account Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="text-xs text-gray-500 mb-1">Test Account</div>
              <div className="text-sm font-bold text-gray-900 truncate">
                {testAccount?.email || 'Unknown'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Stage: {currentStageInfo.name}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 mb-3">
              Complete your profile using the onboarding flow. Click "Complete Profile" on the dashboard to start.
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Resetting...' : 'Reset & Start Fresh'}
            </button>
          </div>
        </div>
      )}

      {/* Collapsed Pill - smaller and positioned to not block UI */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/90 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors text-xs"
      >
        <Sparkles className="w-3 h-3" />
        <span className="font-bold">TEST</span>
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
