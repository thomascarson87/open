import React, { useState } from 'react';
import { useAuth, DEV_ACCOUNTS, DevAccount } from '../../contexts/AuthContext';
import { Check, ChevronUp, ChevronDown, User, Shield, Briefcase, DollarSign, X } from 'lucide-react';
import { MemberRole } from '../../types';

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

export default function DevModeSwitcher() {
  const { user, isDevMode, switchDevAccount, devLogout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Only render in dev mode
  if (!isDevMode) return null;

  const currentAccount = DEV_ACCOUNTS.find(a => a.id === user?.id) || DEV_ACCOUNTS[0];
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

  const getStatusColor = (account: DevAccount) => {
    if (account.profileRole === 'candidate') return 'bg-gray-400';
    switch (account.teamRole) {
      case 'admin': return 'bg-purple-400';
      case 'hiring_manager': return 'bg-blue-400';
      case 'finance': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {/* Expanded View */}
      {expanded && (
        <div className="mb-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-200 w-72">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              Dev Mode Account Switcher
            </div>
          </div>

          {/* Candidate Section */}
          <div className="p-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Talent
            </div>
            {candidateAccounts.map(account => {
              const isActive = account.id === user?.id;
              return (
                <button
                  key={account.id}
                  onClick={() => handleSwitch(account)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${account.badgeColor}`}>
                    {getRoleIcon(account)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
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
          <div className="border-t border-gray-100 mx-2" />

          {/* Company Section */}
          <div className="p-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Company: Heuristik Tech
            </div>
            {companyAccounts.map(account => {
              const isActive = account.id === user?.id;
              return (
                <button
                  key={account.id}
                  onClick={() => handleSwitch(account)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${account.badgeColor}`}>
                    {getRoleIcon(account)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
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

          {/* Clear Dev Mode Button */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleClearDevMode}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
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
        <div className={`w-2 h-2 rounded-full ${getStatusColor(currentAccount)}`} />
        <span className="text-xs font-bold">
          DEV: {currentAccount.name.split(' ')[0]}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${currentAccount.badgeColor}`}>
          {currentAccount.label}
        </span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
    </div>
  );
}
