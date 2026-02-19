import React, { useState } from 'react';
import { useAuth, DEV_ACCOUNTS, DevAccount } from '../../contexts/AuthContext';
import { Check, ChevronUp, ChevronDown, User, Shield, Briefcase, DollarSign, X, Sparkles, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { MemberRole, TestSignupAccount, ONBOARDING_STAGES } from '../../types';

const getRoleIcon = (account: DevAccount) => {
  // Candidate account
  if (account.profileRole === 'candidate') {
    return <User className="w-3.5 h-3.5" />;
  }

  // Recruiter/company roles
  switch (account.teamRole) {
    case 'admin':
      return <Shield className="w-3.5 h-3.5" />;
    case 'hiring_manager':
      return <Briefcase className="w-3.5 h-3.5" />;
    case 'finance':
      return <DollarSign className="w-3.5 h-3.5" />;
    default:
      return <User className="w-3.5 h-3.5" />;
  }
};

// Stage label helper
const getStageBadge = (stage: number) => {
  switch (stage) {
    case ONBOARDING_STAGES.BROWSABLE:
      return { label: 'Stage 1', color: 'bg-amber-100 text-amber-700' };
    case ONBOARDING_STAGES.CAN_APPLY:
      return { label: 'Stage 2', color: 'bg-amber-100 text-amber-700' };
    case ONBOARDING_STAGES.COMPLETE:
      return { label: 'Complete', color: 'bg-green-100 text-green-700' };
    default:
      return { label: 'New', color: 'bg-gray-100 dark:bg-gray-800 text-muted' };
  }
};

export default function DevModeSwitcher() {
  const {
    user,
    isDevMode,
    switchDevAccount,
    devLogout,
    testSignupAccounts,
    activeTestSignupId,
    startTestSignup,
    switchToTestSignup,
    deleteTestSignup,
    clearAllTestSignups,
    testSignupError,
  } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [isCreatingTestSignup, setIsCreatingTestSignup] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Only render in dev mode
  if (!isDevMode) return null;

  const currentAccount = DEV_ACCOUNTS.find(a => a.id === user?.id) || DEV_ACCOUNTS[0];
  const currentTestAccount = testSignupAccounts.find(a => a.id === user?.id);
  const candidateAccounts = DEV_ACCOUNTS.filter(a => a.profileRole === 'candidate');
  const companyAccounts = DEV_ACCOUNTS.filter(a => a.profileRole === 'recruiter');

  const handleSwitch = (account: DevAccount) => {
    if (switchDevAccount && account.id !== user?.id) {
      switchDevAccount(account.id);
    }
    setExpanded(false);
  };

  const handleClearDevMode = () => {
    devLogout();
    window.location.reload();
  };

  const handleStartTestSignup = async () => {
    setIsCreatingTestSignup(true);
    setLocalError(null);
    try {
      const account = await startTestSignup();
      if (account) {
        // Success - reload to start with fresh test account
        window.location.reload();
      } else {
        setLocalError('Failed to create test account');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCreatingTestSignup(false);
    }
  };

  const handleSwitchToTestSignup = (account: TestSignupAccount) => {
    switchToTestSignup(account.id);
    // switchToTestSignup triggers a reload internally
  };

  const handleDeleteTestSignup = async (id: string) => {
    if (!confirm('Delete this test signup account?')) return;
    await deleteTestSignup(id);
  };

  const handleClearAllTestSignups = async () => {
    if (!confirm('Delete ALL test signup accounts?')) return;
    await clearAllTestSignups();
  };

  const getStatusColor = (account: DevAccount) => {
    if (account.profileRole === 'candidate') return 'bg-gray-400';
    switch (account.teamRole) {
      case 'admin': return 'bg-accent-coral';
      case 'hiring_manager': return 'bg-accent-coral-light';
      case 'finance': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  // Determine current display for collapsed pill
  const isOnTestSignupAccount = testSignupAccounts.some(a => a.id === user?.id);
  const displayName = isOnTestSignupAccount
    ? (currentTestAccount?.name || 'Test User')
    : currentAccount.name.split(' ')[0];
  const displayLabel = isOnTestSignupAccount
    ? getStageBadge(currentTestAccount?.onboardingStage || 0).label
    : currentAccount.label;
  const displayBadgeColor = isOnTestSignupAccount
    ? getStageBadge(currentTestAccount?.onboardingStage || 0).color
    : currentAccount.badgeColor;
  const displayStatusColor = isOnTestSignupAccount ? 'bg-amber-400' : getStatusColor(currentAccount);

  // Combined error from context or local
  const errorMessage = localError || testSignupError;

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {/* Expanded View */}
      {expanded && (
        <div className="mb-2 bg-white dark:bg-surface/95 backdrop-blur-sm rounded-xl shadow-xl border border-border overflow-hidden animate-in slide-in-from-bottom-2 duration-200 w-72 max-h-[80vh] overflow-y-auto">
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-border">
            <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Dev Mode Account Switcher
            </div>
          </div>

          {/* Candidate Section */}
          <div className="p-2">
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
              Talent
            </div>
            {candidateAccounts.map(account => {
              const isActive = account.id === user?.id && !isOnTestSignupAccount;
              return (
                <button
                  key={account.id}
                  onClick={() => handleSwitch(account)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${account.badgeColor}`}>
                    {getRoleIcon(account)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-primary truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {account.label}
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-border mx-2" />

          {/* Company Section */}
          <div className="p-2">
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
              Company: Heuristik Tech
            </div>
            {companyAccounts.map(account => {
              const isActive = account.id === user?.id && !isOnTestSignupAccount;
              return (
                <button
                  key={account.id}
                  onClick={() => handleSwitch(account)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${account.badgeColor}`}>
                    {getRoleIcon(account)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-primary truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {account.label}
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-border mx-2" />

          {/* Test Fresh Signup Section */}
          <div className="p-2">
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
              Test Fresh Signup
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-red-700">{errorMessage}</div>
                  <button
                    onClick={() => setLocalError(null)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Start New Test Button */}
            <button
              onClick={handleStartTestSignup}
              disabled={isCreatingTestSignup}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left bg-amber-50 hover:bg-amber-100 transition-colors mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-amber-700">
                {isCreatingTestSignup ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-amber-900">
                  {isCreatingTestSignup ? 'Creating...' : 'Start Fresh Signup'}
                </div>
                <div className="text-xs text-amber-600">
                  Instant mock session (no auth)
                </div>
              </div>
            </button>

            {/* Existing Test Signup Accounts */}
            {testSignupAccounts.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 px-1 mb-1">
                  Previous Test Signups
                </div>
                {testSignupAccounts.map(account => {
                  const isActive = account.id === user?.id;
                  const stageBadge = getStageBadge(account.onboardingStage);
                  return (
                    <div
                      key={account.id}
                      onClick={() => !isActive && handleSwitchToTestSignup(account)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        isActive ? 'bg-amber-100' : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-amber-200 text-amber-700">
                        <User className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-primary truncate">
                          {account.name || 'Unnamed'}
                        </div>
                        <div className="text-[10px] text-muted truncate">
                          {account.email}
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${stageBadge.color}`}>
                        {stageBadge.label}
                      </span>
                      {isActive && (
                        <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTestSignup(account.id);
                        }}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                        title="Delete test account"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Clear All Test Signups */}
            {testSignupAccounts.length > 0 && (
              <button
                onClick={handleClearAllTestSignups}
                className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 px-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear All Test Signups
              </button>
            )}
          </div>

          {/* Clear Dev Mode Button */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-t border-border">
            <button
              onClick={handleClearDevMode}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-muted transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear Dev Mode (use real auth)
            </button>
          </div>
        </div>
      )}

      {/* Collapsed Pill */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
      >
        <div className={`w-2 h-2 rounded-full ${displayStatusColor}`} />
        <span className="text-xs font-bold">
          {isOnTestSignupAccount ? 'TEST' : 'DEV'}: {displayName}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${displayBadgeColor}`}>
          {displayLabel}
        </span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
        )}
      </button>
    </div>
  );
}
